// src/server/gallery/queries.ts
// Server-side database queries for KailshiansX Gallery (PRD §18)

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { GALLERY_CATEGORIES, GalleryCategoryKey } from "@/lib/gallery";
export { GALLERY_CATEGORIES, type GalleryCategoryKey };

export async function getGalleryOverview(options?: {
  category?: string;
  eventId?: string;
  search?: string;
}) {
  const { category, eventId, search } = options || {};

  const normalizedCategory = category && category !== "ALL" ? category.toLowerCase() : undefined;

  // Build filter where
  const where: Prisma.GalleryAlbumWhereInput = {
    isPublished: true,
  };

  if (normalizedCategory) {
    where.category = { equals: normalizedCategory, mode: "insensitive" };
  }

  if (eventId && eventId !== "ALL") {
    where.eventId = eventId;
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { event: { title: { contains: q, mode: "insensitive" } } },
      { event: { city: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [albums, totalImagesCount, categoryCountsRaw, eventsWithAlbums] = await Promise.all([
    db.galleryAlbum.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            type: true,
            venue: true,
            city: {
              select: { name: true, state: true },
            },
          },
        },
        images: {
          take: 4,
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            thumbUrl: true,
            caption: true,
            altText: true,
            width: true,
            height: true,
          },
        },
        _count: {
          select: { images: true },
        },
      },
    }),

    // Total photos across published albums
    db.galleryImage.count({
      where: {
        album: { isPublished: true },
      },
    }),

    // Counts per category
    db.galleryAlbum.groupBy({
      by: ["category"],
      where: { isPublished: true },
      _count: { id: true },
    }),

    // Unique events that have gallery albums
    db.event.findMany({
      where: {
        galleryAlbums: { some: { isPublished: true } },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        city: { select: { name: true } },
        _count: { select: { galleryAlbums: true } },
      },
      orderBy: { startDate: "desc" },
    }),
  ]);

  // Transform category counts map
  const categoryCounts: Record<string, number> = {
    ALL: albums.length,
    meetup: 0,
    hackathon: 0,
    workshop: 0,
    "tech-talk": 0,
    community: 0,
    bts: 0,
  };

  categoryCountsRaw.forEach((c) => {
    const key = c.category.toLowerCase();
    categoryCounts[key] = (categoryCounts[key] || 0) + c._count.id;
  });

  return {
    albums,
    totalImagesCount,
    categoryCounts,
    eventsWithAlbums,
  };
}

export async function getGalleryAlbumById(albumId: string) {
  const album = await db.galleryAlbum.findUnique({
    where: { id: albumId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          startDate: true,
          type: true,
          venue: true,
          city: {
            select: { name: true, state: true },
          },
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
      _count: {
        select: { images: true },
      },
    },
  });

  if (!album) return null;

  // Get related albums (same category or same event)
  const relatedAlbums = await db.galleryAlbum.findMany({
    where: {
      isPublished: true,
      id: { not: albumId },
      OR: [{ category: album.category }, ...(album.eventId ? [{ eventId: album.eventId }] : [])],
    },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        select: { title: true, slug: true },
      },
      _count: {
        select: { images: true },
      },
    },
  });

  return {
    album,
    relatedAlbums,
  };
}
