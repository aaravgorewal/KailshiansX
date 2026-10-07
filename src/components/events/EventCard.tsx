import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Users, ArrowRight, Clock, Mic, Terminal, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatDate, formatTime } from "@/lib/format-date";

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
  priority?: boolean;
  onRegister?: () => void;
  className?: string;
}

const TYPE_LABELS: Record<EventType, string> = {
  HACKATHON: "Hackathon",
  MEETUP: "Meetup",
  WORKSHOP: "Workshop",
  TECH_TALK: "Tech talk",
  OTHER: "Event",
};

const TYPE_ICONS: Record<
  EventType,
  React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  HACKATHON: Trophy,
  MEETUP: Users,
  WORKSHOP: Terminal,
  TECH_TALK: Mic,
  OTHER: Calendar,
};

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
  priority = false,
  onRegister,
  className,
}: EventCardProps) {
  const typeLabel = TYPE_LABELS[type] || TYPE_LABELS.OTHER;
  const TypeIcon = TYPE_ICONS[type] || TYPE_ICONS.OTHER;
  const dateStr = formatDate(startDate);
  const timeStr = formatTime(startDate);
  const href = `/events/${slug}`;
  const priceDisplay = isFree || !price || price === 0 ? "Free" : `₹${price}`;

  const hasCounts =
    (attendeeCount !== undefined && attendeeCount > 0) ||
    (speakerCount !== undefined && speakerCount > 0);

  return (
    <Card
      className={cn(
        "group border-border bg-card hover:border-primary/50 relative flex h-full flex-col justify-between overflow-hidden border transition-colors",
        className
      )}
    >
      {/* Cover Media Container */}
      <div className="bg-muted relative aspect-[16/9] w-full overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            loading={priority ? undefined : "lazy"}
            unoptimized={coverUrl.startsWith("data:")}
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex size-full items-center justify-center">
            <TypeIcon className="size-10 stroke-[1.5]" aria-hidden="true" />
          </div>
        )}

        {/* Top Badges */}
        <div className="pointer-events-none absolute top-3 right-3 left-3 flex items-center justify-between">
          <Badge variant="neutral" size="sm">
            {typeLabel}
          </Badge>

          <span className="border-border bg-card/90 text-foreground rounded border px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
            {priceDisplay}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Date & Time info */}
          <div className="text-muted-foreground mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="text-foreground size-3.5" aria-hidden="true" />
              <span>{dateStr}</span>
            </div>
            {timeStr && (
              <div className="flex items-center gap-1.5">
                <Clock className="text-muted-foreground size-3.5" aria-hidden="true" />
                <span>{timeStr}</span>
              </div>
            )}
          </div>

          {/* Title with full card clickable ::after overlay */}
          <h3
            className="text-foreground hover:text-accent-text line-clamp-2 text-base font-bold transition-colors sm:text-lg"
            title={title}
          >
            <Link
              href={href}
              className="after:absolute after:inset-0 after:z-0 focus-visible:underline focus-visible:outline-none"
            >
              {title}
            </Link>
          </h3>

          {/* Location */}
          <div className="text-muted-foreground mt-2.5 flex items-center gap-1.5 text-xs">
            <MapPin className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
            <span
              className="truncate"
              title={venue ? `${venue}, ${city || "India"}` : city || "India"}
            >
              {venue ? `${venue}, ` : ""}
              <strong className="text-foreground font-medium">{city || "India"}</strong>
            </span>
          </div>

          {/* Attendees / Speakers metadata (rendered ONLY when > 0) */}
          {hasCounts && (
            <div className="border-border text-muted-foreground mt-3.5 flex items-center gap-4 border-t pt-3 text-xs">
              {attendeeCount !== undefined && attendeeCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="text-muted-foreground size-3.5" aria-hidden="true" />
                  <span>{attendeeCount} registered</span>
                </div>
              )}
              {speakerCount !== undefined && speakerCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Mic className="text-muted-foreground size-3.5" aria-hidden="true" />
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
                  className="border-border bg-muted text-muted-foreground rounded border px-2 py-0.5 font-mono text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions (Register button has relative z-10 so it stays clickable above the ::after overlay) */}
        <div className="border-border mt-4 flex items-center justify-between gap-3 border-t pt-3.5">
          <div className="text-muted-foreground group-hover:text-foreground flex items-center gap-1 text-xs font-medium transition-colors">
            <span>Details</span>
            <ArrowRight className="size-3" aria-hidden="true" />
          </div>

          {status !== "COMPLETED" && (
            <div className="relative z-10">
              {onRegister ? (
                <Button size="sm" variant="secondary" onClick={onRegister}>
                  Register
                </Button>
              ) : (
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/events/${slug}/register`}>Register</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
