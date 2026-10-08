import type { Metadata } from "next";
import { LEGAL_CONFIG } from "@/lib/legal-config";
import { Mail, MessageSquare, MapPin } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Contact Us | KailshiansX",
  description:
    "Get in touch with the KailshiansX team for event support, partnerships, and inquiries.",
  alternates: {
    canonical: `${APP_URL}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="border-border mb-8 border-b pb-6">
        <h1 className="h2 text-foreground">Contact Us</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Connect with our events team, community leads, and partner coordinators.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="border-border bg-card flex flex-col justify-between rounded-lg border p-5">
          <div>
            <Mail className="text-foreground mb-3 size-5" aria-hidden="true" />
            <h2 className="text-foreground text-sm font-semibold">Support &amp; Tickets</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Assistance with ticket issues, check-ins, or refunds.
            </p>
          </div>
          <a
            href={`mailto:${LEGAL_CONFIG.supportEmail}`}
            className="text-foreground mt-4 text-xs font-medium underline underline-offset-4"
          >
            {LEGAL_CONFIG.supportEmail}
          </a>
        </div>

        <div className="border-border bg-card flex flex-col justify-between rounded-lg border p-5">
          <div>
            <MessageSquare className="text-foreground mb-3 size-5" aria-hidden="true" />
            <h2 className="text-foreground text-sm font-semibold">Partnerships</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Sponsor hackathons, host tech talks, or provide venues.
            </p>
          </div>
          <a
            href={`mailto:${LEGAL_CONFIG.partnersEmail}`}
            className="text-foreground mt-4 text-xs font-medium underline underline-offset-4"
          >
            {LEGAL_CONFIG.partnersEmail}
          </a>
        </div>

        <div className="border-border bg-card flex flex-col justify-between rounded-lg border p-5">
          <div>
            <MapPin className="text-foreground mb-3 size-5" aria-hidden="true" />
            <h2 className="text-foreground text-sm font-semibold">Headquarters</h2>
            <p className="text-muted-foreground mt-1 text-xs">{LEGAL_CONFIG.companyName}</p>
          </div>
          <span className="text-muted-foreground mt-4 font-mono text-xs">
            {LEGAL_CONFIG.jurisdiction}
          </span>
        </div>
      </div>

      <div className="border-border bg-card mt-10 rounded-lg border p-6">
        <h2 className="text-foreground text-sm font-semibold">Grievance Redressal (India)</h2>
        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
          Pursuant to Information Technology rules, user concerns and statutory grievances may be
          directed to our designated Grievance Officer at{" "}
          <a
            href={`mailto:${LEGAL_CONFIG.grievanceEmail}`}
            className="text-foreground underline underline-offset-4"
          >
            {LEGAL_CONFIG.grievanceEmail}
          </a>
          . Inquiries are acknowledged within 24 business hours.
        </p>
      </div>
    </div>
  );
}
