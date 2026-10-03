// src/server/email/templates/BaseLayout.tsx
// Centralized React Email Base Layout for all KailshiansX transactional emails.

import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Link,
  Hr,
  Preview,
} from "@react-email/components";

interface BaseLayoutProps {
  previewText?: string;
  badgeText?: string;
  badgeColor?: string;
  children: React.ReactNode;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kailshiansx.com";

export function BaseLayout({
  previewText,
  badgeText = "Developer Ecosystem",
  badgeColor = "#3b82f6",
  children,
}: BaseLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {previewText && <Preview>{previewText}</Preview>}
      <Body style={mainBody}>
        <Container style={container}>
          {/* Header Bar */}
          <Section style={headerSection}>
            <Row>
              <Column align="center">
                <div style={logoWrapper}>
                  <Link href={APP_URL} style={logoLink}>
                    Kailshians<span style={logoAccent}>X</span>
                  </Link>
                </div>
                <div
                  style={{
                    ...badgeStyle,
                    borderColor: `${badgeColor}40`,
                    color: badgeColor,
                    backgroundColor: `${badgeColor}15`,
                  }}
                >
                  {badgeText}
                </div>
              </Column>
            </Row>
          </Section>

          {/* Body Content */}
          <Section style={contentSection}>{children}</Section>

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section style={footerSection}>
            <Text style={footerText}>
              <strong>KailshiansX</strong> • The developer events & community initiative of
              Kailshians Web Services.
            </Text>
            <Text style={footerSubtext}>
              Empowering engineers, campuses, and tech ecosystems across India.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${APP_URL}/events`} style={footerLink}>
                Events
              </Link>
              {" • "}
              <Link href={`${APP_URL}/community`} style={footerLink}>
                Community
              </Link>
              {" • "}
              <Link href={`${APP_URL}/privacy`} style={footerLink}>
                Privacy
              </Link>
              {" • "}
              <Link href="mailto:support@kailshiansx.com" style={footerLink}>
                Support
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const mainBody: React.CSSProperties = {
  backgroundColor: "#07090e",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: "32px 12px",
  color: "#f1f5f9",
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#0f172a",
  borderRadius: "16px",
  border: "1px solid #1e293b",
  overflow: "hidden",
};

const headerSection: React.CSSProperties = {
  background: "linear-gradient(180deg, #131d36 0%, #0f172a 100%)",
  padding: "28px 24px 20px 24px",
  textAlign: "center",
  borderBottom: "1px solid #1e293b",
};

const logoWrapper: React.CSSProperties = {
  marginBottom: "8px",
};

const logoLink: React.CSSProperties = {
  fontSize: "26px",
  fontWeight: 900,
  color: "#ffffff",
  letterSpacing: "-0.5px",
  textDecoration: "none",
  display: "inline-block",
};

const logoAccent: React.CSSProperties = {
  color: "#60a5fa",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1px",
  textTransform: "uppercase",
  padding: "3px 10px",
  borderRadius: "9999px",
  border: "1px solid",
};

const contentSection: React.CSSProperties = {
  padding: "32px 28px",
};

const footerDivider: React.CSSProperties = {
  borderColor: "#1e293b",
  margin: "0 24px",
};

const footerSection: React.CSSProperties = {
  padding: "24px 24px 32px 24px",
  textAlign: "center",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "0 0 6px 0",
};

const footerSubtext: React.CSSProperties = {
  fontSize: "11px",
  color: "#64748b",
  margin: "0 0 12px 0",
};

const footerLinks: React.CSSProperties = {
  fontSize: "11px",
  color: "#64748b",
  margin: 0,
};

const footerLink: React.CSSProperties = {
  color: "#60a5fa",
  textDecoration: "none",
};
