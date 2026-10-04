// src/server/users/profile.ts
// Service layer for the authenticated Member Hub (/me) dashboard.
// Fetches My Events, Tickets (QR), Certificates, Workshops, Hackathons, Applications, and Community Role.

import { db } from "@/lib/db";
import { autoLinkUserRecords } from "./autolink";
import { getDeveloperPassportData, type DeveloperPassportData } from "./passport";
import type {
  RegistrationStatus,
  TeamApplicationStatus,
  CampusLeadStatus,
  StateLeadStatus,
  UserRole,
} from "@prisma/client";

export interface MemberDashboardEvent {
  id: string;
  registrationCode: string;
  status: RegistrationStatus;
  ticketName: string;
  ticketPrice: number;
  qrPayload: string | null;
  qrCodeUrl: string | null;
  checkedInAt: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
    type: string;
    coverImage: string | null;
    startDate: string;
    endDate: string | null;
    venueName: string | null;
    venueAddress: string | null;
    city: string | null;
    isVirtual: boolean;
  };
}

export interface MemberCertificate {
  id: string;
  uniqueId: string;
  participantName: string;
  issuedAt: string;
  certificateUrl: string | null;
  event: {
    id: string;
    title: string;
    slug: string;
    startDate: string;
  };
  template: {
    name: string;
    templateType: string;
  };
}

export interface MemberApplication {
  id: string;
  type: "TEAM" | "CAMPUS_LEAD" | "STATE_LEAD";
  title: string;
  subtitle: string;
  status: string;
  appliedDate: string;
  notes?: string | null;
}

export interface MemberDashboardData {
  user: DeveloperPassportData["user"];
  stats: {
    upcomingEventsCount: number;
    ticketsCount: number;
    certificatesCount: number;
    workshopsCount: number;
    hackathonsCount: number;
    applicationsCount: number;
  };
  myEvents: MemberDashboardEvent[];
  upcomingEvents: MemberDashboardEvent[];
  pastEvents: MemberDashboardEvent[];
  certificates: MemberCertificate[];
  workshops: MemberDashboardEvent[];
  hackathons: MemberDashboardEvent[];
  applications: MemberApplication[];
  communityRole: {
    role: UserRole;
    isLead: boolean;
    leadTitle: string | null;
    campusName: string | null;
    stateName: string | null;
    leadStatus: string | null;
  };
  passport: DeveloperPassportData;
}

/**
 * Returns comprehensive data for the /me member portal.
 * Automatically runs autoLinkUserRecords first to ensure all past email records are linked.
 */
export async function getMemberDashboardData(userId: string): Promise<MemberDashboardData | null> {
  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!existingUser) return null;

  // Auto-link past registrations & credentials associated with this verified email
  await autoLinkUserRecords(userId, existingUser.email);

  // Fetch all registrations with event and ticket relations
  const registrations = await db.registration.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          city: true,
          hackathonDetail: true,
          seriesEdition: {
            include: { series: true },
          },
        },
      },
      ticketType: true,
      certificate: {
        include: {
          template: true,
        },
      },
    },
    orderBy: { event: { startDate: "desc" } },
  });

  // Fetch certificates directly linked or via registration
  const certificatesRaw = await db.certificate.findMany({
    where: {
      OR: [{ userId }, { participantEmail: existingUser.email }],
    },
    include: {
      event: true,
      template: true,
    },
    orderBy: { issuedAt: "desc" },
  });

  // Fetch Applications
  const teamApps = await db.teamApplication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const campusApps = await db.campusLeadApplication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const stateApps = await db.stateLeadApplication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Fetch Lead profiles
  const campusLead = await db.campusLead.findUnique({
    where: { userId },
    include: { college: true, city: true },
  });

  const stateLead = await db.stateLead.findUnique({
    where: { userId },
    include: { cities: true },
  });

  // Compute Developer Passport
  const passport = await getDeveloperPassportData(userId);
  if (!passport) return null;

  // Map events
  const now = new Date();
  const allEvents: MemberDashboardEvent[] = registrations.map((r) => ({
    id: r.id,
    registrationCode: r.registrationCode,
    status: r.status,
    ticketName: r.ticketType.name,
    ticketPrice: Number(r.ticketType.price),
    qrPayload: r.qrPayload,
    qrCodeUrl: r.qrCodeUrl,
    checkedInAt: r.checkedInAt ? r.checkedInAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    event: {
      id: r.event.id,
      title: r.event.title,
      slug: r.event.slug,
      type: r.event.type,
      coverImage: r.event.coverImage,
      startDate: r.event.startDate.toISOString(),
      endDate: r.event.endDate ? r.event.endDate.toISOString() : null,
      venueName: r.event.venue,
      venueAddress: r.event.venueAddress,
      city: r.event.city?.name ?? null,
      isVirtual: r.event.attendanceMode === "VIRTUAL",
    },
  }));

  const upcomingEvents = allEvents.filter((e) => new Date(e.event.startDate) >= now);
  const pastEvents = allEvents.filter((e) => new Date(e.event.startDate) < now);

  const workshops = allEvents.filter(
    (e) => e.event.type === "WORKSHOP" || e.event.title.toLowerCase().includes("workshop")
  );

  const hackathons = allEvents.filter((e) => e.event.type === "HACKATHON");

  // Map certificates
  const certificates: MemberCertificate[] = certificatesRaw.map((c) => ({
    id: c.id,
    uniqueId: c.uniqueId,
    participantName: c.participantName,
    issuedAt: c.issuedAt.toISOString(),
    certificateUrl: c.certificateUrl,
    event: {
      id: c.event.id,
      title: c.event.title,
      slug: c.event.slug,
      startDate: c.event.startDate.toISOString(),
    },
    template: {
      name: c.template.name,
      templateType: c.template.description || "Verified Certificate",
    },
  }));

  // Map applications
  const applications: MemberApplication[] = [
    ...teamApps.map((a) => ({
      id: a.id,
      type: "TEAM" as const,
      title: `Team Application: ${a.roleApplied || a.area}`,
      subtitle: `${a.area} Department • KailshiansX Core`,
      status: a.status as TeamApplicationStatus,
      appliedDate: a.createdAt.toISOString(),
      notes: a.adminNotes,
    })),
    ...campusApps.map((a) => ({
      id: a.id,
      type: "CAMPUS_LEAD" as const,
      title: `Campus Lead: ${a.college}`,
      subtitle: `${a.city || "Campus Chapter"} • University Leadership`,
      status: a.status as CampusLeadStatus,
      appliedDate: a.createdAt.toISOString(),
      notes: a.adminNotes,
    })),
    ...stateApps.map((a) => ({
      id: a.id,
      type: "STATE_LEAD" as const,
      title: `State Lead: ${a.state}`,
      subtitle: `Regional Expansion Chapter`,
      status: a.status as StateLeadStatus,
      appliedDate: a.createdAt.toISOString(),
      notes: a.adminNotes,
    })),
  ].sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

  // Determine Community Role
  let leadTitle: string | null = null;
  let campusName: string | null = null;
  let stateName: string | null = null;
  let leadStatus: string | null = null;

  if (campusLead) {
    leadTitle = "Campus Lead";
    campusName = campusLead.college?.name ?? null;
    leadStatus = campusLead.status;
  } else if (stateLead) {
    leadTitle = "State Lead";
    stateName = stateLead.state;
    leadStatus = stateLead.status;
  }

  const isLead = Boolean(
    campusLead ||
    stateLead ||
    passport.user.role === "CAMPUS_LEAD" ||
    passport.user.role === "STATE_LEAD"
  );

  return {
    user: passport.user,
    stats: {
      upcomingEventsCount: upcomingEvents.length,
      ticketsCount: allEvents.length,
      certificatesCount: certificates.length,
      workshopsCount: workshops.length,
      hackathonsCount: hackathons.length,
      applicationsCount: applications.length,
    },
    myEvents: allEvents,
    upcomingEvents,
    pastEvents,
    certificates,
    workshops,
    hackathons,
    applications,
    communityRole: {
      role: passport.user.role,
      isLead,
      leadTitle,
      campusName,
      stateName,
      leadStatus,
    },
    passport,
  };
}

/**
 * Updates a user's profile and Developer Passport configuration.
 */
export async function updateMemberProfile(
  userId: string,
  payload: {
    name?: string;
    username?: string;
    headline?: string | null;
    bio?: string | null;
    github?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    website?: string | null;
    skills?: string[];
    isPassportPublic?: boolean;
  }
) {
  // Validate username format if provided
  if (payload.username) {
    const formattedUsername = payload.username
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "");

    if (formattedUsername.length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }

    const conflict = await db.user.findFirst({
      where: {
        username: formattedUsername,
        id: { not: userId },
      },
    });

    if (conflict) {
      throw new Error("This username is already claimed by another builder");
    }

    payload.username = formattedUsername;
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      ...(payload.name ? { name: payload.name.trim() } : {}),
      ...(payload.username !== undefined ? { username: payload.username } : {}),
      ...(payload.headline !== undefined ? { headline: payload.headline } : {}),
      ...(payload.bio !== undefined ? { bio: payload.bio } : {}),
      ...(payload.github !== undefined ? { github: payload.github } : {}),
      ...(payload.linkedin !== undefined ? { linkedin: payload.linkedin } : {}),
      ...(payload.twitter !== undefined ? { twitter: payload.twitter } : {}),
      ...(payload.website !== undefined ? { website: payload.website } : {}),
      ...(payload.skills !== undefined ? { skills: payload.skills } : {}),
      ...(payload.isPassportPublic !== undefined
        ? { isPassportPublic: payload.isPassportPublic }
        : {}),
    },
  });

  return updatedUser;
}
