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

    const { data: types, error } = await supabase
      .from("document_types")
      .select("*")
      .or(`user_id.eq.${user.id},is_default.eq.true`)
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ types: types || [] });
  } catch (error: any) {
    console.error("Erro ao listar tipos:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao listar tipos." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, color = "#0F4C5C", description } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
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

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const { data: docType, error } = await supabase
      .from("document_types")
      .insert({
        user_id: user.id,
        name: name.trim(),
        slug,
        description: description || null,
        color,
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, type: docType });
  } catch (error: any) {
    console.error("Erro ao criar tipo:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao criar tipo." },
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

    // Apenas tipos criados pelo usuário (não os padrões do sistema) podem ser excluídos
    const { error } = await supabase
      .from("document_types")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("is_default", false);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir tipo:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao excluir tipo." },
      { status: 500 }
    );
  }
}
