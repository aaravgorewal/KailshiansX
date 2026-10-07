// src/server/users/passport.ts
// Computation engine for the Developer Passport: progression ladder (attendee -> campus lead -> organiser -> mentor/speaker),
// milestone achievement badges, activity timeline, and verifiable credentials.

import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export type ProgressionTier = "ATTENDEE" | "CAMPUS_LEAD" | "ORGANISER" | "MENTOR_SPEAKER";

export interface ProgressionStep {
  tier: ProgressionTier;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
  current: boolean;
  requirements: string;
}

export interface DeveloperBadge {
  id: string;
  title: string;
  category: "PARTICIPATION" | "LEADERSHIP" | "CONTRIBUTION" | "MASTERY";
  description: string;
  icon: string;
  color: string;
  unlockedAt: string | null;
  criteria: string;
  isUnlocked: boolean;
}

export interface TimelineItem {
  id: string;
  date: string;
  type: "EVENT" | "WORKSHOP" | "HACKATHON" | "CERTIFICATE" | "LEADERSHIP" | "TALK";
  title: string;
  subtitle: string;
  badgeText: string;
  badgeVariant: "brand" | "teal" | "purple" | "amber" | "green";
  link?: string;
  metadata?: Record<string, string | number | null>;
}

export interface DeveloperPassportData {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    image: string | null;
    headline: string | null;
    bio: string | null;
    role: UserRole;
    github: string | null;
    linkedin: string | null;
    twitter: string | null;
    website: string | null;
    skills: string[];
    isPassportPublic: boolean;
    createdAt: string;
  };
  highestRank: {
    tier: ProgressionTier;
    label: string;
    badgeColor: string;
  };
  progression: ProgressionStep[];
  badges: DeveloperBadge[];
  timeline: TimelineItem[];
  stats: {
    eventsAttended: number;
    workshopsCompleted: number;
    hackathonsJoined: number;
    certificatesEarned: number;
    talksOrMentorships: number;
    memberDays: number;
  };
}

/**
 * Computes the complete Developer Passport payload for any user.
 */
export async function getDeveloperPassportData(
  userId: string
): Promise<DeveloperPassportData | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      registrations: {
        where: { status: { in: ["CONFIRMED", "PENDING"] } },
        include: {
          event: {
            include: {
              seriesEdition: {
                include: { series: true },
              },
              city: true,
              hackathonDetail: true,
            },
          },
          ticketType: true,
          certificate: true,
        },
        orderBy: { createdAt: "desc" },
      },
      certificates: {
        include: {
          event: true,
          template: true,
        },
        orderBy: { issuedAt: "desc" },
      },
      campusLead: {
        include: {
          college: true,
          city: true,
        },
      },
      stateLead: {
        include: {
          cities: true,
        },
      },
      teamApplications: {
        orderBy: { createdAt: "desc" },
      },
      campusLeadApplications: {
        orderBy: { createdAt: "desc" },
      },
      stateLeadApplications: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) return null;

  // Check if user is registered as a speaker in global Speaker table
  const speakerConditions: import("@prisma/client").Prisma.SpeakerWhereInput[] = [
    { name: { equals: user.name || "", mode: "insensitive" } },
    { bio: { contains: user.email, mode: "insensitive" } },
  ];
  if (user.github) {
    speakerConditions.push({ github: { contains: user.github, mode: "insensitive" } });
  }

  const speakerProfile = await db.speaker.findFirst({
    where: {
      OR: speakerConditions,
    },
    include: {
      eventSpeakers: {
        include: {
          event: true,
        },
      },
    },
  });

  // Check if user is a Core Team member
  const coreTeamProfile = await db.coreTeamMember.findFirst({
    where: {
      OR: [
        { email: { equals: user.email, mode: "insensitive" } },
        { name: { equals: user.name || "", mode: "insensitive" } },
      ],
      isActive: true,
    },
  });

  // Calculate statistics
  const confirmedRegistrations = user.registrations.filter(
    (r) => r.status === "CONFIRMED" || r.checkedInAt
  );
  const eventsAttended = confirmedRegistrations.length;

  const workshopsCompleted = confirmedRegistrations.filter(
    (r) => r.event.type === "WORKSHOP" || r.event.category?.toLowerCase().includes("workshop")
  ).length;

  const hackathonsJoined = confirmedRegistrations.filter(
    (r) =>
      r.event.type === "HACKATHON" ||
      r.event.hackathonDetail !== null ||
      r.event.seriesEdition?.series.kind === "HACKATHON"
  ).length;

  const certificatesEarned = user.certificates.length;
  const talksOrMentorships = speakerProfile?.eventSpeakers?.length || 0;

  const memberDays = Math.max(
    1,
    Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  );

  // Determine Progression Tiers
  // 1. ATTENDEE: at least 1 confirmed or checked-in registration
  const attendeeUnlocked = eventsAttended >= 1 || user.registrations.length >= 1;
  const attendeeDate = attendeeUnlocked
    ? (user.registrations[user.registrations.length - 1]?.createdAt.toISOString() ??
      user.createdAt.toISOString())
    : null;

  // 2. CAMPUS_LEAD: active campus lead, state lead, or role in [CAMPUS_LEAD, STATE_LEAD]
  const isCampusLeadActive =
    user.role === "CAMPUS_LEAD" ||
    user.role === "STATE_LEAD" ||
    user.campusLead !== null ||
    user.stateLead !== null ||
    user.campusLeadApplications.some((a) => a.status === "SELECTED") ||
    user.stateLeadApplications.some((a) => a.status === "SELECTED");

  const campusLeadDate = isCampusLeadActive
    ? user.campusLead?.startDate?.toISOString() ||
      user.stateLead?.startDate?.toISOString() ||
      user.createdAt.toISOString()
    : null;

  // 3. ORGANISER: role in [SUPER_ADMIN, ADMIN, EVENT_MANAGER] or CoreTeam or accepted team application
  const isOrganiser =
    user.role === "SUPER_ADMIN" ||
    user.role === "ADMIN" ||
    user.role === "EVENT_MANAGER" ||
    coreTeamProfile !== null ||
    user.teamApplications.some((a) => a.status === "SELECTED");

  const organiserDate = isOrganiser
    ? coreTeamProfile?.joinedAt?.toISOString() || user.createdAt.toISOString()
    : null;

  // 4. MENTOR_SPEAKER: speaker profile with talks, judges, mentors
  const isMentorSpeaker =
    talksOrMentorships > 0 || speakerProfile !== null || user.role === "SUPER_ADMIN";

  const mentorSpeakerDate = isMentorSpeaker
    ? speakerProfile?.eventSpeakers[0]?.event.startDate.toISOString() ||
      user.createdAt.toISOString()
    : null;

  // Progression Ladder Steps
  const progression: ProgressionStep[] = [
    {
      tier: "ATTENDEE",
      title: "Community Attendee",
      description: "Participated in KailshiansX tech meetups, hackathons, or workshops.",
      icon: "UserCheck",
      unlocked: attendeeUnlocked,
      unlockedAt: attendeeDate,
      current: attendeeUnlocked && !isCampusLeadActive && !isOrganiser && !isMentorSpeaker,
      requirements: "Register and attend at least 1 KailshiansX community event.",
    },
    {
      tier: "CAMPUS_LEAD",
      title: "Campus / State Lead",
      description: "Spearheaded local campus tech chapters and expanded student builder reach.",
      icon: "GraduationCap",
      unlocked: isCampusLeadActive,
      unlockedAt: campusLeadDate,
      current: isCampusLeadActive && !isOrganiser && !isMentorSpeaker,
      requirements: "Selected and appointed as Campus Lead or State Lead.",
    },
    {
      tier: "ORGANISER",
      title: "Core Organiser",
      description: "Architected event operations, hackathon tracks, and platform infrastructure.",
      icon: "ShieldAlert",
      unlocked: isOrganiser,
      unlockedAt: organiserDate,
      current: isOrganiser && !isMentorSpeaker,
      requirements: "Promoted to Organising Team, Core Team, or Admin roles.",
    },
    {
      tier: "MENTOR_SPEAKER",
      title: "Mentor & Speaker",
      description:
        "Shared deep technical expertise on stage or evaluated next-gen builder projects.",
      icon: "Zap",
      unlocked: isMentorSpeaker,
      unlockedAt: mentorSpeakerDate,
      current: isMentorSpeaker,
      requirements: "Deliver a technical session, judge a hackathon, or mentor builders.",
    },
  ];

  // Determine highest rank
  let highestRank: DeveloperPassportData["highestRank"] = {
    tier: "ATTENDEE",
    label: "Community Attendee",
    badgeColor: "bg-primary/20 text-primary border-primary/30",
  };

  if (isMentorSpeaker) {
    highestRank = {
      tier: "MENTOR_SPEAKER",
      label: "Mentor & Speaker",
      badgeColor: "bg-primary/20 text-primary border-primary/40 shadow-sm",
    };
  } else if (isOrganiser) {
    highestRank = {
      tier: "ORGANISER",
      label: "Core Organiser",
      badgeColor: "bg-warning/10 text-warning border-warning/40 shadow-sm",
    };
  } else if (isCampusLeadActive) {
    highestRank = {
      tier: "CAMPUS_LEAD",
      label: "Campus Lead",
      badgeColor: "bg-success/20 text-success border-success/40 shadow-sm",
    };
  }

  // Achievement Badges
  const badges: DeveloperBadge[] = [
    {
      id: "first-step",
      title: "First Step",
      category: "PARTICIPATION",
      description: "Attended your first KailshiansX developer event.",
      icon: "Compass",
      color: "bg-primary text-primary-foreground",
      criteria: "Attend 1+ event",
      isUnlocked: eventsAttended >= 1,
      unlockedAt:
        user.registrations[user.registrations.length - 1]?.createdAt.toISOString() || null,
    },
    {
      id: "dev-explorer",
      title: "Dev Explorer",
      category: "PARTICIPATION",
      description: "Consistent community participant with 3+ events attended.",
      icon: "Zap",
      color: "bg-primary text-primary-foreground",
      criteria: "Attend 3+ events",
      isUnlocked: eventsAttended >= 3,
      unlockedAt: eventsAttended >= 3 ? user.registrations[2]?.createdAt.toISOString() : null,
    },
    {
      id: "workshop-pro",
      title: "Hands-on Master",
      category: "MASTERY",
      description: "Completed intensive technical workshop and built working software.",
      icon: "Code2",
      color: "bg-primary text-primary-foreground",
      criteria: "Complete 1+ Workshop",
      isUnlocked: workshopsCompleted >= 1,
      unlockedAt:
        workshopsCompleted >= 1
          ? user.registrations.find((r) => r.event.type === "WORKSHOP")?.createdAt.toISOString() ||
            null
          : null,
    },
    {
      id: "hackathon-warrior",
      title: "Hackathon Builder",
      category: "CONTRIBUTION",
      description: "Built high-velocity prototypes at NirmanX or AarambhX.",
      icon: "Flame",
      color: "bg-primary text-primary-foreground",
      criteria: "Participate in 1+ Hackathon",
      isUnlocked: hackathonsJoined >= 1,
      unlockedAt:
        hackathonsJoined >= 1
          ? user.registrations.find((r) => r.event.type === "HACKATHON")?.createdAt.toISOString() ||
            null
          : null,
    },
    {
      id: "certified-dev",
      title: "Verified Credential",
      category: "MASTERY",
      description: "Earned cryptographic verified certificate of completion.",
      icon: "Award",
      color: "bg-primary text-primary-foreground",
      criteria: "Receive 1+ Certificate",
      isUnlocked: certificatesEarned >= 1,
      unlockedAt: user.certificates[0]?.issuedAt.toISOString() || null,
    },
    {
      id: "campus-pioneer",
      title: "Campus Pioneer",
      category: "LEADERSHIP",
      description: "Appointed to lead campus developer outreach.",
      icon: "Flag",
      color: "bg-primary text-primary-foreground",
      criteria: "Active Campus or State Lead",
      isUnlocked: isCampusLeadActive,
      unlockedAt: campusLeadDate,
    },
    {
      id: "ecosystem-builder",
      title: "Ecosystem Builder",
      category: "LEADERSHIP",
      description: "Part of the team shaping developer community infrastructure.",
      icon: "Cpu",
      color: "bg-primary text-primary-foreground",
      criteria: "Core Team or Organiser",
      isUnlocked: isOrganiser,
      unlockedAt: organiserDate,
    },
    {
      id: "knowledge-beacon",
      title: "Knowledge Beacon",
      category: "MASTERY",
      description: "Mentored aspiring developers or presented keynotes/workshops.",
      icon: "Radio",
      color: "bg-primary text-primary-foreground",
      criteria: "Tech Talk Speaker or Judge",
      isUnlocked: isMentorSpeaker,
      unlockedAt: mentorSpeakerDate,
    },
  ];

  // Participation Timeline (Reverse Chronological)
  const timeline: TimelineItem[] = [];

  // Registrations
  for (const reg of user.registrations) {
    const isWorkshop = reg.event.type === "WORKSHOP";
    const isHackathon = reg.event.type === "HACKATHON" || reg.event.hackathonDetail !== null;

    let itemType: TimelineItem["type"] = "EVENT";
    let badgeText = "Meetup";
    let badgeVariant: TimelineItem["badgeVariant"] = "brand";

    if (isWorkshop) {
      itemType = "WORKSHOP";
      badgeText = "Workshop";
      badgeVariant = "teal";
    } else if (isHackathon) {
      itemType = "HACKATHON";
      badgeText = "Hackathon";
      badgeVariant = "amber";
    }

    timeline.push({
      id: `reg-${reg.id}`,
      date: reg.createdAt.toISOString(),
      type: itemType,
      title: reg.event.title,
      subtitle: `${reg.ticketType.name} Pass • ${reg.event.city?.name ?? "Virtual"}`,
      badgeText,
      badgeVariant,
      link: `/events/${reg.event.slug}`,
      metadata: {
        registrationCode: reg.registrationCode,
        checkedIn: reg.checkedInAt ? "Yes" : "No",
      },
    });
  }

  // Certificates
  for (const cert of user.certificates) {
    timeline.push({
      id: `cert-${cert.id}`,
      date: cert.issuedAt.toISOString(),
      type: "CERTIFICATE",
      title: `Certificate of Completion`,
      subtitle: `${cert.event.title} • Verified ID: ${cert.uniqueId}`,
      badgeText: "Credential",
      badgeVariant: "amber",
      link: cert.certificateUrl || undefined,
      metadata: {
        uniqueId: cert.uniqueId,
      },
    });
  }

  // Campus Lead
  if (user.campusLead) {
    timeline.push({
      id: `lead-campus-${user.campusLead.id}`,
      date: user.campusLead.startDate.toISOString(),
      type: "LEADERSHIP",
      title: "Appointed Campus Lead",
      subtitle: `${user.campusLead.college?.name ?? "University Campus"} • ${user.campusLead.city?.name ?? "India"}`,
      badgeText: "Leadership",
      badgeVariant: "green",
      link: "/campus-leads",
    });
  }

  // State Lead
  if (user.stateLead) {
    timeline.push({
      id: `lead-state-${user.stateLead.id}`,
      date: user.stateLead.startDate.toISOString(),
      type: "LEADERSHIP",
      title: "Appointed State Lead",
      subtitle: `${user.stateLead.state} Chapter Coordinator`,
      badgeText: "State Lead",
      badgeVariant: "green",
      link: "/state-leads",
    });
  }

  // Speaker
  if (speakerProfile?.eventSpeakers) {
    for (const es of speakerProfile.eventSpeakers) {
      timeline.push({
        id: `talk-${es.id}`,
        date: es.event.startDate.toISOString(),
        type: "TALK",
        title: `Speaker Session: ${es.event.title}`,
        subtitle: `${es.role} at ${es.event.title}`,
        badgeText: "Speaker",
        badgeVariant: "purple",
        link: `/events/${es.event.slug}`,
      });
    }
  }

  // Sort timeline descending by date
  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    user: {
      id: user.id,
      name: user.name ?? "KailshiansX Builder",
      username: user.username ?? `builder-${user.id.slice(-6)}`,
      email: user.email,
      image: user.image,
      headline: user.headline,
      bio: user.bio,
      role: user.role,
      github: user.github,
      linkedin: user.linkedin,
      twitter: user.twitter,
      website: user.website,
      skills: user.skills,
      isPassportPublic: user.isPassportPublic,
      createdAt: user.createdAt.toISOString(),
    },
    highestRank,
    progression,
    badges,
    timeline,
    stats: {
      eventsAttended,
      workshopsCompleted,
      hackathonsJoined,
      certificatesEarned,
      talksOrMentorships,
      memberDays,
    },
  };
}
