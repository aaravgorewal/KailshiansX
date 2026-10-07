// src/components/gallery/GalleryOverviewClient.tsx
// Interactive client for filtering, searching, and browsing gallery albums by category & event

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Images, Layers, ArrowRight, ChevronDown } from "lucide-react";
import { AlbumCard } from "./AlbumCard";
import { GALLERY_CATEGORIES } from "@/lib/gallery";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";

interface SerializedAlbum {
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
    city?: { name: string; state: string } | null;
  } | null;
  images: {
    id: string;
    url: string;
    caption?: string | null;
    altText?: string | null;
  }[];
  _count: {
    images: number;
  };
}

interface GalleryOverviewClientProps {
  albums: SerializedAlbum[];
  categoryCounts: Record<string, number>;
  eventsWithAlbums: {
    id: string;
    title: string;
    slug: string;
    type: string;
    city?: { name: string } | null;
    _count: { galleryAlbums: number };
  }[];
  totalPhotosCount: number;
  isAdmin: boolean;
}

export function GalleryOverviewClient({
  albums,
  categoryCounts,
  eventsWithAlbums,
  totalPhotosCount,
}: GalleryOverviewClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = (searchParams.get("category") || "ALL").toLowerCase();
  const currentEventId = searchParams.get("eventId") || "ALL";
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("search") || "");
  const [viewGrouping, setViewGrouping] = React.useState<"grid" | "byEvent">("grid");

  // Sync filters to URL
  const updateUrlFilters = (newCategory?: string, newEventId?: string, newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newCategory !== undefined) {
      if (newCategory === "all" || newCategory === "ALL") params.delete("category");
      else params.set("category", newCategory);
    }

    if (newEventId !== undefined) {
      if (newEventId === "ALL") params.delete("eventId");
      else params.set("eventId", newEventId);
    }

    if (newSearch !== undefined) {
      if (!newSearch.trim()) params.delete("search");
      else params.set("search", newSearch.trim());
    }

    router.push(`/gallery?${params.toString()}`);
  };

  // Filter in-memory for instant feedback
  const filteredAlbums = React.useMemo(() => {
    return albums.filter((album) => {
      // Category filter
      if (currentCategory !== "all" && album.category.toLowerCase() !== currentCategory) {
        return false;
      }

      // Event filter
      if (currentEventId !== "ALL" && album.event?.id !== currentEventId) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = album.title.toLowerCase().includes(q);
        const matchesEvent = album.event?.title.toLowerCase().includes(q);
        const matchesCity = album.event?.city?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesEvent && !matchesCity) return false;
      }

      return true;
    });
  }, [albums, currentCategory, currentEventId, searchQuery]);

  // Group albums by event for "By Event" view
  const groupedByEvent = React.useMemo(() => {
    const map = new Map<string, { event: SerializedAlbum["event"]; albums: SerializedAlbum[] }>();
    const unassociated: SerializedAlbum[] = [];

    filteredAlbums.forEach((alb) => {
      if (alb.event) {
        const existing = map.get(alb.event.id);
        if (existing) {
          existing.albums.push(alb);
        } else {
          map.set(alb.event.id, { event: alb.event, albums: [alb] });
        }
      } else {
        unassociated.push(alb);
      }
    });

    return {
      eventGroups: Array.from(map.values()),
      communityAlbums: unassociated,
    };
  }, [filteredAlbums]);

  return (
    <div className="space-y-8">
      {/* ─── CONTROLS BAR: CATEGORY PILLS + SEARCH + EVENT DROPDOWN ──────── */}
      <div className="space-y-4">
        {/* Category Neutral Chips Bar */}
        <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-1">
          {GALLERY_CATEGORIES.map((cat) => {
            const isSelected =
              cat.key === "ALL"
                ? currentCategory === "all" || !currentCategory
                : currentCategory === cat.key.toLowerCase();
            const count =
              cat.key === "ALL" ? totalPhotosCount : categoryCounts[cat.key.toLowerCase()] || 0;

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => updateUrlFilters(cat.key)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground font-semibold"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{cat.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 font-mono text-xs",
                    isSelected
                      ? "border-primary-foreground/30 text-primary-foreground border"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Event Filter Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative max-w-md flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by album title, event, or city..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  updateUrlFilters(undefined, undefined, e.target.value);
                }}
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring w-full rounded-md border py-2 pr-4 pl-9 text-xs focus:ring-1 focus:outline-none"
              />
            </div>

            {/* Filter by Event dropdown */}
            {eventsWithAlbums.length > 0 && (
              <div className="relative">
                <select
                  value={currentEventId}
                  onChange={(e) => updateUrlFilters(undefined, e.target.value)}
                  className="border-input bg-background text-foreground focus:border-primary focus:ring-ring w-full cursor-pointer appearance-none rounded-md border py-2 pr-10 pl-3 text-xs focus:ring-1 focus:outline-none"
                >
                  <option value="ALL">All Associated Events</option>
                  {eventsWithAlbums.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} {ev.city?.name ? `(${ev.city.name})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="border-border bg-card flex items-center gap-1 rounded-md border p-1">
            <button
              type="button"
              onClick={() => setViewGrouping("grid")}
              className={cn(
                "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
                viewGrouping === "grid"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Images className="size-3.5" />
              <span>Albums View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewGrouping("byEvent")}
              className={cn(
                "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
                viewGrouping === "byEvent"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="size-3.5" />
              <span>By Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── ALBUMS CONTENT DISPLAY ───────────────────────────────────────── */}
      {filteredAlbums.length === 0 ? (
        <div className="border-border bg-card/40 rounded-lg border border-dashed p-12 text-center">
          <div className="border-border bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-lg border">
            <Images className="size-6" />
          </div>
          <h3 className="text-foreground mt-4 text-base font-semibold">No Albums Found</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Try adjusting your category filter, event filter, or search query.
          </p>
          <div className="mt-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                router.push("/gallery");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      ) : viewGrouping === "grid" ? (
        /* Standard Albums Grid (Flat Cards) */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAlbums.map((album, idx) => (
            <AlbumCard
              key={album.id}
              id={album.id}
              title={album.title}
              category={album.category}
              coverImage={album.coverImage}
              photoCount={album._count.images}
              event={album.event}
              previewImages={album.images}
              priority={idx < 2}
            />
          ))}
        </div>
      ) : (
        /* Grouped By Event View */
        <div className="space-y-10">
          {groupedByEvent.eventGroups.map((group) => {
            const ev = group.event!;
            return (
              <section key={ev.id} className="space-y-4">
                <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm">
                        {ev.type.replace("_", " ")}
                      </Badge>
                      <h3 className="text-foreground text-base font-semibold">{ev.title}</h3>
                    </div>
                    <div className="text-muted-foreground mt-1 flex items-center gap-3 font-mono text-xs">
                      <span>{formatDate(ev.startDate)}</span>
                      {ev.city?.name && (
                        <>
                          <span>•</span>
                          <span>{ev.city.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/events/${ev.slug}`}
                    className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
                  >
                    <span>View Event Details</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {group.albums.map((album) => (
                    <AlbumCard
                      key={album.id}
                      id={album.id}
                      title={album.title}
                      category={album.category}
                      coverImage={album.coverImage}
                      photoCount={album._count.images}
                      event={album.event}
                      previewImages={album.images}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {groupedByEvent.communityAlbums.length > 0 && (
            <section className="space-y-4">
              <div className="border-border border-b pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" size="sm">
                    COMMUNITY
                  </Badge>
                  <h3 className="text-foreground text-base font-semibold">
                    Community Chapters &amp; Behind The Scenes
                  </h3>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Candid moments, campus chapter orientations, and team rituals.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {groupedByEvent.communityAlbums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    id={album.id}
                    title={album.title}
                    category={album.category}
                    coverImage={album.coverImage}
                    photoCount={album._count.images}
                    event={null}
                    previewImages={album.images}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
