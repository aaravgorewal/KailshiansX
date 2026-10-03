// src/server/email/templates/PaymentFailedEmail.tsx
// React Email template: Payment failed notification with reason, order details, and retry link.

import * as React from "react";
import { Section, Heading, Text, Link } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

export interface PaymentFailedEmailProps {
  name: string;
  eventTitle: string;
  eventSlug: string;
  amount: number;
  orderId: string;
  failureReason?: string | null;
  retryUrl?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kailshiansx.com";

export function PaymentFailedEmail({
  name,
  eventTitle,
  eventSlug,
  amount,
  orderId,
  failureReason,
  retryUrl,
}: PaymentFailedEmailProps) {
  const amountFormatted = `₹${(amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const checkoutUrl = retryUrl || `${APP_URL}/events/${eventSlug}/register/pay?orderId=${orderId}`;

  return (
    <BaseLayout
      previewText={`Payment attempt of ${amountFormatted} for ${eventTitle} could not be completed.`}
      badgeText="Payment Incomplete"
      badgeColor="#ef4444"
    >
      <Heading as="h1" style={titleHeading}>
        Payment Attempt Unsuccessful
      </Heading>
      <Text style={introParagraph}>
        Hello {name}, your transaction for <strong>{eventTitle}</strong> was not completed by your
        payment provider. No funds have been deducted from your account, or any reserved holds will
        be automatically released.
      </Text>

      {/* Failure Breakdown Card */}
      <Section style={alertCard}>
        <div style={alertPill}>Action Required</div>
        <div style={amountDisplay}>{amountFormatted}</div>
        <Text style={orderRef}>Order Reference: {orderId}</Text>
        {failureReason && (
          <div style={reasonBox}>
            <Text style={reasonLabel}>Provider Note:</Text>
            <Text style={reasonValue}>{failureReason}</Text>
          </div>
        )}
      </Section>

      {/* Reassurance & Instructions */}
      <Section style={instructionsBox}>
        <Text style={instructionTitle}>What happens next?</Text>
        <ul style={listStyle}>
          <li style={listItem}>
            Your seat reservation is held temporarily. Complete payment soon to secure your spot.
          </li>
          <li style={listItem}>
            Common causes include bank authorization OTP timeouts, UPI app limits, or temporary card
            restrictions.
          </li>
          <li style={listItem}>
            You can retry using an alternate payment method (UPI, Netbanking, Credit/Debit card).
          </li>
        </ul>
      </Section>

      {/* CTA Button */}
      <Section style={ctaSection}>
        <Link href={checkoutUrl} style={ctaButton}>
          Retry Payment Now
        </Link>
      </Section>

      <Text style={closingNote}>
        If your account was debited, your bank will automatically reverse the transaction within 3–5
        working days. Feel free to reach out to passes@kailshiansx.com with your order reference.
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

const alertCard: React.CSSProperties = {
  backgroundColor: "#1f1315",
  border: "1px solid #7f1d1d",
  borderRadius: "14px",
  padding: "24px 20px",
  textAlign: "center",
  marginBottom: "24px",
};

const alertPill: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#ef444422",
  color: "#f87171",
  border: "1px solid #ef444444",
  padding: "3px 12px",
  borderRadius: "9999px",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const amountDisplay: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 900,
  color: "#ffffff",
  margin: "12px 0 4px 0",
};

const orderRef: React.CSSProperties = {
  fontSize: "12px",
  fontFamily: "ui-monospace, Menlo, monospace",
  color: "#cbd5e1",
  margin: "0 0 12px 0",
};

const reasonBox: React.CSSProperties = {
  backgroundColor: "#2c1517",
  border: "1px solid #991b1b",
  borderRadius: "8px",
  padding: "10px 14px",
  marginTop: "12px",
  textAlign: "left",
};

const reasonLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#f87171",
  fontWeight: 700,
  textTransform: "uppercase",
  margin: "0 0 2px 0",
};

const reasonValue: React.CSSProperties = {
  fontSize: "12px",
  color: "#fecaca",
  margin: 0,
};

const instructionsBox: React.CSSProperties = {
  backgroundColor: "#131b2e",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "18px 20px",
  marginBottom: "24px",
};

const instructionTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#f1f5f9",
  margin: "0 0 10px 0",
};

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: "20px",
};

const listItem: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: 1.6,
  color: "#94a3b8",
  marginBottom: "6px",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center",
  margin: "24px 0",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#ef4444",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 700,
  padding: "12px 28px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
};

const closingNote: React.CSSProperties = {
  fontSize: "12px",
  color: "#64748b",
  lineHeight: 1.5,
  textAlign: "center",
  margin: "20px 0 0 0",
};
