"use client";

// src/components/profile/ParticipationTimeline.tsx
// Reverse-chronological participation stream with filter tabs.

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Award, Code2, Flame, GraduationCap, ExternalLink, Sparkles } from "lucide-react";
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
  TALK: Sparkles,
};

const BADGE_COLORS: Record<string, string> = {
  brand: "bg-brand-500/20 text-brand-300 border-brand-500/30",
  teal: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  green: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
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
    <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-white">
            <Calendar className="text-brand-400 h-5 w-5" />
            Participation Timeline
          </h3>
          <p className="text-surface-400 mt-1 text-sm">
            Chronological log of events attended, hackathons submitted, and credentials earned.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-surface-950/80 border-surface-800 flex flex-wrap items-center gap-1.5 rounded-xl border p-1">
          {["ALL", "EVENTS", "WORKSHOPS", "HACKATHONS", "CERTIFICATES", "LEADERSHIP"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                filter === f
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-surface-400 hover:text-surface-200"
              )}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="border-surface-800 rounded-xl border border-dashed py-12 text-center">
          <Calendar className="text-surface-600 mx-auto mb-2 h-10 w-10" />
          <p className="text-surface-300 text-sm font-medium">
            No activity recorded for this category.
          </p>
          <p className="text-surface-500 mt-1 text-xs">
            Participate in community meetups or workshops to build your timeline.
          </p>
        </div>
      ) : (
        <div className="border-surface-800 relative ml-2 space-y-6 border-l pl-6 sm:ml-4 sm:pl-8">
          {filteredItems.map((item) => {
            const Icon = TYPE_ICONS[item.type] || Calendar;
            const badgeClass = BADGE_COLORS[item.badgeVariant] || BADGE_COLORS.brand;

            return (
              <div key={item.id} className="group relative">
                {/* Node on vertical timeline line */}
                <div className="bg-surface-900 border-surface-700 text-surface-400 group-hover:border-brand-500 group-hover:text-brand-400 absolute top-1.5 -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border-2 shadow-sm transition-colors sm:-left-[39px]">
                  <Icon className="h-3 w-3" />
                </div>

                <div className="bg-surface-950/60 border-surface-800/80 hover:border-surface-700 hover:bg-surface-950/90 flex flex-col justify-between gap-3 rounded-xl border p-4 shadow-sm transition-all duration-200 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px] font-bold",
                          badgeClass
                        )}
                      >
                        {item.badgeText}
                      </span>
                      <time className="text-surface-400 text-xs">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </div>

                    <h4 className="group-hover:text-brand-300 text-sm font-bold text-white transition-colors">
                      {item.title}
                    </h4>

                    <p className="text-surface-300 text-xs">{item.subtitle}</p>
                  </div>

                  {item.link && (
                    <div className="shrink-0 self-end sm:self-center">
                      <Link
                        href={item.link}
                        target={item.link.startsWith("http") ? "_blank" : undefined}
                        className="text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border-brand-500/30 inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
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
