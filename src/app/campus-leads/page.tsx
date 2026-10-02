import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Campus Lead Program",
  description: "Represent KailshiansX at your college. Apply to become a Campus Lead.",
};

export default function CampusLeadsPage() {
  return (
    <PlaceholderPage
      badge="Campus Leads"
      title="Campus Lead Program"
      description="Represent KailshiansX within your college. Drive events, build your chapter and grow as a community leader."
    />
  );
}
