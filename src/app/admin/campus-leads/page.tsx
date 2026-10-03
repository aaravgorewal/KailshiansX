// src/app/admin/campus-leads/page.tsx
// Server component fetching campus lead applications for AdminCampusLeadsClient.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import {
  AdminCampusLeadsClient,
  type CampusLeadAppItem,
} from "@/components/admin/AdminCampusLeadsClient";

export const metadata: Metadata = {
  title: "Campus Leads Pipeline | KailshiansX Admin",
};

export default async function AdminCampusLeadsPage() {
  await requireAdmin();

  const applications = await db.campusLeadApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formatted: CampusLeadAppItem[] = applications.map((a) => ({
    id: a.id,
    title: a.name,
    name: a.name,
    email: a.email,
    phone: a.phone,
    college: a.college,
    city: a.city,
    courseYear: a.courseYear,
    linkedin: a.linkedin,
    experience: a.experience,
    communityInvolvement: a.communityInvolvement,
    whyKailshiansX: a.whyKailshiansX,
    availability: a.availability,
    status: a.status,
    currentStatus: a.status,
    adminNotes: a.adminNotes,
    createdAt: a.createdAt.toISOString(),
  }));

  return <AdminCampusLeadsClient initialApplications={formatted} />;
}
