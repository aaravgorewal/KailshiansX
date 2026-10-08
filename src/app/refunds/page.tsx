import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_CONFIG } from "@/lib/legal-config";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | KailshiansX",
  description:
    "Refund and cancellation policy for developer events, workshops, and hackathon passes.",
  alternates: {
    canonical: `${APP_URL}/refunds`,
  },
};

export default function RefundsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="border-border mb-8 border-b pb-6">
        <h1 className="h2 text-foreground">Refund &amp; Cancellation Policy</h1>
        <p className="text-muted-foreground mt-2 font-mono text-xs">Last updated: October 2026</p>
      </header>

      <div className="text-muted-foreground space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-foreground text-base font-semibold">1. Ticket Cancellation Window</h2>
          <p>
            Attendee cancellations for paid tickets, workshops, and hackathon passes are subject to
            a clear pre-event window:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">
                More than {LEGAL_CONFIG.cancellationWindowHours} hours before event start:
              </strong>{" "}
              Eligible for a 100% refund of the ticket fee (less standard payment processing fees
              where applicable).
            </li>
            <li>
              <strong className="text-foreground">
                Within {LEGAL_CONFIG.cancellationWindowHours} hours of event start:
              </strong>{" "}
              Non-refundable, as catering, venue capacity, and participant materials are locked.
            </li>
            <li>
              <strong className="text-foreground">No-shows:</strong> Registrations not checked in
              during the official event check-in window are non-refundable.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-base font-semibold">
            2. Event Rescheduling or Cancellation
          </h2>
          <p>
            If an event is rescheduled by {LEGAL_CONFIG.companyName}, tickets automatically transfer
            to the rescheduled date. Attendees unable to make the new date may request a full refund
            within {LEGAL_CONFIG.rescheduleRefundDays} calendar days of notification.
          </p>
          <p>
            If an event is canceled entirely, all verified ticket holders will receive an automatic
            100% refund without needing to raise a dispute.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-base font-semibold">
            3. Processing &amp; Payout Timelines
          </h2>
          <p>
            Approved refunds are credited to the original payment method (UPI, net banking, or card)
            via our payment gateway within {LEGAL_CONFIG.processingTimeline}.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-base font-semibold">
            4. Raising a Cancellation Request
          </h2>
          <p>
            To initiate a cancellation, visit your account dashboard at{" "}
            <Link href="/me" className="text-foreground underline underline-offset-4">
              /me
            </Link>{" "}
            or email{" "}
            <a
              href={`mailto:${LEGAL_CONFIG.supportEmail}`}
              className="text-foreground underline underline-offset-4"
            >
              {LEGAL_CONFIG.supportEmail}
            </a>{" "}
            with your registered Order ID.
          </p>
        </section>
      </div>
    </div>
  );
}
