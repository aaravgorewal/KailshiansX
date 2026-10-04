"use client";

// src/components/profile/ApplicationsTracker.tsx
// Displays status tracker for Team, Campus Lead, and State Lead applications.

import React from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  ExternalLink,
} from "lucide-react";
import type { MemberApplication } from "@/server/users/profile";
import { cn } from "@/lib/utils";

interface Props {
  applications: MemberApplication[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  NEW: {
    label: "Application Submitted",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: Clock,
  },
  APPLIED: {
    label: "Under Review",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: Clock,
  },
  SCREENING: {
    label: "Initial Screening",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: AlertCircle,
  },
  REVIEWING: {
    label: "Under Review",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: AlertCircle,
  },
  INTERVIEW: {
    label: "Interview Scheduled",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: Calendar,
  },
  SELECTED: {
    label: "Offer Accepted",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  ACTIVE: {
    label: "Active Leadership",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Closed",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: XCircle,
  },
};

export function ApplicationsTracker({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <div className="border-surface-800 bg-surface-950/40 rounded-2xl border border-dashed py-16 text-center">
        <FileText className="text-surface-600 mx-auto mb-3 h-12 w-12" />
        <h4 className="mb-1 text-lg font-bold text-white">No Active Applications</h4>
        <p className="text-surface-400 mx-auto mb-5 max-w-md text-sm">
          Want to lead community chapters or build with the core engineering & events team?
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/join-team"
            className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors"
          >
            Join Team
          </Link>
          <Link
            href="/campus-leads"
            className="bg-surface-800 hover:bg-surface-700 text-surface-200 border-surface-700 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            Apply for Campus Lead
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => {
        const config = STATUS_CONFIG[app.status] || {
          label: app.status,
          color: "bg-surface-800 text-surface-300 border-surface-700",
          icon: Clock,
        };
        const Icon = config.icon;

        return (
          <div
            key={app.id}
            className="border-surface-800 bg-surface-900/70 hover:border-surface-700 flex flex-col justify-between gap-4 rounded-2xl border p-5 shadow-lg backdrop-blur-xl transition-all sm:flex-row sm:items-center"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-surface-400 bg-surface-800 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
                  {app.type.replace("_", " ")}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                    config.color
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                </span>
              </div>

              <h4 className="pt-1 text-base font-bold text-white">{app.title}</h4>
              <p className="text-surface-300 text-xs">{app.subtitle}</p>

              {app.notes && (
                <p className="mt-2 rounded-lg border border-amber-800/40 bg-amber-950/30 p-2 font-mono text-xs text-amber-300/90">
                  Reviewer note: {app.notes}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
              <span className="text-surface-400 text-xs">
                Applied{" "}
                {new Date(app.appliedDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>

              {app.type === "CAMPUS_LEAD" && (
                <Link
                  href="/campus-leads"
                  className="text-brand-400 hover:text-brand-300 flex items-center gap-1 text-xs font-semibold"
                >
                  Program Details
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
