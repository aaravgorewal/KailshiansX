"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlbumCard } from "./AlbumCard";
import { cn } from "@/lib/utils";

export interface SerializedAlbum {
  id: string;
  title: string;
  category: string;
  coverImage?: string | null;
  event?: {
    id?: string;
    title: string;
    slug: string;
    startDate: string | Date;
    type?: string;
    venue?: string | null;
    city?: { name: string; state?: string } | null;
  } | null;
  images?: {
    id: string;
    url: string;
    caption?: string | null;
    altText?: string | null;
  }[];
  _count?: {
    images: number;
  };
}

interface GalleryOverviewClientProps {
  albums: SerializedAlbum[];
}

const CATEGORIES = [
  { key: "ALL", label: "All" },
  { key: "meetup", label: "Meetups" },
  { key: "hackathon", label: "Hackathons" },
  { key: "workshop", label: "Workshops" },
  { key: "talk", label: "Talks" },
  { key: "community", label: "Community" },
] as const;

export function GalleryOverviewClient({ albums }: GalleryOverviewClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramCat = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = React.useState<string>(() => {
    if (!paramCat || paramCat === "ALL") return "ALL";
    const found = CATEGORIES.find(
      (c) =>
        c.key.toLowerCase() === paramCat.toLowerCase() ||
        (c.key === "talk" && (paramCat === "tech-talk" || paramCat === "talks"))
    );
    return found ? found.key : "ALL";
  });

  const handleSelectCategory = (catKey: string) => {
    setSelectedCategory(catKey);
    const params = new URLSearchParams(searchParams.toString());
    if (catKey === "ALL") {
      params.delete("category");
    } else {
      params.set("category", catKey);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/gallery${query}`, { scroll: false });
  };

  const filteredAlbums = React.useMemo(() => {
    if (selectedCategory === "ALL") return albums;

    return albums.filter((album) => {
      const cat = album.category.toLowerCase();
      if (selectedCategory === "meetup") {
        return cat === "meetup" || cat === "meetups";
      }
      if (selectedCategory === "hackathon") {
        return cat === "hackathon" || cat === "hackathons";
      }
      if (selectedCategory === "workshop") {
        return cat === "workshop" || cat === "workshops";
      }
      if (selectedCategory === "talk") {
        return cat === "talk" || cat === "talks" || cat === "tech-talk";
      }
      if (selectedCategory === "community") {
        return cat === "community" || cat === "bts";
      }
      return cat === selectedCategory.toLowerCase();
    });
  }, [albums, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Category Filter as plain text buttons */}
      <nav
        aria-label="Gallery categories"
        className="border-border flex flex-wrap items-center gap-6 border-b pb-4 sm:gap-8"
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => handleSelectCategory(cat.key)}
              className={cn(
                "focus-visible:ring-primary rounded py-1 text-sm transition-colors focus-visible:ring-1 focus-visible:outline-none",
                isSelected
                  ? "text-foreground decoration-foreground font-semibold underline decoration-2 underline-offset-8"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </nav>

      {/* Album Grid: 3 columns desktop / 2 tablet / 1 mobile */}
      {filteredAlbums.length === 0 ? (
        <div className="text-muted-foreground py-16 text-center text-sm">
          No albums found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAlbums.map((album, idx) => (
            <AlbumCard
              key={album.id}
              id={album.id}
              title={album.title}
              category={album.category}
              coverImage={album.coverImage}
              event={album.event}
              previewImages={album.images}
              priority={idx === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
