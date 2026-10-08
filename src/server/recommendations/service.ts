// src/server/recommendations/service.ts
// Personalized recommendation engine per :
// Recommends upcoming events and community leadership progression roles
// based on user history, attendance record, technical skills, and geographic location.
//
// NOTE: User has no `city`/`state`/`college` fields. We derive location from the
// user's most-recent Registration (which does carry city & college).
// Event has no `tags` field — we use `category` (string) for topic matching.
// Event has `attendanceMode: AttendanceMode` (IN_PERSON | VIRTUAL | HYBRID) not `isVirtual`.

import { db } from "@/lib/db";
import { AttendanceMode, EventStatus, EventType } from "@prisma/client";

export interface RecommendedEvent {
  id: string;
  title: string;
  slug: string;
  type: EventType;
  coverImage: string | null;
  startDate: string;
  venueName: string | null;
  cityName: string | null;
  isVirtual: boolean;
  matchScore: number; // 0 - 100
  matchReasons: string[];
  tags: string[];
}

export interface RecommendedRole {
  roleId: string;
  title: string;
  category: "LEADERSHIP" | "MENTORSHIP" | "CORE_TEAM" | "CHAPTER";
  description: string;
  commitment: string;
  matchScore: number; // 0 - 100
  matchReasons: string[];
  ctaLink: string;
  ctaText: string;
  badgeText: string;
}

export interface UserRecommendationsPayload {
  userContext: {
    city: string | null;
    college: string | null;
    state: string | null;
    currentRole: string;
    eventsAttendedCount: number;
    preferredCategories: string[];
  };
  recommendedEvents: RecommendedEvent[];
  recommendedRoles: RecommendedRole[];
}

/**
 * Computes personalized event and community role recommendations for a given user.
 */
export async function getPersonalizedRecommendations(
  userId: string
): Promise<UserRecommendationsPayload> {
  const now = new Date();

  // 1. Fetch user profile, registrations, chapter memberships, and lead applications
  const [user, userRegistrations, chapterMemberships, campusApp, stateApp, speakerProfile] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          skills: true,
          role: true,
        },
      }),

      // Fetch registrations with event included so we can read type & category
      db.registration.findMany({
        where: { userId, deletedAt: null },
        select: {
          id: true,
          eventId: true,
          city: true, // city is on Registration, not User
          college: true, // college is on Registration, not User
          event: {
            select: {
              id: true,
              type: true,
              title: true,
              category: true, // `category` (not tags) is the topic/track field on Event
              city: { select: { name: true, state: true } },
            },
          },
        },
      }),

      db.chapterMember.findMany({
        where: { userId, status: "ACTIVE" },
        include: { chapter: true },
      }),

      db.campusLeadApplication.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),

      db.stateLeadApplication.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),

      db.speaker.findFirst({
        where: { userId },
      }),
    ]);

  const userSkills = user?.skills ?? [];

  // Derive city / college / state from the user's most-recent registration
  // (most recent first — find the latest that has a value)
  const latestRegWithCity = [...userRegistrations]
    .reverse()
    .find((r) => r.city ?? r.college ?? r.event?.city?.state);

  const userCity = latestRegWithCity?.city?.trim() ?? null;
  const userCollege = latestRegWithCity?.college?.trim() ?? null;
  const userState = latestRegWithCity?.event?.city?.state?.trim() ?? null;

  // Determine user's past types and categories from registrations
  const attendedEventTypes = new Set<EventType>();
  const attendedEventIds = new Set<string>();
  const pastCategories = new Set<string>();

  userRegistrations.forEach((r) => {
    attendedEventIds.add(r.eventId);
    if (r.event) {
      attendedEventTypes.add(r.event.type);
      if (r.event.category) {
        pastCategories.add(r.event.category.toLowerCase());
      }
    }
  });

  const preferredCategories = Array.from(attendedEventTypes) as string[];

  // 2. Fetch upcoming events (excluding events user is already registered for)
  const upcomingEvents = await db.event.findMany({
    where: {
      status: EventStatus.PUBLISHED,
      deletedAt: null,
      startDate: { gte: now },
      id: { notIn: Array.from(attendedEventIds) },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      coverImage: true,
      startDate: true,
      venue: true,
      attendanceMode: true,
      category: true,
      city: { select: { name: true, state: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { startDate: "asc" },
    take: 12,
  });

  // Score upcoming events
  const scoredEvents: RecommendedEvent[] = upcomingEvents.map((evt) => {
    let score = 50; // baseline score
    const matchReasons: string[] = [];

    const isVirtual = evt.attendanceMode === AttendanceMode.VIRTUAL;
    const isHybrid = evt.attendanceMode === AttendanceMode.HYBRID;

    // City match (+35 pts)
    const isSameCity =
      Boolean(userCity) &&
      Boolean(evt.city?.name) &&
      evt.city!.name.toLowerCase() === userCity!.toLowerCase();

    if (isSameCity) {
      score += 35;
      matchReasons.push(`Happening in your city (${evt.city!.name})`);
    } else if (isVirtual || isHybrid) {
      score += 20;
      matchReasons.push(
        isVirtual ? "Virtual / Online access" : "Hybrid – attend in-person or online"
      );
    }

    // Format match (+20 pts)
    if (attendedEventTypes.has(evt.type)) {
      score += 20;
      const typeLabel =
        evt.type === EventType.WORKSHOP
          ? "Hands-on Workshop"
          : evt.type === EventType.TECH_TALK
            ? "Deep-Dive Tech Talk"
            : evt.type === EventType.HACKATHON
              ? "Hackathon"
              : "Meetup";
      matchReasons.push(`Matches your ${typeLabel} history`);
    }

    // Category / Skills match (+20 pts)
    const evtCategory = evt.category?.toLowerCase() ?? "";
    const hasMatchingCategory =
      Boolean(evtCategory) &&
      (pastCategories.has(evtCategory) ||
        userSkills.some((s: string) => evtCategory.includes(s.toLowerCase())));

    if (hasMatchingCategory) {
      score += 20;
      matchReasons.push("Aligns with your technical focus");
    }

    // High velocity/popularity boost
    if (evt._count.registrations > 25) {
      score += 5;
    }

    const finalScore = Math.min(99, Math.max(55, score));

    if (matchReasons.length === 0) {
      matchReasons.push("Curated upcoming community property");
    }

    const evtCityName = evt.city?.name ?? (isVirtual ? "Virtual / Online" : "India");

    return {
      id: evt.id,
      title: evt.title,
      slug: evt.slug,
      type: evt.type,
      coverImage: evt.coverImage,
      startDate: evt.startDate.toISOString(),
      venueName: evt.venue,
      cityName: evtCityName,
      isVirtual: isVirtual || isHybrid,
      matchScore: finalScore,
      matchReasons,
      tags: evt.category ? [evt.category] : [],
    };
  });

  // Sort events by match score descending
  scoredEvents.sort((a, b) => b.matchScore - a.matchScore);

  // 3. Compute Recommended Roles (Progression Ladder)
  const recommendedRoles: RecommendedRole[] = [];
  const eventsCount = userRegistrations.length;

  // Role 1: Campus Lead
  const isCampusLeadAlready =
    user?.role === "CAMPUS_LEAD" ||
    (campusApp && (campusApp.status === "ACTIVE" || campusApp.status === "SELECTED"));

  if (!isCampusLeadAlready) {
    let campusScore = 75;
    const campusReasons: string[] = [];

    if (userCollege) {
      campusScore += 15;
      campusReasons.push(`Lead community initiatives at ${userCollege}`);
    } else {
      campusReasons.push("Represent KailshiansX at your collegiate campus");
    }

    if (eventsCount >= 1) {
      campusScore += 8;
      campusReasons.push(`You have attended ${eventsCount} KailshiansX events`);
    }

    recommendedRoles.push({
      roleId: "campus-lead",
      title: "Campus Lead Ambassador",
      category: "LEADERSHIP",
      description:
        "Be the official voice of KailshiansX at your college. Organize campus workshops, drive registrations, and receive mentorship directly from our founder.",
      commitment: "5-8 hrs/week",
      matchScore: Math.min(98, campusScore),
      matchReasons: campusReasons,
      ctaLink: "/community#lead",
      ctaText: "Apply as Campus Lead",
      badgeText: "High Student Impact",
    });
  }

  // Role 2: State Lead
  const isStateLeadAlready =
    user?.role === "STATE_LEAD" ||
    (stateApp && (stateApp.status === "ACTIVE" || stateApp.status === "SELECTED"));

  if (!isStateLeadAlready && (eventsCount >= 2 || userState)) {
    let stateScore = 70;
    const stateReasons: string[] = [];

    if (userState) {
      stateScore += 18;
      stateReasons.push(`Expand builder ecosystem across ${userState}`);
    }
    if (eventsCount >= 2) {
      stateScore += 10;
      stateReasons.push("Strong builder attendance track record");
    }

    recommendedRoles.push({
      roleId: "state-lead",
      title: "State Lead Executive",
      category: "LEADERSHIP",
      description:
        "Lead community expansion across cities and institutions in your state. Mentor campus leads, oversee regional meetup properties, and represent us regionally.",
      commitment: "8-12 hrs/week",
      matchScore: Math.min(96, stateScore),
      matchReasons: stateReasons,
      ctaLink: "/community#lead",
      ctaText: "Apply as State Lead",
      badgeText: "Regional Leadership",
    });
  }

  // Role 3: Mentor & Speaker Network
  const isMentorAlready = Boolean(
    speakerProfile && (speakerProfile.isMentor || speakerProfile.isSpeaker)
  );

  if (!isMentorAlready && (eventsCount >= 2 || userSkills.length >= 2)) {
    let mentorScore = 72;
    const mentorReasons: string[] = [];

    if (userSkills.length > 0) {
      mentorScore += 18;
      mentorReasons.push(`Guide developers in ${(userSkills as string[]).slice(0, 3).join(", ")}`);
    }
    if (eventsCount >= 2) {
      mentorScore += 8;
      mentorReasons.push("Active community veteran");
    }

    recommendedRoles.push({
      roleId: "mentor-speaker",
      title: "Technical Mentor & Speaker",
      category: "MENTORSHIP",
      description:
        "Join our verified mentor network. Host 1-on-1 mentorship sessions, deliver technical keynotes, and guide collegiate builders through architecture reviews.",
      commitment: "Flexible (2-4 hrs/week)",
      matchScore: Math.min(97, mentorScore),
      matchReasons: mentorReasons,
      ctaLink: "/network/speakers",
      ctaText: "Join Speaker Network",
      badgeText: "Verified Credentials",
    });
  }

  // Role 4: Collegiate Chapter Core Team
  const activeChapterMembership = chapterMemberships.find(
    (m) => m.role === "LEAD" || m.role === "CO_LEAD" || m.role === "CORE_TEAM"
  );

  if (!activeChapterMembership) {
    recommendedRoles.push({
      roleId: "chapter-core",
      title: "Collegiate Chapter Core Team",
      category: "CHAPTER",
      description:
        "Help run local collegiate chapters, organize fortnightly build sessions, coordinate event logistics, and track chapter health metrics.",
      commitment: "4-6 hrs/week",
      matchScore: 82,
      matchReasons: [
        "Hands-on event management experience",
        "Collaborate closely with chapter leads and fellow builders",
      ],
      ctaLink: "/chapters",
      ctaText: "Explore Chapters",
      badgeText: "Collegiate Operations",
    });
  }

  // Role 5: KailshiansX Core Team Openings
  recommendedRoles.push({
    roleId: "core-team",
    title: "KailshiansX Core Squads",
    category: "CORE_TEAM",
    description:
      "Join our central engineering, design, marketing, or operations team. Build scalable developer infrastructure and craft memorable event experiences.",
    commitment: "10-15 hrs/week",
    matchScore: 80,
    matchReasons: [
      "Work directly with founder & senior architects",
      "Official contributor credentials & letter of recommendation",
    ],
    ctaLink: "/about",
    ctaText: "View Open Squad Roles",
    badgeText: "High Ownership",
  });

  // Sort roles by match score descending
  recommendedRoles.sort((a, b) => b.matchScore - a.matchScore);

  return {
    userContext: {
      city: userCity,
      college: userCollege,
      state: userState,
      currentRole: user?.role ?? "MEMBER",
      eventsAttendedCount: eventsCount,
      preferredCategories,
    },
    recommendedEvents: scoredEvents.slice(0, 6),
    recommendedRoles: recommendedRoles.slice(0, 4),
  };
}
