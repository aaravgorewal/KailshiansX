"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  className,
}: PaginationProps) {
  // Generate page numbers with ellipsis
  const paginationRange = React.useMemo(() => {
    if (totalPages <= 1) return [];
    const totalPageNumbers = siblingCount * 2 + 5; // first, last, current, 2*siblings, 2*dots

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "DOTS_RIGHT", totalPages];
    }

    if (!shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, "DOTS_LEFT", ...rightRange];
    }

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, "DOTS_LEFT", ...middleRange, "DOTS_RIGHT", totalPages];
    }

    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, "DOTS_LEFT", ...middleRange, "DOTS_RIGHT", totalPages];
  }, [totalPages, siblingCount, currentPage]);

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn("flex items-center justify-center py-4", className)}
    >
      <ul className="flex items-center gap-1 sm:gap-1.5">
        {/* First page button */}
        {showFirstLast && (
          <li>
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              aria-label="Go to first page"
              className="border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronsLeft className="size-4" aria-hidden="true" />
            </button>
          </li>
        )}

        {/* Previous button */}
        <li>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
            className="border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-9 items-center justify-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Prev</span>
          </button>
        </li>

        {/* Page buttons */}
        {paginationRange.map((item, index) => {
          if (typeof item === "string") {
            return (
              <li
                key={`dots-${index}`}
                className="text-muted-foreground flex size-9 items-center justify-center"
              >
                <MoreHorizontal className="size-4" aria-hidden="true" />
                <span className="sr-only">More pages</span>
              </li>
            );
          }

          const pageNumber = item as number;
          const isCurrent = pageNumber === currentPage;

          return (
            <li key={pageNumber}>
              <button
                type="button"
                onClick={() => handlePageChange(pageNumber)}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`Page ${pageNumber}`}
                className={cn(
                  "focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-lg text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  isCurrent
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "border-border bg-card text-foreground hover:bg-muted border"
                )}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}

        {/* Next button */}
        <li>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
            className="border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-9 items-center justify-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
          </button>
        </li>

        {/* Last page button */}
        {showFirstLast && (
          <li>
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Go to last page"
              className="border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronsRight className="size-4" aria-hidden="true" />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
