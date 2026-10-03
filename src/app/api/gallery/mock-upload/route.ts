// src/app/api/gallery/mock-upload/route.ts
// Dev fallback route for handling uploads when S3 credentials are not yet configured

import { NextRequest, NextResponse } from "next/server";
import { validateFileUpload } from "@/server/security/upload";

// In-memory or fallback storage for mock mode in local dev
const mockStorage = new Map<string, { buffer: Buffer; contentType: string }>();

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
  }

  const contentType = request.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await request.arrayBuffer();

  const validation = validateFileUpload({
    contentType,
    sizeBytes: arrayBuffer.byteLength,
    filename: key,
  });

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  mockStorage.set(key, {
    buffer: Buffer.from(arrayBuffer),
    contentType: validation.normalizedMimeType || contentType,
  });

  return new NextResponse(null, { status: 200 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key || !mockStorage.has(key)) {
    // Return a default SVG placeholder if not in memory
    const svg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#18181b"/>
        <text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="#a1a1aa" text-anchor="middle" dominant-baseline="middle">
          KailshiansX Gallery Image
        </text>
      </svg>
    `;
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const item = mockStorage.get(key)!;
  return new NextResponse(new Uint8Array(item.buffer), {
    headers: {
      "Content-Type": item.contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
