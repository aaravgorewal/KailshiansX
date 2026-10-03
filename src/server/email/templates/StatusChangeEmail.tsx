// src/server/email/templates/StatusChangeEmail.tsx
// React Email template: Application status-change update for Campus Lead, State Lead, and Team applicants.

import * as React from "react";
import { Section, Heading, Text, Link } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

export interface StatusChangeEmailProps {
  name: string;
  applicationType: "CAMPUS_LEAD" | "STATE_LEAD" | "TEAM";
  referenceId: string;
  roleOrJurisdiction: string;
  newStatus: string;
  reviewNotes?: string | null;
  actionUrl?: string;
}

const STATUS_THEMES: Record<
  string,
  { label: string; color: string; badge: string; headline: string; instructions: string }
> = {
  SCREENING: {
    label: "Under Screening",
    color: "#06b6d4",
    badge: "Stage Advanced: Screening",
    headline: "Your application is under active screening",
    instructions:
      "Our team is reviewing your profile, credentials, and past work. You may be contacted for quick clarifications.",
  },
  REVIEWING: {
    label: "Under Review",
    color: "#06b6d4",
    badge: "Stage Advanced: Reviewing",
    headline: "Your dossier is currently being reviewed",
    instructions:
      "Our team is evaluating your portfolio, GitHub repositories, and past community contributions.",
  },
  INTERVIEW: {
    label: "Interview Scheduled",
    color: "#8b5cf6",
    badge: "Stage Advanced: Interview",
    headline: "Congratulations! You have been shortlisted for an interview",
    instructions:
      "We were impressed by your profile and would love to meet you 1:1 on video call to discuss vision and fit. Check your calendar or reply to coordinate timing.",
  },
  SELECTED: {
    label: "Selected / Accepted",
    color: "#10b981",
    badge: "Official Selection",
    headline: "Welcome to the KailshiansX Core Family! 🎉",
    instructions:
      "We are delighted to formally confirm your selection! You will receive onboarding materials, community credentials, and invitation to our private workspace.",
  },
  REJECTED: {
    label: "Application Concluded",
    color: "#64748b",
    badge: "Application Update",
    headline: "Update regarding your application",
    instructions:
      "Thank you for your interest and effort. While we cannot offer this position at this time due to high competition, we encourage you to stay active in the community and reapply in future cycles.",
  },
};

export function StatusChangeEmail({
  name,
  applicationType,
  referenceId,
  roleOrJurisdiction,
  newStatus,
  reviewNotes,
  actionUrl,
}: StatusChangeEmailProps) {
  const normStatus = newStatus.toUpperCase();
  const theme = STATUS_THEMES[normStatus] || {
    label: newStatus,
    color: "#3b82f6",
    badge: "Status Updated",
    headline: `Your application status changed to ${newStatus}`,
    instructions: "Your dossier status has been updated in our system.",
  };

  const typeName =
    applicationType === "CAMPUS_LEAD"
      ? "Campus Lead"
      : applicationType === "STATE_LEAD"
        ? "State Lead"
        : "Core Team";

  return (
    <BaseLayout
      previewText={`Application status update for ${typeName} (${referenceId}): Now ${theme.label}`}
      badgeText={theme.badge}
      badgeColor={theme.color}
    >
      <Heading as="h1" style={titleHeading}>
        {theme.headline}
      </Heading>
      <Text style={introParagraph}>
        Hello {name}, this is an automated update regarding your application for the{" "}
        <strong>{typeName}</strong> track ({roleOrJurisdiction}).
      </Text>

      {/* Status Box */}
      <Section style={statusCard}>
        <div
          style={{
            ...statusPill,
            backgroundColor: `${theme.color}20`,
            color: theme.color,
            borderColor: `${theme.color}40`,
          }}
        >
          Current Stage
        </div>
        <div style={{ ...statusDisplay, color: theme.color }}>{theme.label}</div>
        <div style={refDisplay}>Reference: {referenceId}</div>

        {reviewNotes && (
          <div style={notesBox}>
            <Text style={notesLabel}>Committee Note:</Text>
            <Text style={notesContent}>{reviewNotes}</Text>
          </div>
        )}
      </Section>

      {/* Next Steps Guidance */}
      <Section style={guidanceBox}>
        <Text style={guidanceHeading}>Next Steps:</Text>
        <Text style={guidanceText}>{theme.instructions}</Text>
      </Section>

      {actionUrl && (
        <Section style={ctaSection}>
          <Link href={actionUrl} style={ctaButton}>
            View Application Dossier
          </Link>
        </Section>
      )}

      <Text style={closingNote}>
        If you have any questions or schedule updates, reply directly to this email and our
        community coordinators will get back to you.
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

const statusCard: React.CSSProperties = {
  backgroundColor: "#0b1120",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "24px 20px",
  textAlign: "center",
  marginBottom: "24px",
};

const statusPill: React.CSSProperties = {
  display: "inline-block",
  padding: "3px 12px",
  borderRadius: "9999px",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  border: "1px solid",
};

const statusDisplay: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 900,
  margin: "12px 0 4px 0",
  letterSpacing: "-0.5px",
};

const refDisplay: React.CSSProperties = {
  fontSize: "12px",
  fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
  color: "#64748b",
};

const notesBox: React.CSSProperties = {
  backgroundColor: "#131b2e",
  border: "1px solid #1e293b",
  borderRadius: "8px",
  padding: "12px 14px",
  marginTop: "16px",
  textAlign: "left",
};

const notesLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  color: "#94a3b8",
  margin: "0 0 4px 0",
};

const notesContent: React.CSSProperties = {
  fontSize: "13px",
  color: "#f1f5f9",
  lineHeight: 1.5,
  margin: 0,
};

const guidanceBox: React.CSSProperties = {
  backgroundColor: "#131b2e",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "18px 20px",
  marginBottom: "24px",
};

const guidanceHeading: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#f1f5f9",
  margin: "0 0 8px 0",
};

const guidanceText: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: 1.6,
  color: "#94a3b8",
  margin: 0,
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
