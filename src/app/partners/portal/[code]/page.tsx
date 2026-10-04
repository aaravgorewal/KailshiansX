// src/app/partners/portal/[code]/page.tsx
import { notFound } from "next/navigation";
import { getPartnerPortalData } from "@/server/partners/service";
import { PartnerPortalClient } from "@/components/partners/PartnerPortalClient";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Brand Partner Portal (${code.toUpperCase()}) | KailshiansX`,
    description:
      "Executive sponsor portal for deliverables tracking, reach analytics, and event reports.",
  };
}

export default async function PartnerPortalDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const data = await getPartnerPortalData(code);

  if (!data) {
    notFound();
  }

  return <PartnerPortalClient data={data} />;
}
