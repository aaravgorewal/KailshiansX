import * as React from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, ArrowRight, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type EventType = "MEETUP" | "HACKATHON" | "WORKSHOP" | "TECH_TALK" | "OTHER";

export type EventStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "UPCOMING" | "LIVE" | "COMPLETED";

export interface EventCardProps {
  id?: string;
  title: string;
  slug: string;
  type: EventType;
  status?: EventStatus;
  startDate: string | Date;
  endDate?: string | Date;
  venue?: string;
  city?: string;
  coverUrl?: string;
  isFree?: boolean;
  price?: number;
  attendeeCount?: number;
  speakerCount?: number;
  tags?: string[];
  onRegister?: () => void;
  className?: string;
}

const typeConfig: Record<
  EventType,
  { label: string; variant: "brand" | "accent" | "success" | "warning" | "default" }
> = {
  HACKATHON: { label: "Hackathon", variant: "accent" },
  MEETUP: { label: "Meetup", variant: "brand" },
  WORKSHOP: { label: "Workshop", variant: "success" },
  TECH_TALK: { label: "Tech Talk", variant: "warning" },
  OTHER: { label: "Event", variant: "default" },
};

function formatDate(dateInput: string | Date): { date: string; time: string } {
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return {
      date: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  } catch {
    return { date: String(dateInput), time: "" };
  }
}

export function EventCard({
  title,
  slug,
  type,
  status = "UPCOMING",
  startDate,
  venue,
  city,
  coverUrl,
  isFree = true,
  price,
  attendeeCount,
  speakerCount,
  tags = [],
  onRegister,
  className,
}: EventCardProps) {
  const typeInfo = typeConfig[type] || typeConfig.OTHER;
  const { date, time } = formatDate(startDate);
  const href = `/events/${slug}`;

  return (
    <article
      className={cn(
        "group border-surface-800 bg-surface-900/70 hover:border-brand-500/50 relative flex flex-col justify-between overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(61,97,252,0.18)]",
        className
      )}
    >
      {/* Cover Media Container */}
      <div className="bg-surface-950 relative aspect-[16/9] w-full overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="from-surface-900 via-surface-950 to-brand-950/40 relative flex h-full w-full items-center justify-center bg-gradient-to-br p-6">
            <div className="bg-grid absolute inset-0 opacity-30" />
            <div className="relative z-10 text-center">
              <span className="text-surface-700/60 text-3xl font-black tracking-widest uppercase select-none">
                {type}
              </span>
            </div>
          </div>
        )}

        {/* Top Badges */}
        <div className="pointer-events-none absolute top-3 right-3 left-3 flex items-center justify-between">
          <Badge variant={typeInfo.variant} size="sm">
            {typeInfo.label}
          </Badge>

          {status === "LIVE" ? (
            <Badge variant="destructive" size="sm" dot dotPulse>
              LIVE NOW
            </Badge>
          ) : status === "COMPLETED" ? (
            <Badge variant="surface" size="sm">
              Past Event
            </Badge>
          ) : (
            <span className="bg-surface-900/80 text-surface-200 border-surface-700/60 rounded-full border px-2 py-0.5 text-[11px] font-medium backdrop-blur-md">
              {isFree ? "Free" : price ? `₹${price}` : "Paid"}
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          {/* Date & Time info */}
          <div className="text-brand-300 mb-2.5 flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5" aria-hidden="true" />
              <span>{date}</span>
            </div>
            {time && (
              <div className="text-surface-400 flex items-center gap-1.5">
                <Clock className="size-3.5" aria-hidden="true" />
                <span>{time}</span>
              </div>
            )}
          </div>

          {/* Title with link */}
          <h3 className="text-surface-50 group-hover:text-brand-300 line-clamp-2 text-lg leading-snug font-bold transition-colors sm:text-xl">
            <Link href={href} className="focus-visible:underline focus-visible:outline-none">
              {title}
            </Link>
          </h3>

          {/* Location */}
          <div className="text-surface-400 mt-3 line-clamp-1 flex items-center gap-1.5 text-xs">
            <MapPin className="text-surface-500 size-3.5 shrink-0" aria-hidden="true" />
            <span>
              {venue ? `${venue}, ` : ""}
              <strong className="text-surface-300 font-medium">{city || "India"}</strong>
            </span>
          </div>

          {/* Attendees / Speakers metadata */}
          {(attendeeCount || speakerCount) && (
            <div className="text-surface-400 border-surface-800/80 mt-4 flex items-center gap-4 border-t pt-3 text-xs">
              {attendeeCount && (
                <div className="flex items-center gap-1.5">
                  <Users className="text-surface-500 size-3.5" aria-hidden="true" />
                  <span>{attendeeCount} registered</span>
                </div>
              )}
              {speakerCount && (
                <div className="flex items-center gap-1.5">
                  <Sparkles className="text-surface-500 size-3.5" aria-hidden="true" />
                  <span>{speakerCount} speakers</span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-surface-800/80 text-surface-400 rounded px-1.5 py-0.5 font-mono text-[10px]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-surface-800/80 mt-5 flex items-center justify-between gap-3 border-t pt-4">
          <Link
            href={href}
            className="text-surface-300 group-hover:text-brand-400 flex items-center gap-1 text-xs font-medium transition-colors"
          >
            <span>Details</span>
            <ArrowRight
              className="size-3 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>

          {status !== "COMPLETED" &&
            (onRegister ? (
              <Button size="sm" onClick={onRegister}>
                Register
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href={href}>Register</Link>
              </Button>
            ))}
        </div>
      </div>
    </article>
  );
}
