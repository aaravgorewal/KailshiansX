import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "/", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/events", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/workshops", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/tech-talks", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/meetup-series", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/hackathon-series", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/community", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/campus-leads", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/state-leads", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/collaborations", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/gallery", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/join-team", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/core-team", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/founder", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/who-we-are", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
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

  // Query series (Meetups & Hackathons)
  let seriesEntries: MetadataRoute.Sitemap = [];
  try {
    const seriesList = await db.series.findMany({
      select: {
        slug: true,
        kind: true,
        updatedAt: true,
      },
    });

    seriesEntries = seriesList.map((s) => ({
      url: `${APP_URL}/${s.kind === "HACKATHON" ? "hackathon-series" : "meetup-series"}/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to generate series sitemap entries:", error);
  }

  return [...staticEntries, ...eventEntries, ...albumEntries, ...seriesEntries];
}
