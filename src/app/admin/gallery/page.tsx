// src/app/admin/gallery/page.tsx
// Server component fetching gallery albums and associated events.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import {
  AdminGalleryManagerClient,
  type GalleryAlbumListItem,
} from "@/components/admin/AdminGalleryManagerClient";

export const metadata: Metadata = {
  title: "Gallery Manager | KailshiansX Admin",
};

export default async function AdminGalleryPage() {
  await requireAdmin();

  const [albums, events] = await Promise.all([
    db.galleryAlbum.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        event: { select: { title: true } },
        _count: { select: { images: true } },
      },
    }),
    db.event.findMany({
      where: { deletedAt: null },
      orderBy: { startDate: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  const formatted: GalleryAlbumListItem[] = albums.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
    coverImage: a.coverImage,
    isPublished: a.isPublished,
    imagesCount: a._count.images,
    eventTitle: a.event?.title ?? null,
    createdAt: a.createdAt.toISOString(),
  }));

  return <AdminGalleryManagerClient initialAlbums={formatted} events={events} />;
}
