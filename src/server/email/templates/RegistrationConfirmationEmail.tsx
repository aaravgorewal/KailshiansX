// src/server/email/templates/RegistrationConfirmationEmail.tsx
// React Email template: Registration confirmation with digital pass, check-in QR code, and event details.

import * as React from "react";
import { Section, Heading, Text, Link, Img } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

export interface RegistrationConfirmationEmailProps {
  name: string;
  eventTitle: string;
  eventSlug: string;
  eventDate: string | Date;
  venue?: string | null;
  cityName?: string | null;
  ticketTierName: string;
  registrationCode: string;
  qrCodeDataUrl?: string | null;
  ticketUrl?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kailshiansx.com";

export function RegistrationConfirmationEmail({
  name,
  eventTitle,
  eventSlug,
  eventDate,
  venue,
  cityName,
  ticketTierName,
  registrationCode,
  qrCodeDataUrl,
  ticketUrl,
}: RegistrationConfirmationEmailProps) {
  const d = new Date(eventDate);
  const dateFormatted = d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeFormatted = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const passUrl = ticketUrl || `${APP_URL}/events/${eventSlug}/ticket/${registrationCode}`;

  return (
    <BaseLayout
      previewText={`Your entry pass for ${eventTitle} is confirmed! Pass code: ${registrationCode}`}
      badgeText="Confirmed Pass"
      badgeColor="#10b981"
    >
      <Heading as="h1" style={titleHeading}>
        Hey {name}, you&apos;re in! 🎉
      </Heading>
      <Text style={introParagraph}>
        Your seat for <strong>{eventTitle}</strong> is officially reserved. Please present your
        digital pass or the QR code below at the reception desk for instant check-in.
      </Text>

      {/* Ticket Pass Box */}
      <Section style={passCard}>
        <div style={tierPill}>{ticketTierName}</div>
        <div style={codeDisplay}>{registrationCode}</div>
        <Text style={passSubtext}>Official Attendee Access Token</Text>

        {qrCodeDataUrl && (
          <div style={qrWrapper}>
            <Img
              src={qrCodeDataUrl}
              alt={`QR Pass for ${registrationCode}`}
              width="170"
              height="170"
              style={qrImage}
            />
            <Text style={qrLabel}>Scannable at entrance gate</Text>
          </div>
        )}
      </Section>

      {/* Logistics Overview */}
      <Section style={logisticsBox}>
        <table width="100%" cellPadding="6" cellSpacing="0" style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelCell}>Event:</td>
              <td style={valCell}>{eventTitle}</td>
            </tr>
            <tr>
              <td style={labelCell}>Date &amp; Time:</td>
              <td style={valCell}>
                {dateFormatted} at {timeFormatted}
              </td>
            </tr>
            <tr>
              <td style={labelCell}>Venue:</td>
              <td style={valCell}>
                {venue || "Venue Announced Soon"}
                {cityName ? `, ${cityName}` : ""}
              </td>
            </tr>
            <tr>
              <td style={labelCell}>Ticket Tier:</td>
              <td style={valCell}>{ticketTierName}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* CTA Button */}
      <Section style={ctaSection}>
        <Link href={passUrl} style={ctaButton}>
          Open Digital Pass
        </Link>
      </Section>

      <Text style={closingNote}>
        Need directions or have a question? Reply directly to this confirmation email and our event
        team will assist you.
      </Text>
    </BaseLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const titleHeading: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 800,
  color: "#f8fafc",
  margin: "0 0 10px 0",
  letterSpacing: "-0.3px",
};

const introParagraph: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.6,
  color: "#94a3b8",
  margin: "0 0 24px 0",
};

const passCard: React.CSSProperties = {
  backgroundColor: "#090d16",
  border: "1px solid #2563eb",
  borderRadius: "14px",
  padding: "24px 20px",
  textAlign: "center",
  marginBottom: "24px",
};

const tierPill: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#1e3a8a33",
  color: "#93c5fd",
  border: "1px solid #3b82f644",
  padding: "3px 12px",
  borderRadius: "9999px",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const codeDisplay: React.CSSProperties = {
  fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
  fontSize: "24px",
  fontWeight: 900,
  letterSpacing: "2px",
  color: "#ffffff",
  margin: "12px 0 4px 0",
};

const passSubtext: React.CSSProperties = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0 0 16px 0",
};

const qrWrapper: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "12px",
  borderRadius: "10px",
  display: "inline-block",
  margin: "0 auto",
};

const qrImage: React.CSSProperties = {
  display: "block",
  margin: "0 auto",
};

const qrLabel: React.CSSProperties = {
  fontSize: "10px",
  color: "#475569",
  margin: "8px 0 0 0",
  fontWeight: 600,
};

const logisticsBox: React.CSSProperties = {
  backgroundColor: "#131b2e",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "16px 20px",
  marginBottom: "24px",
};

const tableStyle: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: 1.5,
};

const labelCell: React.CSSProperties = {
  color: "#94a3b8",
  fontWeight: 500,
  padding: "6px 0",
  verticalAlign: "top",
  width: "35%",
};

const valCell: React.CSSProperties = {
  color: "#f1f5f9",
  fontWeight: 600,
  padding: "6px 0",
  textAlign: "right",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center",
  margin: "24px 0",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#2563eb",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 700,
  padding: "12px 28px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
};

const closingNote: React.CSSProperties = {
  fontSize: "12px",
  color: "#64748b",
  lineHeight: 1.5,
  textAlign: "center",
  margin: "20px 0 0 0",
};
