import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MessageSquare, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

import { db } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";
import { getGoogleCalendarUrl } from "@/lib/calendar";
import { formatDate, formatTimeRange, formatTime } from "@/lib/format-date";
import { generateQrCodeDataUrl, signQrPayload } from "@/server/events/registration";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

interface RegistrationSuccessPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: RegistrationSuccessPageProps): Promise<Metadata> {
  const { id } = await params;
  const registration = await db.registration.findFirst({
    where: {
      OR: [{ id }, { registrationCode: id }],
      deletedAt: null,
    },
    include: { event: true },
  });

  if (!registration) {
    return { title: "Registration | KailshiansX" };
  }

  return {
    title: `Pass #${registration.registrationCode} — ${registration.event.title} | KailshiansX`,
    description: `Official digital pass for ${registration.name} at ${registration.event.title}.`,
    robots: { index: false, follow: false },
  };
}

export default async function RegistrationSuccessPage({ params }: RegistrationSuccessPageProps) {
  const { id } = await params;

  const registration = await db.registration.findFirst({
    where: {
      OR: [{ id }, { registrationCode: id }],
      deletedAt: null,
    },
    include: {
      event: {
        include: {
          city: true,
        },
      },
      ticketType: true,
    },
  });

  if (!registration) {
    notFound();
  }

  const { event, ticketType } = registration;

  // Prepare QR code data URL
  let qrCodeDataUrl = registration.qrCodeUrl;
  if (!qrCodeDataUrl) {
    const payload =
      registration.qrPayload ||
      signQrPayload({
        registrationCode: registration.registrationCode,
        eventId: registration.eventId,
        ticketTypeId: registration.ticketTypeId,
        email: registration.email,
        issuedAt: registration.createdAt.getTime(),
      });
    qrCodeDataUrl = await generateQrCodeDataUrl(payload);
  }

  const calendarUrl = getGoogleCalendarUrl({
    title: event.title,
    description: event.overview,
    slug: event.slug,
    startDate: event.startDate,
    endDate: event.endDate,
    venue: event.venue,
    venueAddress: event.venueAddress,
    cityName: event.city?.name,
  });

  const timeString = event.endDate
    ? formatTimeRange(event.startDate, event.endDate)
    : `${formatTime(event.startDate)} IST`;

  return (
    <main className="min-h-[85vh] py-12 md:py-16">
      <div className="container-page mx-auto max-w-xl space-y-6">
        {/* Navigation link */}
        <div>
          <Link
            href={`/events/${event.slug}`}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>Back to {event.title}</span>
          </Link>
        </div>

        {/* Quiet confirmation card */}
        <div className="border-border bg-card space-y-6 rounded-2xl border p-6 text-center sm:p-8">
          {/* Header pill */}
          <div className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs">
            <CheckCircle2 className="text-foreground size-3.5" aria-hidden="true" />
            <span>Registration Confirmed</span>
          </div>

          {/* Event title & meta */}
          <div className="space-y-1.5">
            <h1 className="font-display text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              {event.title}
            </h1>
            <p className="text-muted-foreground font-mono text-xs">
              {formatDate(event.startDate)} · {timeString}
              {event.venue ? ` · ${event.venue}` : ""}
              {event.city ? `, ${event.city.name}` : ""}
            </p>
          </div>

          {/* Registration ID & Attendee name */}
          <div className="border-border space-y-1 border-y py-2">
            <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
              Registration ID
            </span>
            <div
              id="registration-code"
              className="text-foreground font-mono text-2xl font-bold tracking-tight sm:text-3xl"
            >
              #{registration.registrationCode}
            </div>
            <p className="text-foreground text-sm font-medium">{registration.name}</p>
            <p className="text-muted-foreground font-mono text-xs">{ticketType.name}</p>
          </div>

          {/* QR Ticket */}
          <div className="space-y-2">
            <div className="border-border mx-auto inline-block rounded-xl border bg-white p-3 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeDataUrl}
                alt={`QR pass for ${registration.registrationCode}`}
                className="size-48 object-contain sm:size-52"
              />
            </div>
            <p className="text-muted-foreground font-mono text-xs">
              Scan this QR code at the check-in desk for direct admission
            </p>
          </div>

          {/* Ticket sent to your email */}
          <div className="text-muted-foreground bg-muted/20 border-border flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs">
            <Mail className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Ticket sent to your email ({registration.email})</span>
          </div>

          {/* Action buttons: Add to calendar & Join WhatsApp group */}
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            <Button asChild variant="secondary" size="md" className="w-full">
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                <Calendar className="size-4" aria-hidden="true" />
                <span>Add to calendar</span>
              </a>
            </Button>

            <Button asChild variant="primary" size="md" className="w-full">
              <a href={SITE_CONFIG.whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="size-4" aria-hidden="true" />
                <span>Join WhatsApp group</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
