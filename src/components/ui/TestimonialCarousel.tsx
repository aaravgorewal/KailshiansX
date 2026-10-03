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

export function TestimonialCarousel({
  testimonials,
  autoPlay = false,
  intervalMs = 6000,
  className,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<number>(0);
  const [isPaused, setIsPaused] = React.useState(false);
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

  // Touch handlers
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

  // AutoPlay effect
  React.useEffect(() => {
    if (!autoPlay || isPaused || length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoPlay, isPaused, intervalMs, length, nextSlide]);

  if (length === 0) return null;

  const current = testimonials[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: prefersReducedMotion ? 0 : direction > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: prefersReducedMotion ? 0 : direction < 0 ? 80 : -80,
      opacity: 0,
    }),
  };

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Community Testimonials"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      className={cn(
        "border-surface-800 bg-surface-900/80 focus-visible:ring-brand-500 relative mx-auto w-full max-w-4xl rounded-3xl border p-6 shadow-2xl backdrop-blur-md outline-none focus-visible:ring-2 sm:p-10 md:p-12",
        className
      )}
    >
      {/* Decorative quote icon */}
      <div className="text-surface-800 pointer-events-none absolute top-6 right-8 select-none">
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
            transition={{ duration: 0.35, ease: "easeInOut" }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${currentIndex + 1} of ${length}`}
            className="flex h-full flex-col justify-between"
          >
            {/* Rating or event tag */}
            <div className="mb-4 flex items-center gap-3">
              {current.rating && (
                <div
                  className="flex items-center gap-1 text-amber-400"
                  aria-label={`${current.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-4",
                        i < current.rating! ? "fill-amber-400 text-amber-400" : "text-surface-700"
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              )}
              {current.eventTitle && (
                <span className="bg-brand-500/10 text-brand-300 border-brand-500/20 rounded-full border px-2 py-0.5 font-mono text-xs">
                  {current.eventTitle}
                </span>
              )}
            </div>

            {/* Testimonial quote text */}
            <blockquote className="text-surface-100 relative z-10 mb-8 text-lg leading-relaxed font-normal italic sm:text-xl md:text-2xl">
              &ldquo;{current.quote}&rdquo;
            </blockquote>

            {/* Author details */}
            <div className="flex items-center gap-4">
              {current.avatarUrl ? (
                <img
                  src={current.avatarUrl}
                  alt={current.author}
                  className="border-brand-500/40 size-12 rounded-full border-2 object-cover sm:size-14"
                />
              ) : (
                <div className="from-brand-600 to-accent-600 border-brand-500/40 flex size-12 items-center justify-center rounded-full border-2 bg-gradient-to-tr text-base font-bold text-white sm:size-14">
                  {current.author.charAt(0)}
                </div>
              )}

              <div>
                <div className="text-surface-50 text-base font-semibold sm:text-lg">
                  {current.author}
                </div>
                <div className="text-surface-400 text-xs sm:text-sm">
                  {current.role} • <span className="text-surface-300">{current.company}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="border-surface-800/80 mt-8 flex items-center justify-between border-t pt-6">
        {/* Progress dots */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial slides">
          {testimonials.map((item, idx) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => goToSlide(idx)}
              className={cn(
                "focus-visible:ring-brand-500 h-2 rounded-full transition-[width,background-color] duration-250 outline-none focus-visible:ring-2",
                idx === currentIndex
                  ? "bg-brand-500 w-8"
                  : "bg-surface-700 hover:bg-surface-600 w-2"
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
            className="border-surface-700 bg-surface-800/80 text-surface-300 hover:bg-surface-700 focus-visible:ring-brand-500 flex size-10 items-center justify-center rounded-xl border transition-colors outline-none hover:text-white focus-visible:ring-2"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next testimonial"
            className="border-surface-700 bg-surface-800/80 text-surface-300 hover:bg-surface-700 focus-visible:ring-brand-500 flex size-10 items-center justify-center rounded-xl border transition-colors outline-none hover:text-white focus-visible:ring-2"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
