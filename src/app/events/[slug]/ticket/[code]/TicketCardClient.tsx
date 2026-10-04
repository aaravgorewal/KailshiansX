"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Calendar, Share2, Check, MapPin, CheckCircle2 } from "lucide-react";
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
      title: "QR pass downloaded!",
      description: "Saved to your device for check-in at the entrance.",
      variant: "default",
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Pass for ${eventTitle}`,
          text: `I'm attending ${eventTitle} with pass code #${registrationCode}!`,
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
        variant: "default",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simple Centered Digital Pass Card */}
      <div className="border-border bg-card space-y-6 rounded-lg border p-6 sm:p-8">
        {/* Header with Registration ID & Status */}
        <div className="border-border flex flex-col items-start justify-between gap-3 border-b pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
              Registration ID
            </div>
            <div className="text-foreground mt-0.5 font-mono text-2xl font-bold">
              #{registrationCode}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="sm">
              {ticketTierName}
            </Badge>
            <Badge variant="success" size="sm">
              Confirmed
            </Badge>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-1">
          <h2 className="text-foreground text-xl font-bold sm:text-2xl">{eventTitle}</h2>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
            <span>{eventDateStr}</span>
            <span>·</span>
            <span>{eventTimeStr}</span>
          </div>
          {(venueName || venueAddress) && (
            <div className="text-muted-foreground flex items-center gap-1.5 pt-1 text-xs">
              <MapPin className="text-foreground size-3.5 shrink-0" aria-hidden="true" />
              <span>
                {venueName ? `${venueName}` : ""}
                {venueAddress ? `, ${venueAddress}` : ""}
              </span>
            </div>
          )}
        </div>

        {/* Centered QR Ticket */}
        <div className="border-border bg-muted/30 flex flex-col items-center justify-center rounded-lg border py-6 text-center">
          <div className="border-border inline-block rounded-md border bg-white p-3 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt={`QR code for ${registrationCode}`}
              className="size-44 object-contain sm:size-48"
            />
          </div>
          <p className="text-muted-foreground mt-3 font-mono text-xs">
            Present this QR code at reception for entrance verification
          </p>
        </div>

        {/* Attendee Details */}
        <div className="border-border bg-muted/20 text-muted-foreground space-y-2 rounded-md border p-4 text-xs">
          <div className="flex justify-between">
            <span>Attendee:</span>
            <span className="text-foreground font-semibold">{name}</span>
          </div>
          <div className="flex justify-between">
            <span>Email:</span>
            <span className="text-foreground font-medium">{email}</span>
          </div>
          {college && (
            <div className="flex justify-between">
              <span>College/Org:</span>
              <span className="text-foreground font-medium">{college}</span>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="border-border text-muted-foreground space-y-2 border-t pt-4 text-xs">
          <div className="text-foreground font-semibold">Next Steps:</div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="text-foreground mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>Add the gathering to your calendar so you don&apos;t miss schedule updates.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="text-foreground mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>Save or download your QR pass offline on your mobile device.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="text-foreground mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>Arrive 15 minutes before the first session with a valid photo ID.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-border grid grid-cols-1 gap-2.5 border-t pt-4 sm:grid-cols-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDownloadQr}
            className="w-full gap-1.5 text-xs"
          >
            <Download className="size-3.5" aria-hidden="true" />
            <span>Download QR</span>
          </Button>

          <Button asChild variant="secondary" size="sm" className="w-full gap-1.5 text-xs">
            <a href={googleCalUrl} target="_blank" rel="noopener noreferrer">
              <Calendar className="size-3.5" aria-hidden="true" />
              <span>Calendar</span>
            </a>
          </Button>

          <Button asChild variant="secondary" size="sm" className="w-full gap-1.5 text-xs">
            <a href={icsDownloadUrl} download>
              <Download className="size-3.5" aria-hidden="true" />
              <span>.ICS File</span>
            </a>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="w-full gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="size-3.5" aria-hidden="true" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5" aria-hidden="true" />
                <span>Share pass</span>
              </>
            )}
          </Button>
        </div>

        <div className="pt-2 text-center">
          <Link
            href={`/events/${eventSlug}`}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            ← Return to event details
          </Link>
        </div>
      </div>
    </div>
  );
}
