"use client";

// src/components/profile/ProgressionLadder.tsx
// Visual progression ladder: Attendee -> Campus Lead -> Organiser -> Mentor/Speaker

import React from "react";
import { UserCheck, GraduationCap, ShieldAlert, Zap, CheckCircle2, Lock } from "lucide-react";
import type { ProgressionStep } from "@/server/users/passport";
import { cn } from "@/lib/utils";

interface Props {
  progression: ProgressionStep[];
}

const STEP_ICONS: Record<string, React.ElementType> = {
  UserCheck,
  GraduationCap,
  ShieldAlert,
  Zap,
};

export function ProgressionLadder({ progression }: Props) {
  return (
    <div className="border-border bg-card relative overflow-hidden rounded-2xl border p-6 shadow-2xl backdrop-blur-xl">
      <div className="relative z-10">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-foreground flex items-center gap-2 text-lg font-bold">
              <Zap className="text-primary h-5 w-5" />
              Community Progression Ladder
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Your verified journey through India&apos;s developer ecosystem: Attendee to Mentor.
            </p>
          </div>
          <div className="text-muted-foreground bg-muted border-border flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-medium sm:self-auto">
            <span className="bg-success h-2 w-2 animate-pulse rounded-full" />
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
                    ? "bg-card border-border hover:border-primary/40 shadow-sm"
                    : "bg-background border-border opacity-60 hover:opacity-80"
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
                            ? "bg-primary ring-primary/20 text-primary-foreground ring-4"
                            : "border-success/30 bg-success/20 text-success border"
                          : "bg-muted text-muted-foreground border-border border"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {step.unlocked ? (
                      <span className="border-success/20 bg-success/10 text-success flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold">
                        <CheckCircle2 className="h-3 w-3" />
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-muted-foreground bg-card border-border flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
                        <Lock className="h-3 w-3" />
                        Locked
                      </span>
                    )}
                  </div>

                  <h4 className="text-foreground mb-1 flex items-center gap-1.5 text-sm font-bold">
                    {step.title}
                    {step.current && (
                      <span className="bg-primary h-2 w-2 rounded-full" title="Current Rank" />
                    )}
                  </h4>
                  <p className="text-muted-foreground mb-3 line-clamp-2 text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="border-border border-t pt-3 text-xs">
                  {step.unlocked && step.unlockedAt ? (
                    <span className="text-success font-medium">
                      Achieved{" "}
                      {new Date(step.unlockedAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">
                      Criteria: {step.requirements}
                    </span>
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
