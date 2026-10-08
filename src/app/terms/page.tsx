import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_CONFIG } from "@/lib/legal-config";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Terms of Service | KailshiansX",
  description:
    "Terms and conditions governing event registration and community participation on KailshiansX.",
  alternates: {
    canonical: `${APP_URL}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="border-border mb-8 border-b pb-6">
        <h1 className="h2 text-foreground">Terms of Service</h1>
        <p className="text-muted-foreground mt-2 font-mono text-xs">Last updated: October 2026</p>
      </header>

      <div className="text-muted-foreground space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-foreground text-base font-semibold">1. Agreement to Terms</h2>
          <p>
            By accessing {LEGAL_CONFIG.platformName} or registering for an event, you agree to these
            Terms of Service. If you do not agree, you must discontinue using our services
            immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-base font-semibold">
            2. Event Admission &amp; Ticketing
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Every registration pass is personal to the registered attendee and valid for entry
              upon presenting the verified QR code and valid photo ID.
            </li>
            <li>
              Resale or unauthorized commercial transfer of passes without explicit organizer
              consent is strictly prohibited and voids the ticket.
            </li>
            <li>
              Cancellations and refunds are governed strictly by our{" "}
              <Link href="/refunds" className="text-foreground underline underline-offset-4">
                Refund Policy
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-base font-semibold">
            3. Community Standards &amp; Safety
          </h2>
          <p>
            We enforce a zero-tolerance policy against harassment, discrimination, hate speech, or
            disruptive behavior at both in-person venues and virtual sessions. Organizers reserve
            the right to deny entry or expel violators without refund.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-base font-semibold">
            4. Hackathons &amp; Intellectual Property
          </h2>
          <p>
            Builders and hackathon participants retain 100% intellectual property ownership of
            original code and project architectures created during challenges, except where
            pre-declared sponsor challenge terms apply.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-base font-semibold">
            5. Governing Law &amp; Jurisdiction
          </h2>
          <p>
            These terms are governed by the laws of India. Any legal dispute or proceeding relating
            to these terms shall fall under the exclusive jurisdiction of the competent courts in{" "}
            {LEGAL_CONFIG.jurisdiction}.
          </p>
        </section>
      </div>
    </div>
  );
}
