import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from KailshiansX meetups, hackathons, workshops and tech talks.",
};

export default function GalleryPage() {
  return (
    <PlaceholderPage
      badge="Gallery"
      title="Gallery"
      description="Photos and memories from KailshiansX events — meetups, hackathons, workshops, tech talks, community moments and behind-the-scenes."
    />
  );
}
