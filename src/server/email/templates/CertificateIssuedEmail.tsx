// src/server/email/templates/CertificateIssuedEmail.tsx
// React Email template: Certificate of Achievement notification with unique credential ID and verification link.

import * as React from "react";
import { Section, Heading, Text, Link } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

export interface CertificateIssuedEmailProps {
  name: string;
  eventTitle: string;
  uniqueId: string;
  verificationUrl: string;
  issuedAt?: string | Date;
  downloadUrl?: string;
}

export function CertificateIssuedEmail({
  name,
  eventTitle,
  uniqueId,
  verificationUrl,
  issuedAt = new Date(),
  downloadUrl,
}: CertificateIssuedEmailProps) {
  const d = new Date(issuedAt);
  const dateFormatted = d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <BaseLayout
      previewText={`Your official certificate for ${eventTitle} is ready! Credential ID: ${uniqueId}`}
      badgeText="Certificate Issued"
      badgeColor="#38bdf8"
    >
      <Heading as="h1" style={titleHeading}>
        Congratulations {name}! 🎓
      </Heading>
      <Text style={introParagraph}>
        Your official Certificate of Achievement for <strong>{eventTitle}</strong> has been
        cryptographically signed and issued by KailshiansX.
      </Text>

      {/* Credential Card */}
      <Section style={credentialCard}>
        <div style={badgePill}>Official Credential</div>
        <div style={idDisplay}>{uniqueId}</div>
        <Text style={credentialSubtext}>Verified Proof of Attendance &amp; Mastery</Text>

        <div style={infoGrid}>
          <table width="100%" cellPadding="6" cellSpacing="0" style={tableStyle}>
            <tbody>
              <tr>
                <td style={labelCell}>Recipient:</td>
                <td style={valCell}>{name}</td>
              </tr>
              <tr>
                <td style={labelCell}>Event:</td>
                <td style={valCell}>{eventTitle}</td>
              </tr>
              <tr>
                <td style={labelCell}>Date Issued:</td>
                <td style={valCell}>{dateFormatted}</td>
              </tr>
              <tr>
                <td style={labelCell}>Status:</td>
                <td style={{ ...valCell, color: "#10b981", fontWeight: 700 }}>
                  ✓ Cryptographically Verified
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* Action Buttons */}
      <Section style={buttonContainer}>
        <Link href={verificationUrl} style={primaryButton}>
          View &amp; Verify Certificate
        </Link>
        {downloadUrl && (
          <Link href={downloadUrl} style={secondaryButton}>
            Download PDF
          </Link>
        )}
      </Section>

      <Text style={verificationNotice}>
        Employers, universities, and partners can independently verify the authenticity of this
        certificate at any time by entering ID <span style={monoCode}>{uniqueId}</span> at{" "}
        <Link href={verificationUrl} style={inlineLink}>
          kailshiansx.com/verify
        </Link>
        .
      </Text>
    </BaseLayout>
  );
}

const titleHeading: React.CSSProperties = {
  fontSize: "24px",
  lineHeight: "32px",
  fontWeight: "800",
  color: "#f8fafc",
  margin: "0 0 16px",
  letterSpacing: "-0.02em",
};

const introParagraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#cbd5e1",
  margin: "0 0 24px",
};

const credentialCard: React.CSSProperties = {
  backgroundColor: "#090d16",
  border: "1px solid #1e293b",
  borderRadius: "16px",
  padding: "24px 20px",
  textAlign: "center",
  margin: "0 0 24px",
};

const badgePill: React.CSSProperties = {
  display: "inline-block",
  fontSize: "11px",
  fontWeight: "700",
  color: "#38bdf8",
  backgroundColor: "rgba(56, 189, 248, 0.1)",
  border: "1px solid rgba(56, 189, 248, 0.2)",
  padding: "3px 12px",
  borderRadius: "9999px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "12px",
};

const idDisplay: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "20px",
  fontWeight: "800",
  color: "#ffffff",
  letterSpacing: "0.06em",
  marginBottom: "4px",
};

const credentialSubtext: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "0 0 18px",
};

const infoGrid: React.CSSProperties = {
  backgroundColor: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "12px",
  textAlign: "left",
};

const tableStyle: React.CSSProperties = {
  borderCollapse: "collapse",
};

const labelCell: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "600",
  width: "35%",
};

const valCell: React.CSSProperties = {
  color: "#f1f5f9",
  fontSize: "13px",
  fontWeight: "500",
};

const buttonContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "28px 0 20px",
};

const primaryButton: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#0284c7",
  color: "#ffffff",
  fontWeight: "700",
  fontSize: "14px",
  padding: "12px 28px",
  borderRadius: "12px",
  textDecoration: "none",
  margin: "0 8px 10px 0",
};

const secondaryButton: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#1e293b",
  color: "#e2e8f0",
  fontWeight: "600",
  fontSize: "14px",
  padding: "12px 24px",
  borderRadius: "12px",
  border: "1px solid #334155",
  textDecoration: "none",
  margin: "0 0 10px",
};

const verificationNotice: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "18px",
  color: "#64748b",
  borderTop: "1px solid #1e293b",
  paddingTop: "16px",
  marginTop: "16px",
};

const monoCode: React.CSSProperties = {
  fontFamily: "monospace",
  color: "#38bdf8",
  fontWeight: "700",
};

const inlineLink: React.CSSProperties = {
  color: "#38bdf8",
  textDecoration: "underline",
};
