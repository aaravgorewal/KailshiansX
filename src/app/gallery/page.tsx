// src/app/gallery/page.tsx
// Public gallery organized by category and event (PRD §18)

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
    <div className="bg-surface-950 min-h-screen pb-24">
      {/* ─── HERO HEADER BANNER ────────────────────────────────────────────── */}
      <section className="border-surface-800 from-surface-900 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b pt-16 pb-12">
        <div
          className="bg-grid pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
        />

        <div className="container-page relative z-10 text-center">
          <SectionHeader
            badge="Visual Archive"
            title="Moments from the Developer Ecosystem"
            highlight="Developer Ecosystem"
            description="36-hour hackathon floor sprints, architecture masterclasses, collegiate summits, and behind-the-scenes rituals across India."
            align="center"
          />

          {/* Quick Metrics Bar */}
          <div className="text-surface-400 mt-8 flex flex-wrap items-center justify-center gap-6 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>
                <strong className="text-surface-100">{albums.length}</strong> Curated Albums
              </span>
            </div>
            <span className="text-surface-700">•</span>
            <div>
              <strong className="text-surface-100">{totalImagesCount}</strong> High-Res Photos
            </div>
            <span className="text-surface-700">•</span>
            <div>
              <strong className="text-surface-100">6</strong> Core Categories
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN GALLERY CONTENT ──────────────────────────────────────────── */}
      <main className="container-page mt-10">
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
