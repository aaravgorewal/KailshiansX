"use client";

// src/components/profile/TicketsList.tsx
// Member tickets view with live interactive QR codes, check-in status, and calendar integrations.

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import {
  QrCode,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  X,
  Download,
  ExternalLink,
  Ticket,
} from "lucide-react";
import type { MemberDashboardEvent } from "@/server/users/profile";
import { cn } from "@/lib/utils";

interface Props {
  events: MemberDashboardEvent[];
}

export function TicketsList({ events }: Props) {
  const [activeTicket, setActiveTicket] = useState<MemberDashboardEvent | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const handleOpenQrModal = async (ticket: MemberDashboardEvent) => {
    setActiveTicket(ticket);
    const payload = ticket.qrPayload || ticket.registrationCode;
    try {
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 1,
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("Failed to generate QR code:", err);
      setQrDataUrl(null);
    }
  };

  const handleCloseModal = () => {
    setActiveTicket(null);
    setQrDataUrl(null);
  };

  if (events.length === 0) {
    return (
      <div className="border-border bg-background rounded-2xl border border-dashed py-16 text-center">
        <Ticket className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
        <h4 className="text-foreground mb-1 text-lg font-bold">No Tickets Found</h4>
        <p className="text-muted-foreground mx-auto mb-5 max-w-md text-sm">
          You haven&apos;t registered for any events yet. Check out upcoming technical meetups,
          hackathons, and workshops!
        </p>
        <Link
          href="/events"
          className="bg-primary hover:bg-primary-hover text-primary-foreground inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md transition-colors"
        >
          Explore Events
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {events.map((item) => {
          const isUpcoming = new Date(item.event.startDate) >= new Date();
          const isCheckedIn = Boolean(item.checkedInAt);

          return (
            <div
              key={item.id}
              className="group border-border bg-card hover:border-border hover:bg-card relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-lg backdrop-blur-xl transition-all duration-300"
            >
              <div>
                {/* Event header with type & status badges */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-primary bg-primary/10 border-primary/20 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase">
                    {item.event.type}
                  </span>

                  {isCheckedIn ? (
                    <span className="border-success/20 bg-success/10 text-success inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Checked In
                    </span>
                  ) : isUpcoming ? (
                    <span className="border-border bg-muted text-primary inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      <Clock className="h-3.5 w-3.5" />
                      Upcoming Pass
                    </span>
                  ) : (
                    <span className="text-muted-foreground bg-muted rounded-full px-2.5 py-0.5 text-xs font-medium">
                      Past Event
                    </span>
                  )}
                </div>

                <h3 className="group-hover:text-primary text-foreground mb-2 line-clamp-1 text-base font-bold transition-colors">
                  {item.event.title}
                </h3>

                <div className="text-muted-foreground mb-4 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                    <span>
                      {new Date(item.event.startDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {item.event.isVirtual
                        ? "Online / Virtual Livestream"
                        : `${item.event.venueName || "Venue TBA"}, ${item.event.city || "India"}`}
                    </span>
                  </div>
                </div>

                {/* Ticket Details Bar */}
                <div className="bg-background border-border mb-4 flex items-center justify-between gap-3 rounded-xl border p-3">
                  <div>
                    <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Pass Tier
                    </div>
                    <div className="text-foreground mt-0.5 text-xs font-bold">
                      {item.ticketName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Code
                    </div>
                    <div className="text-primary mt-0.5 font-mono text-xs font-bold">
                      {item.registrationCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-border flex items-center justify-between gap-2 border-t pt-3">
                <button
                  type="button"
                  id={`btn-qr-${item.registrationCode}`}
                  onClick={() => handleOpenQrModal(item)}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Show QR Pass</span>
                </button>

                <Link
                  href={`/events/${item.event.slug}`}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors"
                >
                  <span>Event Info</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive QR Code Modal */}
      {activeTicket && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md duration-200">
          <div className="border-border bg-card relative w-full max-w-sm rounded-3xl border p-6 text-center shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 rounded-full p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="text-primary bg-primary/10 border-primary/20 mb-2 inline-block rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase">
              Official Attendee Pass
            </span>

            <h3 className="text-foreground mb-1 text-lg font-extrabold">
              {activeTicket.event.title}
            </h3>
            <p className="text-muted-foreground mb-5 text-xs">
              Present this QR code at the registration desk for instant entry.
            </p>

            {/* QR Code Container */}
            <div className="mx-auto mb-4 inline-block rounded-2xl bg-white p-4 shadow-inner">
              {qrDataUrl ? (
                <Image
                  src={qrDataUrl}
                  alt={`QR code for ${activeTicket.registrationCode}`}
                  width={220}
                  height={220}
                  className="rounded-lg"
                  unoptimized
                />
              ) : (
                <div className="text-muted-foreground flex h-[220px] w-[220px] items-center justify-center text-xs">
                  Generating QR Pass...
                </div>
              )}
            </div>

            <div className="bg-background border-border mb-5 space-y-1 rounded-xl border p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pass Code:</span>
                <span className="text-primary font-mono font-bold">
                  {activeTicket.registrationCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tier:</span>
                <span className="text-foreground font-semibold">{activeTicket.ticketName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={cn(
                    "font-semibold",
                    activeTicket.checkedInAt ? "text-success" : "text-primary"
                  )}
                >
                  {activeTicket.checkedInAt ? "Checked In" : "Valid for Entry"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`ticket-${activeTicket.registrationCode}.png`}
                  className="bg-muted hover:bg-muted text-foreground border-border flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Save Pass
                </a>
              )}
              <Link
                href={`/events/${activeTicket.event.slug}/ticket/${activeTicket.registrationCode}`}
                className="bg-primary hover:bg-primary-hover text-primary-foreground flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-colors"
              >
                Full Ticket View
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
