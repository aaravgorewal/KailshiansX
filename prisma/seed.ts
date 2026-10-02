import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding KailshiansX database...");

  // ─── Meetup Series ────────────────────────────────────────────────────────
  const raibarX = await prisma.meetupSeries.upsert({
    where: { slug: "raibarx" },
    update: {},
    create: {
      slug: "raibarx",
      name: "RaibarX",
      city: "Jaipur",
      description: "The premier developer meetup series for Rajasthan's tech community.",
      coverImage: null,
    },
  });

  const tricityX = await prisma.meetupSeries.upsert({
    where: { slug: "tricityx" },
    update: {},
    create: {
      slug: "tricityx",
      name: "TricityX",
      city: "Chandigarh",
      description: "Connecting developers across the Chandigarh tricity region.",
      coverImage: null,
    },
  });

  console.log("✅ Meetup Series seeded:", raibarX.name, tricityX.name);

  // ─── Hackathon Series ─────────────────────────────────────────────────────
  const nirmanX = await prisma.hackathonSeries.upsert({
    where: { slug: "nirmanx" },
    update: {},
    create: {
      slug: "nirmanx",
      name: "NirmanX",
      description: "Build. Ship. Impact. The flagship hackathon series by KailshiansX.",
      coverImage: null,
    },
  });

  console.log("✅ Hackathon Series seeded:", nirmanX.name);

  // ─── Events ───────────────────────────────────────────────────────────────
  const demoEvent = await prisma.event.upsert({
    where: { slug: "raibarx-01" },
    update: {},
    create: {
      slug: "raibarx-01",
      title: "RaibarX Edition 01",
      type: "MEETUP",
      status: "PUBLISHED",
      description:
        "The first edition of RaibarX — Rajasthan's flagship developer meetup series by KailshiansX. Talks, networking, and community.",
      city: "Jaipur",
      venue: "Tech Hub Jaipur",
      venueAddress: "C-Scheme, Jaipur, Rajasthan",
      startDate: new Date("2025-03-15T10:00:00.000Z"),
      endDate: new Date("2025-03-15T17:00:00.000Z"),
      isFree: true,
      maxCapacity: 200,
      meetupSeriesId: raibarX.id,
    },
  });

  console.log("✅ Event seeded:", demoEvent.title);

  // ─── Team Members ──────────────────────────────────────────────────────────
  const founder = await prisma.teamMember.upsert({
    where: { id: "seed-founder" },
    update: {},
    create: {
      id: "seed-founder",
      name: "Aarav Gorewal",
      role: "Founder & CEO",
      category: "leadership",
      bio: "Building KailshiansX to connect India's developer community through world-class events.",
      sortOrder: 0,
      isActive: true,
    },
  });

  console.log("✅ Team Member seeded:", founder.name);

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
