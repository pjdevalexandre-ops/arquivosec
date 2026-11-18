import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { simulateOcrProcessing } from "@/lib/ocr/processor";

function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const {
      title,
      document_number,
      document_date,
      origin_sector,
      folder_id,
      type_id,
      tag_ids = [],
      notes,
      file_key,
      file_name,
      file_size_bytes,
      mime_type,
    } = payload;

    const extension = file_name?.split(".").pop()?.toLowerCase() || "pdf";

    // Simulação ou processamento inicial de OCR
    const initialOcrText = await simulateOcrProcessing(file_name, mime_type);

    if (isSupabaseConfigured()) {
      const supabase = await createClientServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          { error: "Sessão não identificada. Por favor, faça login novamente." },
          { status: 401 }
        );
      }

      // Sanitiza UUIDs (ignora IDs de mock como 'f1', 't1' que causariam erro no Postgres)
      const validFolderId = isValidUuid(folder_id) ? folder_id : null;
      const validTypeId = isValidUuid(type_id) ? type_id : null;
      const validTagIds = Array.isArray(tag_ids) ? tag_ids.filter((t: string) => isValidUuid(t)) : [];

      // 1. Inserir Documento
      const { data: document, error: docError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title,
          document_number,
          document_date: document_date || null,
          origin_sector,
          folder_id: validFolderId,
          type_id: validTypeId,
          notes,
          file_key,
          file_name,
          file_size_bytes,
          mime_type,
          file_extension: extension,
          ocr_text: initialOcrText,
          ocr_status: "completed",
          ocr_processed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (docError) {
        console.error("Erro no Supabase ao registrar documento:", docError);
        return NextResponse.json(
          { error: `Erro no banco: ${docError.message || "Falha ao gravar registro."}` },
          { status: 400 }
        );
      }

      // 2. Inserir Tags válidas
      if (validTagIds.length > 0) {
        const docTags = validTagIds.map((tagId: string) => ({
          document_id: document.id,
          tag_id: tagId,
        }));
        await supabase.from("document_tags").insert(docTags);
      }

      // 3. Registrar Log de Auditoria
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        document_id: document.id,
        action: "upload",
        details: { file_name, size: file_size_bytes },
      });

      return NextResponse.json({ success: true, document });
    }

    return NextResponse.json(
      { error: "Serviço de persistência não configurado." },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Erro ao registrar conclusão do upload:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao salvar metadados do documento." },
      { status: 500 }
    );
  }
}
