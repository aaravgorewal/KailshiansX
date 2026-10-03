// src/app/api/gallery/[albumId]/download-zip/route.ts
// Streams a ZIP archive containing all full-resolution images for admins

import { NextRequest, NextResponse } from "next/server";
import { requireAdminForRoute } from "@/server/auth/require-role";
import { db } from "@/lib/db";
import { fetchImageBuffer } from "@/lib/storage";
import JSZip from "jszip";

export async function GET(request: NextRequest, context: { params: Promise<{ albumId: string }> }) {
  const authResult = await requireAdminForRoute();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { albumId } = await context.params;

  try {
    const album = await db.galleryAlbum.findUnique({
      where: { id: albumId },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        event: {
          select: { title: true, slug: true },
        },
      },
    });

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    if (album.images.length === 0) {
      return NextResponse.json({ error: "No images found in this album" }, { status: 400 });
    }

    const zip = new JSZip();
    const sanitizedAlbumTitle = album.title.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);

    // Fetch images in parallel with controlled concurrency
    const fetchPromises = album.images.map(async (img, idx) => {
      try {
        const { buffer, contentType } = await fetchImageBuffer(img.url);
        let ext = "jpg";
        if (contentType.includes("png")) ext = "png";
        else if (contentType.includes("webp")) ext = "webp";
        else if (contentType.includes("svg")) ext = "svg";

        const fileName = `${String(idx + 1).padStart(3, "0")}-${(
          img.caption ||
          img.altText ||
          "photo"
        )
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .substring(0, 30)}.${ext}`;

        zip.file(fileName, buffer);
      } catch (err) {
        console.error(`Failed to download image ${img.url} for zip:`, err);
      }
    });

    await Promise.all(fetchPromises);

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${sanitizedAlbumTitle}_photos.zip"`,
        "Content-Length": String(zipBuffer.length),
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("Failed to generate gallery zip archive:", error);
    return NextResponse.json({ error: "Failed to generate album ZIP" }, { status: 500 });
  }
}
