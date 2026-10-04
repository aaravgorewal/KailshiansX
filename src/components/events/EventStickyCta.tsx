"use client";

import * as React from "react";
import {
  Calendar,
  Share2,
  Check,
  ExternalLink,
  Download,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/useToast";
import { cn } from "@/lib/utils";
import { trackRegisterClick } from "@/lib/analytics";
import { formatDate } from "@/lib/format-date";
import { EventCountdown } from "@/components/events/EventCountdown";

export interface EventStickyCtaProps {
  slug: string;
  title: string;
  isFree: boolean;
  lowestPrice: number;
  highestPrice?: number;
  registrationDeadline?: Date | null;
  startDate: Date;
  endDate?: Date | null;
  status: string;
  maxCapacity?: number | null;
  attendeeCount: number;
  googleCalendarUrl: string;
  icsDownloadUrl: string;
  className?: string;
}

export function EventStickyCta({
  slug,
  title,
  isFree,
  lowestPrice,
  highestPrice,
  registrationDeadline,
  startDate,
  endDate = null,
  status,
  maxCapacity,
  attendeeCount,
  googleCalendarUrl,
  icsDownloadUrl,
  className,
}: EventStickyCtaProps) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const now = new Date();
  const isPast = new Date(startDate) < now;
  const isDeadlinePassed = registrationDeadline ? new Date(registrationDeadline) < now : false;
  const isRegistrationClosed = isPast || isDeadlinePassed || status === "ARCHIVED";

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : `https://kailshiansx.com/events/${slug}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out ${title} on KailshiansX!`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard if user dismissed or share failed
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied to clipboard!",
        description: "Share it with your developer friends and team.",
        variant: "default",
      });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleScrollToTickets = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackRegisterClick({
      eventSlug: slug,
      eventTitle: title,
      price: lowestPrice,
    });
    const ticketsEl = document.getElementById("tickets");
    if (ticketsEl) {
      e.preventDefault();
      ticketsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const priceDisplay = isFree || lowestPrice === 0 ? "Free" : `₹${lowestPrice}`;

  return (
    <>
      {/* ─── DESKTOP SIDEBAR CARD ────────────────────────────────────────── */}
      <div
        className={cn(
          "border-border bg-card sticky top-20 space-y-6 rounded-lg border p-6",
          className
        )}
      >
        {/* Pricing & Status */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
              Pass Price
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-bold">
                {priceDisplay}
                {!isFree && highestPrice && highestPrice > lowestPrice && (
                  <span className="text-muted-foreground text-base font-normal">
                    {" "}
                    – ₹{highestPrice}
                  </span>
                )}
              </span>
              {isFree && (
                <span className="text-muted-foreground font-mono text-xs">RSVP required</span>
              )}
            </div>
          </div>

          <Badge variant={isRegistrationClosed ? "destructive" : "neutral"} size="sm">
            {isRegistrationClosed ? (isPast ? "Event Ended" : "Closed") : "Open"}
          </Badge>
        </div>

        {/* Capacity & Registrations Meter */}
        <div className="border-border bg-muted/40 space-y-2 rounded-md border p-3 text-xs">
          <div className="text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="text-foreground size-3.5" aria-hidden="true" />
              <span>Registrations</span>
            </span>
            <span className="text-foreground font-mono font-semibold">
              {attendeeCount > 0 ? attendeeCount : 0}
              {maxCapacity ? ` / ${maxCapacity}` : "+"}
            </span>
          </div>

          {registrationDeadline && !isPast && (
            <div className="border-border text-muted-foreground flex items-center justify-between border-t pt-2 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="text-muted-foreground size-3" aria-hidden="true" />
                <span>Deadline:</span>
              </span>
              <span className="text-foreground font-mono">{formatDate(registrationDeadline)}</span>
            </div>
          )}

          <EventCountdown variant="compact" startDate={startDate} endDate={endDate} />
        </div>

        {/* Primary Register CTA Button */}
        <div>
          {isRegistrationClosed ? (
            <Button disabled variant="secondary" size="lg" className="w-full">
              Registration Closed
            </Button>
          ) : (
            <Button asChild variant="primary" size="lg" className="w-full justify-center gap-2">
              <a href="#tickets" onClick={handleScrollToTickets}>
                <span>Select Pass &amp; Register</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
          )}
        </div>

        {/* Action Buttons: Calendar & Share */}
        <div className="grid grid-cols-2 gap-3">
          {/* Add to Calendar Button with dropdown */}
          <div className="relative">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="w-full gap-1.5 text-xs"
            >
              <Calendar className="text-foreground size-3.5" aria-hidden="true" />
              <span>Calendar</span>
            </Button>

            {calendarOpen && (
              <div className="border-border bg-card absolute bottom-full left-0 z-30 mb-2 w-48 space-y-1 rounded-md border p-1 text-xs">
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-between rounded px-2.5 py-1.5 transition-colors"
                  onClick={() => setCalendarOpen(false)}
                >
                  <span>Google Calendar</span>
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
                <a
                  href={icsDownloadUrl}
                  download
                  className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-between rounded px-2.5 py-1.5 transition-colors"
                  onClick={() => setCalendarOpen(false)}
                >
                  <span>Apple / Outlook</span>
                  <Download className="size-3" aria-hidden="true" />
                </a>
              </div>
            )}
          </div>

          {/* Share Button */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleShare}
            className="w-full gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="text-foreground size-3.5" aria-hidden="true" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="text-foreground size-3.5" aria-hidden="true" />
                <span>Share</span>
              </>
            )}
          </Button>
        </div>

        {/* Perks Micro-list */}
        <div className="border-border text-muted-foreground space-y-2 border-t pt-4 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-foreground size-3.5 shrink-0" aria-hidden="true" />
            <span>Verifiable digital completion certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-foreground size-3.5 shrink-0" aria-hidden="true" />
            <span>Direct access to mentor &amp; speaker discussions</span>
          </div>
        </div>
      </div>

      {/* ─── MOBILE STICKY BOTTOM BAR ────────────────────────────────────── */}
      <div className="border-border bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t p-3 backdrop-blur-sm lg:hidden">
        <div className="container-page flex items-center justify-between gap-4">
          <div>
            <div className="text-muted-foreground font-mono text-xs">Pass Price</div>
            <div className="text-foreground text-base font-bold">{priceDisplay}</div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleShare}
              aria-label="Share event"
              className="size-9 p-0"
            >
              {copied ? (
                <Check className="text-foreground size-4" aria-hidden="true" />
              ) : (
                <Share2 className="text-foreground size-4" aria-hidden="true" />
              )}
            </Button>

            {isRegistrationClosed ? (
              <Button disabled variant="secondary" size="sm">
                Closed
              </Button>
            ) : (
              <Button asChild variant="primary" size="sm">
                <a href="#tickets" onClick={handleScrollToTickets}>
                  Register now
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
