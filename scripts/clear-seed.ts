// scripts/clear-seed.ts — Delete all seed rows marked with isSeed = true
// Run: npm run seed:clear

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🧹 Clearing all seeded data (isSeed = true)...\n");

  let totalDeleted = 0;

  const runClean = async (label: string, fn: () => Promise<{ count: number }>) => {
    try {
      const res = await fn();
      if (res.count > 0) {
        totalDeleted += res.count;
        console.log(`  ✓ Cleared ${res.count} rows from ${label}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`  ⚠️  Skipped ${label}: ${msg}`);
    }
  };

  // 1. Certificates linked to seeded events, registrations, or templates
  await runClean("Certificate (linked to seeded data)", () =>
    prisma.certificate.deleteMany({
      where: {
        OR: [{ isSeed: true }, { event: { isSeed: true } }, { template: { isSeed: true } }],
      },
    })
  );

  // 2. Attendance & Payments linked to seeded registrations/events
  await runClean("Attendance", () =>
    prisma.attendance.deleteMany({
      where: {
        OR: [
          { isSeed: true },
          { registration: { event: { isSeed: true } } },
          { registration: { isSeed: true } },
        ],
      },
    })
  );

  await runClean("Payment", () =>
    prisma.payment.deleteMany({
      where: {
        OR: [{ isSeed: true }, { registration: { isSeed: true } }],
      },
    })
  );

  // 3. Registrations & Tickets
  await runClean("Registration", () =>
    prisma.registration.deleteMany({
      where: {
        OR: [{ isSeed: true }, { event: { isSeed: true } }],
      },
    })
  );

  await runClean("TicketType", () =>
    prisma.ticketType.deleteMany({
      where: {
        OR: [{ isSeed: true }, { event: { isSeed: true } }],
      },
    })
  );

  // 4. Hackathon Details & Submissions
  await runClean("HackathonScore", () =>
    prisma.hackathonScore.deleteMany({
      where: { submission: { team: { hackathonDetail: { event: { isSeed: true } } } } },
    })
  );
  await runClean("HackathonSubmission", () =>
    prisma.hackathonSubmission.deleteMany({
      where: { team: { hackathonDetail: { event: { isSeed: true } } } },
    })
  );
  await runClean("HackathonTeamMember", () =>
    prisma.hackathonTeamMember.deleteMany({
      where: { team: { hackathonDetail: { event: { isSeed: true } } } },
    })
  );
  await runClean("HackathonTeam", () =>
    prisma.hackathonTeam.deleteMany({ where: { hackathonDetail: { event: { isSeed: true } } } })
  );
  await runClean("HackathonJudge", () =>
    prisma.hackathonJudge.deleteMany({ where: { hackathonDetail: { event: { isSeed: true } } } })
  );
  await runClean("HackathonRubricCriterion", () =>
    prisma.hackathonRubricCriterion.deleteMany({
      where: { hackathonDetail: { event: { isSeed: true } } },
    })
  );
  await runClean("HackathonProblemStatement", () =>
    prisma.hackathonProblemStatement.deleteMany({
      where: { hackathonDetail: { event: { isSeed: true } } },
    })
  );
  await runClean("HackathonPrize", () =>
    prisma.hackathonPrize.deleteMany({ where: { hackathonDetail: { event: { isSeed: true } } } })
  );
  await runClean("HackathonDetail", () =>
    prisma.hackathonDetail.deleteMany({ where: { event: { isSeed: true } } })
  );

  // 5. Event Children
  await runClean("EventScheduleItem", () =>
    prisma.eventScheduleItem.deleteMany({
      where: {
        OR: [{ isSeed: true }, { event: { isSeed: true } }],
      },
    })
  );

  await runClean("EventFaq", () =>
    prisma.eventFaq.deleteMany({
      where: {
        OR: [{ isSeed: true }, { event: { isSeed: true } }],
      },
    })
  );

  await runClean("EventTrack", () =>
    prisma.eventTrack.deleteMany({
      where: {
        OR: [{ isSeed: true }, { event: { isSeed: true } }],
      },
    })
  );

  await runClean("EventSpeaker", () =>
    prisma.eventSpeaker.deleteMany({
      where: {
        OR: [{ isSeed: true }, { event: { isSeed: true } }],
      },
    })
  );

  await runClean("EventPartner", () =>
    prisma.eventPartner.deleteMany({
      where: {
        OR: [{ isSeed: true }, { event: { isSeed: true } }],
      },
    })
  );

  await runClean("EventRevenueItem", () =>
    prisma.eventRevenueItem.deleteMany({
      where: {
        OR: [{ isSeed: true }, { event: { isSeed: true } }],
      },
    })
  );

  await runClean("EventExpenseItem", () =>
    prisma.eventExpenseItem.deleteMany({
      where: {
        OR: [{ isSeed: true }, { event: { isSeed: true } }],
      },
    })
  );

  await runClean("TechTalkResource", () =>
    prisma.techTalkResource.deleteMany({
      where: {
        OR: [{ isSeed: true }, { event: { isSeed: true } }],
      },
    })
  );

  // 6. Gallery
  await runClean("GalleryImage", () =>
    prisma.galleryImage.deleteMany({
      where: {
        OR: [{ isSeed: true }, { album: { isSeed: true } }, { album: { event: { isSeed: true } } }],
      },
    })
  );

  await runClean("GalleryAlbum", () =>
    prisma.galleryAlbum.deleteMany({
      where: {
        OR: [{ isSeed: true }, { event: { isSeed: true } }],
      },
    })
  );

  // 7. Series & Events
  await runClean("SeriesEdition", () =>
    prisma.seriesEdition.deleteMany({
      where: {
        OR: [{ isSeed: true }, { event: { isSeed: true } }, { series: { isSeed: true } }],
      },
    })
  );

  await runClean("Event", () => prisma.event.deleteMany({ where: { isSeed: true } }));
  await runClean("Series", () => prisma.series.deleteMany({ where: { isSeed: true } }));

  // 8. Speakers & Partners & Templates
  await runClean("Speaker", () => prisma.speaker.deleteMany({ where: { isSeed: true } }));
  await runClean("Partner", () => prisma.partner.deleteMany({ where: { isSeed: true } }));
  await runClean("CertificateTemplate", () =>
    prisma.certificateTemplate.deleteMany({ where: { isSeed: true } })
  );

  // 9. Community Leads
  await runClean("CampusLead", () => prisma.campusLead.deleteMany({ where: { isSeed: true } }));
  await runClean("StateLead", () => prisma.stateLead.deleteMany({ where: { isSeed: true } }));
  await runClean("CampusLeadApplication", () =>
    prisma.campusLeadApplication.deleteMany({ where: { isSeed: true } })
  );
  await runClean("StateLeadApplication", () =>
    prisma.stateLeadApplication.deleteMany({ where: { isSeed: true } })
  );

  // 10. Core Team & CMS Singletons
  await runClean("CoreTeamMember", () =>
    prisma.coreTeamMember.deleteMany({ where: { isSeed: true } })
  );
  await runClean("FounderContent", () =>
    prisma.founderContent.deleteMany({ where: { isSeed: true } })
  );
  await runClean("ContentBlock", () => prisma.contentBlock.deleteMany({ where: { isSeed: true } }));
  await runClean("ContentPage", () => prisma.contentPage.deleteMany({ where: { isSeed: true } }));

  // 11. Base Entities (only delete if unreferenced)
  await runClean("College", () => prisma.college.deleteMany({ where: { isSeed: true } }));
  await runClean("City", () =>
    prisma.city.deleteMany({
      where: {
        isSeed: true,
        colleges: { none: {} },
        events: { none: {} },
      },
    })
  );
  await runClean("User", () => prisma.user.deleteMany({ where: { isSeed: true } }));

  console.log(`\n✨ Done! Cleared ${totalDeleted} seeded records across all models.`);
}

main()
  .catch((e) => {
    console.error("❌ seed:clear failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
