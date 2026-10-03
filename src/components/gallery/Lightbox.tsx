// src/components/gallery/Lightbox.tsx
// High-performance, accessible image lightbox with keyboard navigation & filmstrip

"use client";

import * as React from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface LightboxImage {
  id: string;
  url: string;
  thumbUrl?: string | null;
  caption?: string | null;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface LightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ images, currentIndex, isOpen, onClose, onNavigate }: LightboxProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const filmstripRef = React.useRef<HTMLDivElement>(null);

  const activeImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  // Handle keyboard events
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        if (hasMultiple) {
          onNavigate((currentIndex - 1 + images.length) % images.length);
        }
      } else if (e.key === "ArrowRight") {
        if (hasMultiple) {
          onNavigate((currentIndex + 1) % images.length);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Lock body scroll
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, currentIndex, images.length, hasMultiple, onClose, onNavigate]);

  // Scroll active thumbnail into view
  React.useEffect(() => {
    if (!isOpen || !filmstripRef.current) return;
    const activeThumb = filmstripRef.current.children[currentIndex] as HTMLElement;
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex, isOpen]);

  // isLoaded resets via key={currentIndex} on the <img> below — no effect needed

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const downloadCurrentImage = async () => {
    if (!activeImage) return;
    try {
      const response = await fetch(activeImage.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `kailshiansx-photo-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(activeImage.url, "_blank");
    }
  };

  if (!isOpen || !activeImage) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Lightbox"
      className="bg-surface-950/95 animate-in fade-in fixed inset-0 z-50 flex flex-col justify-between backdrop-blur-xl duration-200"
    >
      {/* ─── TOP BAR ──────────────────────────────────────────────────────── */}
      <header className="border-surface-800/80 bg-surface-950/60 relative z-20 flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-surface-300 font-mono text-xs font-semibold tracking-wider">
            {currentIndex + 1} <span className="text-surface-600">/</span> {images.length}
          </span>
          {activeImage.caption && (
            <span className="text-surface-400 hidden max-w-md truncate text-xs sm:inline-block">
              {activeImage.caption}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Download */}
          <button
            type="button"
            onClick={downloadCurrentImage}
            className="text-surface-400 hover:bg-surface-800 hover:text-surface-100 rounded-lg p-2 transition-colors"
            title="Download full image"
            aria-label="Download image"
          >
            <Download className="size-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-surface-400 hover:bg-surface-800 hover:text-surface-100 hidden rounded-lg p-2 transition-colors sm:block"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>

          {/* Open Original */}
          <a
            href={activeImage.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-surface-400 hover:bg-surface-800 hover:text-surface-100 rounded-lg p-2 transition-colors"
            title="Open original in new tab"
            aria-label="Open original"
          >
            <ExternalLink className="size-4" />
          </a>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="text-surface-300 hover:bg-surface-800 rounded-lg p-2 transition-colors hover:text-white"
            title="Close (Esc)"
            aria-label="Close lightbox"
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      {/* ─── MAIN VIEWPORT ────────────────────────────────────────────────── */}
      <main className="relative flex flex-1 items-center justify-center p-4 sm:p-8">
        {/* Navigation Prev */}
        {hasMultiple && (
          <button
            type="button"
            onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
            className="border-surface-700/80 bg-surface-900/80 text-surface-200 hover:border-brand-500/50 hover:bg-surface-800 absolute left-3 z-20 flex size-12 items-center justify-center rounded-full border backdrop-blur-md transition-all hover:scale-105 hover:text-white sm:left-6"
            aria-label="Previous photo"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        {/* The Image Container */}
        <div className="relative flex size-full max-h-[80vh] max-w-6xl items-center justify-center overflow-hidden">
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-brand-500 size-8 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          )}

          <div className="relative size-full">
            <Image
              key={currentIndex}
              src={activeImage.url}
              alt={
                activeImage.altText || activeImage.caption || `Gallery photo ${currentIndex + 1}`
              }
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className={cn(
                "object-contain transition-opacity duration-300",
                isLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setIsLoaded(true)}
            />
          </div>
        </div>

        {/* Navigation Next */}
        {hasMultiple && (
          <button
            type="button"
            onClick={() => onNavigate((currentIndex + 1) % images.length)}
            className="border-surface-700/80 bg-surface-900/80 text-surface-200 hover:border-brand-500/50 hover:bg-surface-800 absolute right-3 z-20 flex size-12 items-center justify-center rounded-full border backdrop-blur-md transition-all hover:scale-105 hover:text-white sm:right-6"
            aria-label="Next photo"
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </main>

      {/* ─── BOTTOM BAR & FILMSTRIP ────────────────────────────────────────── */}
      <footer className="border-surface-800/80 bg-surface-950/80 relative z-20 border-t px-4 py-3 backdrop-blur-md sm:px-6">
        {/* Caption */}
        {activeImage.caption && (
          <div className="text-surface-200 mb-2 text-center text-xs font-medium sm:text-sm">
            {activeImage.caption}
          </div>
        )}

        {/* Thumbnails filmstrip */}
        {hasMultiple && (
          <div
            ref={filmstripRef}
            className="flex scrollbar-none items-center justify-start gap-2 overflow-x-auto py-1 sm:justify-center"
          >
            {images.map((img, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => onNavigate(idx)}
                  className={cn(
                    "relative size-12 shrink-0 overflow-hidden rounded-lg border transition-all duration-200 sm:size-14",
                    isActive
                      ? "border-brand-500 ring-brand-500/50 scale-105 ring-2"
                      : "border-surface-800 hover:border-surface-600 opacity-50 hover:opacity-100"
                  )}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <Image
                    src={img.thumbUrl || img.url}
                    alt={img.altText || `Thumbnail ${idx + 1}`}
                    fill
                    sizes="56px"
                    className="object-cover"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        )}
      </footer>
    </div>
  );
}
