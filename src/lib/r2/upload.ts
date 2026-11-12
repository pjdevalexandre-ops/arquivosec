import { 
  PutObjectCommand, 
  GetObjectCommand, 
  CreateMultipartUploadCommand, 
  UploadPartCommand, 
  CompleteMultipartUploadCommand, 
  AbortMultipartUploadCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, r2BucketName, isR2Configured } from "./client";

/**
 * Gera URL assinada para envio direto do navegador (PUT)
 * Expira em 1 hora
 */
export async function getPresignedUploadUrl(
  fileKey: string,
  contentType: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  if (!isR2Configured()) {
    // Modo simulação para testes e desenvolvimento sem credenciais R2
    return `/api/mock-upload?key=${encodeURIComponent(fileKey)}`;
  }

  const command = new PutObjectCommand({
    Bucket: r2BucketName,
    Key: fileKey,
    ContentType: contentType,
  });

  return await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Gera URL assinada para visualização/download seguro de arquivo privado
 * Expiração padrão curta: 15 minutos (900s)
 */
export async function getPresignedDownloadUrl(
  fileKey: string,
  expiresInSeconds: number = 900
): Promise<string> {
  if (!isR2Configured()) {
    return `/api/mock-file?key=${encodeURIComponent(fileKey)}`;
  }

  const command = new GetObjectCommand({
    Bucket: r2BucketName,
    Key: fileKey,
  });

  return await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Inicializa upload multipart para arquivos grandes (> 50MB ou até vários GBs)
 */
export async function initMultipartUpload(
  fileKey: string,
  contentType: string
): Promise<{ uploadId: string; key: string }> {
  if (!isR2Configured()) {
    return { uploadId: "mock-upload-id-" + Date.now(), key: fileKey };
  }

  const command = new CreateMultipartUploadCommand({
    Bucket: r2BucketName,
    Key: fileKey,
    ContentType: contentType,
  });

  const response = await r2Client.send(command);
  return {
    uploadId: response.UploadId || "",
    key: fileKey,
  };
}

/**
 * Gera URL pré-assinada para uma parte específica de um upload multipart
 */
export async function getPresignedPartUrl(
  fileKey: string,
  uploadId: string,
  partNumber: number
): Promise<string> {
  if (!isR2Configured()) {
    return `/api/mock-upload?key=${encodeURIComponent(fileKey)}&part=${partNumber}`;
  }

  const command = new UploadPartCommand({
    Bucket: r2BucketName,
    Key: fileKey,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

/**
 * Conclui um upload multipart reunindo todas as partes
 */
export async function completeMultipartUpload(
  fileKey: string,
  uploadId: string,
  parts: Array<{ ETag: string; PartNumber: number }>
) {
  if (!isR2Configured()) {
    return { success: true };
  }

  const command = new CompleteMultipartUploadCommand({
    Bucket: r2BucketName,
    Key: fileKey,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts,
    },
  });

  return await r2Client.send(command);
}

/**
 * Cancela um upload multipart em caso de erro
 */
export async function abortMultipartUpload(fileKey: string, uploadId: string) {
  if (!isR2Configured()) {
    return { success: true };
  }

  const command = new AbortMultipartUploadCommand({
    Bucket: r2BucketName,
    Key: fileKey,
    UploadId: uploadId,
  });

  return await r2Client.send(command);
}
