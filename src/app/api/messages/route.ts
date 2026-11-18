import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

// GET /api/messages - Busca mensagens recebidas pelo usuário logado
export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ messages: [], unreadCount: 0 });
    }

    const supabase = await createClientServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // Busca as últimas 40 mensagens recebidas
    const { data: messages, error } = await supabase
      .from("internal_messages")
      .select("*")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false })
      .limit(40);

    if (error) {
      // Se a tabela ainda não foi criada no Supabase, retorna vazio graciosamente
      if (error.code === "42P01") {
        return NextResponse.json({ messages: [], unreadCount: 0 });
      }
      throw error;
    }

    const unreadCount = (messages || []).filter((m) => !m.is_read).length;

    return NextResponse.json({
      messages: messages || [],
      unreadCount,
    });
  } catch (error: any) {
    console.error("Erro ao buscar mensagens:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao buscar mensagens." },
      { status: 500 }
    );
  }
}

// POST /api/messages - Envia mensagem interna para outro usuário
export async function POST(req: NextRequest) {
  try {
    const { receiver_id, message } = await req.json();

    if (!receiver_id || !message || !message.trim()) {
      return NextResponse.json(
        { error: "Destinatário e mensagem são obrigatórios." },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });
    }

    const supabase = await createClientServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // Obter nome do remetente
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const senderName =
      profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Servidor";

    const { data: newMessage, error } = await supabase
      .from("internal_messages")
      .insert({
        sender_id: user.id,
        receiver_id,
        sender_name: senderName,
        message: message.trim(),
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error: any) {
    console.error("Erro ao enviar mensagem:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao enviar mensagem." },
      { status: 500 }
    );
  }
}

// PATCH /api/messages - Marca mensagens como lidas
export async function PATCH(req: NextRequest) {
  try {
    const { id, mark_all } = await req.json();

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createClientServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    if (mark_all) {
      await supabase
        .from("internal_messages")
        .update({ is_read: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false);
    } else if (id) {
      await supabase
        .from("internal_messages")
        .update({ is_read: true })
        .eq("id", id)
        .eq("receiver_id", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Falha ao atualizar mensagens." },
      { status: 500 }
    );
  }
}
