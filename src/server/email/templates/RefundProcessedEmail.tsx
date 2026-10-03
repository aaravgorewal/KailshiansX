// src/server/email/templates/RefundProcessedEmail.tsx
// React Email template: Refund processed notification with amount in INR, refund ID, and bank credit timeline.

import * as React from "react";
import { Section, Heading, Text } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

export interface RefundProcessedEmailProps {
  name: string;
  eventTitle: string;
  amount: number;
  refundId: string;
  paymentId?: string | null;
  registrationCode?: string | null;
  reason?: string | null;
}

export function RefundProcessedEmail({
  name,
  eventTitle,
  amount,
  refundId,
  paymentId,
  registrationCode,
  reason,
}: RefundProcessedEmailProps) {
  const amountFormatted = `₹${(amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <BaseLayout
      previewText={`Refund of ${amountFormatted} for ${eventTitle} has been processed successfully.`}
      badgeText="Refund Processed"
      badgeColor="#10b981"
    >
      <Heading as="h1" style={titleHeading}>
        Refund Initiated Successfully
      </Heading>
      <Text style={introParagraph}>
        Hello {name}, your refund request for <strong>{eventTitle}</strong> has been approved and
        dispatched to your original payment method.
      </Text>

      {/* Refund Breakdown Box */}
      <Section style={summaryCard}>
        <div style={refundPill}>Credit in Progress</div>
        <div style={amountDisplay}>{amountFormatted}</div>
        <Text style={summarySub}>Dispatched to Source Payment Channel</Text>

        <div style={detailsBox}>
          <table width="100%" cellPadding="5" cellSpacing="0" style={tableStyle}>
            <tbody>
              <tr>
                <td style={labelCell}>Refund ID:</td>
                <td style={monoValCell}>{refundId}</td>
              </tr>
              {paymentId && (
                <tr>
                  <td style={labelCell}>Original Payment:</td>
                  <td style={monoValCell}>{paymentId}</td>
                </tr>
              )}
              {registrationCode && (
                <tr>
                  <td style={labelCell}>Pass Code:</td>
                  <td style={monoValCell}>{registrationCode}</td>
                </tr>
              )}
              {reason && (
                <tr>
                  <td style={labelCell}>Reason / Memo:</td>
                  <td style={valCell}>{reason}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Bank timeline card */}
      <Section style={timelineBox}>
        <Text style={timelineHeading}>When will the money arrive?</Text>
        <Text style={timelineText}>
          Most UPI and Netbanking refunds reflect within <strong>24–48 hours</strong>. Credit and
          Debit card transactions typically take <strong>5–7 business days</strong> depending on
          your issuing bank&apos;s clearing cycle.
        </Text>
      </Section>

      <Text style={closingNote}>
        If the funds do not reflect in your account after 7 business days, please quote Refund ID{" "}
        <strong style={{ color: "#f1f5f9" }}>{refundId}</strong> to your bank or contact our support
        desk at passes@kailshiansx.com.
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

const summaryCard: React.CSSProperties = {
  backgroundColor: "#0d1b18",
  border: "1px solid #065f46",
  borderRadius: "14px",
  padding: "24px 20px",
  textAlign: "center",
  marginBottom: "24px",
};

const refundPill: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#10b98122",
  color: "#34d399",
  border: "1px solid #10b98144",
  padding: "3px 12px",
  borderRadius: "9999px",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const amountDisplay: React.CSSProperties = {
  fontSize: "30px",
  fontWeight: 900,
  color: "#ffffff",
  margin: "12px 0 4px 0",
};

const summarySub: React.CSSProperties = {
  fontSize: "12px",
  color: "#6ee7b7",
  margin: "0 0 16px 0",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#06221c",
  border: "1px solid #04785744",
  borderRadius: "10px",
  padding: "12px 16px",
  textAlign: "left",
};

const tableStyle: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: 1.5,
};

const labelCell: React.CSSProperties = {
  color: "#94a3b8",
  fontWeight: 500,
  padding: "4px 0",
  width: "40%",
};

const valCell: React.CSSProperties = {
  color: "#f1f5f9",
  fontWeight: 600,
  padding: "4px 0",
  textAlign: "right",
};

const monoValCell: React.CSSProperties = {
  color: "#34d399",
  fontFamily: "ui-monospace, Menlo, monospace",
  fontWeight: 600,
  padding: "4px 0",
  textAlign: "right",
  fontSize: "12px",
};

const timelineBox: React.CSSProperties = {
  backgroundColor: "#131b2e",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "18px 20px",
  marginBottom: "24px",
};

const timelineHeading: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#f1f5f9",
  margin: "0 0 8px 0",
};

const timelineText: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: 1.6,
  color: "#94a3b8",
  margin: 0,
};

const closingNote: React.CSSProperties = {
  fontSize: "12px",
  color: "#64748b",
  lineHeight: 1.5,
  textAlign: "center",
  margin: "20px 0 0 0",
};
