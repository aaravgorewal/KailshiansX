// src/app/chapters/[slug]/page.tsx
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getChapterBySlug } from "@/server/chapters/service";
import { ChapterPublicClient } from "@/components/chapters/ChapterPublicClient";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.toUpperCase()} Developer Chapter | KailshiansX`,
    description: "Official KailshiansX campus developer chapter and regional meetup community.",
  };
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const data = await getChapterBySlug(slug, session?.user?.id);
  if (!data) {
    notFound();
  }

  return <ChapterPublicClient data={data} />;
}
