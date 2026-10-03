// src/components/about/WhoWeAreClient.tsx
// Hallmark-styled Who We Are presentation (PRD §17)
// Positions KailshiansX as the developer events & community initiative of Kailshians Web Services

"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, Compass, Target, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { WhoWeAreContent } from "@/server/cms/content";

interface WhoWeAreClientProps {
  content: WhoWeAreContent;
}

export function WhoWeAreClient({ content }: WhoWeAreClientProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-20">
      {/* ─── 1. PARENT ORGANIZATION CALLOUT (KAILSHIANS WEB SERVICES) ─────── */}
      <section
        aria-label="Parent Organization & Mandate"
        className="border-brand-500/30 bg-surface-900/80 relative overflow-hidden rounded-3xl border p-8 backdrop-blur-md sm:p-12"
      >
        <div className="flex flex-col items-start gap-8 md:flex-row">
          <div className="bg-brand-500/10 text-brand-400 border-brand-500/25 flex size-14 shrink-0 items-center justify-center rounded-2xl border">
            <Building2 className="size-7" />
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="brand" size="default">
                Ecosystem Charter
              </Badge>
              <span className="text-brand-300 font-mono text-xs font-semibold tracking-wide">
                KAILSHIANS WEB SERVICES
              </span>
            </div>

            <h2 className="text-surface-50 text-xl leading-snug font-black tracking-tight sm:text-2xl">
              The Developer Events &amp; Community Initiative of Kailshians Web Services
            </h2>

            <p className="text-surface-300 text-xs leading-relaxed sm:text-sm">
              {content.initiativeNotice}
            </p>

            <div className="border-surface-800 grid grid-cols-1 gap-4 border-t pt-2 sm:grid-cols-3">
              <div className="space-y-1">
                <span className="text-surface-400 font-mono text-[11px] tracking-wider uppercase">
                  Institutional Wing
                </span>
                <p className="text-surface-100 text-xs font-semibold">Kailshians Web Services</p>
              </div>
              <div className="space-y-1">
                <span className="text-surface-400 font-mono text-[11px] tracking-wider uppercase">
                  Ecosystem Mandate
                </span>
                <p className="text-surface-100 text-xs font-semibold">
                  Zero-Fluff Developer Density
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-surface-400 font-mono text-[11px] tracking-wider uppercase">
                  Governance
                </span>
                <p className="text-surface-100 text-xs font-semibold">Community First Charter</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. MISSION & VISION (PRD §17) ─────────────────────────────────── */}
      <section aria-label="Mission and Vision" className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Mission */}
        <div className="border-surface-800 bg-surface-900/60 hover:border-brand-500/40 space-y-4 rounded-3xl border p-8 transition-colors">
          <div className="bg-brand-500/10 text-brand-400 border-brand-500/20 flex size-12 items-center justify-center rounded-2xl border">
            <Target className="size-6" />
          </div>
          <div>
            <Badge variant="brand" size="default">
              Our Mission
            </Badge>
            <h3 className="text-surface-50 mt-2 text-xl font-bold">
              Democratizing Elite Engineering Access
            </h3>
          </div>
          <p className="text-surface-300 text-xs leading-relaxed sm:text-sm">{content.mission}</p>
        </div>

        {/* Vision */}
        <div className="border-surface-800 bg-surface-900/60 space-y-4 rounded-3xl border p-8 transition-colors hover:border-purple-500/40">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
            <Compass className="size-6" />
          </div>
          <div>
            <Badge variant="accent" size="default">
              Our Vision
            </Badge>
            <h3 className="text-surface-50 mt-2 text-xl font-bold">
              A Nationwide Autonomous Developer Flywheel
            </h3>
          </div>
          <p className="text-surface-300 text-xs leading-relaxed sm:text-sm">{content.vision}</p>
        </div>
      </section>

      {/* ─── 3. CORE VALUES ────────────────────────────────────────────────── */}
      <section aria-label="Our Core Values" className="space-y-8">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <Badge variant="brand" size="default">
            Guiding Philosophy
          </Badge>
          <h2 className="text-surface-50 text-2xl font-black tracking-tight sm:text-3xl">
            Our Constitutional Values
          </h2>
          <p className="text-surface-400 text-xs leading-relaxed">
            These non-negotiable principles govern every meetup, hackathon track, and leadership
            decision.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.values.map((v, idx) => (
            <div
              key={idx}
              className="border-surface-800 bg-surface-900/60 hover:border-brand-500/40 space-y-3 rounded-2xl border p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-brand-400 font-mono text-xs font-bold">0{idx + 1}</span>
                <span className="bg-surface-800 text-surface-300 border-surface-700 rounded-full border px-2 py-0.5 font-mono text-xs">
                  {v.subtitle}
                </span>
              </div>
              <h4 className="text-surface-50 text-base font-bold">{v.title}</h4>
              <p className="text-surface-300 text-xs leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. WHAT WE DO (THE 6 OPERATIONAL PILLARS) ────────────────────── */}
      <section aria-label="What We Do" className="space-y-8">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <Badge variant="accent" size="default">
            Operational Pillars
          </Badge>
          <h2 className="text-surface-50 text-2xl font-black tracking-tight sm:text-3xl">
            What We Do: The KailshiansX Platform
          </h2>
          <p className="text-surface-400 text-xs leading-relaxed">
            Six synchronized tracks running all year round across collegiate hubs and tech capitals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="border-surface-800 bg-surface-900/40 hover:border-brand-500/40 flex flex-col justify-between space-y-4 rounded-2xl border p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-surface-400 font-mono text-xs font-semibold uppercase">
                    {pillar.tagline}
                  </span>
                  <Badge variant="surface" size="sm">
                    {pillar.badge}
                  </Badge>
                </div>
                <h4 className="text-surface-50 text-base font-bold">{pillar.title}</h4>
                <p className="text-surface-300 text-xs leading-relaxed">{pillar.description}</p>
              </div>

              <div className="border-surface-800/80 text-brand-300 flex items-center justify-between border-t pt-2 font-mono text-xs">
                <span>Active Track</span>
                <ArrowRight className="size-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. THE BUILDER PROGRESSION FLYWHEEL ───────────────────────────── */}
      <section
        aria-label="Builder Progression Flywheel"
        className="border-surface-800 bg-surface-900/60 space-y-8 rounded-3xl border p-8 sm:p-12"
      >
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <Badge variant="brand" size="default">
            The Flywheel
          </Badge>
          <h3 className="text-surface-50 text-2xl font-bold">
            How Builders Level Up in KailshiansX
          </h3>
          <p className="text-surface-400 text-xs">
            We don&apos;t just host events; we build a continuous ladder for developer growth.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { step: "01", label: "Attendee", desc: "Show up & build" },
            { step: "02", label: "Member", desc: "Join city chapters" },
            { step: "03", label: "Contributor", desc: "Ship open source" },
            { step: "04", label: "Campus Lead", desc: "Lead collegiate hubs" },
            { step: "05", label: "Organizer", desc: "Run regional stages" },
            { step: "06", label: "Mentor", desc: "Inspire next cohort" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="border-surface-800 bg-surface-950 space-y-2 rounded-xl border p-4 text-center"
            >
              <div className="text-brand-400 font-mono text-xs font-bold">{item.step}</div>
              <div className="text-surface-100 text-xs font-bold">{item.label}</div>
              <div className="text-surface-400 text-[11px]">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 6. FINAL ACTION BLOCK ─────────────────────────────────────────── */}
      <section
        aria-label="Get Involved"
        className="border-surface-800 bg-surface-900/60 space-y-6 rounded-3xl border p-8 text-center sm:p-12"
      >
        <div className="mx-auto max-w-xl space-y-2">
          <h3 className="text-surface-50 text-2xl font-bold">Be Part of the Movement</h3>
          <p className="text-surface-300 text-xs leading-relaxed sm:text-sm">
            Whether you are an engineer looking for rigorous hackathons, a campus leader aiming to
            launch a chapter, or an organizer wanting to join our core team, there is a seat for
            you.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button
            asChild
            variant="default"
            size="default"
            rightIcon={<ArrowRight className="size-4" />}
          >
            <Link href="/join-team">Join The Team</Link>
          </Button>
          <Button asChild variant="secondary" size="default">
            <Link href="/core-team">Meet Our Core Team</Link>
          </Button>
          <Button asChild variant="outline" size="default">
            <Link href="/founder">Read Founder&apos;s Message</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
