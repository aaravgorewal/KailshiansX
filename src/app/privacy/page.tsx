import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Privacy Policy | KailshiansX",
  description: "Privacy Policy and personal information protection for the KailshiansX platform.",
  alternates: {
    canonical: `${APP_URL}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | KailshiansX",
    description: "How KailshiansX collects, uses and protects your data.",
    url: `${APP_URL}/privacy`,
    siteName: "KailshiansX",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <PlaceholderPage
      badge="Legal"
      title="Privacy Policy"
      description="How KailshiansX collects, uses and protects your personal information."
    />
  );
}
