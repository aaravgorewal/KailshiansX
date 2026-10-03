// src/server/cms/content.ts
// CMS server queries and mutation actions for Core Team, Founder, and Who We Are (PRD §15, §16, §17, §22)

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/server/auth/require-role";
import { sanitizeRichText } from "@/server/security/sanitize";

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CORE TEAM QUERIES & MUTATIONS (PRD §15)
// ═══════════════════════════════════════════════════════════════════════════════

export async function getCoreTeamData(includeInactive = false) {
  const members = await db.coreTeamMember.findMany({
    where: includeInactive ? { deletedAt: null } : { isActive: true, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return members;
}

export async function createCoreTeamMember(data: {
  name: string;
  role: string;
  category: string;
  bio?: string;
  photo?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
  email?: string;
  sortOrder?: number;
}) {
  const session = await requireAdmin();

  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const existingWithSlug = await db.coreTeamMember.findUnique({ where: { slug } });
  const finalSlug = existingWithSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

  const member = await db.coreTeamMember.create({
    data: {
      name: data.name,
      slug: finalSlug,
      role: data.role,
      category: data.category,
      bio: data.bio ? sanitizeRichText(data.bio) : null,
      photo: data.photo || null,
      linkedin: data.linkedin || null,
      twitter: data.twitter || null,
      github: data.github || null,
      website: data.website || null,
      email: data.email || null,
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE",
      entityType: "CoreTeamMember",
      entityId: member.id,
      after: member as Prisma.InputJsonValue,
    },
  });

  return { success: true, member };
}

export async function updateCoreTeamMember(
  id: string,
  data: Partial<{
    name: string;
    role: string;
    category: string;
    bio: string;
    photo: string;
    linkedin: string;
    twitter: string;
    github: string;
    website: string;
    email: string;
    sortOrder: number;
    isActive: boolean;
  }>
) {
  const session = await requireAdmin();

  const current = await db.coreTeamMember.findUnique({ where: { id } });
  if (!current) return { success: false, error: "Member not found" };

  const updated = await db.coreTeamMember.update({
    where: { id },
    data: {
      ...data,
      bio: data.bio !== undefined ? (data.bio ? sanitizeRichText(data.bio) : null) : undefined,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entityType: "CoreTeamMember",
      entityId: id,
      before: current as Prisma.InputJsonValue,
      after: updated as Prisma.InputJsonValue,
    },
  });

  return { success: true, member: updated };
}

export async function deleteCoreTeamMember(id: string) {
  const session = await requireAdmin();

  await db.coreTeamMember.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DELETE",
      entityType: "CoreTeamMember",
      entityId: id,
    },
  });

  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. FOUNDER CONTENT QUERIES & MUTATIONS (PRD §16)
// ═══════════════════════════════════════════════════════════════════════════════

export const DEFAULT_FOUNDER_MILESTONES = [
  {
    year: "2024",
    title: "The Awakening: Why KailshiansX Was Born",
    description:
      "Witnessing exceptional engineers in Tier-2 Indian cities shut out of premier hackathons and speaking stages, we resolved to build a distributed community infrastructure rather than just another commercial events outfit.",
  },
  {
    year: "2025",
    title: "RaibarX & The Rajasthan Blueprint",
    description:
      "Launched RaibarX Edition 01 in Jaipur. 200+ vetted builders, 0 sponsors initially, 100% technical depth. Proved that developers crave architecture, systems, and peer mastery over promotional sales pitches.",
  },
  {
    year: "2025",
    title: "NirmanX Season 01 Flagship",
    description:
      "500 builders, 36 hours of continuous coding, ₹5,00,000 prize pool, zero fluff. Multiple winning projects incorporated as startups within 60 days of demo day.",
  },
  {
    year: "2026",
    title: "10+ Cities & The Chapter Network",
    description:
      "Expanding to Chandigarh, Delhi-NCR, Pune, and Bengaluru. Transitioning from event organizer to continuous developer leadership engine across 60+ university campuses.",
  },
];

export async function getFounderPageData() {
  let founder = await db.founderContent.findFirst({
    where: { isPublished: true },
  });

  if (!founder) {
    founder = await db.founderContent.findFirst();
  }

  return {
    founderName: founder?.founderName || "Aarav Gorewal",
    tagline:
      founder?.tagline ||
      "Founder, Kailshians Web Services • Architecting India's Developer Ecosystem",
    message:
      founder?.message ||
      "I built KailshiansX because I was frustrated by the transactional nature of tech events in India. Too many conferences are vendor trade shows where tickets cost weeks of an engineer's salary, and students are treated as lead-generation databases. KailshiansX is an intentional antidote: developer-owned, deeply technical, radically accessible, and committed to turning participants into community leaders.",
    philosophy:
      founder?.philosophy ||
      "True community cannot be bought through marketing budgets. It is grown with patient consistency, authentic technical respect, and genuine investment in individual potential. We measure success not by registrations or ticket revenues, but by how many attendees build production systems, launch open-source initiatives, or step up to become mentors and organizers.",
    photo:
      founder?.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    linkedin: founder?.linkedin || "https://linkedin.com/in/aaravgorewal",
    twitter: founder?.twitter || "https://twitter.com/aaravgorewal",
    milestones:
      (founder?.milestones as Array<{ year: string; title: string; description: string }>) ||
      DEFAULT_FOUNDER_MILESTONES,
    isPublished: founder?.isPublished ?? true,
  };
}

export async function updateFounderContent(data: {
  founderName: string;
  tagline: string;
  message: string;
  philosophy: string;
  photo?: string;
  linkedin?: string;
  twitter?: string;
  milestones: { year: string; title: string; description: string }[];
  isPublished?: boolean;
}) {
  const session = await requireAdmin();

  let founder = await db.founderContent.findFirst();

  if (founder) {
    founder = await db.founderContent.update({
      where: { id: founder.id },
      data: {
        founderName: data.founderName,
        tagline: data.tagline,
        message: sanitizeRichText(data.message),
        philosophy: sanitizeRichText(data.philosophy),
        photo: data.photo || founder.photo,
        linkedin: data.linkedin,
        twitter: data.twitter,
        milestones: data.milestones as Prisma.InputJsonValue,
        isPublished: data.isPublished ?? true,
      },
    });
  } else {
    founder = await db.founderContent.create({
      data: {
        founderName: data.founderName,
        founderSlug: "aarav-gorewal",
        tagline: data.tagline,
        message: sanitizeRichText(data.message),
        philosophy: sanitizeRichText(data.philosophy),
        photo: data.photo,
        linkedin: data.linkedin,
        twitter: data.twitter,
        milestones: data.milestones as Prisma.InputJsonValue,
        isPublished: data.isPublished ?? true,
      },
    });
  }

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entityType: "FounderContent",
      entityId: founder.id,
      after: founder as Prisma.InputJsonValue,
    },
  });

  return { success: true, founder };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. WHO WE ARE CMS & QUERIES (PRD §17)
// ═══════════════════════════════════════════════════════════════════════════════

export interface WhoWeAreContent {
  title: string;
  badge: string;
  introHeadline: string;
  introDescription: string;
  initiativeNotice: string;
  mission: string;
  vision: string;
  values: {
    title: string;
    subtitle: string;
    description: string;
  }[];
  pillars: {
    title: string;
    tagline: string;
    description: string;
    badge: string;
  }[];
}

export const DEFAULT_WHO_WE_ARE: WhoWeAreContent = {
  title: "Who We Are",
  badge: "Initiative of Kailshians Web Services",
  introHeadline: "The Developer Events & Community Infrastructure for India",
  introDescription:
    "KailshiansX is the developer events, community chapters, and builder platform founded under Kailshians Web Services. We power flagship hackathons, regional tech meetups, architecture masterclasses, and collegiate chapters across India.",
  initiativeNotice:
    "KailshiansX operates as the dedicated non-profit community & ecosystem wing of Kailshians Web Services (KWS), established with a single constitutional charter: reinvesting engineering dividends into developer education, campus leadership, and open builder ecosystems.",
  mission:
    "To democratize elite developer infrastructure across India — transforming passive attendees into active builders, open-source contributors, community organizers, and industry leaders regardless of their geographic origin or collegiate tier.",
  vision:
    "A self-sustaining developer flywheel across 50+ Indian cities where every curious programmer has an immediate, clear path to move: Attendee → Member → Contributor → Lead → Organizer → Mentor/Speaker.",
  values: [
    {
      title: "Builder-First Rigor",
      subtitle: "Code Over Slides",
      description:
        "We prioritize tangible engineering output over motivational speeches. Our hackathons produce deployed architectures, not PowerPoint decks.",
    },
    {
      title: "Radical Inclusivity & Inclusiveness",
      subtitle: "Zero Tier-Snobbery",
      description:
        "Brilliance is distributed evenly across India; access is not. We actively subsidize student travel, provide free admission tiers, and prioritize Tier-2/Tier-3 city summits.",
    },
    {
      title: "Long-Term Compounding",
      subtitle: "Ecosystems, Not Campaigns",
      description:
        "We reject 1-off vanity gatherings. Every meetup series (RaibarX, PadharoX, TricityX) is a permanent multi-year institutional chapter that compounds in depth.",
    },
    {
      title: "Extreme Operational Craft",
      subtitle: "Respect For The Builder",
      description:
        "High-fidelity venue audio, lightning-fast gigabit Wi-Fi, healthy warm meals, and zero commercial vendor pitches. We treat developers like the world's most valuable professionals.",
    },
    {
      title: "Autonomous Leadership",
      subtitle: "Empowerment By Default",
      description:
        "Our Campus Leads and State Leads aren't marketing ambassadors; they are granted real budgets, decision autonomy, and stage leadership to run regional initiatives.",
    },
  ],
  pillars: [
    {
      title: "Flagship Hackathon Series",
      tagline: "NirmanX & AarambhX",
      description:
        "36-hour physical hackathons with atomic quota allocation, real hardware bounties, top VC judges, and zero corporate sales pitches.",
      badge: "Flagship",
    },
    {
      title: "Regional Meetup Brands",
      tagline: "RaibarX, PadharoX, TricityX",
      description:
        "Hyperlocal monthly gatherings uniting systems programmers, backend architects, and student founders across Rajasthan, Punjab, and Delhi-NCR.",
      badge: "Community",
    },
    {
      title: "Hands-on Masterclasses",
      tagline: "Workshops & Tech Sprints",
      description:
        "Deep technical labs on Rust, Distributed Systems, High-Concurrency MERN, AI Agentic Workflows, and Cloud Architecture.",
      badge: "Education",
    },
    {
      title: "Architecture Tech Talks",
      tagline: "Production Deep Dives",
      description:
        "Knowledge archive featuring senior staff engineers from Google, Microsoft, and Razorpay breaking down real production incidents and microservices at scale.",
      badge: "Knowledge",
    },
    {
      title: "Campus & State Leadership",
      tagline: "Student To Leader Funnel",
      description:
        "Structured 7-stage leadership fellowship empowering students to run college developer clubs with direct founder mentorship and institutional backing.",
      badge: "Leadership",
    },
    {
      title: "Ecosystem Collaborations",
      tagline: "Colleges, Communities, Brands",
      description:
        "Transparent partnership pipelines for university hackathons, venue hosts, and tech sponsors seeking verified candidate dossiers.",
      badge: "Partnerships",
    },
  ],
};

export async function getWhoWeArePageData(): Promise<WhoWeAreContent> {
  const page = await db.contentPage.findUnique({
    where: { slug: "who-we-are" },
    include: {
      blocks: {
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!page || page.blocks.length === 0) {
    return DEFAULT_WHO_WE_ARE;
  }

  // Parse custom blocks if stored in DB
  const contentBlock = page.blocks.find((b) => b.type === "TEXT" || b.type === "HERO");
  if (contentBlock && contentBlock.data) {
    const rawData = contentBlock.data as Record<string, unknown>;
    return {
      ...DEFAULT_WHO_WE_ARE,
      ...rawData,
    };
  }

  return DEFAULT_WHO_WE_ARE;
}

export async function updateWhoWeAreContent(data: WhoWeAreContent) {
  const session = await requireAdmin();

  const page = await db.contentPage.upsert({
    where: { slug: "who-we-are" },
    update: {
      title: data.title || "Who We Are",
      metaTitle: `${data.title} | KailshiansX`,
      metaDesc: sanitizeRichText(data.introDescription)
        .replace(/<[^>]*>/g, "")
        .slice(0, 160),
      isPublished: true,
    },
    create: {
      slug: "who-we-are",
      title: data.title || "Who We Are",
      metaTitle: `${data.title} | KailshiansX`,
      metaDesc: sanitizeRichText(data.introDescription)
        .replace(/<[^>]*>/g, "")
        .slice(0, 160),
      isPublished: true,
    },
  });

  // Upsert the main content payload block
  const existingBlock = await db.contentBlock.findFirst({
    where: { pageId: page.id },
  });

  if (existingBlock) {
    await db.contentBlock.update({
      where: { id: existingBlock.id },
      data: {
        data: data as unknown as Prisma.InputJsonValue,
        isVisible: true,
      },
    });
  } else {
    await db.contentBlock.create({
      data: {
        pageId: page.id,
        type: "TEXT",
        data: data as unknown as Prisma.InputJsonValue,
        sortOrder: 0,
        isVisible: true,
      },
    });
  }

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entityType: "ContentPage",
      entityId: page.id,
      after: data as unknown as Prisma.InputJsonValue,
    },
  });

  return { success: true };
}
