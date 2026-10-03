import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-surface-800/80 animate-pulse rounded-md",
        shimmer &&
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4 rounded",
            i === lines - 1 ? "w-3/5" : i % 2 === 0 ? "w-full" : "w-5/6"
          )}
        />
      ))}
    </div>
  );
}

export function EventCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "border-surface-800 bg-surface-900/60 space-y-4 rounded-xl border p-5",
        className
      )}
    >
      <Skeleton className="h-44 w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-6 w-4/5 rounded" />
      <div className="space-y-2 pt-1">
        <Skeleton className="h-4 w-1/2 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>
      <div className="border-surface-800/80 flex items-center justify-between border-t pt-3">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function SpeakerCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "border-surface-800 bg-surface-900/60 flex flex-col items-center space-y-4 rounded-xl border p-6 text-center",
        className
      )}
    >
      <Skeleton className="size-24 rounded-full" />
      <div className="flex w-full flex-col items-center space-y-2">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-3.5 w-40 rounded" />
      </div>
      <Skeleton className="h-4 w-16 rounded-full" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </div>
  );
}

export function SeriesCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "border-surface-800 bg-surface-900/60 space-y-4 rounded-xl border p-6",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-7 w-3/4 rounded" />
      <Skeleton className="h-16 w-full rounded" />
      <div className="border-surface-800 flex justify-between border-t pt-4">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("border-surface-800 w-full space-y-4 rounded-xl border p-4", className)}
    >
      <div className="border-surface-800 flex gap-4 border-b pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="border-surface-800/40 flex gap-4 border-b py-2 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn("h-4 rounded", c === 0 ? "flex-1" : "flex-1 opacity-70")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
