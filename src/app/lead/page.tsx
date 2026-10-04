// src/app/lead/page.tsx
// Unified role-gated Leader Portal (PRD §11 & §12)
// Directs Campus Leads and State Leads to their scoped dashboards, and admins to the Leadership Hub.

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getCampusLeadDashboard,
  getStateLeadDashboard,
  getAllCampusLeadsOverview,
  getAllStateLeadsOverview,
} from "@/server/leads/service";
import { CampusLeadDashboardClient } from "@/components/leads/CampusLeadDashboardClient";
import { StateLeadDashboardClient } from "@/components/leads/StateLeadDashboardClient";
import { AdminLeadPortalClient } from "@/components/leads/AdminLeadPortalClient";

export const metadata: Metadata = {
  title: "Leader Portal & Dashboard | KailshiansX",
  description: "Role-gated leadership cockpit for Campus Leads and State Leads.",
};

export default async function LeadPortalPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/lead");
  }

  const role = session.user.role;

  // 1. Campus Lead Scope
  if (role === "CAMPUS_LEAD") {
    const campusData = await getCampusLeadDashboard(session.user.id);
    if (!campusData) {
      redirect("/campus-leads?error=NoActiveCampusLeadFound");
    }
    return <CampusLeadDashboardClient initialData={campusData} />;
  }

  // 2. State Lead Scope
  if (role === "STATE_LEAD") {
    const stateData = await getStateLeadDashboard(session.user.id);
    if (!stateData) {
      redirect("/state-leads?error=NoActiveStateLeadFound");
    }
    return <StateLeadDashboardClient initialData={stateData} />;
  }

  // 3. Admin / Leadership Scope
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(role);
  if (!isAdmin) {
    redirect("/?error=UnauthorizedLeadAccess");
  }

  const [campusLeads, stateLeads] = await Promise.all([
    getAllCampusLeadsOverview(),
    getAllStateLeadsOverview(),
  ]);

  return <AdminLeadPortalClient campusLeads={campusLeads} stateLeads={stateLeads} />;
}
