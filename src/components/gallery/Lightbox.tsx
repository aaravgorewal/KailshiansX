"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
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

function ViewerImage({ image, index }: { image: LightboxImage; index: number }) {
  const [loaded, setLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className="relative flex size-full max-h-[85vh] max-w-6xl items-center justify-center">
      {!loaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      )}
      {hasError ? (
        <div
          className="bg-card/60 flex flex-col items-center justify-center gap-2 rounded-lg p-8 text-white/50"
          aria-hidden="true"
        >
          <ImageIcon className="size-12 opacity-40" />
          <span className="text-xs">Photo unavailable</span>
        </div>
      ) : (
        <Image
          key={index}
          src={image.url}
          alt=""
          fill
          priority
          sizes="100vw"
          className={cn(
            "object-contain transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}

export function Lightbox({ images, currentIndex, isOpen, onClose, onNavigate }: LightboxProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const touchStartXRef = React.useRef<number | null>(null);

  const activeImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  // Handle keyboard events (Arrow keys + Escape + Focus Trap)
  React.useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus close button immediately
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "ArrowLeft" && hasMultiple) {
        e.preventDefault();
        onNavigate((currentIndex - 1 + images.length) % images.length);
        return;
      }

      if (e.key === "ArrowRight" && hasMultiple) {
        e.preventDefault();
        onNavigate((currentIndex + 1) % images.length);
        return;
      }

      if (e.key === "Tab" && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href]:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
      if (deltaX < 0) {
        // Swiped left -> next
        onNavigate((currentIndex + 1) % images.length);
      } else {
        // Swiped right -> prev
        onNavigate((currentIndex - 1 + images.length) % images.length);
      }
    }
  };

  if (!isOpen || !activeImage) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="animate-in fade-in fixed inset-0 z-50 flex flex-col justify-between bg-black/95 text-white backdrop-blur-sm duration-150"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ─── TOP BAR: COUNTER & CLOSE ONLY (NO CLUTTER) ────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center">
          <span className="font-mono text-xs font-medium tracking-wider text-white/80 sm:text-sm">
            {currentIndex + 1} <span className="text-white/40">/</span> {images.length}
          </span>
        </div>

        <div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            title="Close (Esc)"
            aria-label="Close viewer"
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
            onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
            className="absolute left-3 z-20 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:left-6"
            aria-label="Previous photo"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        {/* The Image Container with key on index (no setState in effect) */}
        <ViewerImage key={currentIndex} image={activeImage} index={currentIndex} />

        {/* Navigation Next — 44px hit area */}
        {hasMultiple && (
          <button
            type="button"
            onClick={() => onNavigate((currentIndex + 1) % images.length)}
            className="absolute right-3 z-20 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:right-6"
            aria-label="Next photo"
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </main>

      {/* Empty footer area for visual balance */}
      <footer className="h-6 sm:h-8" />
    </div>
  );
}
