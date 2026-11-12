import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getPresignedDownloadUrl } from "@/lib/r2/upload";
import { mockDocuments } from "@/lib/mock-data";

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const { password } = await req.json().catch(() => ({}));

    if (isSupabaseConfigured()) {
      const supabase = await createClientServer();

      // Busca link ativo e não expirado
      const { data: shareLink, error } = await supabase
        .from("share_links")
        .select("*, document:documents(*)")
        .eq("token", token)
        .eq("is_active", true)
        .single();

      if (error || !shareLink) {
        return NextResponse.json({ error: "Link inválido ou revogado." }, { status: 404 });
      }

      if (new Date(shareLink.expires_at).getTime() < Date.now()) {
        return NextResponse.json({ error: "Este link já expirou." }, { status: 410 });
      }

      // Validação de senha
      if (shareLink.password_hash) {
        if (!password || `hash_${password}` !== shareLink.password_hash) {
          return NextResponse.json({ error: "Senha incorreta.", requiresPassword: true }, { status: 403 });
        }
      }

      // Incrementa visualização
      await supabase
        .from("share_links")
        .update({ view_count: (shareLink.view_count || 0) + 1 })
        .eq("id", shareLink.id);

      // Gera URL assinada de download do arquivo
      const fileUrl = await getPresignedDownloadUrl(shareLink.document.file_key, 900);

      return NextResponse.json({
        document: shareLink.document,
        fileUrl,
      });
    }

    // Modo demonstração
    return NextResponse.json({
      document: mockDocuments[0],
      fileUrl: "/mock-file/sample.pdf",
    });
  } catch (error: any) {
    console.error("Erro na validação do link compartilhado:", error);
    return NextResponse.json(
      { error: "Falha ao processar link compartilhado." },
      { status: 500 }
    );
  }
}
