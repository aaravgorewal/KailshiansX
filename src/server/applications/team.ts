// src/server/applications/team.ts
// Server logic and database persistence for Team Recruitment Applications ()

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  teamApplicationSchema,
  aboutRoleApplicationSchema,
  updateApplicationStatusSchema,
  UpdateApplicationStatusData,
} from "@/lib/validations/team-application";
import { TEAM_AREAS } from "@/lib/team-constants";
import { requireAdmin } from "@/server/auth/require-role";
import { queueApplicationReceivedEmail, queueStatusChangeEmail } from "@/server/email";
import type { TeamApplicationStatus } from "@prisma/client";

export async function submitAboutRoleApplication(data: unknown) {
  const parsed = aboutRoleApplicationSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Invalid application data";
    return { success: false, error: errorMsg };
  }

  const { name, email, phone, role, area, link, whyYou, honeypot } = parsed.data;

  if (honeypot && honeypot.length > 0) {
    return { success: true, message: "Application submitted successfully." };
  }

  const mappedArea = area && (TEAM_AREAS as readonly string[]).includes(area) ? area : "Technology";

  const existingPending = await db.teamApplication.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      status: { in: ["NEW", "REVIEWING", "INTERVIEW"] },
    },
  });

  if (existingPending) {
    return {
      success: false,
      error: "You already have an active application under review. Our team will contact you soon!",
    };
  }

  const application = await db.teamApplication.create({
    data: {
      name,
      email,
      phone: phone || null,
      area: mappedArea,
      roleApplied: role,
      linkedin: link || null,
      motivation: whyYou,
      status: "NEW",
    },
  });

  await queueApplicationReceivedEmail(application.email, {
    name: application.name,
    applicationType: "TEAM",
    referenceId: application.id,
    roleOrJurisdiction: `${application.roleApplied} (${application.area})`,
  }).catch((err) => console.error("Team application email error:", err));

  return {
    success: true,
    id: application.id,
    applicationId: application.id,
    message:
      "Thank you for applying to the KailshiansX Core Team! We'll review your application shortly.",
  };
}

export async function submitTeamApplication(data: unknown) {
  // Validate schema
  const parsed = teamApplicationSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Invalid application data";
    return { success: false, error: errorMsg };
  }

  const {
    name,
    email,
    phone,
    area,
    roleApplied,
    linkedin,
    portfolio,
    resumeUrl,
    experience,
    motivation,
    honeypot,
  } = parsed.data;

  // Bot honeypot trap
  if (honeypot && honeypot.length > 0) {
    // Silently return success to fool bots
    return { success: true, message: "Application submitted successfully." };
  }

  // Prevent duplicate submissions within same area while an application is still pending/reviewing
  const existingPending = await db.teamApplication.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      area,
      status: { in: ["NEW", "REVIEWING", "INTERVIEW"] },
    },
  });

  if (existingPending) {
    return {
      success: false,
      error: `You already have an active application under review for ${area}. Our team will contact you once reviewed!`,
    };
  }

  // Create application record
  const application = await db.teamApplication.create({
    data: {
      name,
      email,
      phone: phone || null,
      area,
      roleApplied,
      linkedin: linkedin || null,
      portfolio: portfolio || null,
      resumeUrl: resumeUrl || null,
      experience,
      motivation,
      status: "NEW",
    },
  });

  // Queue application received email
  await queueApplicationReceivedEmail(application.email, {
    name: application.name,
    applicationType: "TEAM",
    referenceId: application.id,
    roleOrJurisdiction: `${application.roleApplied} (${application.area})`,
  }).catch((err) => console.error("Team application email error:", err));

  return {
    success: true,
    id: application.id,
    applicationId: application.id,
    message:
      "Thank you for applying to the KailshiansX Core Team! We'll review your submission within 3-5 business days.",
  };
}

export async function getTeamApplications(
  options?: {
    status?: string;
    area?: string;
    search?: string;
  },
  skipAuth = false
) {
  if (!skipAuth) {
    await requireAdmin();
  }

  const { status, area, search } = options || {};

  const where: Prisma.TeamApplicationWhereInput = {};

  if (status && status !== "ALL") {
    where.status = status as TeamApplicationStatus;
  }

  if (area && area !== "ALL") {
    where.area = area;
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { roleApplied: { contains: q, mode: "insensitive" } },
    ];
  }

  const [applications, totalCount, statusCountsRaw] = await Promise.all([
    db.teamApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    db.teamApplication.count(),
    db.teamApplication.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const statusCounts: Record<string, number> = {
    ALL: totalCount,
    NEW: 0,
    REVIEWING: 0,
    INTERVIEW: 0,
    SELECTED: 0,
    REJECTED: 0,
  };

  statusCountsRaw.forEach((sc) => {
    statusCounts[sc.status] = sc._count.id;
  });

  return {
    applications,
    totalCount,
    statusCounts,
  };
}

export async function updateTeamApplicationStatus(
  data: UpdateApplicationStatusData,
  skipAuth = false
) {
  let session;
  if (!skipAuth) {
    session = await requireAdmin();
  }

  const parsed = updateApplicationStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid data" };
  }

  const { id, status, adminNotes } = parsed.data;

  const current = await db.teamApplication.findUnique({
    where: { id },
  });

  if (!current) {
    return { success: false, error: "Application not found" };
  }

  const updated = await db.teamApplication.update({
    where: { id },
    data: {
      status: status as TeamApplicationStatus,
      adminNotes: adminNotes !== undefined ? adminNotes : current.adminNotes,
    },
  });

  // Record audit log if session exists
  if (session?.user?.id) {
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entityType: "TeamApplication",
        entityId: id,
        before: { status: current.status, adminNotes: current.adminNotes },
        after: { status: updated.status, adminNotes: updated.adminNotes },
      },
    });
  }

  // Queue status change email notification
  if (current.status !== updated.status) {
    await queueStatusChangeEmail(updated.email, {
      name: updated.name,
      applicationType: "TEAM",
      referenceId: updated.id,
      roleOrJurisdiction: `${updated.roleApplied} (${updated.area})`,
      newStatus: updated.status,
      reviewNotes: adminNotes || updated.adminNotes,
    }).catch((err) => console.error("Team status change email error:", err));
  }

  return { success: true, application: updated };
}
