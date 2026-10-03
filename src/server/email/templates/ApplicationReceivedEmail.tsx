// src/server/email/templates/ApplicationReceivedEmail.tsx
// React Email template: Application received confirmation for Campus Leads, State Leads, and Core Team openings.

import * as React from "react";
import { Section, Heading, Text } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

export interface ApplicationReceivedEmailProps {
  name: string;
  applicationType: "CAMPUS_LEAD" | "STATE_LEAD" | "TEAM";
  referenceId: string;
  roleOrJurisdiction: string;
  city?: string | null;
}

const TYPE_CONFIG = {
  CAMPUS_LEAD: {
    badge: "Campus Lead Dossier",
    badgeColor: "#3b82f6",
    title: "Campus Lead Application Logged",
    roleLabel: "Institution",
    workflow: [
      { step: "1. Applied (Current)", desc: "Application logged into our campus review board" },
      {
        step: "2. Screening",
        desc: "Verification of academic standing, club credentials & tech profile",
      },
      {
        step: "3. 1:1 Video Interview",
        desc: "Discussion on campus goals, developer club sync & chapter vision",
      },
      { step: "4. Selected", desc: "Welcome kit, chapter charter, Slack channel & official badge" },
      { step: "5. Active Lead", desc: "Host meetups, hackathons & student tech workshops" },
    ],
  },
  STATE_LEAD: {
    badge: "State Lead Dossier",
    badgeColor: "#8b5cf6",
    title: "State Lead Application Logged",
    roleLabel: "Jurisdiction State",
    workflow: [
      { step: "1. Applied (Current)", desc: "Executive submission under leadership review" },
      {
        step: "2. Executive Screening",
        desc: "Assessment of regional track record and community leadership",
      },
      { step: "3. Strategic Interview", desc: "Call with Founder and Core Ecosystem Leads" },
      {
        step: "4. Selection & Charter",
        desc: "State jurisdiction assignment, budget allocations & credentials",
      },
      {
        step: "5. Active State Lead",
        desc: "Empower campus leads, regional sponsors & meetup series",
      },
    ],
  },
  TEAM: {
    badge: "Team Opening Application",
    badgeColor: "#06b6d4",
    title: "Team Application Received",
    roleLabel: "Role Opening",
    workflow: [
      { step: "1. New (Current)", desc: "Application submitted and assigned to Area Lead" },
      { step: "2. Reviewing", desc: "Portfolio, GitHub, and past contributions audit" },
      { step: "3. Interview", desc: "Technical discussion or culture fit conversation" },
      { step: "4. Selected", desc: "Onboarding into KailshiansX Core Team with ownership area" },
    ],
  },
};

export function ApplicationReceivedEmail({
  name,
  applicationType,
  referenceId,
  roleOrJurisdiction,
  city,
}: ApplicationReceivedEmailProps) {
  const config = TYPE_CONFIG[applicationType] || TYPE_CONFIG.TEAM;

  return (
    <BaseLayout
      previewText={`We have received your application for ${roleOrJurisdiction}. Reference: ${referenceId}`}
      badgeText={config.badge}
      badgeColor={config.badgeColor}
    >
      <Heading as="h1" style={titleHeading}>
        Application Received, {name}!
      </Heading>
      <Text style={introParagraph}>
        Thank you for applying to build with <strong>KailshiansX</strong>. Your dossier has been
        logged into our pipeline and assigned a unique reference.
      </Text>

      {/* Reference Card */}
      <Section style={refCard}>
        <div style={refLabel}>Application Reference</div>
        <div style={refCode}>{referenceId}</div>
        <div style={refSub}>
          <span>{config.roleLabel}:</span> <strong>{roleOrJurisdiction}</strong>
          {city && <span> • {city}</span>}
        </div>
      </Section>

      {/* Workflow Timeline */}
      <Section style={workflowBox}>
        <Text style={workflowTitle}>Evaluation Pipeline Stages:</Text>
        <div style={timelineContainer}>
          {config.workflow.map((item, idx) => (
            <div key={idx} style={stepRow}>
              <div style={stepHeader}>{item.step}</div>
              <div style={stepDesc}>{item.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      <Text style={closingNote}>
        Our review committee processes submissions weekly. You will receive an email update whenever
        your application status advances.
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

const refCard: React.CSSProperties = {
  backgroundColor: "#0b1120",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "20px",
  textAlign: "center",
  marginBottom: "24px",
};

const refLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "#64748b",
  marginBottom: "6px",
};

const refCode: React.CSSProperties = {
  fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
  fontSize: "22px",
  fontWeight: 900,
  letterSpacing: "1px",
  color: "#38bdf8",
  marginBottom: "8px",
};

const refSub: React.CSSProperties = {
  fontSize: "13px",
  color: "#94a3b8",
};

const workflowBox: React.CSSProperties = {
  backgroundColor: "#131b2e",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "18px 20px",
  marginBottom: "24px",
};

const workflowTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#f1f5f9",
  margin: "0 0 14px 0",
};

const timelineContainer: React.CSSProperties = {
  borderLeft: "2px solid #3b82f6",
  paddingLeft: "16px",
  margin: "4px 0",
};

const stepRow: React.CSSProperties = {
  marginBottom: "12px",
};

const stepHeader: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#f1f5f9",
  marginBottom: "2px",
};

const stepDesc: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  lineHeight: 1.4,
};

const closingNote: React.CSSProperties = {
  fontSize: "12px",
  color: "#64748b",
  lineHeight: 1.5,
  textAlign: "center",
  margin: "20px 0 0 0",
};
