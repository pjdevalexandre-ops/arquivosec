import { S3Client } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const customEndpoint = process.env.R2_ENDPOINT;

export const r2BucketName = process.env.R2_BUCKET_NAME || "arquivosec-documentos";

export const isR2Configured = () => {
  return Boolean(
    (accountId || customEndpoint) &&
    accessKeyId &&
    secretAccessKey &&
    !accessKeyId.includes("placeholder")
  );
};

export const r2Client = new S3Client({
  region: "auto",
  endpoint: customEndpoint || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "https://placeholder.r2.cloudflarestorage.com"),
  credentials: {
    accessKeyId: accessKeyId || "placeholder",
    secretAccessKey: secretAccessKey || "placeholder",
  },
});
