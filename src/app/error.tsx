"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/common/Card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md p-8 text-center sm:p-10">
        <span className="text-destructive text-sm font-semibold tracking-wider uppercase">
          Error 500
        </span>
        <h1 className="text-foreground mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Something Went Wrong
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          An unexpected server error occurred. Please try again or return home.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="primary" onClick={() => reset()}>
            Try Again
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
