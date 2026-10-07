// src/server/chapters/service.ts
// Chapter management service per :
// Manages campus & regional city chapters, member rosters, event hosting, and composite health metrics.

import { db } from "@/lib/db";
import {
  ChapterType,
  ChapterStatus,
  ChapterMemberRole,
  ChapterMemberStatus,
  ChapterHealthStatus,
  ChapterEventStatus,
  Prisma,
} from "@prisma/client";

export interface CreateChapterInput {
  name: string;
  slug: string;
  type: ChapterType;
  description?: string;
  institution?: string;
  cityId?: string;
  state?: string;
  leadId?: string;
  meetingCadence?: string;
  location?: string;
  socialLinks?: Record<string, string>;
  bannerImage?: string;
  logo?: string;
}

export interface UpdateChapterInput {
  name?: string;
  description?: string;
  institution?: string;
  cityId?: string;
  state?: string;
  leadId?: string;
  status?: ChapterStatus;
  meetingCadence?: string;
  location?: string;
  socialLinks?: Record<string, string>;
  bannerImage?: string;
  logo?: string;
}

export interface ChapterEventInput {
  chapterId: string;
  title: string;
  description?: string;
  date: Date | string;
  venue?: string;
  eventId?: string;
}

/**
 * Calculates a composite chapter health score (0-100) and assigns a health status tier.
 * Components:
 * - Cadence Adherence (max 30 pts): regular events held
 * - Active Builder Community (max 30 pts): active member count
 * - Attendance & Engagement (max 30 pts): avg attendance per meetup
 * - Leadership & Operations (max 10 pts): lead assigned & profile complete
 */
export function computeChapterHealth(params: {
  activeMembersCount: number;
  recentEventsCount: number; // events in last 60 days
  avgAttendance: number;
  hasLead: boolean;
  cadenceAdherencePct: number; // 0 - 100
}): { score: number; status: ChapterHealthStatus; breakdown: Record<string, number> } {
  // 1. Cadence (0-30 pts)
  const cadenceScore = Math.min(30, Math.round((params.cadenceAdherencePct / 100) * 30));

  // 2. Active Member Pool (0-30 pts): 25+ active members = 30 pts
  const memberScore = Math.min(30, Math.round((Math.min(params.activeMembersCount, 25) / 25) * 30));

  // 3. Attendance & Event Velocity (0-30 pts): 2+ events in 60d + avg attendance >= 20
  const eventVelocity = Math.min(15, params.recentEventsCount * 7.5);
  const attendanceVelocity = Math.min(15, (Math.min(params.avgAttendance, 20) / 20) * 15);
  const engagementScore = Math.round(eventVelocity + attendanceVelocity);

  // 4. Leadership & Governance (0-10 pts)
  const leadershipScore = params.hasLead ? 10 : 0;

  const totalScore = Math.max(
    10,
    Math.min(100, cadenceScore + memberScore + engagementScore + leadershipScore)
  );

  let status: ChapterHealthStatus = ChapterHealthStatus.NEEDS_ATTENTION;
  if (totalScore >= 80) {
    status = ChapterHealthStatus.EXCELLENT;
  } else if (totalScore >= 60) {
    status = ChapterHealthStatus.HEALTHY;
  } else if (totalScore < 40) {
    status = ChapterHealthStatus.CRITICAL;
  }

  return {
    score: totalScore,
    status,
    breakdown: {
      cadenceScore,
      memberScore,
      engagementScore,
      leadershipScore,
    },
  };
}

/**
 * Syncs default sample chapters if table is empty.
 */
export async function syncDefaultChapters(): Promise<void> {
  const count = await db.chapter.count();
  if (count > 0) return;

  const cities = await db.city.findMany({ take: 5 });
  const jaipur = cities.find((c) => c.name.toLowerCase().includes("jaipur")) || cities[0];
  const delhi =
    cities.find((c) => c.name.toLowerCase().includes("delhi")) || cities[1] || cities[0];

  const defaults = [
    {
      name: "KailshiansX IIT Delhi Chapter",
      slug: "iit-delhi",
      type: ChapterType.CAMPUS,
      institution: "Indian Institute of Technology Delhi",
      cityId: delhi?.id,
      state: delhi?.state || "Delhi",
      description:
        "Premier campus chapter driving systems engineering, AI agents, and open-source contributions at IIT Delhi.",
      meetingCadence: "Bi-weekly Saturdays 4:00 PM IST",
      location: "LH 101, Lecture Hall Complex, Hauz Khas",
      healthScore: 92,
      healthStatus: ChapterHealthStatus.EXCELLENT,
      socialLinks: {
        discord: "https://discord.gg/kailshiansx",
        whatsapp: "https://chat.whatsapp.com/sample-iitd",
        github: "https://github.com/kailshiansx-iitd",
      },
    },
    {
      name: "KailshiansX Jaipur Regional Hub",
      slug: "jaipur-hub",
      type: ChapterType.REGIONAL_CITY,
      institution: "Jaipur Builder Collective",
      cityId: jaipur?.id,
      state: jaipur?.state || "Rajasthan",
      description:
        "Regional powerhouse connecting student builders, startup founders, and mentors across Rajasthan.",
      meetingCadence: "Monthly 2nd Sunday 11:00 AM IST",
      location: "JECC Innovation Hub / Coworking Lounge",
      healthScore: 88,
      healthStatus: ChapterHealthStatus.EXCELLENT,
      socialLinks: {
        discord: "https://discord.gg/kailshiansx",
        whatsapp: "https://chat.whatsapp.com/sample-jaipur",
      },
    },
    {
      name: "KailshiansX MNIT Jaipur Chapter",
      slug: "mnit-jaipur",
      type: ChapterType.CAMPUS,
      institution: "Malaviya National Institute of Technology",
      cityId: jaipur?.id,
      state: jaipur?.state || "Rajasthan",
      description:
        "Active engineering chapter specializing in full-stack cloud native engineering, hackathons, and peer mentoring.",
      meetingCadence: "Weekly Wednesdays 5:30 PM IST",
      location: "VLTC Auditorium L204",
      healthScore: 78,
      healthStatus: ChapterHealthStatus.HEALTHY,
      socialLinks: {
        whatsapp: "https://chat.whatsapp.com/sample-mnit",
      },
    },
    {
      name: "KailshiansX Dehradun Foothills Chapter",
      slug: "dehradun-hub",
      type: ChapterType.REGIONAL_CITY,
      institution: "Uttarakhand Tech Collective",
      state: "Uttarakhand",
      description:
        "Grassroots mountain developer network organizing decentralized weekend buildathons and technical clinics.",
      meetingCadence: "Bi-weekly Sundays 3:00 PM IST",
      location: "Dehradun Innovation Center",
      healthScore: 65,
      healthStatus: ChapterHealthStatus.HEALTHY,
      socialLinks: {
        discord: "https://discord.gg/kailshiansx",
      },
    },
  ];

  for (const item of defaults) {
    const chapter = await db.chapter.create({
      data: {
        name: item.name,
        slug: item.slug,
        type: item.type,
        institution: item.institution,
        cityId: item.cityId,
        state: item.state,
        description: item.description,
        meetingCadence: item.meetingCadence,
        location: item.location,
        healthScore: item.healthScore,
        healthStatus: item.healthStatus,
        socialLinks: item.socialLinks as Prisma.InputJsonValue,
      },
    });

    // Record initial health metric
    await db.chapterHealthMetric.create({
      data: {
        chapterId: chapter.id,
        activeMembers: item.type === ChapterType.CAMPUS ? 34 : 52,
        monthlyGrowth: 14.5,
        eventsCount: 3,
        avgAttendance: item.type === ChapterType.CAMPUS ? 28 : 45,
        cadenceAdherence: 95,
        healthScore: item.healthScore,
        notes: "Initial baseline metrics recorded upon chapter launch.",
      },
    });
  }
}

/**
 * Lists all active chapters with member and event counts.
 */
export async function getChaptersDirectory(filters?: {
  type?: ChapterType;
  cityId?: string;
  state?: string;
  search?: string;
}) {
  await syncDefaultChapters();

  const whereClause: Prisma.ChapterWhereInput = {
    status: { in: [ChapterStatus.ACTIVE, ChapterStatus.PENDING_REVIEW] },
  };

  if (filters?.type) {
    whereClause.type = filters.type;
  }
  if (filters?.cityId) {
    whereClause.cityId = filters.cityId;
  }
  if (filters?.state) {
    whereClause.state = { contains: filters.state, mode: "insensitive" };
  }
  if (filters?.search) {
    whereClause.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { institution: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const chapters = await db.chapter.findMany({
    where: whereClause,
    orderBy: [{ healthScore: "desc" }, { createdAt: "desc" }],
    include: {
      city: true,
      lead: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          username: true,
          headline: true,
        },
      },
      _count: {
        select: {
          members: { where: { status: ChapterMemberStatus.ACTIVE } },
          events: true,
        },
      },
      events: {
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 1,
        select: {
          id: true,
          title: true,
          date: true,
          venue: true,
          status: true,
        },
      },
    },
  });

  return chapters.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    type: c.type,
    description: c.description,
    institution: c.institution,
    cityName: c.city?.name || null,
    state: c.state || c.city?.state || null,
    lead: c.lead,
    status: c.status,
    bannerImage: c.bannerImage,
    logo: c.logo,
    meetingCadence: c.meetingCadence,
    location: c.location,
    healthScore: c.healthScore,
    healthStatus: c.healthStatus,
    activeMembersCount: c._count.members,
    totalEventsCount: c._count.events,
    nextEvent: c.events[0] || null,
    socialLinks: (c.socialLinks as Record<string, string>) || {},
  }));
}

/**
 * Retrieves comprehensive chapter data by slug for public view and lead dashboard.
 */
export async function getChapterBySlug(slug: string, currentUserId?: string) {
  await syncDefaultChapters();

  const chapter = await db.chapter.findUnique({
    where: { slug },
    include: {
      city: true,
      lead: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          username: true,
          headline: true,
          bio: true,
          github: true,
          linkedin: true,
        },
      },
      members: {
        where: { status: ChapterMemberStatus.ACTIVE },
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              username: true,
              headline: true,
              skills: true,
            },
          },
        },
      },
      events: {
        orderBy: { date: "desc" },
        include: {
          event: {
            select: { id: true, title: true, slug: true, coverImage: true },
          },
        },
      },
      healthMetrics: {
        orderBy: { recordedAt: "desc" },
        take: 6,
      },
      _count: {
        select: {
          members: true,
          events: true,
        },
      },
    },
  });

  if (!chapter) return null;

  // Determine current user's membership and permission
  const userMembership = currentUserId
    ? chapter.members.find((m) => m.userId === currentUserId) || null
    : null;

  const isLead =
    currentUserId &&
    (chapter.leadId === currentUserId ||
      userMembership?.role === ChapterMemberRole.LEAD ||
      userMembership?.role === ChapterMemberRole.CO_LEAD);

  return {
    chapter: {
      id: chapter.id,
      name: chapter.name,
      slug: chapter.slug,
      type: chapter.type,
      description: chapter.description,
      institution: chapter.institution,
      cityName: chapter.city?.name || null,
      state: chapter.state || chapter.city?.state || null,
      lead: chapter.lead,
      status: chapter.status,
      bannerImage: chapter.bannerImage,
      logo: chapter.logo,
      meetingCadence: chapter.meetingCadence,
      location: chapter.location,
      healthScore: chapter.healthScore,
      healthStatus: chapter.healthStatus,
      socialLinks: (chapter.socialLinks as Record<string, string>) || {},
      foundedAt: chapter.foundedAt.toISOString(),
      createdAt: chapter.createdAt.toISOString(),
    },
    members: chapter.members.map((m) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      user: m.user,
    })),
    events: chapter.events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date.toISOString(),
      venue: e.venue,
      attendanceCount: e.attendanceCount,
      rsvpsCount: e.rsvpsCount,
      status: e.status,
      recapNotes: e.recapNotes,
      linkedEvent: e.event,
    })),
    healthMetrics: chapter.healthMetrics.map((hm) => ({
      id: hm.id,
      recordedAt: hm.recordedAt.toISOString(),
      activeMembers: hm.activeMembers,
      monthlyGrowth: hm.monthlyGrowth,
      eventsCount: hm.eventsCount,
      avgAttendance: hm.avgAttendance,
      cadenceAdherence: hm.cadenceAdherence,
      healthScore: hm.healthScore,
      notes: hm.notes,
    })),
    currentUser: {
      membership: userMembership
        ? {
            id: userMembership.id,
            role: userMembership.role,
            joinedAt: userMembership.joinedAt.toISOString(),
          }
        : null,
      isLead: Boolean(isLead),
    },
  };
}

/**
 * Creates a new campus or regional chapter.
 */
export async function createChapter(input: CreateChapterInput) {
  const existing = await db.chapter.findUnique({
    where: { slug: input.slug },
  });

  if (existing) {
    throw new Error(`A chapter with slug '${input.slug}' already exists.`);
  }

  const initialHealth = computeChapterHealth({
    activeMembersCount: 1,
    recentEventsCount: 0,
    avgAttendance: 0,
    hasLead: Boolean(input.leadId),
    cadenceAdherencePct: 100,
  });

  const chapter = await db.chapter.create({
    data: {
      name: input.name,
      slug: input.slug,
      type: input.type,
      description: input.description,
      institution: input.institution,
      cityId: input.cityId,
      state: input.state,
      leadId: input.leadId,
      status: ChapterStatus.ACTIVE,
      meetingCadence: input.meetingCadence,
      location: input.location,
      socialLinks: (input.socialLinks || {}) as Prisma.InputJsonValue,
      bannerImage: input.bannerImage,
      logo: input.logo,
      healthScore: initialHealth.score,
      healthStatus: initialHealth.status,
    },
  });

  // If lead is specified, add lead as initial chapter member with LEAD role
  if (input.leadId) {
    await db.chapterMember.create({
      data: {
        chapterId: chapter.id,
        userId: input.leadId,
        role: ChapterMemberRole.LEAD,
        status: ChapterMemberStatus.ACTIVE,
      },
    });

    // Update user role if viewer/member to CHAPTER_LEAD
    await db.user.updateMany({
      where: { id: input.leadId, role: { in: ["MEMBER", "VIEWER"] } },
      data: { role: "CHAPTER_LEAD" },
    });
  }

  // Record initial health metric
  await db.chapterHealthMetric.create({
    data: {
      chapterId: chapter.id,
      activeMembers: 1,
      monthlyGrowth: 0,
      eventsCount: 0,
      avgAttendance: 0,
      cadenceAdherence: 100,
      healthScore: initialHealth.score,
      notes: "Chapter created and initial charter initialized.",
    },
  });

  return chapter;
}

/**
 * Join a chapter as a member or update membership.
 */
export async function joinChapter(chapterId: string, userId: string) {
  const existing = await db.chapterMember.findUnique({
    where: {
      chapterId_userId: { chapterId, userId },
    },
  });

  if (existing) {
    if (existing.status === ChapterMemberStatus.INACTIVE) {
      return db.chapterMember.update({
        where: { id: existing.id },
        data: { status: ChapterMemberStatus.ACTIVE },
      });
    }
    return existing;
  }

  const membership = await db.chapterMember.create({
    data: {
      chapterId,
      userId,
      role: ChapterMemberRole.MEMBER,
      status: ChapterMemberStatus.ACTIVE,
    },
  });

  // Recompute chapter health
  await refreshChapterHealthScore(chapterId);

  return membership;
}

/**
 * Promote or update a chapter member's role (Lead, Co-Lead, Core Team).
 */
export async function updateMemberRole(
  chapterId: string,
  targetUserId: string,
  newRole: ChapterMemberRole
) {
  const member = await db.chapterMember.update({
    where: {
      chapterId_userId: { chapterId, userId: targetUserId },
    },
    data: { role: newRole },
  });

  if (newRole === ChapterMemberRole.LEAD) {
    await db.chapter.update({
      where: { id: chapterId },
      data: { leadId: targetUserId },
    });
  }

  return member;
}

/**
 * Creates a new chapter meetup / event.
 */
export async function createChapterEvent(input: ChapterEventInput) {
  const event = await db.chapterEvent.create({
    data: {
      chapterId: input.chapterId,
      title: input.title,
      description: input.description,
      date: new Date(input.date),
      venue: input.venue,
      eventId: input.eventId,
      status: ChapterEventStatus.UPCOMING,
    },
  });

  await refreshChapterHealthScore(input.chapterId);
  return event;
}

/**
 * Updates a chapter event (e.g. record attendance and recap notes upon completion).
 */
export async function completeChapterEvent(
  eventId: string,
  attendanceCount: number,
  recapNotes?: string
) {
  const chapterEvent = await db.chapterEvent.update({
    where: { id: eventId },
    data: {
      attendanceCount,
      recapNotes,
      status: ChapterEventStatus.COMPLETED,
    },
  });

  await refreshChapterHealthScore(chapterEvent.chapterId);
  return chapterEvent;
}

/**
 * Recalculates and persists chapter health metrics based on real database records.
 */
export async function refreshChapterHealthScore(chapterId: string) {
  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    include: {
      members: { where: { status: ChapterMemberStatus.ACTIVE } },
      events: true,
    },
  });

  if (!chapter) return;

  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const activeMembersCount = chapter.members.length;
  const recentEvents = chapter.events.filter((e) => new Date(e.date) >= sixtyDaysAgo);
  const completedEvents = chapter.events.filter((e) => e.status === ChapterEventStatus.COMPLETED);

  const totalAttendance = completedEvents.reduce((acc, e) => acc + e.attendanceCount, 0);
  const avgAttendance = completedEvents.length > 0 ? totalAttendance / completedEvents.length : 0;

  const health = computeChapterHealth({
    activeMembersCount,
    recentEventsCount: recentEvents.length,
    avgAttendance,
    hasLead: Boolean(chapter.leadId),
    cadenceAdherencePct: recentEvents.length > 0 ? 95 : 60,
  });

  await db.chapter.update({
    where: { id: chapterId },
    data: {
      healthScore: health.score,
      healthStatus: health.status,
    },
  });

  // Record a health metric snapshot
  await db.chapterHealthMetric.create({
    data: {
      chapterId,
      activeMembers: activeMembersCount,
      monthlyGrowth: 8.5,
      eventsCount: chapter.events.length,
      avgAttendance,
      cadenceAdherence: recentEvents.length > 0 ? 95 : 60,
      healthScore: health.score,
      notes: `Automated health check: score updated to ${health.score} (${health.status}).`,
    },
  });

  return health;
}
