// src/app/gallery/[albumId]/page.tsx
// Shareable event album page with OG preview, lightbox, and admin ZIP download

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { AlbumDetailClient } from "@/components/gallery/AlbumDetailClient";
import { AlbumCard } from "@/components/gallery/AlbumCard";
import { getGalleryAlbumById } from "@/server/gallery/queries";
import { GALLERY_CATEGORIES } from "@/lib/gallery";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";
import { ChevronRight, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ albumId: string }>;
}): Promise<Metadata> {
  const { albumId } = await params;
  const data = await getGalleryAlbumById(albumId);

  if (!data || !data.album) {
    return {
      title: "Album Not Found | KailshiansX Gallery",
    };
  }

  const { album } = data;
  const canonicalUrl = `${APP_URL}/gallery/${album.id}`;
  const description = `Explore ${album.images.length} high-resolution photos from ${album.title}. ${
    album.event ? `Held in conjunction with ${album.event.title}.` : ""
  } Kailshians Web Services Developer Ecosystem.`;

  return {
    title: `${album.title} | KailshiansX Gallery`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${album.title} | KailshiansX Gallery`,
      description,
      url: canonicalUrl,
      siteName: "KailshiansX",
      type: "article",
      images: [
        {
          url: `${canonicalUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: album.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${album.title} | KailshiansX Gallery`,
      description,
      images: [`${canonicalUrl}/opengraph-image`],
    },
  };
}

export default async function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;
  const session = await auth();
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(session?.user?.role || "");

  const data = await getGalleryAlbumById(albumId);
  if (!data || !data.album) {
    notFound();
  }

  const { album, relatedAlbums } = data;

  const catConfig = GALLERY_CATEGORIES.find((c) => c.key === album.category.toLowerCase()) || {
    label: album.category,
  };

  // Serialize album for client component
  const serializedAlbum = {
    id: album.id,
    title: album.title,
    category: album.category,
    coverImage: album.coverImage,
    event: album.event
      ? {
          id: album.event.id,
          title: album.event.title,
          slug: album.event.slug,
          startDate: album.event.startDate.toISOString(),
          type: album.event.type,
          venue: album.event.venue,
          city: album.event.city,
        }
      : null,
    images: album.images.map((img) => ({
      id: img.id,
      url: img.url,
      thumbUrl: img.thumbUrl,
      caption: img.caption,
      altText: img.altText,
      width: img.width,
      height: img.height,
    })),
    _count: album._count,
  };

  return (
    <div className="bg-background min-h-screen pt-8 pb-24">
      <div className="container-page space-y-8">
        {/* ─── BREADCRUMBS & BACK LINK ────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="flex items-center justify-between text-xs">
          <ol className="text-muted-foreground flex items-center gap-2">
            <li>
              <Link href="/gallery" className="hover:text-foreground transition-colors">
                Gallery
              </Link>
            </li>
            <li>
              <ChevronRight className="text-muted-foreground size-3" />
            </li>
            <li>
              <Link
                href={`/gallery?category=${album.category}`}
                className="hover:text-foreground capitalize transition-colors"
              >
                {catConfig.label}
              </Link>
            </li>
            <li>
              <ChevronRight className="text-muted-foreground size-3" />
            </li>
            <li className="text-foreground max-w-[200px] truncate font-medium sm:max-w-md">
              {album.title}
            </li>
          </ol>

          <Link
            href="/gallery"
            className="text-muted-foreground hover:text-foreground hidden items-center gap-1.5 font-medium transition-colors sm:inline-flex"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Albums</span>
          </Link>
        </nav>

        {/* ─── ALBUM DETAIL CLIENT (HEADER, PHOTO GRID, LIGHTBOX) ─────────── */}
        <AlbumDetailClient album={serializedAlbum} isAdmin={isAdmin} />

        {/* ─── RELATED ALBUMS SECTION ─────────────────────────────────────── */}
        {relatedAlbums.length > 0 && (
          <section className="border-border space-y-6 border-t pt-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-foreground text-lg font-semibold">More from the Archive</h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  Explore other gatherings in the {catConfig.label} series.
                </p>
              </div>
              <Link href="/gallery" className="text-primary text-xs font-medium hover:underline">
                View Full Archive &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedAlbums.map((relAlbum) => (
                <AlbumCard
                  key={relAlbum.id}
                  id={relAlbum.id}
                  title={relAlbum.title}
                  category={relAlbum.category}
                  coverImage={relAlbum.coverImage}
                  photoCount={relAlbum._count.images}
                  event={null}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
