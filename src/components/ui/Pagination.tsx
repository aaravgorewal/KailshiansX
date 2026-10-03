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

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, "DOTS_LEFT", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, "DOTS_LEFT", ...middleRange, "DOTS_RIGHT", totalPages];
    }

    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages, currentPage, siblingCount]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn("flex flex-col items-center justify-between gap-4 py-4 sm:flex-row", className)}
    >
      {/* Mobile summary text */}
      <div className="text-surface-400 text-xs sm:hidden">
        Page <span className="text-surface-200 font-medium">{currentPage}</span> of{" "}
        <span className="text-surface-200 font-medium">{totalPages}</span>
      </div>

      <ul className="flex items-center gap-1 sm:gap-1.5">
        {/* First page button */}
        {showFirstLast && (
          <li>
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              aria-label="Go to first page"
              className="border-surface-700 bg-surface-900 text-surface-300 hover:bg-surface-800 hover:text-surface-100 inline-flex size-9 items-center justify-center rounded-lg border transition-colors disabled:pointer-events-none disabled:opacity-40"
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
            className="border-surface-700 bg-surface-900 text-surface-300 hover:bg-surface-800 hover:text-surface-100 inline-flex h-9 items-center justify-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-40"
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
                className="text-surface-500 flex size-9 items-center justify-center"
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
                  "inline-flex size-9 items-center justify-center rounded-lg text-xs font-medium transition-all select-none",
                  isCurrent
                    ? "bg-brand-600 shadow-brand-500/30 ring-brand-500 font-semibold text-white shadow-sm ring-1"
                    : "border-surface-700/80 bg-surface-900/60 text-surface-300 hover:bg-surface-800 hover:text-surface-100 hover:border-surface-600 border"
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
            className="border-surface-700 bg-surface-900 text-surface-300 hover:bg-surface-800 hover:text-surface-100 inline-flex h-9 items-center justify-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-40"
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
              className="border-surface-700 bg-surface-900 text-surface-300 hover:bg-surface-800 hover:text-surface-100 inline-flex size-9 items-center justify-center rounded-lg border transition-colors disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronsRight className="size-4" aria-hidden="true" />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
