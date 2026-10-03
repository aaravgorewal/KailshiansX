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

export interface EventStickyCtaProps {
  slug: string;
  title: string;
  isFree: boolean;
  lowestPrice: number;
  highestPrice?: number;
  registrationDeadline?: Date | null;
  startDate: Date;
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
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleScrollToTickets = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const ticketsEl = document.getElementById("tickets");
    if (ticketsEl) {
      e.preventDefault();
      ticketsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ─── DESKTOP SIDEBAR CARD ────────────────────────────────────────── */}
      <div
        className={cn(
          "border-surface-700/80 bg-surface-900/90 sticky top-24 space-y-6 rounded-2xl border p-6 shadow-2xl backdrop-blur-md sm:p-7",
          className
        )}
      >
        {/* Pricing & Status */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-surface-400 font-mono text-xs tracking-wider uppercase">
              Pass Price
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              {isFree ? (
                <span className="text-3xl font-extrabold text-emerald-400">Free</span>
              ) : (
                <span className="text-surface-50 text-3xl font-extrabold">
                  ₹{lowestPrice}
                  {highestPrice && highestPrice > lowestPrice && (
                    <span className="text-surface-400 text-lg font-normal"> - ₹{highestPrice}</span>
                  )}
                </span>
              )}
              {isFree && <span className="text-surface-400 font-mono text-xs">RSVP Required</span>}
            </div>
          </div>

          <Badge variant={isRegistrationClosed ? "destructive" : "brand"} size="sm" dot>
            {isRegistrationClosed
              ? isPast
                ? "Event Ended"
                : "Registration Closed"
              : "Registrations Open"}
          </Badge>
        </div>

        {/* Capacity & Registrations Meter */}
        <div className="border-surface-800 bg-surface-950/60 space-y-2 rounded-xl border p-3.5 text-xs">
          <div className="text-surface-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="text-brand-400 size-3.5" />
              <span>Confirmed Registrations</span>
            </span>
            <span className="text-surface-100 font-mono font-semibold">
              {attendeeCount}
              {maxCapacity ? ` / ${maxCapacity}` : "+"}
            </span>
          </div>

          {registrationDeadline && !isPast && (
            <div className="text-surface-400 border-surface-800/60 flex items-center justify-between border-t pt-2 text-[11px]">
              <span className="flex items-center gap-1">
                <Clock className="size-3 text-amber-400" />
                <span>Deadline:</span>
              </span>
              <span className="text-surface-300 font-mono">
                {new Date(registrationDeadline).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Primary Register CTA Button */}
        <div>
          {isRegistrationClosed ? (
            <Button disabled variant="outline" size="lg" className="w-full">
              Registration Closed
            </Button>
          ) : (
            <Button
              asChild
              variant="default"
              size="lg"
              className="shadow-brand-500/25 w-full shadow-lg"
              rightIcon={<ArrowRight className="size-4" />}
            >
              <a href="#tickets" onClick={handleScrollToTickets}>
                Select Pass &amp; Register
              </a>
            </Button>
          )}
        </div>

        {/* Action Buttons: Calendar & Share */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Add to Calendar Button with dropdown */}
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="w-full gap-1.5 text-xs"
            >
              <Calendar className="text-brand-400 size-3.5" />
              <span>Calendar</span>
            </Button>

            {calendarOpen && (
              <div className="border-surface-700 bg-surface-900 absolute bottom-full left-0 z-30 mb-2 w-48 space-y-1 rounded-xl border p-2 shadow-xl">
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-surface-200 hover:bg-surface-800 flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors hover:text-white"
                  onClick={() => setCalendarOpen(false)}
                >
                  <span>Google Calendar</span>
                  <ExternalLink className="text-surface-400 size-3" />
                </a>
                <a
                  href={icsDownloadUrl}
                  download
                  className="text-surface-200 hover:bg-surface-800 flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors hover:text-white"
                  onClick={() => setCalendarOpen(false)}
                >
                  <span>Apple / Outlook (.ics)</span>
                  <Download className="text-surface-400 size-3" />
                </a>
              </div>
            )}
          </div>

          {/* Share Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="w-full gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="text-accent-400 size-3.5" />
                <span>Share</span>
              </>
            )}
          </Button>
        </div>

        {/* Perks Micro-list */}
        <div className="border-surface-800/80 text-surface-400 space-y-2 border-t pt-4 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-brand-400 size-3.5 shrink-0" />
            <span>Verifiable digital completion certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-accent-400 size-3.5 shrink-0" />
            <span>Direct access to mentor &amp; speaker discussions</span>
          </div>
        </div>
      </div>

      {/* ─── MOBILE STICKY BOTTOM BAR ────────────────────────────────────── */}
      <div className="bg-surface-950/95 border-surface-800/90 fixed inset-x-0 bottom-0 z-40 border-t p-3.5 shadow-2xl backdrop-blur-md md:hidden">
        <div className="container-page flex items-center justify-between gap-4">
          <div>
            <div className="text-surface-400 font-mono text-[11px]">Pass Price</div>
            <div className="text-surface-50 text-lg font-bold">
              {isFree ? <span className="text-emerald-400">Free</span> : `₹${lowestPrice}`}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              aria-label="Share event"
              className="size-10 p-0"
            >
              {copied ? (
                <Check className="size-4 text-emerald-400" />
              ) : (
                <Share2 className="text-surface-300 size-4" />
              )}
            </Button>

            {isRegistrationClosed ? (
              <Button disabled variant="outline" size="sm">
                Closed
              </Button>
            ) : (
              <Button asChild variant="default" size="sm" className="shadow-brand-500/30 shadow-md">
                <a href="#tickets" onClick={handleScrollToTickets}>
                  Register Now
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
