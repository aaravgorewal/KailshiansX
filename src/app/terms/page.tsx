import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Terms of Service | KailshiansX",
  description: "Terms and conditions for using the KailshiansX platform and attending our events.",
  alternates: {
    canonical: `${APP_URL}/terms`,
  },
  openGraph: {
    title: "Terms of Service | KailshiansX",
    description: "Terms and conditions for KailshiansX community events and platform usage.",
    url: `${APP_URL}/terms`,
    siteName: "KailshiansX",
    type: "website",
  },
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
