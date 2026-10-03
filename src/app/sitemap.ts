import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "/",
    "/events",
    "/workshops",
    "/tech-talks",
    "/meetup-series",
    "/hackathon-series",
    "/community",
    "/campus-leads",
    "/state-leads",
    "/collaborations",
    "/gallery",
    "/join-team",
    "/core-team",
    "/founder",
    "/who-we-are",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1.0 : 0.8,
  }));

  // Query all published events from DB
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

  return [...staticEntries, ...eventEntries];
}
