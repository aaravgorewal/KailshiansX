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
    <section className="section-spacing container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      {badge && (
        <span className="border-brand-500/30 bg-brand-500/10 text-brand-400 mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-widest uppercase">
          <Zap size={12} />
          {badge}
        </span>
      )}
      <h1 className="text-surface-50 mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="text-surface-400 max-w-md text-lg leading-relaxed">{description}</p>
      <div className="from-brand-500 to-accent-500 mt-10 h-px w-24 rounded-full bg-gradient-to-r" />
      <p className="text-surface-500 mt-6 text-sm">
        This page is under construction. Check back soon. 🚀
      </p>
    </section>
  );
}
