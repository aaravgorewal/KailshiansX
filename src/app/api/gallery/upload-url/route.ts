// src/app/api/gallery/upload-url/route.ts
// Generates presigned S3 upload URLs for authenticated admins

import { NextRequest, NextResponse } from "next/server";
import { requireAdminForRoute } from "@/server/auth/require-role";
import { createPresignedUploadUrl } from "@/lib/storage";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const authResult = await requireAdminForRoute();
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { albumId, filename, contentType } = body;

    if (!albumId || !filename) {
      return NextResponse.json({ error: "albumId and filename are required" }, { status: 400 });
    }

    // Verify album exists
    const album = await db.galleryAlbum.findUnique({
      where: { id: albumId },
      select: { id: true },
    });

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    const presigned = await createPresignedUploadUrl({
      albumId,
      filename,
      contentType: contentType || "image/jpeg",
    });

    return NextResponse.json(presigned);
  } catch (error) {
    console.error("Failed to generate presigned upload URL:", error);
    return NextResponse.json({ error: "Failed to generate presigned upload URL" }, { status: 500 });
  }
}
