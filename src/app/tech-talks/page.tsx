import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Tech Talks",
  description: "Expert tech sessions and industry talks from leading developers and practitioners.",
};

export default function TechTalksPage() {
  return (
    <PlaceholderPage
      badge="Tech Talks"
      title="Tech Talks"
      description="Expert sessions and focused industry talks from leading developers and practitioners. Past talks become a searchable knowledge archive."
    />
  );
}
