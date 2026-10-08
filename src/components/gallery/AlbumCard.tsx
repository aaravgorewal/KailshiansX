"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";

export interface AlbumCardProps {
  id: string;
  title: string;
  category: string;
  coverImage?: string | null;
  photoCount?: number;
  event?: {
    id?: string;
    title: string;
    slug: string;
    startDate: Date | string;
    type?: string;
    venue?: string | null;
    city?: { name: string; state?: string } | null;
  } | null;
  previewImages?: { url: string; altText?: string | null }[];
  priority?: boolean;
  className?: string;
}

export function AlbumCard({
  id,
  title,
  coverImage,
  event,
  previewImages = [],
  priority = false,
  className,
}: AlbumCardProps) {
  const [hasError, setHasError] = React.useState(false);

  const displayCover = coverImage || previewImages[0]?.url || null;

  const eventDate = event?.startDate ? formatDate(event.startDate) : null;
  const cityName = event?.city?.name || null;
  const metaText = [eventDate, cityName].filter(Boolean).join(" · ");

  return (
    <article className={cn("group flex flex-col space-y-3", className)}>
      <Link
        href={`/gallery/${id}`}
        aria-label={`View ${title}`}
        className="focus-visible:ring-primary block rounded-xl focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="border-border bg-muted relative aspect-[3/2] w-full overflow-hidden rounded-xl border">
          {hasError || !displayCover ? (
            <div
              className="text-muted-foreground bg-muted flex size-full items-center justify-center"
              aria-hidden="true"
            >
              <ImageIcon className="size-8 opacity-40" />
            </div>
          ) : (
            <Image
              src={displayCover}
              alt=""
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-opacity duration-200 group-hover:opacity-90"
              onError={() => setHasError(true)}
            />
          )}
        </div>
      </Link>

      <div className="space-y-1">
        <h2 className="text-foreground group-hover:text-primary text-base font-semibold transition-colors">
          <Link
            href={`/gallery/${id}`}
            className="focus-visible:underline focus-visible:outline-none"
          >
            {title}
          </Link>
        </h2>
        {metaText && <p className="text-muted-foreground font-mono text-xs">{metaText}</p>}
      </div>
    </article>
  );
}
