import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getChapterBySlug } from "@/server/chapters/service";
import { ChapterDashboardClient } from "@/components/chapters/ChapterDashboardClient";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Chapter Dashboard — ${slug.toUpperCase()} | KailshiansX`,
    description: "Manage campus chapter members, scheduled meetups, and real-time health metrics.",
  };
}

export default async function ChapterDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const data = await getChapterBySlug(slug, session?.user?.id);
  if (!data) {
    notFound();
  }

  return <ChapterDashboardClient initialData={data} />;
}
