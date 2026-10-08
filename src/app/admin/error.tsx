// src/app/admin/error.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Admin dashboard error:", error);
  }, [error]);

  return (
    <div className="py-16 text-center">
      <p className="text-destructive font-mono text-xs tracking-wider uppercase">Admin Error</p>
      <h1 className="text-foreground mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-relaxed">
        Could not load this admin section. You can retry or return to the main dashboard.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button variant="primary" size="md" onClick={() => reset()}>
          Try Again
        </Button>
        <Button asChild variant="secondary" size="md">
          <Link href="/admin">Control Room</Link>
        </Button>
        <Button asChild variant="ghost" size="md">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
