// src/lib/storage.ts
// S3-compatible cloud object storage integration with presigned URL support

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION || "ap-south-1";
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const bucket = process.env.S3_BUCKET_NAME || "kailshiansx-media";
const cdnUrl =
  process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, "") ||
  (endpoint ? `${endpoint.replace(/\/$/, "")}/${bucket}` : "");

/**
 * Checks whether realistic S3 credentials are configured in the environment
 */
export function isS3Configured(): boolean {
  return Boolean(
    accessKeyId &&
    secretAccessKey &&
    !accessKeyId.includes("your_access_key") &&
    !secretAccessKey.includes("your_secret_key")
  );
}

/**
 * Lazy instantiation of S3Client
 */
let cachedS3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (cachedS3Client) return cachedS3Client;

  cachedS3Client = new S3Client({
    region,
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    credentials: {
      accessKeyId: accessKeyId || "mock-key",
      secretAccessKey: secretAccessKey || "mock-secret",
    },
  });

  return cachedS3Client;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  isMock?: boolean;
}

/**
 * Generates a presigned PUT URL for uploading an image to S3-compatible storage.
 * If credentials are not configured (local dev), provides a simulated upload handler.
 */
export async function createPresignedUploadUrl({
  albumId,
  filename,
  contentType,
  expiresIn = 3600,
}: {
  albumId: string;
  filename: string;
  contentType: string;
  expiresIn?: number;
}): Promise<PresignedUploadResult> {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const key = `gallery/${albumId}/${timestamp}-${randomSuffix}-${sanitizedFilename}`;

  if (!isS3Configured()) {
    // In local development without real S3 credentials, use the local mock upload API route
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const uploadUrl = `${appUrl}/api/gallery/mock-upload?key=${encodeURIComponent(key)}`;
    const fileUrl = `${appUrl}/api/gallery/mock-upload?key=${encodeURIComponent(key)}`;

    return {
      uploadUrl,
      fileUrl,
      key,
      isMock: true,
    };
  }

  const s3 = getS3Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn });
  const fileUrl = cdnUrl
    ? `${cdnUrl}/${key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    fileUrl,
    key,
    isMock: false,
  };
}

/**
 * Fetch an image's bytes either from S3 or via standard fetch (for CDN/Unsplash URLs)
 */
export async function fetchImageBuffer(
  url: string,
  key?: string
): Promise<{ buffer: Buffer; contentType: string }> {
  // If S3 is configured and we have an S3 key, read directly from S3
  if (isS3Configured() && key) {
    const s3 = getS3Client();
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const res = await s3.send(command);
    const byteArray = await res.Body?.transformToByteArray();
    return {
      buffer: Buffer.from(byteArray || []),
      contentType: res.ContentType || "image/jpeg",
    };
  }

  // Fallback: fetch via standard HTTP request
  const response = await fetch(url, { headers: { "User-Agent": "KailshiansX-Gallery/1.0" } });
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}: status ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: response.headers.get("content-type") || "image/jpeg",
  };
}
