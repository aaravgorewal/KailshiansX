// src/app/gallery/page.tsx
// Public gallery organized by category and event

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GalleryOverviewClient } from "@/components/gallery/GalleryOverviewClient";
import { getGalleryOverview } from "@/server/gallery/queries";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community & Event Gallery | KailshiansX",
  description:
    "Explore photo archives from KailshiansX hackathons, meetups, workshops, tech talks, community summits, and behind-the-scenes builder moments across India.",
  alternates: {
    canonical: `${APP_URL}/gallery`,
  },
  openGraph: {
    title: "Community & Event Gallery | KailshiansX",
    description:
      "High-resolution photos from NirmanX, RaibarX, PadharoX, architecture workshops, and campus builder chapters.",
    url: `${APP_URL}/gallery`,
    siteName: "KailshiansX",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KailshiansX Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Community & Event Gallery | KailshiansX",
    description:
      "Explore photo archives from KailshiansX hackathons, meetups, workshops, tech talks, and builder moments.",
    images: ["/og-image.png"],
  },
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; eventId?: string; search?: string }>;
}) {
  const sParams = await searchParams;
  const session = await auth();
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(session?.user?.role || "");

  const { albums, totalImagesCount, categoryCounts, eventsWithAlbums } = await getGalleryOverview({
    category: sParams.category,
    eventId: sParams.eventId,
    search: sParams.search,
  });

  // Serialize albums for client component
  const serializedAlbums = albums.map((alb) => ({
    id: alb.id,
    title: alb.title,
    category: alb.category,
    coverImage: alb.coverImage,
    event: alb.event
      ? {
          id: alb.event.id,
          title: alb.event.title,
          slug: alb.event.slug,
          startDate: alb.event.startDate.toISOString(),
          type: alb.event.type,
          venue: alb.event.venue,
          city: alb.event.city,
        }
      : null,
    images: alb.images.map((img) => ({
      id: img.id,
      url: img.url,
      caption: img.caption,
      altText: img.altText,
    })),
    _count: alb._count,
  }));

  const serializedEvents = eventsWithAlbums.map((ev) => ({
    id: ev.id,
    title: ev.title,
    slug: ev.slug,
    type: ev.type,
    city: ev.city,
    _count: ev._count,
  }));

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* ─── HEADER BANNER ─────────────────────────────────────────────────── */}
      <section className="border-border border-b py-12">
        <div className="container-page">
          <SectionHeader
            title="Visual Archive"
            description="Moments from hackathons, architecture masterclasses, collegiate summits, and behind-the-scenes rituals across India."
          />

          {/* Quick Metrics Bar */}
          <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-6 font-mono text-xs">
            <div>
              <strong className="text-foreground font-semibold">{albums.length}</strong> Curated
              Albums
            </div>
            <span>•</span>
            <div>
              <strong className="text-foreground font-semibold">{totalImagesCount}</strong> High-Res
              Photos
            </div>
            <span>•</span>
            <div>
              <strong className="text-foreground font-semibold">6</strong> Categories
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN GALLERY CONTENT ──────────────────────────────────────────── */}
      <main className="container-page mt-8">
        <GalleryOverviewClient
          albums={serializedAlbums}
          categoryCounts={categoryCounts}
          eventsWithAlbums={serializedEvents}
          totalPhotosCount={totalImagesCount}
          isAdmin={isAdmin}
        />
      </main>
    </div>
  );
}
