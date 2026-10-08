"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface LoadMoreButtonProps {
  currentLimit: number;
  totalCount: number;
  pageSize?: number;
}

export function LoadMoreButton({ currentLimit, totalCount, pageSize = 8 }: LoadMoreButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  if (currentLimit >= totalCount) {
    return null;
  }

  const handleLoadMore = () => {
    const nextLimit = currentLimit + pageSize;
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", String(nextLimit));
    const qs = params.toString();

    startTransition(() => {
      router.push(qs ? `/events?${qs}` : "/events", { scroll: false });
    });
  };

  return (
    <div className="mt-12 flex justify-center">
      <Button variant="secondary" size="md" isLoading={isPending} onClick={handleLoadMore}>
        Load more
      </Button>
    </div>
  );
}
