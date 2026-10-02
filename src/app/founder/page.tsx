import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Founder",
  description: "The origin story, vision and community philosophy behind KailshiansX.",
};

export default function FounderPage() {
  return (
    <PlaceholderPage
      badge="Founder"
      title="Founder"
      description="The origin story, vision and community philosophy behind KailshiansX. Why it was created and where it's headed."
    />
  );
}
