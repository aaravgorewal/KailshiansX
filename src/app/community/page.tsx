import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Join the KailshiansX developer community. Become a campus lead, state lead, mentor or speaker.",
};

export default function CommunityPage() {
  return (
    <PlaceholderPage
      badge="Community"
      title="Community Hub"
      description="Join the KailshiansX community. Become a Campus Lead, State Lead, mentor or speaker. Every event is a door to a deeper role."
    />
  );
}
