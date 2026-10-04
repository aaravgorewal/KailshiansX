// src/components/about/WhoWeAreClient.tsx
// Who We Are presentation: Mission, Vision, Values, What We Do, Progression, and KWS charter

"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { WhoWeAreContent } from "@/server/cms/content";

interface WhoWeAreClientProps {
  content: WhoWeAreContent;
}

const PROGRESSION_STEPS = ["Attendee", "Member", "Contributor", "Lead", "Organiser", "Mentor"];

export function WhoWeAreClient({ content }: WhoWeAreClientProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-16">
      {/* ─── 1. PARENT ORGANIZATION CALLOUT (KAILSHIANS WEB SERVICES) ─────── */}
      <section
        aria-label="Parent Organization & Mandate"
        className="border-border bg-card rounded-lg border p-6 sm:p-8"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="border-border bg-muted text-muted-foreground rounded-md border px-2.5 py-0.5 font-mono text-xs font-medium">
              KAILSHIANS WEB SERVICES
            </span>
          </div>

          <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
            The Developer Events &amp; Community Initiative of Kailshians Web Services
          </h2>

          <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
            {content.initiativeNotice}
          </p>

          <div className="border-border grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-3">
            <div className="space-y-1">
              <span className="text-muted-foreground font-mono text-xs uppercase">
                Institutional Wing
              </span>
              <p className="text-foreground text-xs font-semibold">Kailshians Web Services</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-mono text-xs uppercase">
                Ecosystem Mandate
              </span>
              <p className="text-foreground text-xs font-semibold">Zero-Fluff Developer Density</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-mono text-xs uppercase">Governance</span>
              <p className="text-foreground text-xs font-semibold">Community First Charter</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. MISSION & VISION (PLAIN BLOCKS) ────────────────────────────── */}
      <section aria-label="Mission and Vision" className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Mission */}
        <div className="border-border bg-card space-y-3 rounded-lg border p-6">
          <span className="text-muted-foreground font-mono text-xs font-medium uppercase">
            Our Mission
          </span>
          <h3 className="text-foreground text-lg font-bold">
            Democratizing Elite Engineering Access
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
            {content.mission}
          </p>
        </div>

        {/* Vision */}
        <div className="border-border bg-card space-y-3 rounded-lg border p-6">
          <span className="text-muted-foreground font-mono text-xs font-medium uppercase">
            Our Vision
          </span>
          <h3 className="text-foreground text-lg font-bold">
            A Nationwide Autonomous Developer Flywheel
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
            {content.vision}
          </p>
        </div>
      </section>

      {/* ─── 3. CORE VALUES (PLAIN BLOCKS) ─────────────────────────────────── */}
      <section aria-label="Our Core Values" className="space-y-6">
        <div className="space-y-1">
          <span className="text-muted-foreground font-mono text-xs font-medium uppercase">
            Guiding Philosophy
          </span>
          <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
            Our Constitutional Values
          </h2>
          <p className="text-muted-foreground text-xs">
            Non-negotiable principles that govern every meetup, hackathon track, and leadership
            decision.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.values.map((v, idx) => (
            <div key={idx} className="border-border bg-card space-y-2 rounded-lg border p-5">
              <div className="flex items-center justify-between">
                <span className="text-primary font-mono text-xs font-semibold">0{idx + 1}</span>
                <span className="border-border bg-muted text-muted-foreground rounded border px-2 py-0.5 font-mono text-xs">
                  {v.subtitle}
                </span>
              </div>
              <h4 className="text-foreground text-sm font-semibold">{v.title}</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. WHAT WE DO (SIMPLE 2-COLUMN LIST) ──────────────────────────── */}
      <section aria-label="What We Do" className="space-y-6">
        <div className="space-y-1">
          <span className="text-muted-foreground font-mono text-xs font-medium uppercase">
            Platform Tracks
          </span>
          <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
            What We Do
          </h2>
          <p className="text-muted-foreground text-xs">
            Synchronized tracks running all year round across collegiate hubs and tech capitals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {content.pillars.map((pillar, idx) => (
            <div key={idx} className="border-border bg-card space-y-2 rounded-lg border p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-foreground text-sm font-semibold">{pillar.title}</h4>
                <span className="border-border bg-muted text-muted-foreground rounded border px-2 py-0.5 font-mono text-xs">
                  {pillar.badge}
                </span>
              </div>
              <p className="text-muted-foreground font-mono text-xs">{pillar.tagline}</p>
              <p className="text-muted-foreground text-xs leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. PROGRESSION (NUMBERED HORIZONTAL LIST THAT WRAPS ON MOBILE) ─── */}
      <section
        aria-label="Builder Progression"
        className="border-border bg-card space-y-5 rounded-lg border p-6 sm:p-8"
      >
        <div className="space-y-1">
          <span className="text-muted-foreground font-mono text-xs font-medium uppercase">
            Growth Ladder
          </span>
          <h3 className="text-foreground text-xl font-bold">Builder Progression</h3>
          <p className="text-muted-foreground text-xs">
            A continuous pathway for developer growth and leadership across our ecosystem.
          </p>
        </div>

        <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 sm:gap-3">
          {PROGRESSION_STEPS.map((step, idx) => (
            <li key={step} className="flex items-center gap-2">
              <span className="border-border bg-muted/60 text-foreground inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium">
                <span className="text-muted-foreground font-mono">{idx + 1}.</span>
                <span>{step}</span>
              </span>
              {idx < PROGRESSION_STEPS.length - 1 && (
                <span className="text-muted-foreground text-xs" aria-hidden="true">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* ─── 6. FINAL ACTION BLOCK ─────────────────────────────────────────── */}
      <section
        aria-label="Get Involved"
        className="border-border bg-card space-y-4 rounded-lg border p-6 text-center sm:p-8"
      >
        <div className="mx-auto max-w-xl space-y-2">
          <h3 className="text-foreground text-xl font-bold">Be Part of the Movement</h3>
          <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
            Whether you are an engineer looking for rigorous hackathons, a campus leader aiming to
            launch a chapter, or an organizer wanting to join our core team, there is a seat for
            you.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild variant="primary" size="sm" rightIcon={<ArrowRight className="size-4" />}>
            <Link href="/join-team">Join The Team</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/core-team">Meet Our Core Team</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/founder">Read Founder&apos;s Message</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
