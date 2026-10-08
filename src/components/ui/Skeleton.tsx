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
