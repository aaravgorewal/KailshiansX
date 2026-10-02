import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "State Lead Program",
  description: "Lead developer community growth and expansion across cities in your state.",
};

export default function StateLeadsPage() {
  return (
    <PlaceholderPage
      badge="State Leads"
      title="State Lead Program"
      description="Coordinate developer community expansion across cities and campuses in your state. Identify campus leads, support local events and drive growth."
    />
  );
}
