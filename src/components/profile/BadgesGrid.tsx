"use client";

// src/components/profile/BadgesGrid.tsx
// Achievement badges showcase with unlock criteria, gradient glowing borders, and details.

import React from "react";
import {
  Compass,
  Zap,
  Code2,
  Flame,
  Award,
  Flag,
  Cpu,
  Radio,
  Lock,
  CheckCircle2,
} from "lucide-react";
import type { DeveloperBadge } from "@/server/users/passport";
import { cn } from "@/lib/utils";

interface Props {
  badges: DeveloperBadge[];
}

const BADGE_ICONS: Record<string, React.ElementType> = {
  Compass,
  Zap,
  Code2,
  Flame,
  Award,
  Flag,
  Cpu,
  Radio,
};

export function BadgesGrid({ badges }: Props) {
  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div className="border-border bg-card rounded-2xl border p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-foreground flex items-center gap-2 text-lg font-bold">
            <Award className="text-primary h-5 w-5" />
            Milestone Achievement Badges
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Proof-of-participation badges earned across KailshiansX hackathons, meetups, and
            leadership.
          </p>
        </div>
        <div className="bg-primary/10 border-primary/20 text-primary self-start rounded-full border px-3 py-1 text-xs font-semibold sm:self-auto">
          {unlockedCount} of {badges.length} Badges Unlocked
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge) => {
          const Icon = BADGE_ICONS[badge.icon] || Award;

          return (
            <div
              key={badge.id}
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 transition-all duration-300",
                badge.isUnlocked
                  ? "bg-background border-border hover:border-primary/50 shadow-md hover:shadow-lg"
                  : "bg-background border-border opacity-50 hover:opacity-75"
              )}
            >
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl shadow-inner transition-transform",
                      badge.isUnlocked
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground border-border border"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {badge.isUnlocked ? (
                    <span className="border-border bg-muted text-primary flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold tracking-wider uppercase">
                      <CheckCircle2 className="text-primary h-3 w-3" />
                      Earned
                    </span>
                  ) : (
                    <span className="text-muted-foreground bg-card border-border flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
                      <Lock className="h-3 w-3" />
                      Locked
                    </span>
                  )}
                </div>

                <h4 className="group-hover:text-primary text-foreground mb-1 text-sm font-bold transition-colors">
                  {badge.title}
                </h4>
                <p className="text-muted-foreground mb-3 line-clamp-2 text-xs leading-relaxed">
                  {badge.description}
                </p>
              </div>

              <div className="border-border flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-muted-foreground italic">{badge.criteria}</span>
                {badge.isUnlocked && badge.unlockedAt && (
                  <span className="text-muted-foreground text-xs">
                    {new Date(badge.unlockedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
