// src/server/email/templates/LeadInactivityNudgeEmail.tsx
// React Email template: Inactivity nudge for leads with no logged activity in >30 days.

import * as React from "react";
import { Section, Heading, Text, Link } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

export interface LeadInactivityNudgeEmailProps {
  name: string;
  leadType: "CAMPUS_LEAD" | "STATE_LEAD";
  collegeOrState: string;
  daysInactive: number;
  referralCode?: string | null;
  dashboardUrl?: string;
}

export function LeadInactivityNudgeEmail({
  name,
  leadType,
  collegeOrState,
  daysInactive,
  referralCode,
  dashboardUrl = "https://kailshiansx.com/lead",
}: LeadInactivityNudgeEmailProps) {
  const isCampus = leadType === "CAMPUS_LEAD";
  const roleTitle = isCampus ? "Campus Lead" : "State Lead";

  return (
    <BaseLayout previewText={`Checking in on your KailshiansX Chapter (${collegeOrState})`}>
      {/* Header Warning/Notice Badge */}
      <Section style={{ textAlign: "center", marginBottom: "20px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: "20px",
            backgroundColor: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#fbbf24",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Leadership Check-in · {daysInactive} Days Since Last Update
        </span>
      </Section>

      <Heading
        as="h2"
        style={{
          color: "#ffffff",
          fontSize: "22px",
          fontWeight: 800,
          textAlign: "center",
          margin: "0 0 12px 0",
        }}
      >
        How are things going at {collegeOrState}, {name}?
      </Heading>

      <Text
        style={{
          color: "#a1a1aa",
          fontSize: "14px",
          lineHeight: "22px",
          textAlign: "center",
          margin: "0 0 24px 0",
        }}
      >
        We noticed that no campus outreach activities or monthly reports have been recorded on your{" "}
        {roleTitle} dashboard in the past <strong>{daysInactive} days</strong>. Our leadership team
        is here to support you in reigniting momentum!
      </Text>

      {/* Suggested Quick Wins Card */}
      <Section
        style={{
          backgroundColor: "#18181b",
          border: "1px solid #27272a",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "14px", marginBottom: "12px" }}>
          ⚡ 3 Quick Ways to Reactivate Your Chapter This Week:
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ color: "#38bdf8", fontWeight: 600, fontSize: "13px" }}>
            1. Share Upcoming Hackathon & Workshop Dates
          </div>
          <div style={{ color: "#a1a1aa", fontSize: "12px", marginTop: "2px" }}>
            Use your referral code {referralCode ? `(${referralCode})` : ""} to invite classmates to
            upcoming NirmanX & regional meetups.
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ color: "#34d399", fontWeight: 600, fontSize: "13px" }}>
            2. Host a 45-Min College Info Session
          </div>
          <div style={{ color: "#a1a1aa", fontSize: "12px", marginTop: "2px" }}>
            Book an empty classroom or college lab to introduce KailshiansX, open-source tracks, and
            Dev Passport perks.
          </div>
        </div>

        <div>
          <div style={{ color: "#f43f5e", fontWeight: 600, fontSize: "13px" }}>
            3. Log Past Informal Activities & Submit Your Report
          </div>
          <div style={{ color: "#a1a1aa", fontSize: "12px", marginTop: "2px" }}>
            If you have already held informal discussions or shared flyers, record them on your
            dashboard to boost your performance score.
          </div>
        </div>
      </Section>

      {/* CTA Button */}
      <Section style={{ textAlign: "center", marginBottom: "20px" }}>
        <Link
          href={dashboardUrl}
          style={{
            display: "inline-block",
            backgroundColor: "#f59e0b",
            color: "#000000",
            padding: "13px 26px",
            borderRadius: "12px",
            fontWeight: 800,
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          Go to Lead Dashboard & Log Activity →
        </Link>
      </Section>
    </BaseLayout>
  );
}
