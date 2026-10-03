// src/components/team/CoreTeamClient.tsx
// Interactive core team directory grouped by category with rich profile cards (PRD §15)

"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, Mail, ArrowRight } from "lucide-react";
import { LinkedinIcon, TwitterIcon, GithubIcon } from "@/components/ui/social-icons";
import { CORE_TEAM_CATEGORIES } from "@/lib/team-constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface SerializedCoreTeamMember {
  id: string;
  name: string;
  slug: string;
  role: string;
  category: string;
  bio?: string | null;
  photo?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  github?: string | null;
  website?: string | null;
  email?: string | null;
  sortOrder: number;
}

interface CoreTeamClientProps {
  members: SerializedCoreTeamMember[];
}

export function CoreTeamClient({ members }: CoreTeamClientProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");

  const filteredMembers = React.useMemo(() => {
    if (selectedCategory === "ALL") return members;
    return members.filter((m) => m.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [members, selectedCategory]);

  return (
    <div className="space-y-12">
      {/* ─── CATEGORY FILTER TABS ─────────────────────────────────────────── */}
      <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("ALL")}
          className={cn(
            "shrink-0 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-200",
            selectedCategory === "ALL"
              ? "border-brand-500/80 bg-brand-500/15 text-brand-300 font-semibold"
              : "border-surface-800 bg-surface-900/60 text-surface-400 hover:border-surface-700 hover:text-surface-200"
          )}
        >
          All Members ({members.length})
        </button>

        {CORE_TEAM_CATEGORIES.map((cat) => {
          const count = members.filter(
            (m) => m.category.toLowerCase() === cat.key.toLowerCase()
          ).length;
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={cn(
                "shrink-0 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-200",
                isSelected
                  ? "border-brand-500/80 bg-brand-500/15 text-brand-300 font-semibold"
                  : "border-surface-800 bg-surface-900/60 text-surface-400 hover:border-surface-700 hover:text-surface-200"
              )}
            >
              <span>{cat.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "py-0.2 ml-1.5 rounded-full px-1.5 font-mono text-[10px]",
                    isSelected
                      ? "bg-brand-500/30 text-brand-200"
                      : "bg-surface-800 text-surface-400"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── PROFILE CARDS GRID ───────────────────────────────────────────── */}
      {filteredMembers.length === 0 ? (
        <div className="border-surface-800 bg-surface-900/40 rounded-2xl border border-dashed p-12 text-center">
          <p className="text-surface-400 text-sm">
            No team members listed in this category yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => {
            const categoryInfo = CORE_TEAM_CATEGORIES.find(
              (c) => c.key === member.category.toLowerCase()
            );

            return (
              <article
                key={member.id}
                className="group border-surface-800 bg-surface-900/60 hover:border-brand-500/40 hover:bg-surface-900/80 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="space-y-4">
                  {/* Top: Avatar + Category Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="border-surface-700/80 bg-surface-800 relative size-16 shrink-0 overflow-hidden rounded-2xl border">
                      {member.photo ? (
                        <Image
                          src={member.photo}
                          alt={member.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-surface-400 flex size-full items-center justify-center text-lg font-bold">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    <Badge variant="brand" size="sm">
                      {categoryInfo?.label.split("&")[0].trim() || member.category}
                    </Badge>
                  </div>

                  {/* Name & Role */}
                  <div>
                    <h3 className="text-surface-50 group-hover:text-brand-300 text-lg font-bold transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-brand-400 mt-0.5 font-mono text-xs font-semibold">
                      {member.role}
                    </p>
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-surface-300 line-clamp-4 text-xs leading-relaxed">
                      {member.bio}
                    </p>
                  )}

                  {/* Area of Ownership Badge / Box (PRD §15) */}
                  <div className="border-surface-800 bg-surface-950/60 space-y-1 rounded-xl border p-3 text-[11px]">
                    <span className="text-surface-400 block font-mono text-[10px] font-semibold tracking-wider uppercase">
                      Core Ownership
                    </span>
                    <p className="text-surface-200 font-medium">
                      {categoryInfo?.description || `${member.role} initiatives`}
                    </p>
                  </div>
                </div>

                {/* Bottom: Professional Links Row */}
                <div className="border-surface-800/80 mt-6 flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-2">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-surface-400 hover:bg-surface-800 hover:text-brand-400 rounded-lg p-1.5 transition-colors"
                        title="LinkedIn Profile"
                        aria-label="LinkedIn"
                      >
                        <LinkedinIcon className="size-4" />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-surface-400 hover:bg-surface-800 hover:text-brand-400 rounded-lg p-1.5 transition-colors"
                        title="Twitter / X Profile"
                        aria-label="Twitter"
                      >
                        <TwitterIcon className="size-4" />
                      </a>
                    )}
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-surface-400 hover:bg-surface-800 hover:text-surface-100 rounded-lg p-1.5 transition-colors"
                        title="GitHub Profile"
                        aria-label="GitHub"
                      >
                        <GithubIcon className="size-4" />
                      </a>
                    )}
                    {member.website && (
                      <a
                        href={member.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-surface-400 hover:bg-surface-800 hover:text-surface-100 rounded-lg p-1.5 transition-colors"
                        title="Personal Website"
                        aria-label="Website"
                      >
                        <Globe className="size-4" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="text-surface-400 hover:bg-surface-800 hover:text-surface-100 rounded-lg p-1.5 transition-colors"
                        title="Email"
                        aria-label="Email"
                      >
                        <Mail className="size-4" />
                      </a>
                    )}
                  </div>

                  <span className="text-surface-500 font-mono text-[10px]">Verified Lead</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ─── JOIN TEAM CTA ─────────────────────────────────────────────────── */}
      <section className="border-surface-800 from-surface-900 via-surface-900/60 to-surface-950 space-y-4 rounded-3xl border bg-gradient-to-br p-8 text-center sm:p-12">
        <Badge variant="accent" size="default">
          We Are Expanding
        </Badge>
        <h2 className="text-surface-50 text-2xl font-black tracking-tight sm:text-3xl">
          Want to Join the KailshiansX Core Team?
        </h2>
        <p className="text-surface-300 mx-auto max-w-xl text-xs leading-relaxed sm:text-sm">
          We are recruiting across Technology, Events, Community, Partnerships, Design, and
          Marketing. Move from attendee to steering organizer.
        </p>
        <div className="pt-2">
          <Button
            asChild
            size="default"
            variant="default"
            rightIcon={<ArrowRight className="size-4" />}
          >
            <Link href="/join-team">View Open Positions &amp; Apply</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
