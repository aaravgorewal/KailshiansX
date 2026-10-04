// src/server/email/templates/LeadOnboardingEmail.tsx
// React Email template: Onboarding sequence for newly selected/activated Campus and State Leads.

import * as React from "react";
import { Section, Heading, Text, Link } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

export interface LeadOnboardingEmailProps {
  name: string;
  leadType: "CAMPUS_LEAD" | "STATE_LEAD";
  collegeOrState: string;
  referralCode: string;
  dashboardUrl?: string;
  handbookUrl?: string;
  discordUrl?: string;
}

export function LeadOnboardingEmail({
  name,
  leadType,
  collegeOrState,
  referralCode,
  dashboardUrl = "https://kailshiansx.com/lead",
  handbookUrl = "https://kailshiansx.com/docs/lead-handbook",
  discordUrl = "https://discord.gg/kailshiansx",
}: LeadOnboardingEmailProps) {
  const isCampus = leadType === "CAMPUS_LEAD";
  const roleTitle = isCampus ? "Campus Lead" : "State Lead";
  const scopeLabel = isCampus ? "Campus Jurisdiction" : "Assigned State";
  const referralLink = `https://kailshiansx.com/events?ref=${encodeURIComponent(referralCode)}`;

  return (
    <BaseLayout
      previewText={`Welcome to KailshiansX Leadership: ${roleTitle} for ${collegeOrState}`}
    >
      {/* Header Badge */}
      <Section style={{ textAlign: "center", marginBottom: "20px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: "20px",
            backgroundColor: isCampus ? "rgba(59, 130, 246, 0.15)" : "rgba(139, 92, 246, 0.15)",
            border: `1px solid ${isCampus ? "rgba(59, 130, 246, 0.3)" : "rgba(139, 92, 246, 0.3)"}`,
            color: isCampus ? "#60a5fa" : "#a78bfa",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Official Appointment · {roleTitle}
        </span>
      </Section>

      <Heading
        as="h2"
        style={{
          color: "#ffffff",
          fontSize: "24px",
          fontWeight: 800,
          textAlign: "center",
          margin: "0 0 12px 0",
          letterSpacing: "-0.02em",
        }}
      >
        Welcome to the Core, {name}!
      </Heading>

      <Text
        style={{
          color: "#a1a1aa",
          fontSize: "15px",
          lineHeight: "24px",
          textAlign: "center",
          margin: "0 0 28px 0",
        }}
      >
        You have been officially chartered as the <strong>{roleTitle}</strong> representing
        KailshiansX for <span style={{ color: "#ffffff", fontWeight: 600 }}>{collegeOrState}</span>.
        You are now the pioneer driving developer culture, technical workshops, and hackathons in
        your region.
      </Text>

      {/* Scope Details & Referral Card */}
      <Section
        style={{
          backgroundColor: "#18181b",
          border: "1px solid #27272a",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
          <div>
            <div
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                color: "#71717a",
                fontWeight: 700,
              }}
            >
              {scopeLabel}
            </div>
            <div style={{ fontSize: "15px", color: "#ffffff", fontWeight: 700, marginTop: "2px" }}>
              {collegeOrState}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                color: "#71717a",
                fontWeight: 700,
              }}
            >
              Leader Status
            </div>
            <div style={{ fontSize: "13px", color: "#34d399", fontWeight: 700, marginTop: "2px" }}>
              ● ACTIVE
            </div>
          </div>
        </div>

        {/* Unique Referral Code */}
        <div
          style={{
            backgroundColor: "#09090b",
            border: "1px dashed #3f3f46",
            borderRadius: "12px",
            padding: "14px 16px",
            marginTop: "12px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              color: "#f59e0b",
              fontWeight: 700,
            }}
          >
            Your Official Ambassador Referral Code
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "18px",
              fontWeight: 800,
              color: "#fbbf24",
              marginTop: "4px",
              letterSpacing: "0.05em",
            }}
          >
            {referralCode}
          </div>
          <div style={{ fontSize: "12px", color: "#a1a1aa", marginTop: "4px" }}>
            Share your link:{" "}
            <Link
              href={referralLink}
              style={{ color: "#60a5fa", textDecoration: "underline", wordBreak: "break-all" }}
            >
              {referralLink}
            </Link>
          </div>
        </div>
      </Section>

      {/* 30-Day Onboarding Roadmap */}
      <Section style={{ marginBottom: "28px" }}>
        <Heading
          as="h3"
          style={{
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: 700,
            margin: "0 0 16px 0",
          }}
        >
          Your First 30 Days Playbook
        </Heading>

        <div style={{ borderLeft: "2px solid #3f3f46", paddingLeft: "16px", marginLeft: "4px" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "13px" }}>
              Week 1: Chapter Setup & Handbooks
            </div>
            <div style={{ color: "#a1a1aa", fontSize: "12px", marginTop: "2px" }}>
              Review the Lead Handbook, join the regional coordinator Discord channel, and bookmark
              your Lead Dashboard.
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "13px" }}>
              Week 2: Community Outreach & Social Buzz
            </div>
            <div style={{ color: "#a1a1aa", fontSize: "12px", marginTop: "2px" }}>
              Post about your appointment on LinkedIn/X, distribute event posters, and share your
              referral code with peer builders.
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "13px" }}>
              Week 3: Mobilize Event Participation
            </div>
            <div style={{ color: "#a1a1aa", fontSize: "12px", marginTop: "2px" }}>
              Coordinate attendance for upcoming workshops or hackathons, organize campus watch
              parties or study circles.
            </div>
          </div>

          <div>
            <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "13px" }}>
              Week 4: Log Activities & Submit First Monthly Report
            </div>
            <div style={{ color: "#a1a1aa", fontSize: "12px", marginTop: "2px" }}>
              Log your hours, outreach events, and submit your monthly retrospective to earn
              leadership performance badges.
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Buttons */}
      <Section style={{ textAlign: "center", marginBottom: "24px" }}>
        <Link
          href={dashboardUrl}
          style={{
            display: "inline-block",
            backgroundColor: "#f59e0b",
            color: "#000000",
            padding: "14px 28px",
            borderRadius: "12px",
            fontWeight: 800,
            fontSize: "14px",
            textDecoration: "none",
            marginRight: "10px",
          }}
        >
          Open Lead Dashboard →
        </Link>

        <Link
          href={discordUrl}
          style={{
            display: "inline-block",
            backgroundColor: "#27272a",
            color: "#ffffff",
            padding: "14px 24px",
            borderRadius: "12px",
            fontWeight: 700,
            fontSize: "14px",
            textDecoration: "none",
            marginRight: "10px",
          }}
        >
          Join Leader Channel
        </Link>

        {handbookUrl && (
          <Link
            href={handbookUrl}
            style={{
              display: "inline-block",
              backgroundColor: "transparent",
              border: "1px solid #3f3f46",
              color: "#a1a1aa",
              padding: "14px 20px",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "13px",
              textDecoration: "none",
              marginTop: "8px",
            }}
          >
            Read Handbook
          </Link>
        )}
      </Section>
    </BaseLayout>
  );
}
