import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { mockFolders } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
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
    }

    return NextResponse.json({ folders: mockFolders });
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

    if (isSupabaseConfigured()) {
      const supabase = await createClientServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }

      const { data: folder, error } = await supabase
        .from("folders")
        .insert({
          user_id: user.id,
          name: name.trim(),
          parent_id: parent_id || null,
          color: color || "#0F4C5C",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ success: true, folder });
    }

    const mockFolder = {
      id: `f-${Date.now()}`,
      user_id: "gestor",
      name: name.trim(),
      parent_id: parent_id || null,
      color: color || "#0F4C5C",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      document_count: 0,
    };

    return NextResponse.json({ success: true, folder: mockFolder });
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
    }

    return NextResponse.json({ success: true });
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

    if (isSupabaseConfigured()) {
      const supabase = await createClientServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }

      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      return NextResponse.json({ success: true });
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
