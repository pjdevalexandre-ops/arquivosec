import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getPresignedUploadUrl } from "@/lib/r2/upload";
import { sanitizeFileName } from "@/lib/utils";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    const { fileName, mimeType, fileSizeBytes } = await req.json();

    if (!fileName || !mimeType) {
      return NextResponse.json(
        { error: "Nome do arquivo e formato são obrigatórios." },
        { status: 400 }
      );
    }

    // Validação estrita de tipo de arquivo seguro
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/tiff",
      "image/bmp",
    ];

    if (!allowedMimeTypes.includes(mimeType.toLowerCase())) {
      return NextResponse.json(
        { error: "Formato não suportado. O sistema aceita exclusivamente PDFs e imagens digitalizadas." },
        { status: 400 }
      );
    }

    // Limite máximo por arquivo individual: 500 MB
    const maxSizeBytes = 500 * 1024 * 1024;
    if (fileSizeBytes && fileSizeBytes > maxSizeBytes) {
      return NextResponse.json(
        { error: "O arquivo excede o limite individual de 500 MB. Utilize divisão em partes." },
        { status: 400 }
      );
    }

    // Obtém o usuário se autenticado para isolar no storage
    let userPrefix = "gestor";
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClientServer();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userPrefix = user.id;
        }
      } catch (authErr) {
        console.warn("Aviso ao obter usuário na rota presigned:", authErr);
      }
    }

    // Chave única e inalterável com UUID v4 + Timestamp + Nome Sanitizado
    // Isso garante que arquivos NUNCA sejam sobrescritos ou perdidos
    const cleanName = sanitizeFileName(fileName);
    const uniqueId = crypto.randomUUID();
    const timestamp = Date.now();
    const fileKey = `docs/${userPrefix}/${timestamp}-${uniqueId}-${cleanName}`;

    const uploadUrl = await getPresignedUploadUrl(fileKey, mimeType, 3600);

    return NextResponse.json({
      uploadUrl,
      fileKey,
      expiresIn: 3600,
    });
  } catch (error: any) {
    console.error("Erro ao gerar URL assinada:", error);
    return NextResponse.json(
      { error: "Falha ao gerar link seguro de upload." },
      { status: 500 }
    );
  }
}
