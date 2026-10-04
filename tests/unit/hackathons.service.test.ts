// tests/unit/hackathons.service.test.ts
// Comprehensive unit tests for Hackathon Engine per PRD §9 & §24:
// 1. Team formation, invite code generation & duplicate membership prevention.
// 2. Joining team via invite code with max team size enforcement.
// 3. Problem statement selection with leader-only authorization.
// 4. Project submission with repo, demo, deck, tech stack & deadline enforcement.
// 5. Judge scoring with multi-criteria rubric & normalized score computation.
// 6. Results publishing & winner rank assignments.
// 7. Prize disbursement tracking with transaction references.

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateTeamInviteCode,
  createHackathonTeam,
  joinTeamByInviteCode,
  selectTeamProblemStatement,
  submitProject,
  submitJudgeScore,
  publishHackathonResults,
  updatePrizeDisbursement,
} from "@/server/hackathons/service";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

vi.mock("@/lib/db", () => ({
  db: {
    hackathonDetail: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    hackathonTeam: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    hackathonTeamMember: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    hackathonProblemStatement: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    hackathonSubmission: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    hackathonJudge: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    hackathonRubricCriterion: {
      findMany: vi.fn(),
      createMany: vi.fn(),
      count: vi.fn(),
    },
    hackathonScore: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    hackathonPrize: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    certificateTemplate: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    certificate: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/server/email/queue", () => ({
  enqueueEmail: vi.fn().mockResolvedValue({ id: "mock-email-job" }),
}));

describe("Hackathon Engine Service (PRD §9 & §24)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Invite Code Generation", () => {
    it("generates invite codes matching KX-TEAM-XXXX format", () => {
      const code = generateTeamInviteCode();
      expect(code).toMatch(/^KX-TEAM-[A-Z0-9]{4,6}$/);
    });
  });

  describe("Team Creation", () => {
    it("creates a team and assigns creator as LEADER", async () => {
      vi.mocked(db.hackathonDetail.findUnique).mockResolvedValue({
        id: "detail-1",
        eventId: "event-1",
        minTeamSize: 1,
        maxTeamSize: 4,
      } as unknown as never);

      vi.mocked(db.hackathonTeamMember.findFirst).mockResolvedValue(null);
      vi.mocked(db.hackathonTeam.findUnique).mockResolvedValue(null);

      const mockCreatedTeam = {
        id: "team-1",
        hackathonDetailId: "detail-1",
        name: "Apex Builders",
        slug: "apex-builders",
        inviteCode: "KX-TEAM-APEX",
        leaderId: "user-1",
        status: "FORMING",
        track: "Autonomous AI",
        members: [
          {
            id: "m-1",
            userId: "user-1",
            role: "LEADER",
            status: "ACCEPTED",
          },
        ],
      };

      vi.mocked(db.hackathonTeam.create).mockResolvedValue(mockCreatedTeam as unknown as never);

      const result = await createHackathonTeam({
        hackathonDetailId: "detail-1",
        leaderId: "user-1",
        name: "Apex Builders",
        track: "Autonomous AI",
      });

      expect(db.hackathonTeam.create).toHaveBeenCalled();
      expect(result.name).toBe("Apex Builders");
      expect(result.leaderId).toBe("user-1");
    });

    it("prevents user from joining or creating multiple teams in the same hackathon", async () => {
      vi.mocked(db.hackathonDetail.findUnique).mockResolvedValue({
        id: "detail-1",
      } as unknown as never);

      vi.mocked(db.hackathonTeamMember.findFirst).mockResolvedValue({
        id: "m-existing",
        team: { name: "Existing Team" },
      } as unknown as never);

      await expect(
        createHackathonTeam({
          hackathonDetailId: "detail-1",
          leaderId: "user-1",
          name: "Duplicate Team",
        })
      ).rejects.toThrow("already a member of team");
    });
  });

  describe("Joining Team via Invite Code", () => {
    it("successfully adds member when team capacity allows", async () => {
      const updatedTeam = {
        id: "team-1",
        name: "Apex Builders",
        members: [
          { userId: "leader-1", status: "ACCEPTED" },
          { userId: "dev-1", status: "ACCEPTED" },
          { userId: "user-new", status: "ACCEPTED", role: "DEVELOPER" },
        ],
      };

      vi.mocked(db.hackathonTeam.findUnique)
        .mockResolvedValueOnce({
          id: "team-1",
          name: "Apex Builders",
          hackathonDetailId: "detail-1",
          hackathonDetail: { maxTeamSize: 4, minTeamSize: 2 },
          status: "FORMING",
          members: [
            { userId: "leader-1", status: "ACCEPTED" },
            { userId: "dev-1", status: "ACCEPTED" },
          ],
        } as unknown as never)
        .mockResolvedValueOnce(updatedTeam as unknown as never);

      vi.mocked(db.hackathonTeamMember.findFirst).mockResolvedValue(null);
      vi.mocked(db.hackathonTeam.update).mockResolvedValue(updatedTeam as unknown as never);

      const result = await joinTeamByInviteCode({
        inviteCode: "KX-TEAM-APEX",
        userId: "user-new",
        role: "DEVELOPER",
      });

      expect(db.hackathonTeamMember.create).toHaveBeenCalled();
      expect(result?.members.length).toBe(3);
    });

    it("enforces maximum team size limit", async () => {
      vi.mocked(db.hackathonTeam.findUnique).mockResolvedValue({
        id: "team-1",
        name: "Full Squad",
        hackathonDetailId: "detail-1",
        hackathonDetail: { maxTeamSize: 3 },
        members: [
          { userId: "u-1", status: "ACCEPTED" },
          { userId: "u-2", status: "ACCEPTED" },
          { userId: "u-3", status: "ACCEPTED" },
        ],
      } as unknown as never);

      await expect(
        joinTeamByInviteCode({
          inviteCode: "KX-TEAM-FULL",
          userId: "user-overflow",
        })
      ).rejects.toThrow(/already full/i);
    });
  });

  describe("Problem Statement Selection", () => {
    it("allows team leader to select a problem statement", async () => {
      vi.mocked(db.hackathonTeam.findUnique).mockResolvedValue({
        id: "team-1",
        leaderId: "leader-1",
      } as unknown as never);

      vi.mocked(db.hackathonProblemStatement.findUnique).mockResolvedValue({
        id: "ps-1",
        title: "Autonomous Agentic Coding",
        track: "Autonomous AI Agents",
      } as unknown as never);

      vi.mocked(db.hackathonTeam.update).mockResolvedValue({
        id: "team-1",
        problemStatementId: "ps-1",
        track: "Autonomous AI Agents",
      } as unknown as never);

      const result = await selectTeamProblemStatement({
        teamId: "team-1",
        leaderUserId: "leader-1",
        problemStatementId: "ps-1",
      });

      expect(result.problemStatementId).toBe("ps-1");
      expect(result.track).toBe("Autonomous AI Agents");
    });

    it("rejects non-leader members from selecting problem statement", async () => {
      vi.mocked(db.hackathonTeam.findUnique).mockResolvedValue({
        id: "team-1",
        leaderId: "actual-leader",
      } as unknown as never);

      await expect(
        selectTeamProblemStatement({
          teamId: "team-1",
          leaderUserId: "unauthorized-member",
          problemStatementId: "ps-1",
        })
      ).rejects.toThrow("Only the team leader");
    });
  });

  describe("Project Submission", () => {
    it("records submission with GitHub, demo, pitch deck, and video", async () => {
      vi.mocked(db.hackathonTeam.findUnique).mockResolvedValue({
        id: "team-1",
        hackathonDetailId: "detail-1",
        track: "Autonomous AI",
        hackathonDetail: {
          submissionDeadline: new Date(Date.now() + 86400000), // tomorrow
        },
        members: [{ userId: "builder-1", status: "ACCEPTED" }],
      } as unknown as never);

      vi.mocked(db.hackathonSubmission.findUnique).mockResolvedValue(null);

      const mockSubmission = {
        id: "sub-1",
        teamId: "team-1",
        title: "KWS Self-Healing Cluster",
        tagline: "Autonomous Kubernetes SRE in 100 LOC",
        repoUrl: "https://github.com/kailshiansx/cluster-heal",
        demoUrl: "https://cluster-heal.kailshiansx.com",
        deckUrl: "https://pitch.kailshiansx.com/deck.pdf",
        videoUrl: "https://youtube.com/watch?v=mock",
        techStack: ["Next.js", "Go", "Kubernetes", "PostgreSQL"],
        status: "SUBMITTED",
      };

      vi.mocked(db.hackathonSubmission.upsert).mockResolvedValue(
        mockSubmission as unknown as never
      );
      vi.mocked(db.hackathonTeam.update).mockResolvedValue({} as unknown as never);

      const result = await submitProject({
        teamId: "team-1",
        userId: "builder-1",
        title: "KWS Self-Healing Cluster",
        tagline: "Autonomous Kubernetes SRE in 100 LOC",
        description: "Full self-healing Kubernetes operator.",
        track: "Autonomous AI",
        repoUrl: "https://github.com/kailshiansx/cluster-heal",
        demoUrl: "https://cluster-heal.kailshiansx.com",
        deckUrl: "https://pitch.kailshiansx.com/deck.pdf",
        videoUrl: "https://youtube.com/watch?v=mock",
        techStack: ["Next.js", "Go", "Kubernetes", "PostgreSQL"],
      });

      expect(db.hackathonSubmission.upsert).toHaveBeenCalled();
      expect(result.status).toBe("SUBMITTED");
      expect(result.repoUrl).toBe("https://github.com/kailshiansx/cluster-heal");
    });

    it("rejects project submission after deadline", async () => {
      vi.mocked(db.hackathonTeam.findUnique).mockResolvedValue({
        id: "team-1",
        hackathonDetailId: "detail-1",
        hackathonDetail: {
          submissionDeadline: new Date(Date.now() - 3600000), // 1 hour ago
        },
        members: [{ userId: "late-builder", status: "ACCEPTED" }],
      } as unknown as never);

      await expect(
        submitProject({
          teamId: "team-1",
          userId: "late-builder",
          title: "Late Submission",
          description: "Missed deadline",
          track: "AI",
          repoUrl: "https://github.com/late/repo",
          techStack: ["Node"],
        })
      ).rejects.toThrow(/deadline has passed/i);
    });
  });

  describe("Judge Evaluation and Rubric Scoring", () => {
    it("computes weighted multi-criteria score and updates normalized score", async () => {
      vi.mocked(db.hackathonSubmission.findUnique).mockResolvedValue({
        id: "sub-1",
        hackathonDetailId: "detail-1",
      } as unknown as never);

      vi.mocked(db.hackathonJudge.findFirst).mockResolvedValue({
        id: "judge-1",
        hackathonDetailId: "detail-1",
        userId: "judge-user-1",
        active: true,
      } as unknown as never);

      vi.mocked(db.hackathonRubricCriterion.findMany).mockResolvedValue([
        { id: "c1", name: "Innovation", maxScore: 20, weight: 1.0 },
        { id: "c2", name: "Execution", maxScore: 20, weight: 1.0 },
        { id: "c3", name: "UI/UX", maxScore: 20, weight: 1.0 },
        { id: "c4", name: "Impact", maxScore: 20, weight: 1.0 },
        { id: "c5", name: "Pitch", maxScore: 20, weight: 1.0 },
      ] as unknown as never);

      const mockScore = {
        id: "score-1",
        submissionId: "sub-1",
        judgeId: "judge-1",
        totalScore: 92,
        criteriaScores: { c1: 18, c2: 19, c3: 19, c4: 18, c5: 18 },
        feedback: "Outstanding architecture and crisp demo.",
        privateNotes: "Strong candidate for 1st place.",
      };

      vi.mocked(db.hackathonScore.upsert).mockResolvedValue(mockScore as unknown as never);

      vi.mocked(db.hackathonScore.findMany).mockResolvedValue([
        { totalScore: 92 },
        { totalScore: 90 },
      ] as unknown as never);

      vi.mocked(db.hackathonSubmission.update).mockResolvedValue({} as unknown as never);

      const result = await submitJudgeScore({
        submissionId: "sub-1",
        judgeUserId: "judge-user-1",
        criteriaScores: { c1: 18, c2: 19, c3: 19, c4: 18, c5: 18 },
        feedback: "Outstanding architecture and crisp demo.",
        privateNotes: "Strong candidate for 1st place.",
      });

      expect(db.hackathonScore.upsert).toHaveBeenCalled();
      expect(result.totalScore).toBe(92);
      // Checks that normalized score average ((92 + 90) / 2 = 91) is calculated and saved
      expect(db.hackathonSubmission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "sub-1" },
          data: expect.objectContaining({
            normalizedScore: 91,
            status: "EVALUATED",
          }),
        })
      );
    });
  });

  describe("Results Publishing and Winner Assignments", () => {
    it("publishes results, sets official ranks, and links prizes to winning squads", async () => {
      vi.mocked(db.hackathonDetail.findUnique).mockResolvedValue({
        id: "detail-1",
      } as unknown as never);

      vi.mocked(db.hackathonSubmission.update).mockResolvedValue({} as unknown as never);
      vi.mocked(db.hackathonSubmission.findUnique).mockResolvedValue({
        id: "sub-1",
        teamId: "team-1",
      } as unknown as never);

      vi.mocked(db.hackathonPrize.findFirst).mockResolvedValue({
        id: "prize-1",
        rank: 1,
      } as unknown as never);

      vi.mocked(db.hackathonPrize.update).mockResolvedValue({} as unknown as never);

      vi.mocked(db.hackathonDetail.update).mockResolvedValue({
        id: "detail-1",
        isResultsPublished: true,
        resultsPublishedAt: new Date(),
      } as unknown as never);

      const result = await publishHackathonResults({
        hackathonDetailId: "detail-1",
        adminUserId: "admin-1",
        winnerSelections: [
          {
            submissionId: "sub-1",
            rank: 1,
            winnerTier: "GRAND_PRIZE",
          },
        ],
      });

      expect(result.isResultsPublished).toBe(true);
      expect(db.hackathonSubmission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "sub-1" },
          data: expect.objectContaining({
            rank: 1,
            isWinner: true,
            winnerTier: "GRAND_PRIZE",
          }),
        })
      );
      expect(db.hackathonPrize.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "prize-1" },
          data: { winningTeamId: "team-1" },
        })
      );
    });
  });

  describe("Prize Disbursement Tracking", () => {
    it("updates disbursement status, adds transaction reference, and marks timestamp", async () => {
      const mockUpdatedPrize = {
        id: "prize-1",
        title: "Grand Prize Winner",
        cashAmount: new Prisma.Decimal(100000),
        disbursementStatus: "DISBURSED",
        transactionRef: "UPI-TXN-90283401928",
        disbursedAt: new Date(),
      };

      vi.mocked(db.hackathonPrize.update).mockResolvedValue(mockUpdatedPrize as unknown as never);

      const result = await updatePrizeDisbursement({
        prizeId: "prize-1",
        status: "DISBURSED",
        transactionRef: "UPI-TXN-90283401928",
      });

      expect(db.hackathonPrize.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "prize-1" },
          data: expect.objectContaining({
            disbursementStatus: "DISBURSED",
            transactionRef: "UPI-TXN-90283401928",
          }),
        })
      );
      expect(result.disbursementStatus).toBe("DISBURSED");
      expect(result.transactionRef).toBe("UPI-TXN-90283401928");
    });
  });
});
