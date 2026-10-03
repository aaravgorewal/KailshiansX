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
  variant = "default",
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

  const colorVariants = {
    default: "text-surface-50",
    brand: "text-brand-400 drop-shadow-[0_0_12px_rgba(61,97,252,0.35)]",
    accent: "gradient-text drop-shadow-[0_0_12px_rgba(139,61,255,0.35)]",
  }[variant];

  return (
    <div
      ref={ref}
      className={cn(
        "border-surface-800 bg-surface-900/60 hover:border-surface-700 flex flex-col items-center rounded-2xl border p-6 text-center backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
        className
      )}
      aria-label={`${prefix}${value}${suffix} ${label}`}
    >
      {icon && (
        <div className="bg-surface-800/90 border-surface-700/80 text-brand-400 mb-3 flex size-12 items-center justify-center rounded-xl border shadow-inner">
          {icon}
        </div>
      )}

      <div
        className={cn(
          "font-mono text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl",
          colorVariants
        )}
        aria-hidden="true"
      >
        {formattedNumber}
      </div>

      <div className="text-surface-200 mt-2 text-sm font-semibold sm:text-base">{label}</div>

      {description && (
        <p className="text-surface-400 mt-1 max-w-[220px] text-xs leading-normal">{description}</p>
      )}
    </div>
  );
}
