import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export default function sitemap(): MetadataRoute.Sitemap {
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

  return staticRoutes.map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1.0 : 0.8,
  }));
}
