// src/components/ui/PlaceholderPage.tsx
// Shared skeleton used by every placeholder route until real content is built.

import type { Metadata } from "next";
import { Zap } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  badge?: string;
}

export function generatePlaceholderMetadata(
  title: string,
  description: string
): Metadata {
  return {
    title,
    description,
  };
}

export function PlaceholderPage({ title, description, badge }: PlaceholderPageProps) {
  return (
    <section className="section-spacing container-page flex flex-col items-center justify-center min-h-[60vh] text-center">
      {badge && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-400 mb-6">
          <Zap size={12} />
          {badge}
        </span>
      )}
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-50 mb-4">
        {title}
      </h1>
      <p className="text-lg text-surface-400 max-w-md leading-relaxed">{description}</p>
      <div className="mt-10 h-px w-24 bg-gradient-to-r from-brand-500 to-accent-500 rounded-full" />
      <p className="mt-6 text-sm text-surface-500">
        This page is under construction. Check back soon. 🚀
      </p>
    </section>
  );
}
