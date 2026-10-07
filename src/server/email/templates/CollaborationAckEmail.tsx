// src/server/email/templates/CollaborationAckEmail.tsx
// React Email template: Auto-acknowledgement for institutional, community, and corporate partnership leads.

import * as React from "react";
import { Section, Heading, Text, Link } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

export interface CollaborationAckEmailProps {
  name: string;
  organisation: string;
  type: "COLLEGE" | "COMMUNITY" | "VENUE" | "SPONSOR";
  referenceCode: string;
  city: string;
  proposedScope: string;
  resourcesOffered: string;
}

const TYPE_TITLES: Record<string, string> = {
  COLLEGE: "College Collaboration",
  COMMUNITY: "Community Partner",
  VENUE: "Venue Partner",
  SPONSOR: "Sponsor / Brand Partner",
};

export function CollaborationAckEmail({
  name,
  organisation,
  type,
  referenceCode,
  city,
  proposedScope,
  resourcesOffered,
}: CollaborationAckEmailProps) {
  const typeLabel = TYPE_TITLES[type] || "Partnership";

  return (
    <BaseLayout
      previewText={`Partnership proposal received from ${organisation} (${referenceCode}).`}
      badgeText={typeLabel}
      badgeColor="#06b6d4"
    >
      <Heading as="h1" style={titleHeading}>
        Partnership Proposal Received
      </Heading>
      <Text style={introParagraph}>
        Dear {name}, thank you for proposing an alliance between <strong>{organisation}</strong> and{" "}
        <strong>KailshiansX</strong>. Your dossier has been logged into our institutional CRM.
      </Text>

      {/* Summary Box */}
      <Section style={summaryCard}>
        <div style={typePill}>{typeLabel}</div>
        <div style={orgTitle}>{organisation}</div>
        <div style={refText}>Dossier Reference: {referenceCode}</div>

        <div style={detailBox}>
          <table width="100%" cellPadding="4" cellSpacing="0" style={tableStyle}>
            <tbody>
              <tr>
                <td style={labelCell}>Region:</td>
                <td style={valCell}>{city}</td>
              </tr>
              <tr>
                <td style={labelCell}>Proposed Scope:</td>
                <td style={valCell}>{proposedScope}</td>
              </tr>
              <tr>
                <td style={labelCell}>Resources:</td>
                <td style={valCell}>{resourcesOffered}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* Pipeline Stages */}
      <Section style={pipelineBox}>
        <Text style={pipelineHeading}>Partnership Evaluation Roadmap ():</Text>
        <div style={pipelineList}>
          <div style={pipeStep}>
            <strong style={{ color: "#38bdf8" }}>1. New Lead (Current)</strong> — Proposal indexed
            in state/city queue
          </div>
          <div style={pipeStep}>
            <strong>2. Initial Review</strong> — Partnership Lead evaluates alignment &amp; reaches
            out within 24–48 hours
          </div>
          <div style={pipeStep}>
            <strong>3. Alignment Meeting</strong> — Video call to align on dates, capacity,
            curriculum, and mutual value
          </div>
          <div style={pipeStep}>
            <strong>4. Formal Agreement / MoU</strong> — Mutual endorsement, branding rollout &amp;
            asset exchange
          </div>
          <div style={pipeStep}>
            <strong>5. Confirmed &amp; Public</strong> — Event launch, student registrations, and
            execution
          </div>
        </div>
      </Section>

      <Text style={closingNote}>
        For urgent inquiries or fast-tracked event dates, reply directly to this email or contact
        our alliances desk at{" "}
        <Link href="mailto:partnerships@kailshiansx.com" style={{ color: "#38bdf8" }}>
          partnerships@kailshiansx.com
        </Link>
        .
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
  backgroundColor: "#081520",
  border: "1px solid #0e7490",
  borderRadius: "14px",
  padding: "24px 20px",
  textAlign: "center",
  marginBottom: "24px",
};

const typePill: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#06b6d422",
  color: "#22d3ee",
  border: "1px solid #06b6d444",
  padding: "3px 12px",
  borderRadius: "9999px",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const orgTitle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 800,
  color: "#ffffff",
  margin: "12px 0 4px 0",
};

const refText: React.CSSProperties = {
  fontSize: "12px",
  fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
  color: "#38bdf8",
  marginBottom: "16px",
};

const detailBox: React.CSSProperties = {
  backgroundColor: "#031c26",
  border: "1px solid #083344",
  borderRadius: "10px",
  padding: "12px 16px",
  textAlign: "left",
};

const tableStyle: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: 1.5,
};

const labelCell: React.CSSProperties = {
  color: "#64748b",
  fontWeight: 600,
  padding: "4px 0",
  verticalAlign: "top",
  width: "35%",
};

const valCell: React.CSSProperties = {
  color: "#f1f5f9",
  fontWeight: 500,
  padding: "4px 0",
};

const pipelineBox: React.CSSProperties = {
  backgroundColor: "#131b2e",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "18px 20px",
  marginBottom: "24px",
};

const pipelineHeading: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#f1f5f9",
  margin: "0 0 12px 0",
};

const pipelineList: React.CSSProperties = {
  borderLeft: "2px solid #06b6d4",
  paddingLeft: "14px",
};

const pipeStep: React.CSSProperties = {
  fontSize: "12px",
  color: "#cbd5e1",
  marginBottom: "10px",
  lineHeight: 1.4,
};

const closingNote: React.CSSProperties = {
  fontSize: "12px",
  color: "#64748b",
  lineHeight: 1.5,
  textAlign: "center",
  margin: "20px 0 0 0",
};
