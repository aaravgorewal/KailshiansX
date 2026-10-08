"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, ImageIcon } from "lucide-react";
import type { LightboxImage } from "./Lightbox";
import { formatDate } from "@/lib/format-date";

const Lightbox = dynamic(() => import("./Lightbox").then((mod) => mod.Lightbox), {
  ssr: false,
});

interface SerializedImage {
  id: string;
  url: string;
  thumbUrl?: string | null;
  caption?: string | null;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

interface AlbumDetailClientProps {
  album: {
    id: string;
    title: string;
    category: string;
    coverImage?: string | null;
    event?: {
      id: string;
      title: string;
      slug: string;
      startDate: string | Date;
      type: string;
      venue?: string | null;
      city?: { name: string; state?: string } | null;
    } | null;
    images: SerializedImage[];
    _count?: { images: number };
  };
}

function PhotoCard({
  img,
  idx,
  onClick,
}: {
  img: SerializedImage;
  idx: number;
  onClick: () => void;
}) {
  const [hasError, setHasError] = React.useState(false);
  const isPriority = idx === 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View photo ${idx + 1}`}
      className="group border-border bg-muted focus-visible:ring-primary relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-lg border focus-visible:ring-2 focus-visible:outline-none"
    >
      {hasError ? (
        <div
          className="text-muted-foreground bg-muted flex size-full items-center justify-center"
          aria-hidden="true"
        >
          <ImageIcon className="size-8 opacity-40" />
        </div>
      ) : (
        <Image
          src={img.url}
          alt=""
          fill
          priority={isPriority}
          loading={isPriority ? "eager" : "lazy"}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-opacity duration-200 group-hover:opacity-90"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}

export function AlbumDetailClient({ album }: AlbumDetailClientProps) {
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);

  const eventDate = album.event?.startDate ? formatDate(album.event.startDate) : null;
  const cityName = album.event?.city?.name || null;
  const metaText = [eventDate, cityName].filter(Boolean).join(" · ");

  const lightboxImages: LightboxImage[] = album.images.map((img) => ({
    id: img.id,
    url: img.url,
    caption: img.caption,
    altText: img.altText,
    width: img.width,
    height: img.height,
  }));

  return (
    <div className="space-y-8">
      {/* Back link & Header */}
      <div className="space-y-4">
        <Link
          href="/gallery"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 font-mono text-xs transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Gallery</span>
        </Link>

        <div className="space-y-1">
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {album.title}
          </h1>
          {metaText && <p className="text-muted-foreground font-mono text-xs">{metaText}</p>}
        </div>
      </div>

      {/* Masonry-free uniform photo grid */}
      {album.images.length === 0 ? (
        <div className="text-muted-foreground border-border rounded-lg border border-dashed py-16 text-center text-sm">
          No photos found in this album.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {album.images.map((img, idx) => (
            <PhotoCard
              key={img.id || idx}
              img={img}
              idx={idx}
              onClick={() => setViewerIndex(idx)}
            />
          ))}
        </div>
      )}

      {/* Viewer Modal */}
      <Lightbox
        images={lightboxImages}
        currentIndex={viewerIndex ?? 0}
        isOpen={viewerIndex !== null}
        onClose={() => setViewerIndex(null)}
        onNavigate={(newIndex) => setViewerIndex(newIndex)}
      />
    </div>
  );
}
