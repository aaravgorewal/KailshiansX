// src/components/gallery/AlbumCard.tsx
// Album preview card with Next.js image optimization and error fallback

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Images, ArrowRight, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format-date";
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
  const [hasError, setHasError] = React.useState(false);

  const catConfig = GALLERY_CATEGORIES.find((c) => c.key === category.toLowerCase()) || {
    label: category,
  };

  const displayCover =
    coverImage ||
    previewImages[0]?.url ||
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80";

  const eventDate = event?.startDate ? formatDate(event.startDate) : null;

  return (
    <article
      className={cn(
        "group border-border bg-card hover:border-primary/50 relative flex flex-col justify-between overflow-hidden rounded-lg border transition-colors duration-150",
        className
      )}
    >
      {/* ─── Media Container (3:2 aspect ratio) ─────────────────────────── */}
      <div className="bg-muted relative aspect-[3/2] w-full overflow-hidden">
        {hasError || !displayCover ? (
          <div className="bg-muted text-muted-foreground flex size-full items-center justify-center">
            <ImageIcon className="size-8" />
          </div>
        ) : (
          <Image
            src={displayCover}
            alt={title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            onError={() => setHasError(true)}
          />
        )}

        {/* Top Badges */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between">
          <Badge variant="outline" size="sm" className="bg-card/90 backdrop-blur-sm">
            {catConfig.label}
          </Badge>

          <span className="border-border bg-card/90 text-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium backdrop-blur-sm">
            <Images className="text-muted-foreground size-3" />
            <span>
              {photoCount} {photoCount === 1 ? "photo" : "photos"}
            </span>
          </span>
        </div>
      </div>

      {/* ─── Body Details ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Metadata Row: Date & City */}
          <div className="text-muted-foreground mb-2 flex flex-wrap items-center gap-3 font-mono text-xs">
            {eventDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3" />
                <span>{eventDate}</span>
              </div>
            )}
            {event?.city?.name && (
              <div className="flex items-center gap-1">
                <MapPin className="size-3" />
                <span>{event.city.name}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-base font-semibold transition-colors">
            <Link
              href={`/gallery/${id}`}
              className="after:absolute after:inset-0 focus-visible:underline focus-visible:outline-none"
            >
              {title}
            </Link>
          </h3>
        </div>

        {/* Bottom Bar */}
        <div className="border-border mt-4 flex items-center justify-between border-t pt-3 text-xs">
          <span className="text-muted-foreground group-hover:text-foreground">View Album</span>
          <div className="text-primary flex items-center gap-1 font-medium">
            <span>Explore</span>
            <ArrowRight className="size-3.5" />
          </div>
        </div>
      </div>
    </article>
  );
}
