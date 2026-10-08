import type { Metadata } from "next";
import { GalleryOverviewClient } from "@/components/gallery/GalleryOverviewClient";
import { getGalleryOverview } from "@/server/gallery/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery | KailshiansX",
  description:
    "Photo archives from KailshiansX hackathons, meetups, workshops, tech talks, and builder chapters across India.",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sParams = await searchParams;
  const { albums } = await getGalleryOverview({
    category: sParams.category,
  });

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

  return (
    <main className="container-page min-h-screen space-y-10 py-12 sm:py-16">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Gallery
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-base">
          Photo archives from KailshiansX hackathons, meetups, workshops, tech talks, and builder
          chapters across India.
        </p>
      </div>

      <GalleryOverviewClient albums={serializedAlbums} />
    </main>
  );
}
