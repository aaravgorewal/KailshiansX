"use client";

// src/components/profile/ProgressionLadder.tsx
// Visual progression ladder: Attendee -> Campus Lead -> Organiser -> Mentor/Speaker

import React from "react";
import { UserCheck, GraduationCap, ShieldAlert, Sparkles, CheckCircle2, Lock } from "lucide-react";
import type { ProgressionStep } from "@/server/users/passport";
import { cn } from "@/lib/utils";

interface Props {
  progression: ProgressionStep[];
}

const STEP_ICONS: Record<string, React.ElementType> = {
  UserCheck,
  GraduationCap,
  ShieldAlert,
  Sparkles,
};

export function ProgressionLadder({ progression }: Props) {
  return (
    <div className="border-surface-800 bg-surface-900/60 relative overflow-hidden rounded-2xl border p-6 shadow-2xl backdrop-blur-xl">
      {/* Background ambient gradient */}
      <div className="bg-brand-500/5 pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Community Progression Ladder
            </h3>
            <p className="text-surface-400 mt-1 text-sm">
              Your verified journey through India&apos;s developer ecosystem: Attendee to Mentor.
            </p>
          </div>
          <div className="text-surface-300 bg-surface-800/80 border-surface-700/60 flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-medium sm:self-auto">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Verified Career Credentials
          </div>
        </div>

        {/* Stepper Grid */}
        <div className="relative grid grid-cols-1 gap-4 md:grid-cols-4">
          {progression.map((step) => {
            const Icon = STEP_ICONS[step.icon] || UserCheck;

            return (
              <div
                key={step.tier}
                className={cn(
                  "relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-300",
                  step.unlocked
                    ? "from-surface-800/90 to-surface-900/80 border-surface-700 hover:border-brand-500/40 bg-gradient-to-b shadow-lg"
                    : "bg-surface-950/40 border-surface-800/60 opacity-60 hover:opacity-80"
                )}
              >
                <div>
                  {/* Top Header */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl shadow-inner transition-colors",
                        step.unlocked
                          ? step.current
                            ? "bg-brand-500 ring-brand-500/20 text-white ring-4"
                            : "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                          : "bg-surface-800 text-surface-400 border-surface-700/40 border"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {step.unlocked ? (
                      <span className="flex items-center gap-1 rounded-full border border-emerald-800/60 bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-surface-400 bg-surface-900 border-surface-800 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium">
                        <Lock className="h-3 w-3" />
                        Locked
                      </span>
                    )}
                  </div>

                  <h4 className="mb-1 flex items-center gap-1.5 text-sm font-bold text-white">
                    {step.title}
                    {step.current && (
                      <span className="bg-brand-400 h-2 w-2 rounded-full" title="Current Rank" />
                    )}
                  </h4>
                  <p className="text-surface-300 mb-3 line-clamp-2 text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="border-surface-800/70 border-t pt-3 text-[11px]">
                  {step.unlocked && step.unlockedAt ? (
                    <span className="font-medium text-emerald-400">
                      Achieved{" "}
                      {new Date(step.unlockedAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  ) : (
                    <span className="text-surface-400 italic">Criteria: {step.requirements}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
