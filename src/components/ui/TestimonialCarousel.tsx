/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TestimonialItem {
  id: string | number;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string;
  rating?: number;
  eventTitle?: string;
}

export interface TestimonialCarouselProps {
  testimonials: TestimonialItem[];
  autoPlay?: boolean;
  intervalMs?: number;
  className?: string;
}

export function TestimonialCarousel({ testimonials, className }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<number>(0);
  const touchStartX = React.useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const length = testimonials.length;

  const nextSlide = React.useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % length);
  }, [length]);

  const prevSlide = React.useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + length) % length);
  }, [length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  if (length === 0) return null;

  const current = testimonials[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir < 0 ? 30 : -30,
      opacity: 0,
    }),
  };

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Community Testimonials"
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      className={cn(
        "border-border bg-card focus-visible:ring-ring focus-visible:ring-offset-background relative mx-auto w-full max-w-4xl rounded-lg border p-6 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:p-10 md:p-12",
        className
      )}
    >
      {/* Decorative quote icon */}
      <div className="text-muted pointer-events-none absolute top-6 right-8 select-none">
        <Quote className="size-16 opacity-30 sm:size-24" aria-hidden="true" />
      </div>

      <div className="flex min-h-[220px] flex-col justify-between sm:min-h-[190px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeInOut" }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${currentIndex + 1} of ${length}`}
            className="flex h-full flex-col justify-between"
          >
            {/* Rating or event tag */}
            <div className="mb-4 flex items-center gap-3">
              {current.rating && (
                <div
                  className="text-foreground flex items-center gap-1"
                  aria-label={`${current.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-4",
                        i < current.rating! ? "fill-foreground text-foreground" : "text-border"
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              )}
              {current.eventTitle && (
                <span className="bg-muted text-muted-foreground border-border rounded-full border px-2 py-0.5 font-mono text-xs">
                  {current.eventTitle}
                </span>
              )}
            </div>

            {/* Testimonial quote text */}
            <blockquote className="text-foreground relative z-10 mb-8 text-lg leading-relaxed font-normal italic sm:text-xl md:text-2xl">
              &ldquo;{current.quote}&rdquo;
            </blockquote>

            {/* Author details */}
            <div className="flex items-center gap-4">
              {current.avatarUrl ? (
                <img
                  src={current.avatarUrl}
                  alt={current.author}
                  className="border-border size-12 rounded-full border object-cover sm:size-14"
                />
              ) : (
                <div className="bg-muted border-border text-foreground flex size-12 items-center justify-center rounded-full border text-base font-bold sm:size-14">
                  {current.author.charAt(0)}
                </div>
              )}

              <div>
                <div className="text-foreground text-base font-semibold sm:text-lg">
                  {current.author}
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm">
                  {current.role} • <span className="text-foreground">{current.company}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="border-border mt-8 flex items-center justify-between border-t pt-6">
        {/* Progress dots as buttons with aria-labels */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial slides">
          {testimonials.map((item, idx) => (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={idx === currentIndex}
              aria-label={`Go to slide ${idx + 1} of ${length}`}
              onClick={() => goToSlide(idx)}
              className={cn(
                "focus-visible:ring-ring h-2 rounded-full transition-[width,background-color] duration-150 outline-none focus-visible:ring-2",
                idx === currentIndex ? "bg-primary w-8" : "bg-muted hover:bg-muted-foreground w-2"
              )}
            />
          ))}
        </div>

        {/* Prev / Next buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous testimonial"
            className="border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring flex size-10 items-center justify-center rounded-lg border transition-colors outline-none focus-visible:ring-2"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next testimonial"
            className="border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring flex size-10 items-center justify-center rounded-lg border transition-colors outline-none focus-visible:ring-2"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
