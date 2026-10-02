import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for the KailshiansX platform.",
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
