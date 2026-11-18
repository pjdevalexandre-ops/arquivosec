import { NextRequest, NextResponse } from "next/server";
import { getPresignedDownloadUrl } from "@/lib/r2/upload";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;

    if (isSupabaseConfigured()) {
      const supabase = await createClientServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }

      const { data: document, error } = await supabase
        .from("documents")
        .select(`
          *,
          folder:folders(*),
          type:document_types(*),
          document_tags(tag:tags(*))
        `)
        .eq("id", documentId)
        .eq("user_id", user.id)
        .single();

      if (error || !document) {
        return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });
      }

      // Gera URL assinada de 15 minutos diretamente do Cloudflare R2
      const signedUrl = await getPresignedDownloadUrl(document.file_key, 900);

      // Registra visualização na auditoria
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        document_id: document.id,
        action: "view",
        details: { mode: "signed_get_url" },
      });

      const formattedDoc = {
        ...document,
        tags: (document.document_tags || []).map((dt: any) => dt.tag).filter(Boolean),
        file_url: signedUrl,
      };

      return NextResponse.json({ url: signedUrl, document: formattedDoc });
    }

    return NextResponse.json(
      { error: "Serviço de armazenamento não configurado." },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Erro ao obter URL de visualização:", error);
    return NextResponse.json(
      { error: "Falha ao gerar link seguro de visualização." },
      { status: 500 }
    );
  }
}
