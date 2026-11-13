import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { mockDocuments } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folder_id");
    const isFavorite = searchParams.get("favorite") === "true";
    const isTrashed = searchParams.get("trashed") === "true";

    if (isSupabaseConfigured()) {
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
        .eq("user_id", user.id)
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
    }

    // Modo local / inicial
    let localDocs = mockDocuments.filter((d) => Boolean(d.is_trashed) === isTrashed);
    if (folderId) {
      localDocs = localDocs.filter((d) => d.folder_id === folderId);
    }
    if (isFavorite) {
      localDocs = localDocs.filter((d) => d.is_favorite);
    }

    return NextResponse.json({ documents: localDocs });
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
    const { id, title, document_number, folder_id, type_id, is_favorite, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do documento é obrigatório." }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
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
      if (folder_id !== undefined) updateData.folder_id = folder_id;
      if (type_id !== undefined) updateData.type_id = type_id;
      if (is_favorite !== undefined) updateData.is_favorite = is_favorite;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from("documents")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ success: true, document: data });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao atualizar documento:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao atualizar documento." },
      { status: 500 }
    );
  }
}
