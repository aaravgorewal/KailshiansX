// src/server/email/templates/EventReminderEmail.tsx
// React Email template: 24-hour event reminder with venue details, check-in instructions, and digital pass link.

import * as React from "react";
import { Section, Heading, Text, Link } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

export interface EventReminderEmailProps {
  name: string;
  eventTitle: string;
  eventSlug: string;
  eventDate: string | Date;
  venue?: string | null;
  venueAddress?: string | null;
  venueMapUrl?: string | null;
  cityName?: string | null;
  registrationCode: string;
  ticketUrl?: string;
  scheduleHighlights?: Array<{ time: string; title: string }>;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kailshiansx.com";

export function EventReminderEmail({
  name,
  eventTitle,
  eventSlug,
  eventDate,
  venue,
  venueAddress,
  venueMapUrl,
  cityName,
  registrationCode,
  ticketUrl,
  scheduleHighlights,
}: EventReminderEmailProps) {
  const d = new Date(eventDate);
  const dateFormatted = d.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "short",
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
      previewText={`Reminder: ${eventTitle} begins tomorrow at ${timeFormatted}! Have your pass ready.`}
      badgeText="24H Event Countdown"
      badgeColor="#f59e0b"
    >
      <Heading as="h1" style={titleHeading}>
        See you tomorrow, {name}! ⚡
      </Heading>
      <Text style={introParagraph}>
        This is a friendly reminder that <strong>{eventTitle}</strong> kicks off in 24 hours. Here
        is everything you need to make your arrival and check-in seamless.
      </Text>

      {/* Countdown Card */}
      <Section style={countdownCard}>
        <div style={countdownPill}>Starts Tomorrow</div>
        <div style={timeDisplay}>
          {dateFormatted} • {timeFormatted}
        </div>
        <Text style={countdownSub}>
          Gates open 30 minutes prior for registration &amp; networking
        </Text>
      </Section>

      {/* Location Box */}
      <Section style={venueBox}>
        <Text style={sectionHeading}>📍 Venue &amp; Navigation</Text>
        <Text style={venueName}>
          {venue || "Event Venue"}
          {cityName ? ` • ${cityName}` : ""}
        </Text>
        {venueAddress && <Text style={venueAddr}>{venueAddress}</Text>}
        {venueMapUrl && (
          <div style={{ marginTop: "10px" }}>
            <Link href={venueMapUrl} style={mapLink}>
              Open in Google Maps →
            </Link>
          </div>
        )}
      </Section>

      {/* Schedule Snapshot if available */}
      {scheduleHighlights && scheduleHighlights.length > 0 && (
        <Section style={scheduleBox}>
          <Text style={sectionHeading}>🗓 Key Schedule Highlights</Text>
          <div style={scheduleList}>
            {scheduleHighlights.map((s, idx) => (
              <div key={idx} style={scheduleRow}>
                <span style={scheduleTime}>{s.time}</span>
                <span style={scheduleTitle}>{s.title}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Check-in Guidance */}
      <Section style={prepBox}>
        <Text style={sectionHeading}>🎒 Checklist for Tomorrow</Text>
        <ul style={listStyle}>
          <li style={listItem}>
            <strong>Your Pass Code:</strong> <span style={codeBadge}>{registrationCode}</span> (Show
            on your phone)
          </li>
          <li style={listItem}>
            <strong>What to Bring:</strong> Charged laptop, power brick, and government/student ID.
          </li>
          <li style={listItem}>
            <strong>Wi-Fi:</strong> High-speed venue credentials will be provided at reception.
          </li>
        </ul>
      </Section>

      {/* CTA Button */}
      <Section style={ctaSection}>
        <Link href={passUrl} style={ctaButton}>
          Open Your Digital Pass
        </Link>
      </Section>

      <Text style={closingNote}>
        Running late or need directions? You can reach our event leads directly on WhatsApp or reply
        to this reminder.
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

const countdownCard: React.CSSProperties = {
  backgroundColor: "#1c1409",
  border: "1px solid #78350f",
  borderRadius: "14px",
  padding: "24px 20px",
  textAlign: "center",
  marginBottom: "24px",
};

const countdownPill: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#f59e0b22",
  color: "#fbbf24",
  border: "1px solid #f59e0b44",
  padding: "3px 12px",
  borderRadius: "9999px",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const timeDisplay: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 800,
  color: "#ffffff",
  margin: "12px 0 4px 0",
};

const countdownSub: React.CSSProperties = {
  fontSize: "12px",
  color: "#fde68a",
  margin: 0,
};

const venueBox: React.CSSProperties = {
  backgroundColor: "#131b2e",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "16px 20px",
  marginBottom: "20px",
};

const sectionHeading: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#f1f5f9",
  margin: "0 0 8px 0",
};

const venueName: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#f8fafc",
  margin: "0 0 4px 0",
};

const venueAddr: React.CSSProperties = {
  fontSize: "13px",
  color: "#94a3b8",
  margin: 0,
  lineHeight: 1.4,
};

const mapLink: React.CSSProperties = {
  fontSize: "12px",
  color: "#38bdf8",
  textDecoration: "none",
  fontWeight: 600,
};

const scheduleBox: React.CSSProperties = {
  backgroundColor: "#131b2e",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "16px 20px",
  marginBottom: "20px",
};

const scheduleList: React.CSSProperties = {
  marginTop: "8px",
};

const scheduleRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "5px 0",
  borderBottom: "1px solid #1e293b",
  fontSize: "12px",
};

const scheduleTime: React.CSSProperties = {
  color: "#f59e0b",
  fontFamily: "ui-monospace, monospace",
  fontWeight: 600,
  width: "30%",
};

const scheduleTitle: React.CSSProperties = {
  color: "#e2e8f0",
  textAlign: "right",
  width: "70%",
};

const prepBox: React.CSSProperties = {
  backgroundColor: "#131b2e",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "16px 20px",
  marginBottom: "24px",
};

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: "18px",
};

const listItem: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: 1.6,
  color: "#cbd5e1",
  marginBottom: "4px",
};

const codeBadge: React.CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  backgroundColor: "#1e293b",
  padding: "2px 6px",
  borderRadius: "4px",
  color: "#38bdf8",
  fontWeight: 700,
};

const ctaSection: React.CSSProperties = {
  textAlign: "center",
  margin: "24px 0",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#f59e0b",
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: 800,
  padding: "12px 28px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
};

const closingNote: React.CSSProperties = {
  fontSize: "12px",
  color: "#64748b",
  lineHeight: 1.5,
  textAlign: "center",
  margin: "20px 0 0 0",
};
