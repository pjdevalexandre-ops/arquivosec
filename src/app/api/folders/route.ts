import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    const { data: folders, error } = await supabase
      .from("folders")
      .select("*, documents:documents(count)")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    const formatted = (folders || []).map((f: any) => ({
      ...f,
      document_count: f.documents?.[0]?.count || 0,
    }));

    return NextResponse.json({ folders: formatted });
  } catch (error: any) {
    console.error("Erro ao listar pastas:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao listar pastas." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, parent_id, color } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nome da pasta é obrigatório." }, { status: 400 });
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

    const cleanName = name.trim();

    // Validação de duplicidade no mesmo nível
    let duplicateCheck = supabase
      .from("folders")
      .select("id")
      .eq("user_id", user.id)
      .ilike("name", cleanName);

    if (parent_id) {
      duplicateCheck = duplicateCheck.eq("parent_id", parent_id);
    } else {
      duplicateCheck = duplicateCheck.is("parent_id", null);
    }

    const { data: existing } = await duplicateCheck.maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma pasta com este nome neste nível." },
        { status: 409 }
      );
    }

    const { data: folder, error } = await supabase
      .from("folders")
      .insert({
        user_id: user.id,
        name: cleanName,
        parent_id: parent_id || null,
        color: color || "#0F4C5C",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, folder });
  } catch (error: any) {
    console.error("Erro ao criar pasta:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao criar pasta." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, name, color, parent_id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID da pasta é obrigatório." }, { status: 400 });
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
    if (name) updateData.name = name.trim();
    if (color) updateData.color = color;
    if (parent_id !== undefined) updateData.parent_id = parent_id || null;

    const { data: folder, error } = await supabase
      .from("folders")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, folder });
  } catch (error: any) {
    console.error("Erro ao atualizar pasta:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao atualizar pasta." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID da pasta é obrigatório." }, { status: 400 });
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

    // Ao deletar pasta, remove a associação dos documentos pertencentes a ela (set folder_id = null)
    await supabase
      .from("documents")
      .update({ folder_id: null })
      .eq("folder_id", id)
      .eq("user_id", user.id);

    const { error } = await supabase
      .from("folders")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir pasta:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao excluir pasta." },
      { status: 500 }
    );
  }
}
