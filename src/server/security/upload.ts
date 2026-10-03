// src/server/security/upload.ts — File upload type & size limit validation

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const MIME_EXTENSION_MAP: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/avif": [".avif"],
  "image/gif": [".gif"],
};

export interface FileValidationInput {
  contentType?: string | null;
  sizeBytes?: number | null;
  filename?: string | null;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  normalizedMimeType?: AllowedImageMimeType;
}

/**
 * Validates that an uploaded file is an allowed image type and within size constraints.
 */
export function validateFileUpload(input: FileValidationInput): FileValidationResult {
  const { contentType, sizeBytes, filename } = input;

  // 1. Validate MIME type
  if (!contentType) {
    return { valid: false, error: "Content-Type is required for upload verification." };
  }

  const normalized = contentType.toLowerCase().trim() as AllowedImageMimeType;
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(normalized)) {
    return {
      valid: false,
      error: `Invalid file type '${contentType}'. Only JPEG, PNG, WebP, AVIF, and GIF are allowed.`,
    };
  }

  // 2. Validate size if provided
  if (typeof sizeBytes === "number") {
    if (sizeBytes <= 0) {
      return { valid: false, error: "File cannot be empty (0 bytes)." };
    }
    if (sizeBytes > MAX_UPLOAD_SIZE_BYTES) {
      const maxMb = MAX_UPLOAD_SIZE_BYTES / (1024 * 1024);
      return {
        valid: false,
        error: `File size exceeds the maximum limit of ${maxMb}MB.`,
      };
    }
  }

  // 3. Validate filename extension if provided
  if (filename) {
    const extMatch = filename.toLowerCase().match(/\.[a-z0-9]+$/);
    const ext = extMatch ? extMatch[0] : "";
    const allowedExts = MIME_EXTENSION_MAP[normalized] || [];
    if (ext && !allowedExts.includes(ext)) {
      return {
        valid: false,
        error: `Filename extension '${ext}' does not match Content-Type '${normalized}'.`,
      };
    }
  }

  return { valid: true, normalizedMimeType: normalized };
}
