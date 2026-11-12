import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { mockDocuments } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const folderId = searchParams.get("folder_id");
    const typeId = searchParams.get("type_id");

    if (isSupabaseConfigured()) {
      const supabase = await createClientServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }

      // Executa a função RPC Postgres criada no schema
      const { data, error } = await supabase.rpc("search_documents", {
        search_query: q,
        filter_folder_id: folderId || null,
        filter_type_id: typeId || null,
      });

      if (error) {
        throw error;
      }

      return NextResponse.json({ results: data });
    }

    // Modo demonstração
    const results = mockDocuments.filter((doc) => {
      if (doc.is_trashed) return false;
      const lower = q.toLowerCase();
      return (
        doc.title.toLowerCase().includes(lower) ||
        doc.document_number?.toLowerCase().includes(lower) ||
        doc.notes?.toLowerCase().includes(lower) ||
        doc.ocr_text?.toLowerCase().includes(lower)
      );
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Erro na busca de documentos:", error);
    return NextResponse.json(
      { error: "Falha ao processar pesquisa." },
      { status: 500 }
    );
  }
}
