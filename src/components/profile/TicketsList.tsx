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
        color: { dark: "#0f172a", light: "#ffffff" },
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
      <div className="border-surface-800 bg-surface-950/40 rounded-2xl border border-dashed py-16 text-center">
        <Ticket className="text-surface-600 mx-auto mb-3 h-12 w-12" />
        <h4 className="mb-1 text-lg font-bold text-white">No Tickets Found</h4>
        <p className="text-surface-400 mx-auto mb-5 max-w-md text-sm">
          You haven&apos;t registered for any events yet. Check out upcoming technical meetups,
          hackathons, and workshops!
        </p>
        <Link
          href="/events"
          className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors"
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
              className="group border-surface-800 bg-surface-900/70 hover:border-surface-700 hover:bg-surface-900 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-lg backdrop-blur-xl transition-all duration-300"
            >
              <div>
                {/* Event header with type & status badges */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-brand-400 bg-brand-500/10 border-brand-500/20 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
                    {item.event.type}
                  </span>

                  {isCheckedIn ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-800/60 bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Checked In
                    </span>
                  ) : isUpcoming ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-800/60 bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                      <Clock className="h-3.5 w-3.5" />
                      Upcoming Pass
                    </span>
                  ) : (
                    <span className="text-surface-400 bg-surface-800 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                      Past Event
                    </span>
                  )}
                </div>

                <h3 className="group-hover:text-brand-300 mb-2 line-clamp-1 text-base font-bold text-white transition-colors">
                  {item.event.title}
                </h3>

                <div className="text-surface-300 mb-4 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-surface-400 h-3.5 w-3.5 shrink-0" />
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
                    <MapPin className="text-surface-400 h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {item.event.isVirtual
                        ? "Online / Virtual Livestream"
                        : `${item.event.venueName || "Venue TBA"}, ${item.event.city || "India"}`}
                    </span>
                  </div>
                </div>

                {/* Ticket Details Bar */}
                <div className="bg-surface-950/60 border-surface-800/80 mb-4 flex items-center justify-between gap-3 rounded-xl border p-3">
                  <div>
                    <div className="text-surface-400 text-[10px] font-semibold tracking-wider uppercase">
                      Pass Tier
                    </div>
                    <div className="mt-0.5 text-xs font-bold text-white">{item.ticketName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-surface-400 text-[10px] font-semibold tracking-wider uppercase">
                      Code
                    </div>
                    <div className="text-brand-400 mt-0.5 font-mono text-xs font-bold">
                      {item.registrationCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-surface-800/70 flex items-center justify-between gap-2 border-t pt-3">
                <button
                  type="button"
                  id={`btn-qr-${item.registrationCode}`}
                  onClick={() => handleOpenQrModal(item)}
                  className="bg-brand-500 hover:bg-brand-600 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Show QR Pass</span>
                </button>

                <Link
                  href={`/events/${item.event.slug}`}
                  className="text-surface-300 hover:bg-surface-800 inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors hover:text-white"
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
          <div className="border-surface-700 bg-surface-900 relative w-full max-w-sm rounded-3xl border p-6 text-center shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="text-surface-400 hover:bg-surface-800 absolute top-4 right-4 rounded-full p-1 transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="text-brand-400 bg-brand-500/10 border-brand-500/20 mb-2 inline-block rounded-full border px-3 py-1 text-[11px] font-bold tracking-wider uppercase">
              Official Attendee Pass
            </span>

            <h3 className="mb-1 text-lg font-extrabold text-white">{activeTicket.event.title}</h3>
            <p className="text-surface-400 mb-5 text-xs">
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
                <div className="flex h-[220px] w-[220px] items-center justify-center text-xs text-slate-800">
                  Generating QR Pass...
                </div>
              )}
            </div>

            <div className="bg-surface-950/80 border-surface-800 mb-5 space-y-1 rounded-xl border p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-surface-400">Pass Code:</span>
                <span className="text-brand-400 font-mono font-bold">
                  {activeTicket.registrationCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Tier:</span>
                <span className="font-semibold text-white">{activeTicket.ticketName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Status:</span>
                <span
                  className={cn(
                    "font-semibold",
                    activeTicket.checkedInAt ? "text-emerald-400" : "text-amber-400"
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
                  className="bg-surface-800 hover:bg-surface-700 text-surface-100 border-surface-700 flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Save Pass
                </a>
              )}
              <Link
                href={`/events/${activeTicket.event.slug}/ticket/${activeTicket.registrationCode}`}
                className="bg-brand-500 hover:bg-brand-600 flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white transition-colors"
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
