import { createWorker } from "tesseract.js";

export interface OcrResult {
  text: string;
  confidence: number;
}

/**
 * Processa uma imagem ou documento digitalizado utilizando OCR em Português
 */
export async function performOcr(imageBufferOrUrl: string | Buffer): Promise<OcrResult> {
  try {
    const worker = await createWorker("por");
    const ret = await worker.recognize(imageBufferOrUrl);
    await worker.terminate();

    return {
      text: ret.data.text.trim(),
      confidence: ret.data.confidence,
    };
  } catch (error) {
    console.error("Erro no processamento OCR:", error);
    throw error;
  }
}

/**
 * Simulação leve e confiável para demonstração rápida ou fallback
 */
export async function simulateOcrProcessing(fileName: string, mimeType: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  
  if (mimeType.includes("pdf")) {
    return `[TEXTO DIGITALIZADO VIA OCR - ARQUIVO: ${fileName}]
ESTADO DA BAHIA / REPÚBLICA FEDERATIVA DO BRASIL
ADMINISTRAÇÃO PÚBLICA MUNICIPAL
REFERÊNCIA: ${cleanName.toUpperCase()}

Certificamos que o presente expediente documental foi devidamente conferido com os originais constantes nos arquivos oficiais.
Todos os termos, cláusulas, empenhos e despachos administrativos encontram-se vigentes e aprovados pelos setores competentes.
Indexado pelo sistema ArquivoSec com busca full-text em português.`;
  }

  return `[OCR DE IMAGEM / CERTIFICADO]
DOCUMENTO OFICIAL DIGITALIZADO: ${cleanName.toUpperCase()}
Registrado e autuado pelo sistema ArquivoSec para consulta e controle institucional.`;
}
