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
    color: "bg-primary/10 text-primary border-primary/20",
    icon: Clock,
  },
  APPLIED: {
    label: "Under Review",
    color: "bg-primary/10 text-primary border-primary/20",
    icon: Clock,
  },
  SCREENING: {
    label: "Initial Screening",
    color: "bg-primary/10 text-primary border-primary/20",
    icon: AlertCircle,
  },
  REVIEWING: {
    label: "Under Review",
    color: "bg-primary/10 text-primary border-primary/20",
    icon: AlertCircle,
  },
  INTERVIEW: {
    label: "Interview Scheduled",
    color: "bg-primary/10 text-primary border-border",
    icon: Calendar,
  },
  SELECTED: {
    label: "Offer Accepted",
    color: "bg-success/10 text-success border-success/20",
    icon: CheckCircle2,
  },
  ACTIVE: {
    label: "Active Leadership",
    color: "bg-success/10 text-success border-success/20",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Closed",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
  },
};

export function ApplicationsTracker({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <div className="border-border bg-background rounded-2xl border border-dashed py-16 text-center">
        <FileText className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
        <h4 className="text-foreground mb-1 text-lg font-bold">No Active Applications</h4>
        <p className="text-muted-foreground mx-auto mb-5 max-w-md text-sm">
          Want to lead community chapters or build with the core engineering & events team?
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/join-team"
            className="bg-primary hover:bg-primary-hover text-primary-foreground inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md transition-colors"
          >
            Join Team
          </Link>
          <Link
            href="/campus-leads"
            className="bg-muted hover:bg-muted text-foreground border-border inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors"
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
          color: "bg-muted text-muted-foreground border-border",
          icon: Clock,
        };
        const Icon = config.icon;

        return (
          <div
            key={app.id}
            className="border-border bg-card hover:border-border flex flex-col justify-between gap-4 rounded-2xl border p-5 shadow-lg backdrop-blur-xl transition-all sm:flex-row sm:items-center"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground bg-muted rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase">
                  {app.type.replace("_", " ")}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    config.color
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                </span>
              </div>

              <h4 className="text-foreground pt-1 text-base font-bold">{app.title}</h4>
              <p className="text-muted-foreground text-xs">{app.subtitle}</p>

              {app.notes && (
                <p className="text-warning border-border bg-muted mt-2 rounded-lg border p-2 font-mono text-xs">
                  Reviewer note: {app.notes}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
              <span className="text-muted-foreground text-xs">
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
                  className="text-primary hover:text-primary flex items-center gap-1 text-xs font-semibold"
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
