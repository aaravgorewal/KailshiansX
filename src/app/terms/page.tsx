import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using the KailshiansX platform.",
};

export default function TermsPage() {
  return (
    <PlaceholderPage
      badge="Legal"
      title="Terms of Service"
      description="Terms and conditions for using the KailshiansX platform and attending our events."
    />
  );
}
