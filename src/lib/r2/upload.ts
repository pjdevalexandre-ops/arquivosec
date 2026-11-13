import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  CreateMultipartUploadCommand, 
  UploadPartCommand, 
  CompleteMultipartUploadCommand, 
  AbortMultipartUploadCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, r2BucketName, isR2Configured } from "./client";

/**
 * Gera URL assinada para envio direto do navegador (PUT)
 * O arquivo vai direto do navegador para o Cloudflare R2
 * Expira em 1 hora para dar tempo de uploads grandes
 */
export async function getPresignedUploadUrl(
  fileKey: string,
  contentType: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  if (!isR2Configured()) {
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
 * Expiração curta padrão: 15 minutos (900s) para máxima segurança
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
 * Remove permanentemente o arquivo do Cloudflare R2
 * ATENÇÃO: Utilizar SOMENTE no expurgo definitivo da Lixeira!
 */
export async function deleteObjectFromR2(fileKey: string): Promise<boolean> {
  if (!isR2Configured()) {
    return true;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: r2BucketName,
      Key: fileKey,
    });
    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error(`Erro ao deletar objeto ${fileKey} do R2:`, error);
    return false;
  }
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
 * Cancela um upload multipart em caso de erro para liberar recursos
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
