import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Meetup Series",
  description:
    "City and community meetup brands by KailshiansX — RaibarX, PadharoX, TricityX and more.",
};

export default function MeetupSeriesPage() {
  return (
    <PlaceholderPage
      badge="Meetup Series"
      title="Meetup Series"
      description="Long-term city and community meetup brands — RaibarX, PadharoX, TricityX and more. Each edition builds on the last."
    />
  );
}
