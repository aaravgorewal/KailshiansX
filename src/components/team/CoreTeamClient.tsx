// src/components/team/CoreTeamClient.tsx
// Interactive core team directory grouped by category with profile cards

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

function MemberAvatar({ name, photo }: { name: string; photo?: string | null }) {
  const [hasError, setHasError] = React.useState(false);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!photo || hasError) {
    return (
      <div className="bg-muted text-muted-foreground flex size-full items-center justify-center font-mono text-sm font-semibold">
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={photo}
      alt={name}
      fill
      sizes="56px"
      className="object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export function CoreTeamClient({ members }: CoreTeamClientProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");

  const filteredMembers = React.useMemo(() => {
    if (selectedCategory === "ALL") return members;
    return members.filter((m) => m.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [members, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* ─── CATEGORY FILTER TABS (NEUTRAL) ───────────────────────────────── */}
      <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("ALL")}
          className={cn(
            "shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
            selectedCategory === "ALL"
              ? "border-primary bg-primary text-primary-foreground font-semibold"
              : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
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
                "shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground font-semibold"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>{cat.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 font-mono text-xs",
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
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
        <div className="border-border bg-card/40 rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
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
                className="group border-border bg-card hover:border-primary/50 relative flex flex-col justify-between rounded-lg border p-5 transition-colors duration-150"
              >
                <div className="space-y-4">
                  {/* Top: Avatar + Category Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="border-border bg-muted relative size-14 shrink-0 overflow-hidden rounded-md border">
                      <MemberAvatar name={member.name} photo={member.photo} />
                    </div>

                    <Badge variant="outline" size="sm">
                      {categoryInfo?.label.split("&")[0].trim() || member.category}
                    </Badge>
                  </div>

                  {/* Name & Role */}
                  <div>
                    <h3 className="text-foreground text-base font-semibold">{member.name}</h3>
                    <p className="text-muted-foreground mt-0.5 text-xs">{member.role}</p>
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
                      {member.bio}
                    </p>
                  )}

                  {/* Area of Ownership */}
                  <div className="border-border bg-muted/40 space-y-1 rounded-md border p-2.5">
                    <span className="text-muted-foreground block font-mono text-xs uppercase">
                      Ownership
                    </span>
                    <p className="text-foreground text-xs font-medium">
                      {categoryInfo?.description || `${member.role} initiatives`}
                    </p>
                  </div>
                </div>

                {/* Bottom: Professional Links Row */}
                <div className="border-border mt-5 flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-1.5">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                        title="LinkedIn Profile"
                        aria-label={`LinkedIn profile of ${member.name}`}
                      >
                        <LinkedinIcon className="size-4" />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                        title="Twitter / X Profile"
                        aria-label={`Twitter profile of ${member.name}`}
                      >
                        <TwitterIcon className="size-4" />
                      </a>
                    )}
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                        title="GitHub Profile"
                        aria-label={`GitHub profile of ${member.name}`}
                      >
                        <GithubIcon className="size-4" />
                      </a>
                    )}
                    {member.website && (
                      <a
                        href={member.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                        title="Personal Website"
                        aria-label={`Personal website of ${member.name}`}
                      >
                        <Globe className="size-4" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                        title="Email"
                        aria-label={`Send email to ${member.name}`}
                      >
                        <Mail className="size-4" />
                      </a>
                    )}
                  </div>

                  <span className="text-muted-foreground font-mono text-xs">Verified Lead</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ─── JOIN TEAM CTA ─────────────────────────────────────────────────── */}
      <section className="border-border bg-card space-y-4 rounded-lg border p-6 text-center sm:p-8">
        <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
          Want to Join the KailshiansX Core Team?
        </h2>
        <p className="text-muted-foreground mx-auto max-w-xl text-xs leading-relaxed sm:text-sm">
          We are recruiting across Technology, Events, Community, Partnerships, Design, and
          Marketing. Move from attendee to steering organizer.
        </p>
        <div className="pt-2">
          <Button asChild size="sm" variant="primary" rightIcon={<ArrowRight className="size-4" />}>
            <Link href="/join-team">View Open Positions &amp; Apply</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
