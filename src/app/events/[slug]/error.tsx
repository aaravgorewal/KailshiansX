// src/app/events/[slug]/error.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function EventDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Event detail error:", error);
  }, [error]);

  return (
    <div className="container-page py-24 text-center">
      <p className="text-destructive font-mono text-xs tracking-wider uppercase">Error</p>
      <h1 className="text-foreground mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        Could not load event
      </h1>
      <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-relaxed">
        An error occurred while loading this event. You can try again or return home.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button variant="primary" size="md" onClick={() => reset()}>
          Try Again
        </Button>
        <Button asChild variant="secondary" size="md">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
