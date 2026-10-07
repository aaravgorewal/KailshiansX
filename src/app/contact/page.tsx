import type { Metadata } from "next";
import { Mail, MapPin, MessageSquare } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Contact Us | KailshiansX",
  description:
    "Get in touch with the KailshiansX team for event support, partnerships, and community inquiries.",
  alternates: {
    canonical: `${APP_URL}/contact`,
  },
  openGraph: {
    title: "Contact Us | KailshiansX",
    description: "Connect with the KailshiansX team.",
    url: `${APP_URL}/contact`,
    siteName: "KailshiansX",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="container-page mx-auto max-w-4xl py-12">
      <header className="border-border mb-8 border-b pb-6">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Connect
        </span>
        <h1 className="text-foreground mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Contact Us
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Have questions about an upcoming event, hackathon partnership, or chapter leadership?
          We&apos;re here to help.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="border-border bg-card flex h-full flex-col justify-between rounded-lg border p-6">
          <div>
            <Mail className="text-foreground size-5" />
            <h2 className="text-foreground mt-4 text-sm font-semibold">General Support</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Questions regarding event tickets, certificates, or platform accounts.
            </p>
          </div>
          <a
            href="mailto:support@kailshians.com"
            className="text-foreground focus-visible:ring-ring mt-3 block rounded text-sm font-medium underline underline-offset-4 hover:opacity-80 focus-visible:ring-1 focus-visible:outline-none"
          >
            support@kailshians.com
          </a>
        </div>

        <div className="border-border bg-card flex h-full flex-col justify-between rounded-lg border p-6">
          <div>
            <MessageSquare className="text-foreground size-5" />
            <h2 className="text-foreground mt-4 text-sm font-semibold">
              Partnerships &amp; Sponsors
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Corporate hackathon sponsorships, tech talk collabs, and mentor engagements.
            </p>
          </div>
          <a
            href="mailto:partners@kailshians.com"
            className="text-foreground focus-visible:ring-ring mt-3 block rounded text-sm font-medium underline underline-offset-4 hover:opacity-80 focus-visible:ring-1 focus-visible:outline-none"
          >
            partners@kailshians.com
          </a>
        </div>

        <div className="border-border bg-card flex h-full flex-col justify-between rounded-lg border p-6">
          <div>
            <MapPin className="text-foreground size-5" />
            <h2 className="text-foreground mt-4 text-sm font-semibold">Headquarters</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Kailshians Web Services Private Limited
            </p>
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              Bengaluru &amp; New Delhi, India
            </p>
          </div>
        </div>
      </div>

      <div className="border-border bg-card mt-12 rounded-lg border p-6 sm:p-8">
        <h2 className="text-foreground text-base font-semibold">Grievance Redressal</h2>
        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
          In accordance with Information Technology rules, any content or platform grievances may be
          addressed to our designated Grievance Officer at{" "}
          <a
            href="mailto:grievance@kailshians.com"
            className="text-foreground focus-visible:ring-ring rounded underline underline-offset-4 hover:opacity-80 focus-visible:ring-1 focus-visible:outline-none"
          >
            grievance@kailshians.com
          </a>
          . We acknowledge all inquiries within 24 business hours.
        </p>
      </div>
    </div>
  );
}
