// src/server/email/templates/PostEventFeedbackNextStepEmail.tsx
// React Email template: Post-event feedback prompt and "Next Step" CTAs (Volunteer, Lead, Speaker).

import * as React from "react";
import { Section, Heading, Text, Link } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

export interface PostEventFeedbackNextStepEmailProps {
  attendeeName: string;
  eventTitle: string;
  eventSlug: string;
  certificateUrl?: string | null;
  feedbackUrl?: string;
  volunteerUrl?: string;
  campusLeadUrl?: string;
  stateLeadUrl?: string;
  speakerUrl?: string;
}

export function PostEventFeedbackNextStepEmail({
  attendeeName,
  eventTitle,
  eventSlug,
  certificateUrl,
  feedbackUrl,
  volunteerUrl = "https://kailshiansx.com/collaborations",
  campusLeadUrl = "https://kailshiansx.com/campus-leads",
  stateLeadUrl = "https://kailshiansx.com/state-leads",
  speakerUrl = "https://kailshiansx.com/collaborations",
}: PostEventFeedbackNextStepEmailProps) {
  const resolvedFeedbackUrl =
    feedbackUrl || `https://kailshiansx.com/events/${eventSlug}?feedback=1`;

  return (
    <BaseLayout
      previewText={`Thank you for attending ${eventTitle} — Share feedback & choose your next step!`}
    >
      {/* Header Badge */}
      <Section style={{ textAlign: "center", marginBottom: "20px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: "20px",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#34d399",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Event Concluded · Thank You!
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
        }}
      >
        You were part of something electric, {attendeeName}!
      </Heading>

      <Text
        style={{
          color: "#a1a1aa",
          fontSize: "15px",
          lineHeight: "24px",
          textAlign: "center",
          margin: "0 0 24px 0",
        }}
      >
        Thank you for being an active builder at <strong>{eventTitle}</strong>. We hope you
        discovered fresh paradigms, met incredible collaborators, and leveled up your engineering
        craft.
      </Text>

      {/* Certificate Callout if available */}
      {certificateUrl && (
        <Section
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "14px",
            padding: "16px 20px",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>
            🎓 Your Verifiable Certificate is Ready
          </div>
          <div style={{ color: "#d4d4d8", fontSize: "12px", marginBottom: "12px" }}>
            Add your credential to LinkedIn and download the cryptographically signed PDF.
          </div>
          <Link
            href={certificateUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#f59e0b",
              color: "#000000",
              padding: "10px 20px",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "12px",
              textDecoration: "none",
            }}
          >
            Claim Your Certificate →
          </Link>
        </Section>
      )}

      {/* Feedback Prompt */}
      <Section
        style={{
          backgroundColor: "#18181b",
          border: "1px solid #27272a",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "28px",
          textAlign: "center",
        }}
      >
        <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "15px", marginBottom: "8px" }}>
          How was your experience?
        </div>
        <div
          style={{ color: "#a1a1aa", fontSize: "13px", lineHeight: "20px", marginBottom: "16px" }}
        >
          Help us sharpen future editions. Takes less than 2 minutes to share your thoughts and rate
          speakers.
        </div>
        <Link
          href={resolvedFeedbackUrl}
          style={{
            display: "inline-block",
            backgroundColor: "#27272a",
            color: "#ffffff",
            border: "1px solid #3f3f46",
            padding: "12px 24px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          Submit Event Feedback ★★★★★
        </Link>
      </Section>

      {/* NEXT STEP CTAs */}
      <Section style={{ marginBottom: "28px" }}>
        <Heading
          as="h3"
          style={{
            color: "#ffffff",
            fontSize: "17px",
            fontWeight: 800,
            textAlign: "center",
            margin: "0 0 6px 0",
          }}
        >
          Choose Your Next Step in KailshiansX
        </Heading>
        <Text
          style={{
            color: "#a1a1aa",
            fontSize: "13px",
            textAlign: "center",
            margin: "0 0 20px 0",
          }}
        >
          Don&apos;t just attend — shape the developer movement in your college, city, or state.
        </Text>

        {/* 3 CTA Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* CTA 1: Volunteer */}
          <div
            style={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "10px",
            }}
          >
            <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "14px" }}>
              🤝 1. Become an Event Volunteer
            </div>
            <div
              style={{ color: "#a1a1aa", fontSize: "12px", marginTop: "4px", marginBottom: "8px" }}
            >
              Join the ground team managing attendee check-in, speaker hospitality, stage AV, or
              hackathon judging.
            </div>
            <Link
              href={volunteerUrl}
              style={{
                color: "#38bdf8",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Sign Up as Volunteer →
            </Link>
          </div>

          {/* CTA 2: Campus or State Lead */}
          <div
            style={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "10px",
            }}
          >
            <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: "14px" }}>
              🚀 2. Apply to Become a Campus or State Lead
            </div>
            <div
              style={{ color: "#a1a1aa", fontSize: "12px", marginTop: "4px", marginBottom: "8px" }}
            >
              Represent KailshiansX on your campus or coordinate regional meetups across your state.
              Get chartered, earn leadership credits, and unlock exclusive sponsor swag.
            </div>
            <div style={{ display: "flex", gap: "14px" }}>
              <Link
                href={campusLeadUrl}
                style={{
                  color: "#a78bfa",
                  fontSize: "12px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Apply for Campus Lead →
              </Link>
              <Link
                href={stateLeadUrl}
                style={{
                  color: "#c084fc",
                  fontSize: "12px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Apply for State Lead →
              </Link>
            </div>
          </div>

          {/* CTA 3: Speaker / Tech Talk */}
          <div
            style={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "14px",
              padding: "16px",
            }}
          >
            <div style={{ color: "#34d399", fontWeight: 700, fontSize: "14px" }}>
              🎙️ 3. Propose a Tech Talk / Become a Speaker
            </div>
            <div
              style={{ color: "#a1a1aa", fontSize: "12px", marginTop: "4px", marginBottom: "8px" }}
            >
              Share your deep-dive expertise in AI, System Design, Rust, or DevOps with thousands of
              ambitious engineers.
            </div>
            <Link
              href={speakerUrl}
              style={{
                color: "#34d399",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Submit Speaker Proposal →
            </Link>
          </div>
        </div>
      </Section>
    </BaseLayout>
  );
}
