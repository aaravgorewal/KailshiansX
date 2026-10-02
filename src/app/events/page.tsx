import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Browse all upcoming and past KailshiansX events — meetups, hackathons, workshops and tech talks.",
};

export default function EventsPage() {
  return (
    <PlaceholderPage
      badge="Events"
      title="All Events"
      description="Browse upcoming and past meetups, hackathons, workshops, and tech talks from KailshiansX."
    />
  );
}
