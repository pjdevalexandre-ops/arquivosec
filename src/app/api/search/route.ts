import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const folderId = searchParams.get("folder_id");
    const typeId = searchParams.get("type_id");

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Serviço de pesquisa não configurado." },
        { status: 503 }
      );
    }

    const supabase = await createClientServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // Tenta primeiro a RPC rápida
    let rpcSuccess = false;
    let rpcData: any[] = [];

    try {
      const { data, error } = await supabase.rpc("search_documents", {
        search_query: q,
        filter_folder_id: folderId || null,
        filter_type_id: typeId || null,
      });

      if (!error && data) {
        rpcSuccess = true;
        rpcData = data;
      }
    } catch (_) {
      rpcSuccess = false;
    }

    if (rpcSuccess) {
      return NextResponse.json({ results: rpcData });
    }

    // Fallback resiliente direto no Postgres com ILIKE
    let query = supabase
      .from("documents")
      .select(`
        *,
        folder:folders(*),
        type:document_types(*),
        document_tags(tag:tags(*))
      `)
      .eq("is_trashed", false);

    if (folderId) {
      query = query.eq("folder_id", folderId);
    }
    if (typeId) {
      query = query.eq("type_id", typeId);
    }

    if (q) {
      query = query.or(
        `title.ilike.%${q}%,document_number.ilike.%${q}%,notes.ilike.%${q}%,origin_sector.ilike.%${q}%,ocr_text.ilike.%${q}%`
      );
    }

    const { data: fallbackDocs, error: fbError } = await query.order("created_at", { ascending: false });

    if (fbError) {
      throw fbError;
    }

    const formatted = (fallbackDocs || []).map((doc: any) => ({
      ...doc,
      tags: (doc.document_tags || []).map((dt: any) => dt.tag).filter(Boolean),
    }));

    return NextResponse.json({ results: formatted });
  } catch (error: any) {
    console.error("Erro na busca de documentos:", error);
    return NextResponse.json(
      { error: "Falha ao processar pesquisa." },
      { status: 500 }
    );
  }
}
