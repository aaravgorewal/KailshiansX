import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "/", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/events", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/community", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/gallery", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/partner", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/refunds", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${APP_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Query published events
  let eventEntries: MetadataRoute.Sitemap = [];
  try {
    const publishedEvents = await db.event.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    eventEntries = publishedEvents.map((event) => ({
      url: `${APP_URL}/events/${event.slug}`,
      lastModified: event.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));
  } catch (error) {
    console.error("Failed to generate event sitemap entries:", error);
  }

  // Query published gallery albums
  let albumEntries: MetadataRoute.Sitemap = [];
  try {
    const albums = await db.galleryAlbum.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    albumEntries = albums.map((album) => ({
      url: `${APP_URL}/gallery/${album.id}`,
      lastModified: album.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Failed to generate gallery sitemap entries:", error);
  }

  return [...staticEntries, ...eventEntries, ...albumEntries];
}
