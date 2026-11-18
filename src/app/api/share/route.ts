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

    const { data: links, error } = await supabase
      .from("share_links")
      .select(`
        *,
        document:documents(*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ links: links || [] });
  } catch (error: any) {
    console.error("Erro ao listar links compartilhados:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao listar links compartilhados." },
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

    const { error } = await supabase
      .from("share_links")
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao revogar link:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao revogar link." },
      { status: 500 }
    );
  }
}
