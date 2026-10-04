// src/components/ui/PlaceholderPage.tsx
// Shared skeleton used by every placeholder route until real content is built.

import type { Metadata } from "next";
import { Zap } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  badge?: string;
}

export function generatePlaceholderMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
  };
}

export function PlaceholderPage({ title, description, badge }: PlaceholderPageProps) {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      {badge && (
        <span className="border-border bg-muted text-foreground mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-widest uppercase">
          <Zap size={12} />
          {badge}
        </span>
      )}
      <h1 className="text-foreground mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="text-muted-foreground max-w-md text-base leading-relaxed">{description}</p>
      <div className="border-border my-8 h-px w-24 border-t" />
      <p className="text-muted-foreground text-xs">
        This page is under construction. Check back soon.
      </p>
    </section>
  );
}
