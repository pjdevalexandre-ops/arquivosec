import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { simulateOcrProcessing } from "@/lib/ocr/processor";

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

    const extension = file_name.split(".").pop()?.toLowerCase() || "pdf";

    // Simulação ou processamento inicial de OCR
    const initialOcrText = await simulateOcrProcessing(file_name, mime_type);

    if (isSupabaseConfigured()) {
      const supabase = await createClientServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }

      // 1. Inserir Documento
      const { data: document, error: docError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title,
          document_number,
          document_date: document_date || null,
          origin_sector,
          folder_id: folder_id || null,
          type_id: type_id || null,
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
        throw docError;
      }

      // 2. Inserir Tags
      if (tag_ids.length > 0) {
        const docTags = tag_ids.map((tagId: string) => ({
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

    // Modo demonstração
    const mockCreatedDoc = {
      id: `doc-${Date.now()}`,
      title,
      document_number,
      document_date,
      origin_sector,
      folder_id,
      type_id,
      notes,
      file_key,
      file_name,
      file_size_bytes,
      mime_type,
      file_extension: extension,
      ocr_text: initialOcrText,
      ocr_status: "completed",
      is_favorite: false,
      is_trashed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, document: mockCreatedDoc });
  } catch (error: any) {
    console.error("Erro ao registrar conclusão do upload:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao salvar metadados do documento." },
      { status: 500 }
    );
  }
}
