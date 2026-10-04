import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | KailshiansX",
  description:
    "Refund and cancellation guidelines for developer events, workshops, and passes on KailshiansX.",
  alternates: {
    canonical: `${APP_URL}/refunds`,
  },
  openGraph: {
    title: "Refund & Cancellation Policy | KailshiansX",
    description: "Refund and cancellation guidelines for KailshiansX tickets and passes.",
    url: `${APP_URL}/refunds`,
    siteName: "KailshiansX",
    type: "website",
  },
};

export default function RefundsPage() {
  return (
    <div className="container-page mx-auto max-w-4xl py-12">
      <header className="border-border mb-8 border-b pb-6">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Legal
        </span>
        <h1 className="text-foreground mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-muted-foreground mt-2 text-xs">Last updated: October 2026</p>
      </header>

      <div className="text-muted-foreground space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">
            1. Ticket Cancellations by Attendees
          </h2>
          <p>
            We recognize that plans can change. For paid events, workshops, and hackathon
            registrations hosted directly on the KailshiansX platform:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">More than 48 hours before event start:</strong>{" "}
              Full refund (100% of the ticket face value, minus any standard payment gateway
              processing fees).
            </li>
            <li>
              <strong className="text-foreground">Within 48 hours of event start:</strong> Tickets
              are non-refundable as catering, swag, and venue capacities have been committed.
            </li>
            <li>
              <strong className="text-foreground">No-shows:</strong> Registrations that are not
              checked in during the event check-in window are non-refundable.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">
            2. Event Rescheduling or Cancellation by Organizers
          </h2>
          <p>
            If an event is rescheduled, your ticket will remain automatically valid for the new
            date. If you are unable to attend the rescheduled date, you may request a 100% refund
            within 7 days of the rescheduling announcement.
          </p>
          <p>
            If an event is cancelled entirely by KailshiansX or its venue partners, all ticket
            holders will receive a full 100% automatic refund.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">
            3. Free Events &amp; RSVP Releases
          </h2>
          <p>
            For free events and community meetups, there is no monetary cancellation fee. However,
            to ensure fellow community members on the waitlist can participate, we request that you
            release your RSVP through your Member Dashboard (/me) at least 24 hours prior to the
            event start.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">4. Refund Processing Timelines</h2>
          <p>
            Approved refunds are credited back to the original method of payment (credit/debit card,
            UPI, or net banking) via our payment gateway within 5 to 7 business days, depending on
            your banking provider.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">5. How to Initiate a Refund</h2>
          <p>
            To request a cancellation and refund, navigate to your Developer Passport at{" "}
            <a href="/me" className="text-foreground underline underline-offset-4 hover:opacity-80">
              /me
            </a>
            , select the relevant ticket, and click &quot;Request Refund&quot;. Alternatively, email
            support@kailshians.com with your Order ID and registered email address.
          </p>
        </section>
      </div>
    </div>
  );
}
