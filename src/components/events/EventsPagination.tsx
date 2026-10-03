"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

export interface EventsPaginationProps {
  currentPage: number;
  totalPages: number;
  className?: string;
}

export function EventsPagination({ currentPage, totalPages, className }: EventsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (page <= 1) {
      current.delete("page");
    } else {
      current.set("page", String(page));
    }
    const query = current.toString();
    const targetUrl = query ? `${pathname}?${query}` : pathname;
    router.push(targetUrl, { scroll: true });
  };

  if (totalPages <= 1) return null;

  return (
    <div className={className}>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
