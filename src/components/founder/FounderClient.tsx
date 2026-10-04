// src/components/founder/FounderClient.tsx
// Founder profile, message, philosophy, and milestones from CMS

"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageSquareQuote, BookOpen, Milestone as MilestoneIcon } from "lucide-react";
import { LinkedinIcon, TwitterIcon } from "@/components/ui/social-icons";
import { Button } from "@/components/ui/Button";

interface Milestone {
  year: string | number;
  title: string;
  description: string;
}

interface FounderClientProps {
  founder: {
    founderName: string;
    tagline: string;
    message: string;
    philosophy: string;
    photo?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    milestones: Milestone[];
  };
}

export function FounderClient({ founder }: FounderClientProps) {
  const [photoError, setPhotoError] = React.useState(false);

  const initials = founder.founderName
    ? founder.founderName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AG";

  const hasMessage = Boolean(founder.message && founder.message.trim().length > 0);
  const hasPhilosophy = Boolean(founder.philosophy && founder.philosophy.trim().length > 0);
  const hasMilestones = Boolean(founder.milestones && founder.milestones.length > 0);

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      {/* ─── 1. FOUNDER PROFILE & IDENTITY ─────────────────────────────────── */}
      <section className="border-border bg-card rounded-lg border p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
          {/* Avatar / Portrait (CMS photo or initials fallback) */}
          <div className="border-border bg-muted relative size-28 shrink-0 overflow-hidden rounded-lg border sm:size-32">
            {founder.photo && !photoError ? (
              <Image
                src={founder.photo}
                alt={founder.founderName}
                fill
                priority
                sizes="(max-width: 640px) 112px, 128px"
                className="object-cover"
                onError={() => setPhotoError(true)}
              />
            ) : (
              <div className="bg-muted text-muted-foreground flex size-full items-center justify-center font-mono text-2xl font-bold sm:text-3xl">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                {founder.founderName}
              </h2>
              {founder.tagline && (
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm">{founder.tagline}</p>
              )}
            </div>

            {/* Social Links */}
            {(founder.linkedin || founder.twitter) && (
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                {founder.linkedin && (
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                    aria-label={`LinkedIn profile of ${founder.founderName}`}
                  >
                    <LinkedinIcon className="size-4" />
                  </a>
                )}
                {founder.twitter && (
                  <a
                    href={founder.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                    aria-label={`Twitter profile of ${founder.founderName}`}
                  >
                    <TwitterIcon className="size-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 2. FOUNDER MESSAGE (CMS CONTENT ONLY, HIDE IF EMPTY) ─────────── */}
      {hasMessage && (
        <section
          aria-label="Founder's Message"
          className="border-border bg-card space-y-4 rounded-lg border p-6 sm:p-8"
        >
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="text-muted-foreground size-5" />
            <h3 className="text-foreground text-base font-semibold">A Personal Message</h3>
          </div>
          <div className="text-muted-foreground space-y-4 text-xs leading-relaxed sm:text-sm">
            <p className="whitespace-pre-line">{founder.message}</p>
          </div>
          <div className="border-border text-muted-foreground border-t pt-3 font-mono text-xs">
            {founder.founderName}
          </div>
        </section>
      )}

      {/* ─── 3. COMMUNITY PHILOSOPHY (CMS CONTENT ONLY, HIDE IF EMPTY) ─────── */}
      {hasPhilosophy && (
        <section
          aria-label="Community Philosophy"
          className="border-border bg-card space-y-4 rounded-lg border p-6 sm:p-8"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="text-muted-foreground size-5" />
            <h3 className="text-foreground text-base font-semibold">Community Philosophy</h3>
          </div>
          <div className="text-muted-foreground space-y-4 text-xs leading-relaxed sm:text-sm">
            <p className="whitespace-pre-line">{founder.philosophy}</p>
          </div>
        </section>
      )}

      {/* ─── 4. SELECTED MILESTONES (CMS CONTENT ONLY, HIDE IF EMPTY) ──────── */}
      {hasMilestones && (
        <section
          aria-label="Selected Milestones"
          className="border-border bg-card space-y-6 rounded-lg border p-6 sm:p-8"
        >
          <div className="flex items-center gap-2">
            <MilestoneIcon className="text-muted-foreground size-5" />
            <h3 className="text-foreground text-base font-semibold">Key Milestones</h3>
          </div>

          <div className="border-border relative ml-2 space-y-6 border-l pl-6">
            {founder.milestones.map((m, idx) => (
              <div key={idx} className="relative space-y-1">
                {/* Dot */}
                <div className="bg-primary absolute top-1.5 -left-[29px] size-2 rounded-full" />

                <span className="text-primary font-mono text-xs font-semibold">{m.year}</span>
                <h4 className="text-foreground text-sm font-semibold">{m.title}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">{m.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── 5. FINAL CTAs ─────────────────────────────────────────────────── */}
      <section
        aria-label="Get Involved"
        className="border-border bg-card space-y-4 rounded-lg border p-6 text-center sm:p-8"
      >
        <h3 className="text-foreground text-xl font-bold">Ready to Build with Us?</h3>
        <p className="text-muted-foreground mx-auto max-w-xl text-xs leading-relaxed sm:text-sm">
          KailshiansX belongs to every developer who wants to raise the bar. Join a gathering, step
          up as a campus lead, or partner your institution with our chapter network.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild variant="primary" size="sm" rightIcon={<ArrowRight className="size-4" />}>
            <Link href="/events">Explore Gatherings</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/community">Join Community</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/collaborations">Partner With Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
