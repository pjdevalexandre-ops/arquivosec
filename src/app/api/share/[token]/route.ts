import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getPresignedDownloadUrl } from "@/lib/r2/upload";

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const { password } = await req.json().catch(() => ({}));

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Serviço indisponível no momento." },
        { status: 503 }
      );
    }

    const supabase = await createClientServer();

    // Busca link ativo e não expirado
    const { data: shareLink, error } = await supabase
      .from("share_links")
      .select("*, document:documents(*)")
      .eq("token", token)
      .eq("is_active", true)
      .single();

    if (error || !shareLink || !shareLink.document) {
      return NextResponse.json(
        { error: "Link de compartilhamento não encontrado ou revogado pelo órgão emissor." },
        { status: 404 }
      );
    }

    // Verifica se expirou
    if (new Date(shareLink.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Este link de compartilhamento temporário expirou." },
        { status: 410 }
      );
    }

    // Validação de senha se exigida
    if (shareLink.password_hash) {
      if (!password) {
        return NextResponse.json(
          { error: "Este documento requer senha de validação para acesso.", requiresPassword: true },
          { status: 403 }
        );
      }
      if (`hash_${password}` !== shareLink.password_hash) {
        return NextResponse.json(
          { error: "Senha incorreta. Verifique com o emissor do documento.", requiresPassword: true },
          { status: 403 }
        );
      }
    }

    // Incrementa contador de visualização
    await supabase
      .from("share_links")
      .update({ view_count: (shareLink.view_count || 0) + 1 })
      .eq("id", shareLink.id);

    // Registra no log de auditoria
    await supabase.from("activity_logs").insert({
      user_id: shareLink.user_id,
      document_id: shareLink.document.id,
      action: "view",
      details: {
        mode: "public_share_link",
        token: token,
      },
    });

    // Gera URL assinada de download/visualização temporária do Cloudflare R2
    const fileUrl = await getPresignedDownloadUrl(shareLink.document.file_key, 900);

    return NextResponse.json({
      document: shareLink.document,
      fileUrl,
    });
  } catch (error: any) {
    console.error("Erro na validação do link compartilhado:", error);
    return NextResponse.json(
      { error: "Falha ao processar link compartilhado." },
      { status: 500 }
    );
  }
}
