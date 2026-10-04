import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("bg-muted animate-pulse rounded-md", className)}
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
      className={cn("border-border bg-card space-y-4 rounded-lg border p-5", className)}
    >
      <Skeleton className="h-44 w-full rounded-md" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-6 w-4/5 rounded" />
      <div className="space-y-2 pt-1">
        <Skeleton className="h-4 w-1/2 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>
      <div className="border-border flex items-center justify-between border-t pt-3">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function SeriesCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("border-border bg-card space-y-3 rounded-lg border p-6", className)}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="size-12 rounded-lg" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4 rounded pt-2" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-2/3 rounded" />
      <div className="border-border flex items-center justify-between border-t pt-3">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </div>
  );
}

export function SpeakerCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "border-border bg-card flex flex-col items-center rounded-lg border p-6 text-center",
        className
      )}
    >
      <Skeleton className="size-24 rounded-full" />
      <Skeleton className="mt-4 h-5 w-32 rounded" />
      <Skeleton className="mt-1 h-3.5 w-24 rounded" />
      <Skeleton className="mt-1 h-3 w-28 rounded" />
      <div className="mt-4 flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-9 w-full rounded-lg" />
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
      className={cn("border-border overflow-hidden rounded-lg border", className)}
      aria-hidden="true"
    >
      <div className="border-border bg-muted flex items-center border-b p-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1 px-2">
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-card divide-border divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center p-3">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="flex-1 px-2">
                <Skeleton className={cn("h-4 rounded", c === 0 ? "w-4/5" : "w-1/2")} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
