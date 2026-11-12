import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/r2/upload";
import { sanitizeFileName } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { fileName, mimeType, fileSizeBytes } = await req.json();

    if (!fileName || !mimeType) {
      return NextResponse.json(
        { error: "Nome do arquivo e tipo MIME são obrigatórios." },
        { status: 400 }
      );
    }

    // Validação de tipo de arquivo seguro (PDFs e imagens digitalizadas)
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/tiff",
      "image/bmp",
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Apenas PDFs e imagens digitalizadas são aceitos." },
        { status: 400 }
      );
    }

    // Limite máximo de arquivo individual: 500 MB
    const maxSizeBytes = 500 * 1024 * 1024;
    if (fileSizeBytes && fileSizeBytes > maxSizeBytes) {
      return NextResponse.json(
        { error: "Tamanho de arquivo excede o limite máximo permitido de 500 MB por documento." },
        { status: 400 }
      );
    }

    const cleanName = sanitizeFileName(fileName);
    const fileKey = `docs/${Date.now()}-${cleanName}`;

    const uploadUrl = await getPresignedUploadUrl(fileKey, mimeType, 3600);

    return NextResponse.json({
      uploadUrl,
      fileKey,
      expiresIn: 3600,
    });
  } catch (error: any) {
    console.error("Erro ao gerar URL assinada:", error);
    return NextResponse.json(
      { error: "Falha ao gerar URL de upload seguro." },
      { status: 500 }
    );
  }
}
