import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Who We Are",
  description:
    "KailshiansX is the developer events and community initiative of Kailshians Web Services.",
};

export default function WhoWeArePage() {
  return (
    <PlaceholderPage
      badge="Who We Are"
      title="Who We Are"
      description="KailshiansX is the developer events and community initiative of Kailshians Web Services. Mission, vision, values and what we do."
    />
  );
}
