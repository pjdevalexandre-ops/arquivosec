import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { simulateOcrProcessing } from "@/lib/ocr/processor";

export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "documentId é obrigatório." }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClientServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }

      // Marca como 'processing'
      await supabase
        .from("documents")
        .update({ ocr_status: "processing" })
        .eq("id", documentId)
        .eq("user_id", user.id);

      const { data: document } = await supabase
        .from("documents")
        .select("file_name, mime_type")
        .eq("id", documentId)
        .single();

      const extractedText = await simulateOcrProcessing(
        document?.file_name || "documento.pdf",
        document?.mime_type || "application/pdf"
      );

      // Atualiza texto e marca como 'completed'
      await supabase
        .from("documents")
        .update({
          ocr_text: extractedText,
          ocr_status: "completed",
          ocr_processed_at: new Date().toISOString(),
        })
        .eq("id", documentId)
        .eq("user_id", user.id);

      return NextResponse.json({ success: true, text: extractedText });
    }

    return NextResponse.json({
      success: true,
      text: "Texto OCR processado com sucesso em modo demonstração.",
    });
  } catch (error: any) {
    console.error("Erro no processamento OCR:", error);
    return NextResponse.json(
      { error: "Falha ao processar OCR do documento." },
      { status: 500 }
    );
  }
}
