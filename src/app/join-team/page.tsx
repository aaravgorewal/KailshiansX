import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Join Our Team",
  description:
    "Work with KailshiansX across technology, events, community, marketing, design and developer relations.",
};

export default function JoinTeamPage() {
  return (
    <PlaceholderPage
      badge="Join Team"
      title="Join Our Team"
      description="We're recruiting across Technology, Events, Operations, Community, Partnerships, Sponsorship, Marketing, Design, Content and Developer Relations."
    />
  );
}
