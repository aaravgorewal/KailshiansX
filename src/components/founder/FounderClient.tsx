// src/components/founder/FounderClient.tsx
// Hallmark-styled Founder story, philosophy, milestones, and links (PRD §16 — not a resume)

"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Quote, ArrowRight, ShieldCheck, HeartHandshake, Cpu, Compass } from "lucide-react";
import { LinkedinIcon, TwitterIcon } from "@/components/ui/social-icons";
import { Badge } from "@/components/ui/Badge";
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
  return (
    <div className="mx-auto max-w-5xl space-y-20">
      {/* ─── 1. FOUNDER PROFILE & ORIGIN STORY ────────────────────────────── */}
      <section className="border-surface-800 bg-surface-900/60 rounded-3xl border p-8 backdrop-blur-md sm:p-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start lg:gap-12">
          {/* Founder Portrait */}
          <div className="shrink-0 space-y-4 text-center">
            <div className="border-surface-700/80 bg-surface-800 relative size-44 overflow-hidden rounded-3xl border-2 shadow-2xl sm:size-52">
              {founder.photo ? (
                <Image
                  src={founder.photo}
                  alt={founder.founderName}
                  fill
                  priority
                  sizes="(max-width: 640px) 176px, 208px"
                  className="object-cover"
                />
              ) : (
                <div className="text-surface-400 flex size-full items-center justify-center text-4xl font-black">
                  AG
                </div>
              )}
            </div>

            <div>
              <h3 className="text-surface-50 text-xl font-bold">{founder.founderName}</h3>
              <p className="text-brand-300 mx-auto mt-1 max-w-[200px] font-mono text-xs leading-tight">
                {founder.tagline}
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {founder.linkedin && (
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-surface-700/80 bg-surface-950 text-surface-400 hover:border-brand-500/50 hover:text-brand-300 rounded-xl border p-2 transition-colors"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="size-4" />
                </a>
              )}
              {founder.twitter && (
                <a
                  href={founder.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-surface-700/80 bg-surface-950 text-surface-400 hover:border-brand-500/50 hover:text-brand-300 rounded-xl border p-2 transition-colors"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="size-4" />
                </a>
              )}
            </div>
          </div>

          {/* Why It Was Created (PRD §16) */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <Badge variant="brand" size="default">
                Why KailshiansX Was Created
              </Badge>
              <h2 className="text-surface-50 mt-3 text-2xl leading-tight font-black tracking-tight sm:text-3xl lg:text-4xl">
                The Intentional Antidote to Transactional Tech Events
              </h2>
            </div>

            <div className="text-surface-300 space-y-4 text-xs leading-relaxed sm:text-sm">
              <p>
                Throughout my journey building software, I noticed a painful pattern across India:
                thousands of hungry, brilliant engineers enrolled in university campuses outside
                Bengaluru and Gurgaon were being completely ignored.
              </p>
              <p>
                When tech events did happen in regional cities, they were almost always corporate
                marketing roadshows designed to collect student emails for paid bootcamps or selling
                unrelated software licenses. Real technical substance was missing. Hackathons had
                predetermined outcomes, Wi-Fi collapsed at midnight, and mentors were absent.
              </p>
              <p>
                <strong className="text-surface-100 font-semibold">
                  KailshiansX was built as an uncompromising counter-force.
                </strong>{" "}
                We set out to engineer events where the builder is the primary stakeholder — free
                tier admission, world-class keynote speakers who actually stay for Q&amp;A, and an
                architecture-first curriculum that treats young developers like future engineering
                directors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. FOUNDER MESSAGE (LETTER STYLE) ──────────────────────────────── */}
      <section className="border-brand-500/30 bg-brand-500/5 relative overflow-hidden rounded-3xl border p-8 sm:p-12">
        <Quote className="text-brand-400/40 mb-4 size-10" />
        <h3 className="text-surface-50 mb-4 text-xl font-bold sm:text-2xl">
          A Personal Message to Every Builder
        </h3>
        <blockquote className="text-surface-200 space-y-4 text-sm leading-relaxed italic sm:text-base">
          <p>“{founder.message}”</p>
        </blockquote>
        <div className="text-brand-300 mt-6 flex items-center gap-3 font-mono text-xs">
          <span className="bg-brand-400 size-2 rounded-full" />
          <span>{founder.founderName} • Founder, Kailshians Web Services</span>
        </div>
      </section>

      {/* ─── 3. COMMUNITY PHILOSOPHY (PRD §16) ─────────────────────────────── */}
      <section className="space-y-8">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <Badge variant="accent" size="default">
            Core Principles
          </Badge>
          <h2 className="text-surface-50 text-2xl font-black tracking-tight sm:text-3xl">
            Our Community Philosophy
          </h2>
          <p className="text-surface-400 text-xs leading-relaxed">
            Events come and go; communities compound over decades. Here are the convictions that
            guide every decision at KailshiansX.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="border-surface-800 bg-surface-900/60 space-y-3 rounded-2xl border p-6">
            <div className="bg-brand-500/10 text-brand-400 border-brand-500/20 flex size-10 items-center justify-center rounded-xl border">
              <HeartHandshake className="size-5" />
            </div>
            <h4 className="text-surface-50 text-base font-bold">Trust Over Transactions</h4>
            <p className="text-surface-300 text-xs leading-relaxed">
              We never monetize participant data or flood attendee inboxes with partner spam.
              Sponsors earn attention by offering real engineering bounties and mentorship, not
              aggressive sales pitches.
            </p>
          </div>

          <div className="border-surface-800 bg-surface-900/60 space-y-3 rounded-2xl border p-6">
            <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <Compass className="size-5" />
            </div>
            <h4 className="text-surface-50 text-base font-bold">Consistency Over Hype</h4>
            <p className="text-surface-300 text-xs leading-relaxed">
              Anyone can host a splashy one-time conference. We build recurring properties (RaibarX,
              PadharoX, NirmanX) that return every season with deeper technical tracks and higher
              standards.
            </p>
          </div>

          <div className="border-surface-800 bg-surface-900/60 space-y-3 rounded-2xl border p-6">
            <div className="flex size-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
              <Cpu className="size-5" />
            </div>
            <h4 className="text-surface-50 text-base font-bold">Technical Respect by Default</h4>
            <p className="text-surface-300 text-xs leading-relaxed">
              We assume builders are smart and ambitious. We dive straight into B-Trees, Raft
              consensus, eBPF, and Agentic AI architectures without patronizing oversimplifications.
            </p>
          </div>

          <div className="border-surface-800 bg-surface-900/60 space-y-3 rounded-2xl border p-6">
            <div className="flex size-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
              <ShieldCheck className="size-5" />
            </div>
            <h4 className="text-surface-50 text-base font-bold">
              The Builder Progression Flywheel
            </h4>
            <p className="text-surface-300 text-xs leading-relaxed">
              Our core metric is mobility: turning attendees into active open-source contributors,
              campus leads, stage organizers, and eventually speakers and mentors for the next
              cohort.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 4. SELECTED MILESTONES (PRD §16) ──────────────────────────────── */}
      <section className="border-surface-800 bg-surface-900/40 space-y-8 rounded-3xl border p-8 sm:p-12">
        <div>
          <Badge variant="brand" size="default">
            Journey &amp; Evolution
          </Badge>
          <h2 className="text-surface-50 mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Selected Milestones
          </h2>
          <p className="text-surface-400 mt-1 text-xs">
            A chronological timeline of how an idea grew into a multi-city developer platform.
          </p>
        </div>

        <div className="border-surface-800 relative ml-4 space-y-8 border-l pl-6">
          {founder.milestones.map((m, idx) => (
            <div key={idx} className="group relative">
              {/* Dot */}
              <div className="border-surface-950 bg-brand-500 absolute top-1 -left-[31px] size-3 rounded-full border-2 transition-transform group-hover:scale-125" />

              <div className="space-y-1">
                <span className="text-brand-400 font-mono text-xs font-bold">{m.year}</span>
                <h4 className="text-surface-50 text-base font-bold">{m.title}</h4>
                <p className="text-surface-300 max-w-2xl text-xs leading-relaxed">
                  {m.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. FINAL CTAs ─────────────────────────────────────────────────── */}
      <section className="border-surface-800 bg-surface-900/60 space-y-5 rounded-3xl border p-8 text-center sm:p-12">
        <h3 className="text-surface-50 text-2xl font-bold">Ready to Build with Us?</h3>
        <p className="text-surface-300 mx-auto max-w-xl text-xs leading-relaxed sm:text-sm">
          KailshiansX belongs to every developer who wants to raise the bar. Join a gathering, step
          up as a campus lead, or partner your institution with our chapter network.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button
            asChild
            variant="default"
            size="default"
            rightIcon={<ArrowRight className="size-4" />}
          >
            <Link href="/events">Explore Gatherings</Link>
          </Button>
          <Button asChild variant="secondary" size="default">
            <Link href="/community">Join Community</Link>
          </Button>
          <Button asChild variant="outline" size="default">
            <Link href="/collaborations">Partner With Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
