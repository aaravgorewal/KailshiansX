"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Calendar, Share2, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/useToast";

export interface TicketCardClientProps {
  registrationCode: string;
  name: string;
  email: string;
  college?: string | null;
  ticketTierName: string;
  eventTitle: string;
  eventSlug: string;
  eventDateStr: string;
  eventTimeStr: string;
  venueName?: string | null;
  venueAddress?: string | null;
  qrCodeUrl: string;
  googleCalUrl: string;
  icsDownloadUrl: string;
}

export function TicketCardClient({
  registrationCode,
  name,
  email,
  college,
  ticketTierName,
  eventTitle,
  eventSlug,
  eventDateStr,
  eventTimeStr,
  venueName,
  venueAddress,
  qrCodeUrl,
  googleCalUrl,
  icsDownloadUrl,
}: TicketCardClientProps) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleDownloadQr = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `${registrationCode}-ticket-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Ticket downloaded!",
      description: "Save this on your device for fast check-in at the entrance.",
      variant: "success",
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Pass for ${eventTitle}`,
          text: `I'm attending ${eventTitle} with pass code ${registrationCode}!`,
          url,
        });
        return;
      } catch {
        // Fallback
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Pass link copied!",
        description: "You can bookmark or share this digital ticket link.",
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Central Digital Pass Card */}
      <div className="border-surface-700/80 from-surface-900 via-surface-900/90 to-surface-950 relative overflow-hidden rounded-3xl border bg-gradient-to-b p-6 shadow-2xl backdrop-blur-md sm:p-9">
        {/* Glow */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full opacity-20 blur-2xl"
          style={{ background: "#3d61fc" }}
        />

        {/* Top Header of Ticket */}
        <div className="border-surface-800 flex items-start justify-between border-b pb-6">
          <div>
            <span className="text-brand-400 font-mono text-xs font-semibold tracking-widest uppercase">
              KailshiansX Verified Pass
            </span>
            <h2 className="text-surface-50 mt-1 text-2xl leading-snug font-black sm:text-3xl">
              {eventTitle}
            </h2>
            <div className="text-surface-400 mt-1 text-xs">
              {eventDateStr} • {eventTimeStr}
            </div>
          </div>
          <Badge variant="brand" size="default">
            {ticketTierName}
          </Badge>
        </div>

        {/* Middle Body with QR Code and Attendee Details */}
        <div className="flex flex-col items-center justify-between gap-8 py-8 md:flex-row">
          {/* QR Code Container */}
          <div className="flex flex-col items-center">
            <div className="border-surface-200 rounded-2xl border bg-white p-3 shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt={`QR code for ${registrationCode}`}
                className="size-48 object-contain sm:size-52"
              />
            </div>
            <span className="text-surface-400 mt-2 font-mono text-[11px]">
              Scan at reception desk
            </span>
          </div>

          {/* Attendee Data Block */}
          <div className="w-full flex-1 space-y-4">
            <div className="border-surface-800 bg-surface-950/70 space-y-3 rounded-2xl border p-5">
              <div>
                <div className="text-surface-500 font-mono text-[11px] tracking-wider uppercase">
                  Registration Code
                </div>
                <div className="text-surface-50 mt-0.5 font-mono text-2xl font-black tracking-wider sm:text-3xl">
                  {registrationCode}
                </div>
              </div>

              <div className="border-surface-800/80 grid grid-cols-1 gap-3 border-t pt-2 text-xs sm:grid-cols-2">
                <div>
                  <div className="text-surface-500">Attendee Name</div>
                  <div className="text-surface-100 mt-0.5 font-semibold">{name}</div>
                </div>
                <div>
                  <div className="text-surface-500">Email Address</div>
                  <div className="text-surface-200 mt-0.5 truncate font-medium">{email}</div>
                </div>
                {college && (
                  <div className="sm:col-span-2">
                    <div className="text-surface-500">Institution / Org</div>
                    <div className="text-surface-200 mt-0.5 font-medium">{college}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Venue Info */}
            <div className="border-surface-800/80 bg-surface-900/50 text-surface-300 flex items-start gap-3 rounded-xl border p-4 text-xs">
              <MapPin className="text-accent-400 mt-0.5 size-4 shrink-0" />
              <div>
                <div className="text-surface-100 font-semibold">{venueName || "Venue"}</div>
                {venueAddress && <div className="text-surface-400 mt-0.5">{venueAddress}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="border-surface-800 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadQr}
              leftIcon={<Download className="size-4" />}
            >
              Save QR Pass (PNG)
            </Button>

            <Button asChild variant="outline" size="sm" leftIcon={<Calendar className="size-4" />}>
              <a href={googleCalUrl} target="_blank" rel="noopener noreferrer">
                Google Calendar
              </a>
            </Button>

            <Button asChild variant="ghost" size="sm" className="text-xs">
              <a href={icsDownloadUrl} download>
                Download .ics
              </a>
            </Button>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleShare}
            leftIcon={
              copied ? <Check className="size-4 text-emerald-400" /> : <Share2 className="size-4" />
            }
          >
            {copied ? "Link Copied!" : "Share Ticket"}
          </Button>
        </div>
      </div>

      {/* Navigation Return Links */}
      <div className="text-surface-400 flex items-center justify-between px-2 text-xs">
        <Link href={`/events/${eventSlug}`} className="hover:text-surface-100 transition-colors">
          ← Return to Event Schedule
        </Link>
        <Link href="/events" className="hover:text-surface-100 transition-colors">
          Explore Other Gatherings →
        </Link>
      </div>
    </div>
  );
}
