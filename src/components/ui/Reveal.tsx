"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  duration?: number;
  distance?: number;
  as?: React.ElementType;
}

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/**
 * Reveal animation component:
 * - Uses IntersectionObserver to trigger a fade-up once.
 * - Disabled automatically when prefers-reduced-motion is active.
 * - Gracefully visible when JavaScript is disabled (via CSS scripting: none & noscript).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  duration = 500,
  distance = 12,
  as: Component = "div",
  ...props
}: RevealProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const prefersReduced = React.useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  React.useEffect(() => {
    if (prefersReduced) return;
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Fade-up ONCE
        }
      },
      {
        threshold: 0.01,
        rootMargin: "0px 0px 50px 0px",
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [prefersReduced]);

  const shouldShow = prefersReduced || isVisible;

  return (
    <Component
      ref={ref}
      data-reveal=""
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transform: shouldShow ? "none" : `translateY(${distance}px)`,
      }}
      className={cn(
        "transition-[opacity,transform] ease-out will-change-[opacity,transform]",
        shouldShow ? "opacity-100" : "opacity-0",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
