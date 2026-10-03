import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Core Team",
  description:
    "Meet the people building KailshiansX — leadership, technology, community and operations.",
};

export default function CoreTeamPage() {
  return (
    <PlaceholderPage
      badge="Core Team"
      title="Core Team"
      description="Meet the people behind KailshiansX — leadership, technology, community, events, partnerships, marketing and operations."
    />
  );
}
