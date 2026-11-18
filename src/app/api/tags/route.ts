import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { mockTags } from "@/lib/mock-data";

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

      const { data: tags, error } = await supabase
        .from("tags")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      return NextResponse.json({ tags: tags || [] });
    }

    return NextResponse.json({ tags: mockTags });
  } catch (error: any) {
    console.error("Erro ao listar tags:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao listar tags." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, color = "#3B82F6" } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClientServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }

      const { data: tag, error } = await supabase
        .from("tags")
        .insert({
          user_id: user.id,
          name: name.trim(),
          color,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ success: true, tag });
    }

    const mockTag = {
      id: `tag-${Date.now()}`,
      user_id: "gestor",
      name: name.trim(),
      color,
    };

    return NextResponse.json({ success: true, tag: mockTag });
  } catch (error: any) {
    console.error("Erro ao criar tag:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao criar tag." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
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
        .from("tags")
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
    console.error("Erro ao excluir tag:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao excluir tag." },
      { status: 500 }
    );
  }
}
