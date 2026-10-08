import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_CONFIG } from "@/lib/legal-config";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Privacy Policy | KailshiansX",
  description: "Privacy policy and data protection practices for the KailshiansX platform.",
  alternates: {
    canonical: `${APP_URL}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="border-border mb-8 border-b pb-6">
        <h1 className="h2 text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2 font-mono text-xs">Last updated: October 2026</p>
      </header>

      <div className="text-muted-foreground space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-foreground text-base font-semibold">1. Overview</h2>
          <p>
            {LEGAL_CONFIG.companyName} (&quot;{LEGAL_CONFIG.platformName}&quot;, &quot;we&quot;,
            &quot;us&quot;) respects your personal privacy. This policy outlines how we collect,
            process, and safeguard information across our developer events and community platforms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-base font-semibold">2. Information Collected</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Identity Data:</strong> Full name, email address,
              and OAuth profile details (e.g., GitHub, Google) upon account creation.
            </li>
            <li>
              <strong className="text-foreground">Event &amp; Pass Information:</strong> Registered
              sessions, t-shirt sizes for hackathons, dietary preferences, and check-in QR codes.
            </li>
            <li>
              <strong className="text-foreground">Payment Records:</strong> Transaction IDs and
              order amounts processed via RBI-authorized payment aggregators (e.g., Razorpay). We
              never store raw card or bank credentials on our servers.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-base font-semibold">3. Use of Information</h2>
          <p>We process personal data solely to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Issue and validate digital entry passes and verifiable attendance credentials.</li>
            <li>Send essential schedule updates, venue details, and emergency announcements.</li>
            <li>Facilitate team matching, mentor interactions, and hackathon project judging.</li>
            <li>Comply with Indian tax and regulatory accounting obligations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-base font-semibold">
            4. Data Sharing &amp; Protection
          </h2>
          <p>
            We do not sell personal data to third parties. Authorized service providers (cloud
            databases, transactional email delivery, payment gateways) only access data necessary to
            perform contracted services under strict confidentiality agreements.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-base font-semibold">5. Inquiries &amp; Grievances</h2>
          <p>
            For data inquiries, rectification, or deletion requests, reach our team at{" "}
            <a
              href={`mailto:${LEGAL_CONFIG.privacyEmail}`}
              className="text-foreground underline underline-offset-4"
            >
              {LEGAL_CONFIG.privacyEmail}
            </a>{" "}
            or visit our{" "}
            <Link href="/contact" className="text-foreground underline underline-offset-4">
              contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
