"use client";

import * as React from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface StatCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  description?: string;
  duration?: number;
  decimals?: number;
  icon?: React.ReactNode;
  variant?: "default" | "brand" | "accent";
  className?: string;
}

export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  label,
  description,
  duration = 2,
  decimals = 0,
  icon,
  className,
}: StatCounterProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = React.useState<number>(0);

  React.useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration, shouldReduceMotion]);

  const currentVal = shouldReduceMotion ? value : displayValue;

  const formattedNumber = React.useMemo(() => {
    const formatted = currentVal.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  }, [currentVal, decimals, prefix, suffix]);

  return (
    <div
      ref={ref}
      className={cn(
        "border-border bg-card hover:border-muted-foreground flex flex-col items-center rounded-lg border p-6 text-center transition-colors duration-150",
        className
      )}
      aria-label={`${prefix}${value}${suffix} ${label}`}
    >
      {icon && (
        <div className="bg-muted border-border text-foreground mb-3 flex size-12 items-center justify-center rounded-lg border">
          {icon}
        </div>
      )}

      <div
        className="text-foreground font-mono text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
        aria-hidden="true"
      >
        {formattedNumber}
      </div>

      <div className="text-foreground mt-2 text-sm font-semibold sm:text-base">{label}</div>

      {description && (
        <p className="text-muted-foreground mt-1 max-w-[220px] text-xs leading-normal">
          {description}
        </p>
      )}
    </div>
  );
}
