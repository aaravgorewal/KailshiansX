// src/app/chapters/page.tsx
import { getChaptersDirectory } from "@/server/chapters/service";
import { ChaptersDirectoryClient } from "@/components/chapters/ChaptersDirectoryClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus Chapters & Regional Hubs | KailshiansX",
  description:
    "Discover localized builder chapters, campus leads, and regional meetup networks across India.",
};

export default async function ChaptersPage() {
  const chapters = await getChaptersDirectory();
  return <ChaptersDirectoryClient initialChapters={chapters} />;
}
