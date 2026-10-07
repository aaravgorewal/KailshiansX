// src/components/gallery/AlbumDetailClient.tsx
// Interactive album photo grid with lightbox, sharing, admin ZIP download, and upload modal

"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Share2,
  Download,
  UploadCloud,
  Calendar,
  MapPin,
  ExternalLink,
  Images,
  Maximize2,
  Check,
  ImageIcon,
} from "lucide-react";
import { Lightbox, LightboxImage } from "./Lightbox";
import { UploadPhotosModal } from "./UploadPhotosModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/useToast";
import { formatDate } from "@/lib/format-date";
import { GALLERY_CATEGORIES } from "@/lib/gallery";

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
      city?: { name: string; state: string } | null;
    } | null;
    images: SerializedImage[];
    _count: { images: number };
  };
  isAdmin: boolean;
}

function PhotoCard({
  img,
  idx,
  albumTitle,
  onClick,
}: {
  img: SerializedImage;
  idx: number;
  albumTitle: string;
  onClick: () => void;
}) {
  const [hasError, setHasError] = React.useState(false);
  const isPriority = idx < 4;

  return (
    <figure
      onClick={onClick}
      className="group border-border bg-muted hover:border-primary/50 relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-lg border transition-colors duration-150"
    >
      {hasError ? (
        <div className="bg-muted text-muted-foreground flex size-full items-center justify-center">
          <ImageIcon className="size-8" />
        </div>
      ) : (
        <Image
          src={img.url}
          alt={img.altText || img.caption || `${albumTitle} photo ${idx + 1}`}
          fill
          priority={isPriority}
          loading={isPriority ? "eager" : "lazy"}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          onError={() => setHasError(true)}
        />
      )}

      {/* Subtle Hover Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />

      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <span className="line-clamp-1 max-w-[80%] text-xs font-medium text-white">
          {img.caption || `Photo ${idx + 1}`}
        </span>
        <div className="rounded bg-black/60 p-1.5 text-white backdrop-blur-sm">
          <Maximize2 className="size-3.5" />
        </div>
      </div>

      {/* Index Pill in Top Right */}
      <span className="absolute top-2 right-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-xs text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        #{idx + 1}
      </span>
    </figure>
  );
}

export function AlbumDetailClient({ album, isAdmin }: AlbumDetailClientProps) {
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const { toast } = useToast();

  const catConfig = GALLERY_CATEGORIES.find((c) => c.key === album.category.toLowerCase()) || {
    label: album.category,
  };

  const eventDate = album.event?.startDate ? formatDate(album.event.startDate) : null;

  // Share Album handler
  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${album.title} | KailshiansX Gallery`,
      text: `Check out photos from ${album.title} on KailshiansX!`,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User dismissed share sheet, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast({
        title: "Link copied!",
        description: "Album URL has been copied to your clipboard.",
      });
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast({
        title: "Sharing unavailable",
        description: "Please copy the URL from your browser address bar.",
        variant: "destructive",
      });
    }
  };

  // Admin download all photos as ZIP
  const handleDownloadZip = async () => {
    if (isDownloadingZip) return;
    setIsDownloadingZip(true);

    toast({
      title: "Preparing ZIP archive",
      description: "Bundling full-resolution photos... Download will begin shortly.",
    });

    try {
      const response = await fetch(`/api/gallery/${album.id}/download-zip`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to download ZIP");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const sanitized = album.title.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 40);
      a.download = `${sanitized}_photos.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      toast({
        title: "Download complete!",
        description: `Downloaded ZIP containing ${album.images.length} photos.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to package photos into ZIP.";
      toast({
        title: "Download failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDownloadingZip(false);
    }
  };

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
      {/* ─── HEADER / ACTION CONTROLS ─────────────────────────────────────── */}
      <div className="border-border bg-card rounded-lg border p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            {/* Badges & Category */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="outline" size="default">
                {catConfig.label}
              </Badge>

              <span className="border-border bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs">
                <Images className="size-3.5" />
                <span>{album.images.length} photos</span>
              </span>

              {album.event && (
                <Link
                  href={`/events/${album.event.slug}`}
                  className="border-border bg-muted text-foreground hover:border-primary/50 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                >
                  <span>Event: {album.event.title}</span>
                  <ExternalLink className="text-muted-foreground size-3" />
                </Link>
              )}
            </div>

            {/* Album Title */}
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {album.title}
            </h1>

            {/* Event Metadata details */}
            <div className="text-muted-foreground flex flex-wrap items-center gap-4 font-mono text-xs">
              {eventDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  <span>{eventDate}</span>
                </div>
              )}
              {album.event?.venue && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  <span>
                    {album.event.venue}
                    {album.event.city?.name ? `, ${album.event.city.name}` : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {/* Share Button */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleShare}
              leftIcon={
                copiedLink ? (
                  <Check className="text-success size-4" />
                ) : (
                  <Share2 className="size-4" />
                )
              }
            >
              {copiedLink ? "Link Copied" : "Share Album"}
            </Button>

            {/* Admin: Download All (ZIP) */}
            {isAdmin && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleDownloadZip}
                isLoading={isDownloadingZip}
                leftIcon={<Download className="size-4" />}
                title="Download all full-resolution photos as a single ZIP archive"
              >
                {isDownloadingZip ? "Bundling ZIP..." : "Download All (ZIP)"}
              </Button>
            )}

            {/* Admin: Upload Photos */}
            {isAdmin && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                leftIcon={<UploadCloud className="size-4" />}
              >
                Upload Photos
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ─── PHOTOS MASONRY / GRID ────────────────────────────────────────── */}
      {album.images.length === 0 ? (
        <div className="border-border bg-card/40 rounded-lg border border-dashed p-16 text-center">
          <div className="border-border bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-lg border">
            <Images className="size-6" />
          </div>
          <h3 className="text-foreground mt-4 text-base font-semibold">
            No Photos In This Album Yet
          </h3>
          <p className="text-muted-foreground mt-1 text-xs">
            {isAdmin
              ? "As an administrator, click 'Upload Photos' above to add images via S3 presigned upload."
              : "Check back soon as our photography team uploads event captures."}
          </p>
          {isAdmin && (
            <div className="mt-6">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                leftIcon={<UploadCloud className="size-4" />}
              >
                Upload First Photo
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {album.images.map((img, idx) => (
            <PhotoCard
              key={img.id}
              img={img}
              idx={idx}
              albumTitle={album.title}
              onClick={() => setLightboxIndex(idx)}
            />
          ))}
        </div>
      )}

      {/* ─── LIGHTBOX MODAL ────────────────────────────────────────────────── */}
      <Lightbox
        images={lightboxImages}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(newIndex) => setLightboxIndex(newIndex)}
      />

      {/* ─── ADMIN S3 UPLOAD MODAL ─────────────────────────────────────────── */}
      {isAdmin && (
        <UploadPhotosModal
          albumId={album.id}
          albumTitle={album.title}
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}
    </div>
  );
}
