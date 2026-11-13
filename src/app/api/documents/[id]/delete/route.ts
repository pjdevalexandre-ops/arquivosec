import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { deleteObjectFromR2 } from "@/lib/r2/upload";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;
    const body = await req.json().catch(() => ({}));
    const { action = "trash" } = body; // 'trash' (soft delete), 'restore' (restaurar), 'permanent' (expurgo definitivo)

    if (isSupabaseConfigured()) {
      const supabase = await createClientServer();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }

      // Busca documento garantindo propriedade do usuário
      const { data: doc, error: fetchErr } = await supabase
        .from("documents")
        .select("id, file_key, title, file_size_bytes")
        .eq("id", documentId)
        .eq("user_id", user.id)
        .single();

      if (fetchErr || !doc) {
        return NextResponse.json({ error: "Documento não encontrado ou sem permissão." }, { status: 404 });
      }

      if (action === "trash") {
        // 1. Soft Delete: NUNCA deleta o arquivo físico do R2!
        await supabase
          .from("documents")
          .update({
            is_trashed: true,
            trashed_at: new Date().toISOString(),
          })
          .eq("id", documentId)
          .eq("user_id", user.id);

        await supabase.from("activity_logs").insert({
          user_id: user.id,
          document_id: documentId,
          action: "delete",
          details: { reason: "movido_para_lixeira", retention_days: 30 },
        });

        return NextResponse.json({ success: true, message: "Documento movido para a lixeira." });
      }

      if (action === "restore") {
        // 2. Restaurar: Retorna o documento ao estado ativo normal
        await supabase
          .from("documents")
          .update({
            is_trashed: false,
            trashed_at: null,
          })
          .eq("id", documentId)
          .eq("user_id", user.id);

        await supabase.from("activity_logs").insert({
          user_id: user.id,
          document_id: documentId,
          action: "restore",
          details: { restored_at: new Date().toISOString() },
        });

        return NextResponse.json({ success: true, message: "Documento restaurado com sucesso." });
      }

      if (action === "permanent") {
        // 3. Expurgo Definitivo: Deleta do R2 e remove da base
        // Primeiro remove do R2
        if (doc.file_key) {
          await deleteObjectFromR2(doc.file_key);
        }

        // Depois remove do PostgreSQL (triggers atualizam cota automaticamente)
        await supabase
          .from("documents")
          .delete()
          .eq("id", documentId)
          .eq("user_id", user.id);

        await supabase.from("activity_logs").insert({
          user_id: user.id,
          document_id: null,
          action: "permanent_delete",
          details: { document_id: documentId, title: doc.title, size: doc.file_size_bytes },
        });

        return NextResponse.json({ success: true, message: "Documento excluído definitivamente." });
      }
    }

    return NextResponse.json({ success: true, action });
  } catch (error: any) {
    console.error("Erro na operação de exclusão do documento:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao processar operação." },
      { status: 500 }
    );
  }
}
