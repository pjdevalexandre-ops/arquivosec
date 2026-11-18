import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folder_id");
    const isFavorite = searchParams.get("favorite") === "true";
    const isTrashed = searchParams.get("trashed") === "true";

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Serviço de banco de dados não configurado." },
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

    let query = supabase
      .from("documents")
      .select(`
        *,
        folder:folders(*),
        type:document_types(*),
        document_tags(tag:tags(*))
      `)
      .eq("is_trashed", isTrashed)
      .order("created_at", { ascending: false });

    if (folderId) {
      query = query.eq("folder_id", folderId);
    }

    if (isFavorite) {
      query = query.eq("is_favorite", true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Mapeia tags associadas
    const formattedDocs = (data || []).map((doc: any) => ({
      ...doc,
      tags: (doc.document_tags || []).map((dt: any) => dt.tag).filter(Boolean),
    }));

    return NextResponse.json({ documents: formattedDocs });
  } catch (error: any) {
    console.error("Erro ao listar documentos:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao carregar documentos." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ids, title, document_number, folder_id, type_id, is_favorite, notes } = body;

    if (!id && (!ids || !Array.isArray(ids) || ids.length === 0)) {
      return NextResponse.json(
        { error: "ID ou lista de IDs de documentos é obrigatório." },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Serviço de banco de dados não configurado." },
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

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (document_number !== undefined) updateData.document_number = document_number;
    if (folder_id !== undefined) updateData.folder_id = folder_id || null;
    if (type_id !== undefined) updateData.type_id = type_id || null;
    if (is_favorite !== undefined) updateData.is_favorite = is_favorite;
    if (notes !== undefined) updateData.notes = notes;

    // Atualização em lote
    if (ids && Array.isArray(ids) && ids.length > 0) {
      const { error } = await supabase
        .from("documents")
        .update(updateData)
        .in("id", ids);

      if (error) throw error;

      return NextResponse.json({ success: true, count: ids.length });
    }

    // Atualização unitária
    const { data, error } = await supabase
      .from("documents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, document: data });
  } catch (error: any) {
    console.error("Erro ao atualizar documento:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao atualizar documento." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { ids, action = "trash" } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Lista de IDs é obrigatória para exclusão em lote." },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Serviço de banco de dados não configurado." },
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

    if (action === "trash") {
      const { error } = await supabase
        .from("documents")
        .update({
          is_trashed: true,
          trashed_at: new Date().toISOString(),
        })
        .in("id", ids);

      if (error) throw error;

      return NextResponse.json({ success: true, count: ids.length });
    }

    return NextResponse.json(
      { error: "Ação não suportada para exclusão em lote." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Erro ao excluir documentos em lote:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao processar exclusão em lote." },
      { status: 500 }
    );
  }
}
