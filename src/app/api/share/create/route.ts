import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    const { documentId, duration = "7d", password } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "documentId é obrigatório." }, { status: 400 });
    }

    // Calcula expiração
    const now = new Date();
    let hours = 24 * 7; // padrão 7d
    if (duration === "24h") hours = 24;
    if (duration === "30d") hours = 24 * 30;

    const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
    const token = `sec-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36)}`;

    if (isSupabaseConfigured()) {
      const supabase = await createClientServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }

      const { data: shareLink, error } = await supabase
        .from("share_links")
        .insert({
          document_id: documentId,
          user_id: user.id,
          token,
          duration_label: duration,
          expires_at: expiresAt,
          password_hash: password ? `hash_${password}` : null,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Registra evento no log
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        document_id: documentId,
        action: "share",
        details: { token, duration, has_password: Boolean(password) },
      });

      return NextResponse.json({ token: shareLink.token, expiresAt });
    }

    return NextResponse.json({
      token,
      expiresAt,
    });
  } catch (error: any) {
    console.error("Erro ao gerar link de compartilhamento:", error);
    return NextResponse.json(
      { error: "Falha ao criar link seguro." },
      { status: 500 }
    );
  }
}
