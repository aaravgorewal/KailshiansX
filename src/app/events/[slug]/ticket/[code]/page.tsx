import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getGoogleCalendarUrl } from "@/lib/calendar";
import { generateQrCodeDataUrl, signQrPayload } from "@/server/events/registration";
import { TicketCardClient } from "./TicketCardClient";

export const dynamic = "force-dynamic";

interface TicketPageProps {
  params: Promise<{ slug: string; code: string }>;
}

export async function generateMetadata({ params }: TicketPageProps): Promise<Metadata> {
  const { code } = await params;
  const registration = await db.registration.findUnique({
    where: { registrationCode: code },
    include: { event: true },
  });

  if (!registration) {
    return { title: "Pass Not Found | KailshiansX" };
  }

  return {
    title: `Digital Pass: ${registration.registrationCode} | ${registration.event.title} | KailshiansX`,
    description: `Official digital ticket pass for ${registration.name} at ${registration.event.title}.`,
    robots: { index: false, follow: false },
  };
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { slug, code } = await params;

  const registration = await db.registration.findUnique({
    where: { registrationCode: code },
    include: {
      event: {
        include: {
          city: true,
        },
      },
      ticketType: true,
    },
  });

  if (!registration || registration.event.slug !== slug || registration.deletedAt) {
    notFound();
  }

  const { event, ticketType } = registration;

  // If pending payment, show payment reminder / redirect option
  if (registration.status === "PENDING") {
    const isHoldValid =
      registration.holdExpiresAt && new Date(registration.holdExpiresAt) > new Date();

    return (
      <div className="bg-surface-950 min-h-screen px-4 py-16">
        <div className="mx-auto max-w-xl space-y-6 text-center">
          <div className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
            <AlertTriangle className="size-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="warning">Payment Incomplete</Badge>
            <h1 className="text-surface-100 text-2xl font-bold tracking-tight sm:text-3xl">
              Ticket Payment Pending
            </h1>
            <p className="text-surface-400 text-sm">
              Registration #{registration.registrationCode} is awaiting successful payment
              confirmation.
            </p>
          </div>

          {isHoldValid ? (
            <div className="border-surface-800 bg-surface-900/60 space-y-4 rounded-2xl border p-6">
              <p className="text-surface-300 text-xs">
                Your temporary seat hold is still active until{" "}
                <strong className="text-brand-300">
                  {new Date(registration.holdExpiresAt!).toLocaleTimeString()}
                </strong>
                . Complete payment now to guarantee your spot.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild variant="primary">
                  <Link href={`/events/${slug}/register/pay?regId=${registration.id}`}>
                    Complete Payment Now
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/events/${slug}`}>Return to Event</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6">
              <p className="text-xs text-rose-300">
                Your 10-minute seat hold window has expired. If you made a payment, please wait a
                moment or check your inbox as our webhook processes bank updates.
              </p>
              <Button asChild variant="secondary">
                <Link href={`/events/${slug}/register`}>Start Fresh Registration</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (registration.status === "CANCELLED") {
    return (
      <div className="bg-surface-950 min-h-screen px-4 py-16">
        <div className="mx-auto max-w-xl space-y-6 text-center">
          <div className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
            <AlertTriangle className="size-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="outline" className="border-rose-500/40 text-rose-400">
              Pass Cancelled / Refunded
            </Badge>
            <h1 className="text-surface-100 text-2xl font-bold tracking-tight sm:text-3xl">
              Registration Inactive
            </h1>
            <p className="text-surface-400 text-sm">
              Registration #{registration.registrationCode} has been cancelled or refunded and is no
              longer valid for venue entry.
            </p>
          </div>

          <Button asChild variant="secondary">
            <Link href={`/events/${slug}`}>Explore Event Details</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Ensure QR Code URL is ready
  let qrCodeDataUrl = registration.qrCodeUrl;
  if (!qrCodeDataUrl) {
    const payload =
      registration.qrPayload ||
      signQrPayload({
        registrationCode: registration.registrationCode,
        eventId: event.id,
        ticketTypeId: ticketType.id,
        email: registration.email,
        issuedAt: registration.createdAt.getTime(),
      });
    qrCodeDataUrl = await generateQrCodeDataUrl(payload);

    // Save back to DB cache asynchronously
    db.registration
      .update({
        where: { id: registration.id },
        data: { qrCodeUrl: qrCodeDataUrl, qrPayload: payload },
      })
      .catch((err) => console.error("Could not cache generated QR code URL:", err));
  }

  // Formatted date and time
  const eventDateStr = new Date(event.startDate).toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const eventTimeStr = `${new Date(event.startDate).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}${
    event.endDate
      ? ` - ${new Date(event.endDate).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`
      : ""
  }`;

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kailshiansx.com";

  const googleCalUrl = getGoogleCalendarUrl({
    title: event.title,
    description: event.overview,
    slug: event.slug,
    startDate: event.startDate,
    endDate: event.endDate,
    venue: event.venue,
    venueAddress: event.venueAddress,
    cityName: event.city?.name,
    appUrl: APP_URL,
  });

  const icsDownloadUrl = `/api/events/${event.slug}/ics`;

  return (
    <div className="bg-surface-950 min-h-screen pb-24">
      {/* Top Banner Bar */}
      <div className="border-surface-800/80 bg-surface-900/60 border-b py-4">
        <div className="container-page text-surface-400 flex items-center justify-between text-xs">
          <Link
            href={`/events/${event.slug}`}
            className="hover:text-surface-100 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to event</span>
          </Link>

          <div className="flex items-center gap-2 font-medium text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            <span>Pass Confirmed & Issued</span>
          </div>
        </div>
      </div>

      <div className="container-page max-w-3xl px-4 pt-10">
        <TicketCardClient
          registrationCode={registration.registrationCode}
          name={registration.name}
          email={registration.email}
          college={registration.college}
          ticketTierName={ticketType.name}
          eventTitle={event.title}
          eventSlug={event.slug}
          eventDateStr={eventDateStr}
          eventTimeStr={eventTimeStr}
          venueName={event.venue}
          venueAddress={event.venueAddress}
          qrCodeUrl={qrCodeDataUrl}
          googleCalUrl={googleCalUrl}
          icsDownloadUrl={icsDownloadUrl}
        />
      </div>
    </div>
  );
}
