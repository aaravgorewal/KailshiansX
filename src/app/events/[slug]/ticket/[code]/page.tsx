import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getGoogleCalendarUrl } from "@/lib/calendar";
import { generateQrCodeDataUrl, signQrPayload } from "@/server/events/registration";
import { formatDate, formatTime, formatTimeRange } from "@/lib/format-date";
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
      <div className="bg-background min-h-screen px-4 py-16">
        <div className="mx-auto max-w-lg space-y-6 text-center">
          <div className="border-border bg-muted text-foreground mx-auto inline-flex size-14 items-center justify-center rounded-lg border">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <Badge variant="neutral">Payment Pending</Badge>
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Registration Incomplete
            </h1>
            <p className="text-muted-foreground text-sm">
              Registration ID:{" "}
              <span className="text-foreground font-mono font-semibold">
                #{registration.registrationCode}
              </span>{" "}
              is awaiting payment confirmation.
            </p>
          </div>

          {isHoldValid ? (
            <div className="border-border bg-card space-y-4 rounded-lg border p-6">
              <p className="text-muted-foreground text-xs">
                Your temporary seat hold is active until{" "}
                <strong className="text-foreground">
                  {formatTime(registration.holdExpiresAt)}
                </strong>
                . Complete payment now to guarantee your spot.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild variant="primary">
                  <Link href={`/events/${slug}/register/pay?regId=${registration.id}`}>
                    Complete Payment Now
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={`/events/${slug}`}>Return to Event</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-border bg-card space-y-4 rounded-lg border p-6">
              <p className="text-muted-foreground text-xs">
                Your seat hold window has expired. If you made a payment, please wait a moment or
                check your email for confirmation.
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
      <div className="bg-background min-h-screen px-4 py-16">
        <div className="mx-auto max-w-lg space-y-6 text-center">
          <div className="border-border bg-muted text-foreground mx-auto inline-flex size-14 items-center justify-center rounded-lg border">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <Badge variant="destructive">Pass Cancelled</Badge>
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Registration Inactive
            </h1>
            <p className="text-muted-foreground text-sm">
              Registration ID:{" "}
              <span className="text-foreground font-mono font-semibold">
                #{registration.registrationCode}
              </span>{" "}
              has been cancelled and is no longer valid for venue entry.
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

  // Formatted date and time using format-date.ts
  const eventDateStr = formatDate(event.startDate);
  const eventTimeStr = formatTimeRange(event.startDate, event.endDate);

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kailshiansX.com";

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
    <div className="bg-background min-h-screen pb-24">
      {/* Top Banner Bar */}
      <div className="border-border bg-card/40 border-b py-3.5">
        <div className="container-page text-muted-foreground flex items-center justify-between text-xs">
          <Link
            href={`/events/${event.slug}`}
            className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>Back to event</span>
          </Link>

          <div className="text-foreground flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            <span>Pass Confirmed &amp; Issued</span>
          </div>
        </div>
      </div>

      <div className="container-page max-w-xl px-4 pt-8">
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
