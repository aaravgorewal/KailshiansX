// src/app/lead/state/page.tsx
// Dedicated State Lead Dashboard with state jurisdiction scope (PRD §12).

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStateLeadDashboard } from "@/server/leads/service";
import { StateLeadDashboardClient } from "@/components/leads/StateLeadDashboardClient";

export const metadata: Metadata = {
  title: "State Lead Cockpit | KailshiansX",
  description:
    "Track statewide chapter coverage, campus ambassadors, activities, and regional reports.",
};

interface PageProps {
  searchParams: Promise<{ leadId?: string }>;
}

export default async function StateLeadPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/lead/state");
  }

  const { leadId: queryLeadId } = await searchParams;
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(session.user.role);

  let targetIdentifier = session.user.id;

  if (isAdmin && queryLeadId) {
    targetIdentifier = queryLeadId;
  } else if (session.user.role !== "STATE_LEAD" && !isAdmin) {
    redirect("/?error=UnauthorizedStateLeadAccess");
  } else if (isAdmin && !queryLeadId) {
    // If admin visits without query, grab the first active state lead
    const firstLead = await db.stateLead.findFirst({
      where: { status: "ACTIVE" },
      select: { id: true },
    });
    if (firstLead) {
      targetIdentifier = firstLead.id;
    }
  }

  const data = await getStateLeadDashboard(targetIdentifier);
  if (!data) {
    redirect("/state-leads?error=StateLeadProfileNotFound");
  }

  return (
    <StateLeadDashboardClient
      initialData={data}
      isAdminViewing={isAdmin && data.userId !== session.user.id}
    />
  );
}
