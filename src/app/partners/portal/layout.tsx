import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Portal | KailshiansX",
  description:
    "Secure portal for official brand sponsors to track event deliverables, audience telemetry, and impact reports.",
  openGraph: {
    title: "Partner Portal | KailshiansX",
    description:
      "Secure portal for official brand sponsors to track event deliverables, audience telemetry, and impact reports.",
  },
};

export default function PartnerPortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
