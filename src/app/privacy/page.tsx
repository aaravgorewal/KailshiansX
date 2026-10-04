import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Privacy Policy | KailshiansX",
  description: "Privacy Policy and personal information protection for the KailshiansX platform.",
  alternates: {
    canonical: `${APP_URL}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | KailshiansX",
    description: "How KailshiansX collects, uses and protects your data.",
    url: `${APP_URL}/privacy`,
    siteName: "KailshiansX",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="container-page mx-auto max-w-4xl py-12">
      <header className="border-border mb-8 border-b pb-6">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Legal
        </span>
        <h1 className="text-foreground mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mt-2 text-xs">Last updated: October 2026</p>
      </header>

      <div className="text-muted-foreground space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">1. Introduction</h2>
          <p>
            Kailshians Web Services (&quot;KailshiansX&quot;, &quot;we&quot;, &quot;our&quot;, or
            &quot;us&quot;) operates the KailshiansX developer event platform. This Privacy Policy
            describes how we collect, use, disclose, and protect personal data when you use our
            website, register for events, participate in hackathons, or engage with our community
            chapters.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">2. Information We Collect</h2>
          <p>We collect information you provide directly to us when using our platform:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Account Information:</strong> Name, email address,
              GitHub/Google profile identifiers, and profile image.
            </li>
            <li>
              <strong className="text-foreground">Event Registrations:</strong> College/university,
              graduation year, technical skills, diet preferences, and emergency contact details for
              in-person hackathons and workshops.
            </li>
            <li>
              <strong className="text-foreground">Payment Details:</strong> Transaction references,
              pass types, and billing information processed securely via authorized payment gateways
              (such as Razorpay). We do not store full credit card numbers or banking credentials.
            </li>
            <li>
              <strong className="text-foreground">Community Participation:</strong> Submissions,
              project repositories, mentor bookings, and attendance check-ins.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">3. How We Use Your Information</h2>
          <p>We use your information for the following purposes:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Facilitating event admissions, QR code ticket validation, and check-in workflows.
            </li>
            <li>
              Issuing cryptographically verifiable attendance certificates and developer
              credentials.
            </li>
            <li>
              Transmitting essential event logistics, schedule updates, and emergency notifications.
            </li>
            <li>Facilitating mentor bookings and state/campus chapter coordination.</li>
            <li>Improving platform performance, telemetry, security, and spam prevention.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">
            4. Information Sharing &amp; Disclosure
          </h2>
          <p>
            We do not sell your personal data. We share information only under the following
            circumstances:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Event Organizers &amp; Partners:</strong> Relevant
              participant details (e.g., team members, attendance) may be shared with venue partners
              and corporate sponsors strictly for event facilitation and hiring fairs with your
              opt-in consent.
            </li>
            <li>
              <strong className="text-foreground">Service Providers:</strong> Cloud hosting,
              database infrastructure, email delivery providers, and payment processors bound by
              confidentiality obligations.
            </li>
            <li>
              <strong className="text-foreground">Legal Requirements:</strong> When mandated by
              applicable law, governmental regulation, or court order.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">
            5. Data Retention &amp; Security
          </h2>
          <p>
            We retain your personal data for as long as your account remains active or as needed to
            maintain your event credential records. We implement appropriate technical and
            organizational safeguards to protect against unauthorized access, loss, or misuse.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">6. Your Rights &amp; Choices</h2>
          <p>
            You have the right to access, update, or request deletion of your account and personal
            data. You can manage your notification preferences or request data export by contacting
            us at privacy@kailshians.com.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">7. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy or our data practices, please reach
            out via our{" "}
            <a
              href="/contact"
              className="text-foreground underline underline-offset-4 hover:opacity-80"
            >
              contact page
            </a>{" "}
            or email us at privacy@kailshians.com.
          </p>
        </section>
      </div>
    </div>
  );
}
