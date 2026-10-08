// src/app/lead/campus/page.tsx
// Dedicated Campus Lead Dashboard with college & city scope ().

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCampusLeadDashboard } from "@/server/leads/service";
import { CampusLeadDashboardClient } from "@/components/leads/CampusLeadDashboardClient";

export const metadata: Metadata = {
  title: "Campus Lead Cockpit | KailshiansX",
  description: "Track college chapter referrals, events, activities, and monthly reports.",
};

interface PageProps {
  searchParams: Promise<{ leadId?: string }>;
}

export default async function CampusLeadPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/lead/campus");
  }

  const { leadId: queryLeadId } = await searchParams;
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(session.user.role);

  let targetIdentifier = session.user.id;

  if (isAdmin && queryLeadId) {
    targetIdentifier = queryLeadId;
  } else if (session.user.role !== "CAMPUS_LEAD" && !isAdmin) {
    redirect("/?error=UnauthorizedCampusLeadAccess");
  } else if (isAdmin && !queryLeadId) {
    // If admin visits without query, grab the first active campus lead
    const firstLead = await db.campusLead.findFirst({
      where: { status: "ACTIVE" },
      select: { id: true },
    });
    if (firstLead) {
      targetIdentifier = firstLead.id;
    }
  }

  const data = await getCampusLeadDashboard(targetIdentifier);
  if (!data) {
    redirect("/community#lead?error=CampusLeadProfileNotFound");
  }

  return (
    <CampusLeadDashboardClient
      initialData={data}
      isAdminViewing={isAdmin && data.userId !== session.user.id}
    />
  );
}
