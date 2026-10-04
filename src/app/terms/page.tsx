import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Terms of Service | KailshiansX",
  description: "Terms and conditions for using the KailshiansX platform and attending our events.",
  alternates: {
    canonical: `${APP_URL}/terms`,
  },
  openGraph: {
    title: "Terms of Service | KailshiansX",
    description: "Terms and conditions for KailshiansX community events and platform usage.",
    url: `${APP_URL}/terms`,
    siteName: "KailshiansX",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <div className="container-page mx-auto max-w-4xl py-12">
      <header className="border-border mb-8 border-b pb-6">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Legal
        </span>
        <h1 className="text-foreground mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>
        <p className="text-muted-foreground mt-2 text-xs">Last updated: October 2026</p>
      </header>

      <div className="text-muted-foreground space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the KailshiansX platform, registering for events, or purchasing
            tickets, you agree to be bound by these Terms of Service and all applicable laws and
            regulations. If you do not agree with any of these terms, you are prohibited from using
            or accessing this site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">2. Platform Services</h2>
          <p>
            KailshiansX provides developer event management, ticketing, hackathon coordination,
            community chapters, and digital credential verification services. We reserve the right
            to modify, suspend, or discontinue any aspect of our services at any time without prior
            notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">
            3. User Conduct &amp; Community Guidelines
          </h2>
          <p>
            Participants in all KailshiansX events (in-person and virtual) must adhere to our
            Community Code of Conduct. Harassment, discrimination, offensive behavior, disruptive
            conduct, or academic dishonesty (including plagiarism in hackathons) will result in
            immediate expulsion and revocation of tickets without refund.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">
            4. Event Registration &amp; Ticketing
          </h2>
          <p>
            Each ticket or pass issued through KailshiansX is valid solely for the named ticket
            holder and the specific event session indicated. Tickets may not be resold or
            transferred except where explicitly allowed by event organizers. Ticket holders must
            present valid government-issued or collegiate photo identification along with the QR
            code pass upon entry.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">5. Intellectual Property</h2>
          <p>
            Participants in hackathons and developer challenges retain full intellectual property
            ownership of code and projects created during events, subject to specific event rules or
            sponsor challenge agreements disclosed prior to registration. The KailshiansX name,
            logo, and platform design are the intellectual property of Kailshians Web Services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">6. Limitation of Liability</h2>
          <p>
            In no event shall Kailshians Web Services or its event organizers be liable for any
            indirect, incidental, special, consequential, or punitive damages arising out of your
            participation in events or inability to use the platform. In-person attendees assume all
            risks associated with travel and physical venue attendance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">
            7. Governing Law &amp; Jurisdiction
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India. Any
            disputes arising in connection with these Terms shall be subject to the exclusive
            jurisdiction of the courts of New Delhi, India.
          </p>
        </section>
      </div>
    </div>
  );
}
