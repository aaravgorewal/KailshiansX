import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Collaborations",
  description:
    "Partner with KailshiansX — college collaborations, community partners, venue partners and brand sponsors.",
};

export default function CollaborationsPage() {
  return (
    <PlaceholderPage
      badge="Collaborations"
      title="Collaborate With Us"
      description="Partner with KailshiansX as a college, community partner, venue partner or brand sponsor. Let's build something great together."
    />
  );
}
