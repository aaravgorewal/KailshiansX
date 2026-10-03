// src/app/api/gallery/images/route.ts
// Inserts new gallery images into the database after S3 upload

import { NextRequest, NextResponse } from "next/server";
import { requireAdminForRoute } from "@/server/auth/require-role";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const authResult = await requireAdminForRoute();
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { albumId, images } = body; // images is array of { url, caption, altText, width, height }

    if (!albumId || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "albumId and non-empty images array are required" },
        { status: 400 }
      );
    }

    const album = await db.galleryAlbum.findUnique({
      where: { id: albumId },
      include: { _count: { select: { images: true } } },
    });

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    const startOrder = album._count.images;

    // Create the images
    const createdImages = await db.$transaction(
      images.map(
        (
          img: { url: string; caption?: string; altText?: string; width?: number; height?: number },
          index: number
        ) =>
          db.galleryImage.create({
            data: {
              albumId,
              url: img.url,
              caption: img.caption || null,
              altText: img.altText || img.caption || album.title,
              width: img.width || null,
              height: img.height || null,
              sortOrder: startOrder + index + 1,
            },
          })
      )
    );

    // If album has no cover image, set the first uploaded image as cover
    if (!album.coverImage && images[0]?.url) {
      await db.galleryAlbum.update({
        where: { id: albumId },
        data: { coverImage: images[0].url },
      });
    }

    return NextResponse.json({ success: true, count: createdImages.length, images: createdImages });
  } catch (error) {
    console.error("Failed to save gallery images:", error);
    return NextResponse.json({ error: "Failed to save gallery images" }, { status: 500 });
  }
}
