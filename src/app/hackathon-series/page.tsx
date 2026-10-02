import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Hackathon Series",
  description: "Recurring hackathon properties by KailshiansX — NirmanX, AarambhX and more.",
};

export default function HackathonSeriesPage() {
  return (
    <PlaceholderPage
      badge="Hackathon Series"
      title="Hackathon Series"
      description="Recurring hackathon properties — NirmanX, AarambhX and more. Tracks, problem statements, prizes, judges, mentors and submissions."
    />
  );
}
