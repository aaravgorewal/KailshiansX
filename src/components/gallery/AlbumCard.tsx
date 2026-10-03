// src/components/gallery/AlbumCard.tsx
// Hallmark-aligned album preview card with Next.js image optimization

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Images, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { GALLERY_CATEGORIES } from "@/lib/gallery";
import { cn } from "@/lib/utils";

export interface AlbumCardProps {
  id: string;
  title: string;
  category: string;
  coverImage?: string | null;
  photoCount: number;
  event?: {
    title: string;
    slug: string;
    startDate: Date | string;
    type: string;
    city?: { name: string; state: string } | null;
  } | null;
  previewImages?: { url: string; altText?: string | null }[];
  priority?: boolean;
  className?: string;
}

export function AlbumCard({
  id,
  title,
  category,
  coverImage,
  photoCount,
  event,
  previewImages = [],
  priority = false,
  className,
}: AlbumCardProps) {
  const catConfig = GALLERY_CATEGORIES.find((c) => c.key === category.toLowerCase()) || {
    label: category,
    badgeVariant: "brand" as const,
  };

  const displayCover =
    coverImage ||
    previewImages[0]?.url ||
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80";

  const eventDate = event?.startDate
    ? new Date(event.startDate).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <article
      className={cn(
        "group border-surface-800 bg-surface-900/60 hover:border-brand-500/40 hover:bg-surface-900/80 relative flex flex-col justify-between overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5",
        className
      )}
    >
      {/* ─── Media Container ──────────────────────────────────────────────── */}
      <div className="bg-surface-950 relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={displayCover}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />

        <div className="from-surface-950/90 via-surface-950/20 absolute inset-0 bg-gradient-to-t to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between">
          <Badge variant={catConfig.badgeVariant} size="sm">
            {catConfig.label}
          </Badge>

          <span className="border-surface-700/60 bg-surface-900/80 text-surface-200 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium backdrop-blur-md">
            <Images className="text-brand-400 size-3" />
            <span>
              {photoCount} {photoCount === 1 ? "photo" : "photos"}
            </span>
          </span>
        </div>

        {/* Event Association Badge (if any) */}
        {event && (
          <div className="absolute right-3 bottom-3 left-3">
            <span className="text-surface-300 inline-block max-w-full truncate text-[11px] font-medium backdrop-blur-sm">
              Linked to <strong className="font-semibold text-white">{event.title}</strong>
            </span>
          </div>
        )}
      </div>

      {/* ─── Body Details ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Metadata Row */}
          <div className="text-surface-400 mb-2 flex flex-wrap items-center gap-3 font-mono text-xs">
            {eventDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="text-brand-400 size-3" />
                <span>{eventDate}</span>
              </div>
            )}
            {event?.city?.name && (
              <div className="flex items-center gap-1">
                <MapPin className="text-surface-500 size-3" />
                <span>{event.city.name}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-surface-50 group-hover:text-brand-300 line-clamp-2 text-base leading-snug font-bold transition-colors sm:text-lg">
            <Link
              href={`/gallery/${id}`}
              className="after:absolute after:inset-0 focus-visible:underline focus-visible:outline-none"
            >
              {title}
            </Link>
          </h3>
        </div>

        {/* Bottom Bar */}
        <div className="border-surface-800/80 mt-4 flex items-center justify-between border-t pt-3 text-xs">
          <span className="text-surface-400 group-hover:text-surface-200 font-medium">
            View Album
          </span>
          <div className="text-brand-400 flex items-center gap-1 font-semibold transition-transform group-hover:translate-x-0.5">
            <span>Explore</span>
            <ArrowRight className="size-3.5" />
          </div>
        </div>
      </div>
    </article>
  );
}
