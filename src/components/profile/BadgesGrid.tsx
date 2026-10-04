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
    <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-white">
            <Award className="h-5 w-5 text-amber-400" />
            Milestone Achievement Badges
          </h3>
          <p className="text-surface-400 mt-1 text-sm">
            Proof-of-participation badges earned across KailshiansX hackathons, meetups, and
            leadership.
          </p>
        </div>
        <div className="bg-brand-500/10 border-brand-500/20 text-brand-400 self-start rounded-full border px-3 py-1 text-xs font-semibold sm:self-auto">
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
                  ? "bg-surface-950/80 border-surface-700/80 hover:border-brand-500/50 shadow-md hover:shadow-lg"
                  : "bg-surface-950/30 border-surface-800/40 opacity-50 hover:opacity-75"
              )}
            >
              {/* Top ambient glow for unlocked badge */}
              {badge.isUnlocked && (
                <div
                  className={cn(
                    "pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl",
                    badge.color
                  )}
                />
              )}

              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl shadow-inner transition-transform group-hover:scale-105",
                      badge.isUnlocked
                        ? cn("bg-gradient-to-br text-white shadow-lg", badge.color)
                        : "bg-surface-800 text-surface-400 border-surface-700/50 border"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {badge.isUnlocked ? (
                    <span className="flex items-center gap-1 rounded-full border border-amber-800/60 bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-400 uppercase">
                      <CheckCircle2 className="h-3 w-3 text-amber-400" />
                      Earned
                    </span>
                  ) : (
                    <span className="text-surface-400 bg-surface-900 border-surface-800 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium">
                      <Lock className="h-3 w-3" />
                      Locked
                    </span>
                  )}
                </div>

                <h4 className="group-hover:text-brand-300 mb-1 text-sm font-bold text-white transition-colors">
                  {badge.title}
                </h4>
                <p className="text-surface-300 mb-3 line-clamp-2 text-xs leading-relaxed">
                  {badge.description}
                </p>
              </div>

              <div className="border-surface-800/80 flex items-center justify-between border-t pt-3 text-[11px]">
                <span className="text-surface-400 italic">{badge.criteria}</span>
                {badge.isUnlocked && badge.unlockedAt && (
                  <span className="text-surface-400 text-[10px]">
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
