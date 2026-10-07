"use client";

// src/components/profile/ParticipationTimeline.tsx
// Reverse-chronological participation stream with filter tabs.

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Award, Code2, Flame, GraduationCap, ExternalLink, Zap } from "lucide-react";
import type { TimelineItem } from "@/server/users/passport";
import { cn } from "@/lib/utils";

interface Props {
  timeline: TimelineItem[];
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  EVENT: Calendar,
  WORKSHOP: Code2,
  HACKATHON: Flame,
  CERTIFICATE: Award,
  LEADERSHIP: GraduationCap,
  TALK: Zap,
};

const BADGE_COLORS: Record<string, string> = {
  brand: "bg-primary/10 text-primary border-primary/20",
  teal: "bg-success/10 text-success border-success/20",
  amber: "bg-warning/10 text-warning border-warning/20",
  purple: "bg-primary/10 text-primary border-primary/20",
  green: "bg-success/10 text-success border-success/20",
};

export function ParticipationTimeline({ timeline }: Props) {
  const [filter, setFilter] = useState<string>("ALL");

  const filteredItems = timeline.filter((item) => {
    if (filter === "ALL") return true;
    if (filter === "EVENTS") return item.type === "EVENT";
    if (filter === "WORKSHOPS") return item.type === "WORKSHOP";
    if (filter === "HACKATHONS") return item.type === "HACKATHON";
    if (filter === "CERTIFICATES") return item.type === "CERTIFICATE";
    if (filter === "LEADERSHIP") return item.type === "LEADERSHIP" || item.type === "TALK";
    return true;
  });

  return (
    <div className="border-border bg-card rounded-2xl border p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-foreground flex items-center gap-2 text-lg font-bold">
            <Calendar className="text-primary h-5 w-5" />
            Participation Timeline
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Chronological log of events attended, hackathons submitted, and credentials earned.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-background border-border flex flex-wrap items-center gap-1.5 rounded-xl border p-1">
          {["ALL", "EVENTS", "WORKSHOPS", "HACKATHONS", "CERTIFICATES", "LEADERSHIP"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="border-border rounded-xl border border-dashed py-12 text-center">
          <Calendar className="text-muted-foreground mx-auto mb-2 h-10 w-10" />
          <p className="text-muted-foreground text-sm font-medium">
            No activity recorded for this category.
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Participate in community meetups or workshops to build your timeline.
          </p>
        </div>
      ) : (
        <div className="border-border relative ml-2 space-y-6 border-l pl-6 sm:ml-4 sm:pl-8">
          {filteredItems.map((item) => {
            const Icon = TYPE_ICONS[item.type] || Calendar;
            const badgeClass = BADGE_COLORS[item.badgeVariant] || BADGE_COLORS.brand;

            return (
              <div key={item.id} className="group relative">
                {/* Node on vertical timeline line */}
                <div className="bg-card border-border text-muted-foreground group-hover:border-primary group-hover:text-primary absolute top-1.5 -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border-2 shadow-sm transition-colors sm:-left-[39px]">
                  <Icon className="h-3 w-3" />
                </div>

                <div className="bg-background border-border hover:border-border hover:bg-background flex flex-col justify-between gap-3 rounded-xl border p-4 shadow-sm transition-all duration-200 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-xs font-bold",
                          badgeClass
                        )}
                      >
                        {item.badgeText}
                      </span>
                      <time className="text-muted-foreground text-xs">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </div>

                    <h4 className="group-hover:text-primary text-foreground text-sm font-bold transition-colors">
                      {item.title}
                    </h4>

                    <p className="text-muted-foreground text-xs">{item.subtitle}</p>
                  </div>

                  {item.link && (
                    <div className="shrink-0 self-end sm:self-center">
                      <Link
                        href={item.link}
                        target={item.link.startsWith("http") ? "_blank" : undefined}
                        className="text-primary hover:text-primary bg-primary/10 hover:bg-primary/20 border-primary/30 inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
