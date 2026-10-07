// src/server/hackathons/service.ts
// Comprehensive Hackathon Engine per :
// 1. Team formation, invites, join codes, member roles.
// 2. Problem-statement selection with tracks and sponsor criteria.
// 3. Project submissions (GitHub repo, demo, deck, video, tech stack).
// 4. Judge accounts with scoring rubrics & multi-criteria evaluation.
// 5. Normalized leaderboard & official results publishing.
// 6. Prize tracking with disbursement status & certificate issuance.

import { db } from "@/lib/db";
import { type TeamMemberRole, type PrizeDisbursementStatus, Prisma } from "@prisma/client";
import { enqueueEmail } from "@/server/email/queue";
import { EmailTemplate } from "@prisma/client";

export interface CreateTeamInput {
  hackathonDetailId: string;
  leaderId: string;
  name: string;
  problemStatementId?: string;
  track?: string;
}

export interface SubmitProjectInput {
  teamId: string;
  userId: string;
  title: string;
  tagline?: string;
  description: string;
  track: string;
  repoUrl: string;
  demoUrl?: string;
  deckUrl?: string;
  videoUrl?: string;
  techStack?: string[];
  problemStatementId?: string;
}

export interface JudgeScoreInput {
  submissionId: string;
  judgeUserId: string;
  criteriaScores: Record<string, number>;
  feedback?: string;
  privateNotes?: string;
}

export interface PublishResultsInput {
  hackathonDetailId: string;
  adminUserId: string;
  winnerSelections: Array<{
    submissionId: string;
    rank: number;
    winnerTier: string;
    prizeId?: string;
  }>;
}

/**
 * Generates an uppercase, human-readable invite code: KX-TEAM-XXXX
 */
export function generateTeamInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KX-TEAM-${random}`;
}

/**
 * Syncs default rubric criteria (5 pillars, 20 pts each = 100 pts) if none exist.
 */
export async function syncDefaultRubrics(hackathonDetailId: string) {
  const existing = await db.hackathonRubricCriterion.count({
    where: { hackathonDetailId },
  });

  if (existing > 0) return;

  const defaultRubrics = [
    {
      name: "Technical Innovation & Complexity",
      description: "Novelty of architecture, algorithms, and deep technical engineering.",
      maxScore: 20,
      weight: 1.0,
      sortOrder: 1,
    },
    {
      name: "Execution & Functionality",
      description: "Working demo stability, code quality, test coverage, and completeness.",
      maxScore: 20,
      weight: 1.0,
      sortOrder: 2,
    },
    {
      name: "UI/UX & Design Polish",
      description: "Intuitive user journeys, aesthetics, responsiveness, and developer experience.",
      maxScore: 20,
      weight: 1.0,
      sortOrder: 3,
    },
    {
      name: "Impact & Practicality",
      description: "Real-world utility, commercial feasibility, and problem-solution fit.",
      maxScore: 20,
      weight: 1.0,
      sortOrder: 4,
    },
    {
      name: "Pitch & Presentation",
      description: "Clear communication, slide deck structure, and demo storytelling.",
      maxScore: 20,
      weight: 1.0,
      sortOrder: 5,
    },
  ];

  await db.hackathonRubricCriterion.createMany({
    data: defaultRubrics.map((r) => ({
      ...r,
      hackathonDetailId,
    })),
  });
}

/**
 * Syncs problem statements from HackathonDetail.problemStatements JSON into relational table.
 */
export async function syncProblemStatements(hackathonDetailId: string) {
  const existing = await db.hackathonProblemStatement.count({
    where: { hackathonDetailId },
  });

  if (existing > 0) return;

  const detail = await db.hackathonDetail.findUnique({
    where: { id: hackathonDetailId },
  });

  if (!detail || !detail.problemStatements || !Array.isArray(detail.problemStatements)) {
    return;
  }

  const list = detail.problemStatements as Array<{
    id?: string;
    title: string;
    description: string;
    track: string;
    criteria?: string[];
  }>;

  for (let i = 0; i < list.length; i++) {
    const ps = list[i];
    const slug = ps.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    await db.hackathonProblemStatement.create({
      data: {
        hackathonDetailId,
        title: ps.title,
        slug: slug || `ps-${i + 1}`,
        description: ps.description,
        track: ps.track,
        criteria: ps.criteria || [],
        sortOrder: i + 1,
      },
    });
  }
}

/**
 * Syncs prizes from HackathonDetail.prizes JSON into relational table.
 */
export async function syncPrizes(hackathonDetailId: string) {
  const existing = await db.hackathonPrize.count({
    where: { hackathonDetailId },
  });

  if (existing > 0) return;

  const detail = await db.hackathonDetail.findUnique({
    where: { id: hackathonDetailId },
  });

  if (!detail || !detail.prizes || !Array.isArray(detail.prizes)) {
    return;
  }

  const list = detail.prizes as Array<{
    title: string;
    amount?: string | number;
    perks?: string[];
    track?: string;
  }>;

  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    let cash = 0;
    if (typeof p.amount === "number") {
      cash = p.amount;
    } else if (typeof p.amount === "string") {
      const match = p.amount.replace(/[^0-9]/g, "");
      if (match) cash = parseInt(match, 10);
    }

    await db.hackathonPrize.create({
      data: {
        hackathonDetailId,
        title: p.title,
        rank: i + 1,
        track: p.track || null,
        cashAmount: new Prisma.Decimal(cash),
        perks: p.perks || [],
        disbursementStatus: "PENDING",
      },
    });
  }
}

/**
 * Retrieves full hackathon engine metadata and configuration.
 */
export async function getHackathonEngineData(eventIdOrSlug: string, currentUserId?: string) {
  const event = await db.event.findFirst({
    where: {
      OR: [{ id: eventIdOrSlug }, { slug: eventIdOrSlug }],
    },
    include: {
      city: true,
      tracks: { orderBy: { sortOrder: "asc" } },
      speakers: {
        where: { role: "JUDGE" },
        include: { speaker: true },
      },
      hackathonDetail: {
        include: {
          problemStatementsList: { orderBy: { sortOrder: "asc" } },
          rubricCriteria: { orderBy: { sortOrder: "asc" } },
          prizesList: {
            orderBy: [{ rank: "asc" }, { createdAt: "asc" }],
            include: { winningTeam: true },
          },
          judges: {
            include: { user: true },
          },
          _count: {
            select: {
              teams: true,
              submissions: true,
              judges: true,
            },
          },
        },
      },
    },
  });

  if (!event || !event.hackathonDetail) {
    return null;
  }

  // Auto-sync problem statements, rubrics, and prizes if not populated
  if (event.hackathonDetail.problemStatementsList.length === 0) {
    await syncProblemStatements(event.hackathonDetail.id);
  }
  if (event.hackathonDetail.rubricCriteria.length === 0) {
    await syncDefaultRubrics(event.hackathonDetail.id);
  }
  if (event.hackathonDetail.prizesList.length === 0) {
    await syncPrizes(event.hackathonDetail.id);
  }

  // Re-fetch populated detail
  const detail = await db.hackathonDetail.findUnique({
    where: { id: event.hackathonDetail.id },
    include: {
      problemStatementsList: { orderBy: { sortOrder: "asc" } },
      rubricCriteria: { orderBy: { sortOrder: "asc" } },
      prizesList: {
        orderBy: [{ rank: "asc" }, { createdAt: "asc" }],
        include: { winningTeam: true },
      },
      judges: {
        include: { user: true },
      },
      _count: {
        select: {
          teams: true,
          submissions: true,
          judges: true,
        },
      },
    },
  });

  if (!detail) return null;

  let userTeam = null;
  if (currentUserId) {
    userTeam = await getUserHackathonTeam(detail.id, currentUserId);
  }

  return {
    event: {
      id: event.id,
      title: event.title,
      slug: event.slug,
      startDate: event.startDate.toISOString(),
    },
    detail: {
      id: detail.id,
      eventId: detail.eventId,
      minTeamSize: detail.minTeamSize,
      maxTeamSize: detail.maxTeamSize,
      rules: detail.rules,
      submissionDeadline: detail.submissionDeadline?.toISOString() || null,
      isResultsPublished: detail.isResultsPublished,
      resultsPublishedAt: detail.resultsPublishedAt?.toISOString() || null,
      problemStatementsList: detail.problemStatementsList.map((ps) => ({
        id: ps.id,
        title: ps.title,
        slug: ps.slug,
        description: ps.description,
        track: ps.track,
        criteria: ps.criteria,
        sponsorName: ps.sponsorName,
        sponsorLogo: ps.sponsorLogo,
      })),
      rubricCriteria: detail.rubricCriteria.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        maxScore: r.maxScore,
        weight: Number(r.weight),
      })),
      prizesList: detail.prizesList.map((p) => ({
        id: p.id,
        title: p.title,
        rank: p.rank,
        track: p.track,
        cashAmount: Number(p.cashAmount),
        currency: p.currency,
        perks: p.perks,
        disbursementStatus: p.disbursementStatus,
        winningTeam: p.winningTeam ? { id: p.winningTeam.id, name: p.winningTeam.name } : null,
      })),
    },
    userTeam: userTeam
      ? {
          id: userTeam.id,
          name: userTeam.name,
          slug: userTeam.slug,
          inviteCode: userTeam.inviteCode,
          leaderId: userTeam.leaderId,
          problemStatementId: userTeam.problemStatementId,
          track: userTeam.track,
          status: userTeam.status,
          members: userTeam.members.map((m) => ({
            id: m.id,
            userId: m.userId,
            role: m.role,
            status: m.status,
            user: {
              id: m.user.id,
              name: m.user.name,
              email: m.user.email ?? "",
              image: m.user.image,
              username: m.user.username,
            },
          })),
          submission: userTeam.submission
            ? {
                id: userTeam.submission.id,
                title: userTeam.submission.title,
                tagline: userTeam.submission.tagline,
                description: userTeam.submission.description,
                track: userTeam.submission.track,
                repoUrl: userTeam.submission.repoUrl,
                demoUrl: userTeam.submission.demoUrl,
                deckUrl: userTeam.submission.deckUrl,
                videoUrl: userTeam.submission.videoUrl,
                techStack: userTeam.submission.techStack,
                status: userTeam.submission.status,
                submittedAt: userTeam.submission.submittedAt.toISOString(),
                normalizedScore: userTeam.submission.normalizedScore
                  ? Number(userTeam.submission.normalizedScore)
                  : null,
                rank: userTeam.submission.rank,
                isWinner: userTeam.submission.isWinner,
                winnerTier: userTeam.submission.winnerTier,
              }
            : null,
        }
      : null,
    currentUserId,
  };
}

/**
 * Creates a new hackathon team with the creator as Team Leader.
 */
export async function createHackathonTeam(input: CreateTeamInput) {
  const detail = await db.hackathonDetail.findUnique({
    where: { id: input.hackathonDetailId },
  });

  if (!detail) {
    throw new Error("Hackathon not found");
  }

  // Ensure user is not already in an active team for this hackathon
  const existingMembership = await db.hackathonTeamMember.findFirst({
    where: {
      userId: input.leaderId,
      team: { hackathonDetailId: input.hackathonDetailId },
      status: "ACCEPTED",
    },
    include: { team: true },
  });

  if (existingMembership) {
    throw new Error(`You are already a member of team "${existingMembership.team.name}".`);
  }

  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  let inviteCode = generateTeamInviteCode();
  let codeCollision = await db.hackathonTeam.findUnique({ where: { inviteCode } });
  while (codeCollision) {
    inviteCode = generateTeamInviteCode();
    codeCollision = await db.hackathonTeam.findUnique({ where: { inviteCode } });
  }

  const team = await db.hackathonTeam.create({
    data: {
      hackathonDetailId: input.hackathonDetailId,
      leaderId: input.leaderId,
      name: input.name,
      slug: slug || `team-${Date.now().toString().slice(-4)}`,
      inviteCode,
      problemStatementId: input.problemStatementId || null,
      track: input.track || null,
      status: detail.minTeamSize <= 1 ? "READY" : "FORMING",
      members: {
        create: {
          userId: input.leaderId,
          role: "LEADER",
          status: "ACCEPTED",
        },
      },
    },
    include: {
      members: { include: { user: true } },
      problemStatement: true,
      submission: true,
    },
  });

  return team;
}

/**
 * Joins a team using its unique invite code.
 */
export async function joinTeamByInviteCode(input: {
  inviteCode: string;
  userId: string;
  role?: TeamMemberRole;
}) {
  const team = await db.hackathonTeam.findUnique({
    where: { inviteCode: input.inviteCode },
    include: {
      hackathonDetail: true,
      members: true,
    },
  });

  if (!team) {
    throw new Error("Invalid invite code. Team not found.");
  }

  if (team.status === "DISQUALIFIED") {
    throw new Error("This team has been disqualified.");
  }

  const currentAcceptedMembers = team.members.filter((m) => m.status === "ACCEPTED");
  if (currentAcceptedMembers.length >= team.hackathonDetail.maxTeamSize) {
    throw new Error(
      `Team is already full (maximum ${team.hackathonDetail.maxTeamSize} builders allowed).`
    );
  }

  // Check if user is already a member of this team
  const existingInThisTeam = team.members.find((m) => m.userId === input.userId);
  if (existingInThisTeam) {
    if (existingInThisTeam.status === "ACCEPTED") {
      return team;
    }
    // Update invited to accepted
    await db.hackathonTeamMember.update({
      where: { id: existingInThisTeam.id },
      data: { status: "ACCEPTED", joinedAt: new Date() },
    });
  } else {
    // Check if user is enrolled in another team in this hackathon
    const inOtherTeam = await db.hackathonTeamMember.findFirst({
      where: {
        userId: input.userId,
        team: { hackathonDetailId: team.hackathonDetailId },
        status: "ACCEPTED",
      },
      include: { team: true },
    });

    if (inOtherTeam) {
      throw new Error(`You are already in another team ("${inOtherTeam.team.name}").`);
    }

    await db.hackathonTeamMember.create({
      data: {
        teamId: team.id,
        userId: input.userId,
        role: input.role || "DEVELOPER",
        status: "ACCEPTED",
      },
    });
  }

  // If member count now meets minimum, update team to READY
  const updatedMemberCount = currentAcceptedMembers.length + 1;
  if (updatedMemberCount >= team.hackathonDetail.minTeamSize && team.status === "FORMING") {
    await db.hackathonTeam.update({
      where: { id: team.id },
      data: { status: "READY" },
    });
  }

  return db.hackathonTeam.findUnique({
    where: { id: team.id },
    include: {
      members: { include: { user: true } },
      problemStatement: true,
      submission: true,
    },
  });
}

/**
 * Selects or updates a team's problem statement and track.
 */
export async function selectTeamProblemStatement(input: {
  teamId: string;
  leaderUserId: string;
  problemStatementId: string;
}) {
  const team = await db.hackathonTeam.findUnique({
    where: { id: input.teamId },
  });

  if (!team) throw new Error("Team not found");
  if (team.leaderId !== input.leaderUserId) {
    throw new Error("Only the team leader can select the problem statement.");
  }

  const ps = await db.hackathonProblemStatement.findUnique({
    where: { id: input.problemStatementId },
  });

  if (!ps) throw new Error("Problem statement not found");

  const updated = await db.hackathonTeam.update({
    where: { id: input.teamId },
    data: {
      problemStatementId: ps.id,
      track: ps.track,
    },
    include: {
      problemStatement: true,
      members: { include: { user: true } },
      submission: true,
    },
  });

  // If submission already exists, keep problem statement in sync
  if (updated.submission) {
    await db.hackathonSubmission.update({
      where: { id: updated.submission.id },
      data: {
        problemStatementId: ps.id,
        track: ps.track,
      },
    });
  }

  return updated;
}

/**
 * Gets a user's active team for a given hackathon.
 */
export async function getUserHackathonTeam(hackathonDetailId: string, userId: string) {
  const member = await db.hackathonTeamMember.findFirst({
    where: {
      userId,
      status: "ACCEPTED",
      team: { hackathonDetailId },
    },
    include: {
      team: {
        include: {
          members: {
            include: { user: true },
            orderBy: { joinedAt: "asc" },
          },
          problemStatement: true,
          submission: {
            include: {
              scores: true,
            },
          },
        },
      },
    },
  });

  return member ? member.team : null;
}

/**
 * Submits or edits a project submission for a hackathon team.
 */
export async function submitProject(input: SubmitProjectInput) {
  const team = await db.hackathonTeam.findUnique({
    where: { id: input.teamId },
    include: {
      hackathonDetail: true,
      members: true,
      submission: true,
    },
  });

  if (!team) throw new Error("Team not found");

  const isMember = team.members.some((m) => m.userId === input.userId && m.status === "ACCEPTED");
  if (!isMember) {
    throw new Error("You must be an accepted member of this team to submit a project.");
  }

  // Verify deadline if configured
  if (team.hackathonDetail.submissionDeadline) {
    const now = new Date();
    if (now > team.hackathonDetail.submissionDeadline) {
      throw new Error(
        `Submission deadline has passed (${team.hackathonDetail.submissionDeadline.toLocaleString()}).`
      );
    }
  }

  const problemStatementId = input.problemStatementId || team.problemStatementId || null;
  const track = input.track || team.track || "General Track";

  const submission = await db.hackathonSubmission.upsert({
    where: { teamId: input.teamId },
    update: {
      title: input.title,
      tagline: input.tagline || null,
      description: input.description,
      track,
      repoUrl: input.repoUrl,
      demoUrl: input.demoUrl || null,
      deckUrl: input.deckUrl || null,
      videoUrl: input.videoUrl || null,
      techStack: input.techStack || [],
      problemStatementId,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
    create: {
      hackathonDetailId: team.hackathonDetailId,
      teamId: input.teamId,
      title: input.title,
      tagline: input.tagline || null,
      description: input.description,
      track,
      repoUrl: input.repoUrl,
      demoUrl: input.demoUrl || null,
      deckUrl: input.deckUrl || null,
      videoUrl: input.videoUrl || null,
      techStack: input.techStack || [],
      problemStatementId,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  // Update team status to SUBMITTED
  await db.hackathonTeam.update({
    where: { id: input.teamId },
    data: { status: "SUBMITTED" },
  });

  return submission;
}

/**
 * Assigns a user as an official hackathon judge and ensures UserRole.JUDGE.
 */
export async function assignHackathonJudge(input: {
  hackathonDetailId: string;
  userId: string;
  title?: string;
  company?: string;
  bio?: string;
  track?: string;
}) {
  const user = await db.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new Error("User not found");

  // Upgrade role if standard user
  if (user.role === "MEMBER" || user.role === "VIEWER") {
    await db.user.update({
      where: { id: input.userId },
      data: { role: "JUDGE" },
    });
  }

  const judge = await db.hackathonJudge.upsert({
    where: {
      hackathonDetailId_userId: {
        hackathonDetailId: input.hackathonDetailId,
        userId: input.userId,
      },
    },
    update: {
      title: input.title || null,
      company: input.company || null,
      bio: input.bio || null,
      track: input.track || "ALL",
      active: true,
    },
    create: {
      hackathonDetailId: input.hackathonDetailId,
      userId: input.userId,
      title: input.title || null,
      company: input.company || null,
      bio: input.bio || null,
      track: input.track || "ALL",
      active: true,
    },
    include: {
      user: true,
    },
  });

  return judge;
}

/**
 * Retrieves all submissions assigned to a judge along with existing score if evaluated.
 */
export async function getJudgeEvaluationQueue(hackathonDetailId: string, judgeUserId: string) {
  let judge = await db.hackathonJudge.findFirst({
    where: {
      hackathonDetailId,
      userId: judgeUserId,
      active: true,
    },
  });

  if (!judge) {
    const user = await db.user.findUnique({ where: { id: judgeUserId } });
    if (user && ["SUPER_ADMIN", "ADMIN", "JUDGE", "EVENT_MANAGER"].includes(user.role)) {
      judge = await db.hackathonJudge.create({
        data: {
          hackathonDetailId,
          userId: user.id,
          title: user.role === "JUDGE" ? "Official Hackathon Judge" : "Grand Jury / Organizer",
          company: "Kailshians Web Services",
          track: "ALL",
          active: true,
        },
      });
    } else {
      return null;
    }
  }

  const rubrics = await db.hackathonRubricCriterion.findMany({
    where: { hackathonDetailId },
    orderBy: { sortOrder: "asc" },
  });

  const submissions = await db.hackathonSubmission.findMany({
    where: {
      hackathonDetailId,
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "EVALUATED"] },
      ...(judge.track && judge.track !== "ALL" ? { track: judge.track } : {}),
    },
    include: {
      team: {
        include: {
          members: { include: { user: true } },
        },
      },
      problemStatement: true,
      scores: {
        where: { judgeId: judge.id },
      },
    },
    orderBy: [{ submittedAt: "asc" }],
  });

  return {
    judge,
    rubrics,
    submissions: submissions.map((sub) => ({
      ...sub,
      myScore: sub.scores[0] || null,
    })),
  };
}

/**
 * Evaluates and scores a project submission using multi-criteria rubric.
 */
export async function submitJudgeScore(input: JudgeScoreInput) {
  const submission = await db.hackathonSubmission.findUnique({
    where: { id: input.submissionId },
    include: { hackathonDetail: true },
  });

  if (!submission) throw new Error("Submission not found");

  let judge = await db.hackathonJudge.findFirst({
    where: {
      hackathonDetailId: submission.hackathonDetailId,
      userId: input.judgeUserId,
      active: true,
    },
  });

  if (!judge) {
    const user = await db.user.findUnique({ where: { id: input.judgeUserId } });
    if (user && ["SUPER_ADMIN", "ADMIN", "JUDGE", "EVENT_MANAGER"].includes(user.role)) {
      judge = await db.hackathonJudge.create({
        data: {
          hackathonDetailId: submission.hackathonDetailId,
          userId: user.id,
          title: user.role === "JUDGE" ? "Official Hackathon Judge" : "Grand Jury / Organizer",
          company: "Kailshians Web Services",
          track: "ALL",
          active: true,
        },
      });
    } else {
      throw new Error("You are not an authorized judge for this hackathon.");
    }
  }

  // Compute total score across criteria
  const rubrics = await db.hackathonRubricCriterion.findMany({
    where: { hackathonDetailId: submission.hackathonDetailId },
  });

  let totalScore = 0;
  for (const criterion of rubrics) {
    const raw = input.criteriaScores[criterion.id] ?? 0;
    const clamped = Math.min(criterion.maxScore, Math.max(0, raw));
    totalScore += clamped * Number(criterion.weight);
  }

  const score = await db.hackathonScore.upsert({
    where: {
      submissionId_judgeId: {
        submissionId: input.submissionId,
        judgeId: judge.id,
      },
    },
    update: {
      totalScore,
      criteriaScores: input.criteriaScores,
      feedback: input.feedback || null,
      privateNotes: input.privateNotes || null,
      submittedAt: new Date(),
    },
    create: {
      submissionId: input.submissionId,
      judgeId: judge.id,
      totalScore,
      criteriaScores: input.criteriaScores,
      feedback: input.feedback || null,
      privateNotes: input.privateNotes || null,
      submittedAt: new Date(),
    },
  });

  // Recalculate normalized average score for the submission
  const allScores = await db.hackathonScore.findMany({
    where: { submissionId: input.submissionId },
  });

  const avgScore =
    allScores.reduce((acc, s) => acc + Number(s.totalScore), 0) / (allScores.length || 1);

  await db.hackathonSubmission.update({
    where: { id: input.submissionId },
    data: {
      normalizedScore: Math.round(avgScore * 10) / 10,
      status: "EVALUATED",
    },
  });

  return score;
}

/**
 * Retrieves the hackathon leaderboard.
 * Public access is hidden until results are published, unless accessed by admin or judge.
 */
export async function getHackathonLeaderboard(
  hackathonDetailId: string,
  options?: {
    track?: string;
    isPrivileged?: boolean; // admin or judge
  }
) {
  const detail = await db.hackathonDetail.findUnique({
    where: { id: hackathonDetailId },
  });

  if (!detail) return null;

  const isPublished = detail.isResultsPublished;
  const canView = isPublished || options?.isPrivileged;

  const submissions = await db.hackathonSubmission.findMany({
    where: {
      hackathonDetailId,
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "EVALUATED"] },
      ...(options?.track ? { track: options.track } : {}),
    },
    include: {
      team: {
        include: {
          members: { include: { user: true } },
          prizesWon: true,
        },
      },
      problemStatement: true,
      _count: {
        select: { scores: true },
      },
    },
    orderBy: [
      { isWinner: "desc" },
      { rank: "asc" },
      { normalizedScore: "desc" },
      { submittedAt: "asc" },
    ],
  });

  const rankedSubmissions = submissions.map((sub, idx) => ({
    id: sub.id,
    rank: sub.rank || idx + 1,
    title: sub.title,
    tagline: sub.tagline,
    description: sub.description,
    track: sub.track,
    repoUrl: sub.repoUrl,
    demoUrl: sub.demoUrl,
    deckUrl: sub.deckUrl,
    videoUrl: sub.videoUrl,
    techStack: sub.techStack,
    normalizedScore: canView ? sub.normalizedScore : null,
    totalJudgesScored: sub._count.scores,
    isWinner: sub.isWinner,
    winnerTier: sub.winnerTier,
    team: {
      id: sub.team.id,
      name: sub.team.name,
      membersCount: sub.team.members.length,
      members: sub.team.members.map((m) => ({
        id: m.id,
        name: m.user.name || "Builder",
        role: m.role,
        image: m.user.image,
      })),
      prizesWon: sub.team.prizesWon,
    },
    problemStatement: sub.problemStatement
      ? {
          id: sub.problemStatement.id,
          title: sub.problemStatement.title,
        }
      : null,
  }));

  return {
    isResultsPublished: detail.isResultsPublished,
    resultsPublishedAt: detail.resultsPublishedAt?.toISOString() || null,
    totalSubmissions: submissions.length,
    canViewScores: canView,
    submissions: rankedSubmissions,
  };
}

/**
 * Admin officially finalizes winner ranks, links prizes, and publishes results.
 */
export async function publishHackathonResults(input: PublishResultsInput) {
  // Update winner ranks and tiers
  for (const selection of input.winnerSelections) {
    const isWinner = Boolean(selection.winnerTier && selection.rank <= 3);

    await db.hackathonSubmission.update({
      where: { id: selection.submissionId },
      data: {
        rank: selection.rank,
        winnerTier: selection.winnerTier || null,
        isWinner,
      },
    });

    const prizeToLink = selection.prizeId
      ? { id: selection.prizeId }
      : await db.hackathonPrize.findFirst({
          where: {
            hackathonDetailId: input.hackathonDetailId,
            rank: selection.rank,
          },
        });

    if (prizeToLink) {
      const sub = await db.hackathonSubmission.findUnique({
        where: { id: selection.submissionId },
        select: { teamId: true },
      });

      if (sub) {
        await db.hackathonPrize.update({
          where: { id: prizeToLink.id },
          data: {
            winningTeamId: sub.teamId,
          },
        });
      }
    }
  }

  // Update hackathon detail to published
  const updatedDetail = await db.hackathonDetail.update({
    where: { id: input.hackathonDetailId },
    data: {
      isResultsPublished: true,
      resultsPublishedAt: new Date(),
    },
    include: {
      prizesList: { include: { winningTeam: true } },
    },
  });

  return updatedDetail;
}

/**
 * Updates prize disbursement status and financial settlement record.
 */
export async function updatePrizeDisbursement(input: {
  prizeId: string;
  status: PrizeDisbursementStatus;
  transactionRef?: string;
  notes?: string;
}) {
  const prize = await db.hackathonPrize.update({
    where: { id: input.prizeId },
    data: {
      disbursementStatus: input.status,
      transactionRef: input.transactionRef || null,
      notes: input.notes || null,
      disbursedAt: input.status === "DISBURSED" ? new Date() : null,
    },
    include: {
      winningTeam: {
        include: {
          members: { include: { user: true } },
        },
      },
    },
  });

  return prize;
}

/**
 * Dispatches automated hackathon participation or winner certificates.
 */
export async function issueHackathonCertificates(input: {
  hackathonDetailId: string;
  issueType: "PARTICIPANTS" | "WINNERS" | "ALL";
}) {
  const detail = await db.hackathonDetail.findUnique({
    where: { id: input.hackathonDetailId },
    include: { event: true },
  });

  if (!detail) throw new Error("Hackathon not found");

  const teams = await db.hackathonTeam.findMany({
    where: {
      hackathonDetailId: input.hackathonDetailId,
      status: { in: ["READY", "SUBMITTED"] },
    },
    include: {
      members: { include: { user: true } },
      submission: true,
    },
  });

  // Get or create a default certificate template
  let template = await db.certificateTemplate.findFirst({
    where: { isDefault: true },
  });

  if (!template) {
    template = await db.certificateTemplate.findFirst();
  }

  if (!template) {
    template = await db.certificateTemplate.create({
      data: {
        name: `${detail.event.title} Official Certificate`,
        description: `Awarded for engineering excellence in ${detail.event.title}.`,
        templateUrl: "https://assets.kailshiansx.com/certificates/hackathon-default.png",
        fields: [],
        isDefault: true,
      },
    });
  }

  const issuedList: Array<{ email: string; name: string; certId: string }> = [];

  for (const team of teams) {
    const isWinner = team.submission?.isWinner;
    if (input.issueType === "WINNERS" && !isWinner) continue;
    if (input.issueType === "PARTICIPANTS" && isWinner) continue;

    for (const member of team.members) {
      if (member.status !== "ACCEPTED" || !member.user.email) continue;

      const certUniqueId = `KX-HACK-${detail.event.slug.slice(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Create or update certificate record
      const cert = await db.certificate.create({
        data: {
          uniqueId: certUniqueId,
          eventId: detail.eventId,
          templateId: template.id,
          participantName: member.user.name || "Hackathon Builder",
          participantEmail: member.user.email,
          userId: member.user.id,
          deliveryStatus: "SENT",
        },
      });

      // Enqueue certificate issued email notification
      await enqueueEmail({
        template: EmailTemplate.CERTIFICATE_ISSUED,
        recipient: member.user.email,
        payload: {
          name: member.user.name || "Builder",
          eventTitle: detail.event.title,
          verificationUrl: `https://kailshiansx.com/verify?id=${certUniqueId}`,
          uniqueId: certUniqueId,
          downloadUrl: `https://kailshiansx.com/verify?id=${certUniqueId}`,
        },
        immediate: false,
      });

      issuedList.push({
        email: member.user.email,
        name: member.user.name || "Builder",
        certId: cert.uniqueId,
      });
    }
  }

  return {
    totalIssued: issuedList.length,
    issuedCount: issuedList.length,
    certificates: issuedList,
  };
}
