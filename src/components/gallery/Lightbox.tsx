// src/components/gallery/Lightbox.tsx
// High-performance, accessible image lightbox with keyboard navigation, focus trap, swipe, and filmstrip

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
  ImageIcon,
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
  // Track loadedIndex so loaded state resets synchronously when currentIndex changes — no setState in useEffect
  const [loadedIndex, setLoadedIndex] = React.useState<number | null>(null);
  const [hasError, setHasError] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const filmstripRef = React.useRef<HTMLDivElement>(null);
  const touchStartXRef = React.useRef<number | null>(null);

  const activeImage = images[currentIndex];
  const hasMultiple = images.length > 1;
  const isLoaded = loadedIndex === currentIndex;

  // Handle keyboard events (Arrow keys + Escape + Focus Trap)
  React.useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (hasMultiple) {
          setHasError(false);
          onNavigate((currentIndex - 1 + images.length) % images.length);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (hasMultiple) {
          setHasError(false);
          onNavigate((currentIndex + 1) % images.length);
        }
      } else if (e.key === "Tab") {
        // Focus trap inside lightbox container
        if (!containerRef.current) return;
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
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

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) > 50 && hasMultiple) {
      setHasError(false);
      if (deltaX < 0) {
        // Swiped left -> next
        onNavigate((currentIndex + 1) % images.length);
      } else {
        // Swiped right -> prev
        onNavigate((currentIndex - 1 + images.length) % images.length);
      }
    }
  };

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
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image Lightbox"
      className="animate-in fade-in fixed inset-0 z-50 flex flex-col justify-between bg-black/95 text-white duration-150"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ─── TOP BAR ──────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold tracking-wider text-white/80">
            {currentIndex + 1} <span className="text-white/40">/</span> {images.length}
          </span>
          {activeImage.caption && (
            <span className="hidden max-w-md truncate text-xs text-white/70 sm:inline-block">
              {activeImage.caption}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Direct Download — 44px hit area */}
          <button
            type="button"
            onClick={downloadCurrentImage}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            title="Download full image"
            aria-label="Download image"
          >
            <Download className="size-4" />
          </button>

          {/* Fullscreen Toggle — 44px hit area */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:flex"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>

          {/* Open Original — 44px hit area */}
          <a
            href={activeImage.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            title="Open original in new tab"
            aria-label="Open original"
          >
            <ExternalLink className="size-4" />
          </a>

          {/* Close — 44px hit area */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            title="Close (Esc)"
            aria-label="Close lightbox"
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      {/* ─── MAIN VIEWPORT ────────────────────────────────────────────────── */}
      <main className="relative flex flex-1 items-center justify-center p-4 sm:p-8">
        {/* Navigation Prev — 44px hit area */}
        {hasMultiple && (
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              onNavigate((currentIndex - 1 + images.length) % images.length);
            }}
            className="absolute left-3 z-20 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition-colors hover:bg-white/20 sm:left-6"
            aria-label="Previous photo"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        {/* The Image Container */}
        <div className="relative flex size-full max-h-[75vh] max-w-6xl items-center justify-center overflow-hidden">
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}

          {hasError ? (
            <div className="flex flex-col items-center justify-center gap-2 text-white/60">
              <ImageIcon className="size-12" />
              <p className="text-xs">Photo could not be loaded</p>
            </div>
          ) : (
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
                  "object-contain transition-opacity duration-200",
                  isLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setLoadedIndex(currentIndex)}
                onError={() => setHasError(true)}
              />
            </div>
          )}
        </div>

        {/* Navigation Next — 44px hit area */}
        {hasMultiple && (
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              onNavigate((currentIndex + 1) % images.length);
            }}
            className="absolute right-3 z-20 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition-colors hover:bg-white/20 sm:right-6"
            aria-label="Next photo"
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </main>

      {/* ─── BOTTOM BAR & FILMSTRIP ────────────────────────────────────────── */}
      <footer className="relative z-20 border-t border-white/10 bg-black/40 px-4 py-3 sm:px-6">
        {/* Caption */}
        {activeImage.caption && (
          <div className="mb-2 text-center text-xs font-medium text-white/90 sm:text-sm">
            {activeImage.caption}
          </div>
        )}

        {/* Thumbnails filmstrip — 44px+ hit area each */}
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
                  onClick={() => {
                    setHasError(false);
                    onNavigate(idx);
                  }}
                  className={cn(
                    "relative size-12 shrink-0 overflow-hidden rounded-md border transition-all sm:size-14",
                    isActive
                      ? "border-primary ring-primary opacity-100 ring-2"
                      : "border-white/20 opacity-50 hover:border-white/50 hover:opacity-100"
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
