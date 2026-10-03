// prisma/seed.ts
// KailshiansX — realistic seed data for v1.0 schema
// Run: npm run db:seed

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding KailshiansX...\n");

  // ─── Cities ──────────────────────────────────────────────────────────────────
  const [jaipur, chandigarh, delhi] = await Promise.all([
    prisma.city.upsert({
      where: { name: "Jaipur" },
      update: {},
      create: { name: "Jaipur", state: "Rajasthan" },
    }),
    prisma.city.upsert({
      where: { name: "Chandigarh" },
      update: {},
      create: { name: "Chandigarh", state: "Punjab" },
    }),
    prisma.city.upsert({
      where: { name: "Delhi" },
      update: {},
      create: { name: "Delhi", state: "Delhi" },
    }),
  ]);
  console.log("✅ Cities:", jaipur.name, chandigarh.name, delhi.name);

  // ─── Colleges ────────────────────────────────────────────────────────────────
  const [mnit, pec, iitd] = await Promise.all([
    prisma.college.upsert({
      where: { name_cityId: { name: "MNIT Jaipur", cityId: jaipur.id } },
      update: {},
      create: {
        name: "MNIT Jaipur",
        cityId: jaipur.id,
        state: "Rajasthan",
        website: "https://mnit.ac.in",
      },
    }),
    prisma.college.upsert({
      where: { name_cityId: { name: "PEC Chandigarh", cityId: chandigarh.id } },
      update: {},
      create: {
        name: "PEC Chandigarh",
        cityId: chandigarh.id,
        state: "Punjab",
        website: "https://pec.ac.in",
      },
    }),
    prisma.college.upsert({
      where: { name_cityId: { name: "IIT Delhi", cityId: delhi.id } },
      update: {},
      create: {
        name: "IIT Delhi",
        cityId: delhi.id,
        state: "Delhi",
        website: "https://iitd.ac.in",
      },
    }),
  ]);
  console.log("✅ Colleges:", mnit.name, pec.name, iitd.name);

  // ─── Speakers ─────────────────────────────────────────────────────────────────
  const [rahul, priya, arjun, deepa] = await Promise.all([
    prisma.speaker.upsert({
      where: { slug: "rahul-sharma" },
      update: {},
      create: {
        name: "Rahul Sharma",
        slug: "rahul-sharma",
        designation: "Senior SDE",
        organisation: "Google",
        bio: "Full-stack engineer with 8 years building scalable products at Google. Open-source contributor and developer advocate.",
        linkedin: "https://linkedin.com/in/rahul-sharma",
        twitter: "https://twitter.com/rahuldev",
      },
    }),
    prisma.speaker.upsert({
      where: { slug: "priya-mehta" },
      update: {},
      create: {
        name: "Priya Mehta",
        slug: "priya-mehta",
        designation: "ML Engineer",
        organisation: "Microsoft",
        bio: "Machine learning engineer at Microsoft Research. Speaker at PyCon India and JSConf. Loves making AI accessible.",
        linkedin: "https://linkedin.com/in/priya-mehta",
      },
    }),
    prisma.speaker.upsert({
      where: { slug: "arjun-kapoor" },
      update: {},
      create: {
        name: "Arjun Kapoor",
        slug: "arjun-kapoor",
        designation: "Founder & CTO",
        organisation: "Devstack Labs",
        bio: "Serial founder. Built and sold two SaaS products. Now helping startups scale engineering culture.",
        linkedin: "https://linkedin.com/in/arjun-kapoor",
        twitter: "https://twitter.com/arjunbuilds",
      },
    }),
    prisma.speaker.upsert({
      where: { slug: "deepa-nair" },
      update: {},
      create: {
        name: "Deepa Nair",
        slug: "deepa-nair",
        designation: "DevOps Lead",
        organisation: "Razorpay",
        bio: "DevOps architect at Razorpay leading cloud-native migrations. Kubernetes enthusiast and CNCF ambassador.",
        linkedin: "https://linkedin.com/in/deepa-nair",
      },
    }),
  ]);
  console.log("✅ Speakers:", rahul.name, priya.name, arjun.name, deepa.name);

  // ─── Partners ─────────────────────────────────────────────────────────────────
  const [techCorpPartner, startupIndia, gitHub] = await Promise.all([
    prisma.partner.upsert({
      where: { slug: "techcorp" },
      update: {},
      create: {
        name: "TechCorp Solutions",
        slug: "techcorp",
        website: "https://techcorp.in",
        category: "brand",
      },
    }),
    prisma.partner.upsert({
      where: { slug: "startup-india" },
      update: {},
      create: {
        name: "Startup India",
        slug: "startup-india",
        website: "https://startupindia.gov.in",
        category: "community",
      },
    }),
    prisma.partner.upsert({
      where: { slug: "github" },
      update: {},
      create: {
        name: "GitHub",
        slug: "github",
        website: "https://github.com",
        category: "community",
      },
    }),
  ]);
  console.log("✅ Partners:", techCorpPartner.name, startupIndia.name, gitHub.name);

  // ─── Series ────────────────────────────────────────────────────────────────
  const [raibarX, tricityX, padharoX, nirmanX, aarambhX] = await Promise.all([
    prisma.series.upsert({
      where: { slug: "raibarx" },
      update: {},
      create: {
        slug: "raibarx",
        name: "RaibarX",
        kind: "MEETUP",
        tagline: "Rajasthan's Premier Developer Meetup",
        city: "Jaipur",
        description:
          "RaibarX is the flagship developer meetup series by KailshiansX for the Rajasthan tech community. Each edition brings together developers, founders, and students for talks, networking, and community building.",
        purpose: "Build a sustainable developer community across Rajasthan",
      },
    }),
    prisma.series.upsert({
      where: { slug: "tricityx" },
      update: {},
      create: {
        slug: "tricityx",
        name: "TricityX",
        kind: "MEETUP",
        tagline: "Connecting Tricity Developers",
        city: "Chandigarh",
        description:
          "TricityX connects the developer communities of Chandigarh, Mohali and Panchkula through regular meetups, workshops and tech sessions.",
        purpose: "Unite the tricity developer ecosystem",
      },
    }),
    prisma.series.upsert({
      where: { slug: "padharox" },
      update: {},
      create: {
        slug: "padharox",
        name: "PadharoX",
        kind: "MEETUP",
        tagline: "Rajasthan Welcomes Tech",
        city: "Jodhpur",
        description:
          "PadharoX spreads the KailshiansX community spirit beyond Jaipur into cities like Jodhpur, Udaipur and Kota.",
        purpose: "Expand developer community into Tier-2 Rajasthan cities",
      },
    }),
    prisma.series.upsert({
      where: { slug: "nirmanx" },
      update: {},
      create: {
        slug: "nirmanx",
        name: "NirmanX",
        kind: "HACKATHON",
        tagline: "Build. Ship. Impact.",
        description:
          "NirmanX is KailshiansX's flagship hackathon series. Each edition focuses on a societal challenge — Nirman (meaning 'to build') challenges developers to create meaningful solutions.",
        purpose: "Drive product innovation through competitive hackathons",
      },
    }),
    prisma.series.upsert({
      where: { slug: "aarambhx" },
      update: {},
      create: {
        slug: "aarambhx",
        name: "AarambhX",
        kind: "HACKATHON",
        tagline: "Every Great Journey Begins Here.",
        description:
          "AarambhX (meaning 'beginning') is a beginner-friendly hackathon series designed for first-time participants — college students taking their first step into the builder community.",
        purpose: "Lower the barrier to entry for first-time hackers",
      },
    }),
  ]);
  console.log("✅ Series:", raibarX.name, tricityX.name, padharoX.name, nirmanX.name, aarambhX.name);

  // ─── Certificate Template ────────────────────────────────────────────────────
  const defaultTemplate = await prisma.certificateTemplate.upsert({
    where: { id: "seed-cert-template-01" },
    update: {},
    create: {
      id: "seed-cert-template-01",
      name: "KailshiansX Standard Certificate",
      description: "Default certificate template for all events",
      templateUrl: "https://cdn.kailshiansx.com/templates/cert-standard.png",
      fields: [
        { key: "participantName", x: 540, y: 320, fontSize: 36, color: "#1a1a2e", fontFamily: "Inter" },
        { key: "eventName", x: 540, y: 390, fontSize: 22, color: "#3d61fc", fontFamily: "Inter" },
        { key: "issuedAt", x: 540, y: 460, fontSize: 16, color: "#71717a", fontFamily: "Inter" },
        { key: "uniqueId", x: 820, y: 560, fontSize: 12, color: "#a1a1aa", fontFamily: "Geist Mono" },
      ],
      isDefault: true,
    },
  });
  console.log("✅ Certificate template:", defaultTemplate.name);

  // ─── Events ──────────────────────────────────────────────────────────────────

  // 1. RaibarX Edition 01 — Meetup
  const raibarX01 = await prisma.event.upsert({
    where: { slug: "raibarx-01" },
    update: {},
    create: {
      slug: "raibarx-01",
      title: "RaibarX Edition 01",
      type: "MEETUP",
      status: "PUBLISHED",
      overview:
        "The first edition of RaibarX — Rajasthan's premier developer meetup by KailshiansX. A day of inspiring talks, hands-on networking, and community building for developers across Jaipur.",
      cityId: jaipur.id,
      venue: "Jaipur Engineering College",
      venueAddress: "JEC Campus, Kukas, Jaipur, Rajasthan 302028",
      startDate: new Date("2025-03-15T10:00:00.000Z"),
      endDate: new Date("2025-03-15T17:00:00.000Z"),
      registrationDeadline: new Date("2025-03-12T23:59:59.000Z"),
      maxCapacity: 200,
      isFeatured: true,
      metaTitle: "RaibarX Edition 01 — Rajasthan Developer Meetup",
      metaDescription:
        "Join KailshiansX for RaibarX Edition 01 — Rajasthan's first developer meetup. Talks, networking, and community.",
    },
  });

  // 2. RaibarX Edition 02 — Meetup
  const raibarX02 = await prisma.event.upsert({
    where: { slug: "raibarx-02" },
    update: {},
    create: {
      slug: "raibarx-02",
      title: "RaibarX Edition 02",
      type: "MEETUP",
      status: "PUBLISHED",
      overview:
        "The second edition of RaibarX, bigger and better. Featuring talks on AI, open-source, and developer careers.",
      cityId: jaipur.id,
      venue: "MNIT Jaipur",
      venueAddress: "MNIT Campus, Jaipur, Rajasthan 302017",
      startDate: new Date("2025-07-19T10:00:00.000Z"),
      endDate: new Date("2025-07-19T18:00:00.000Z"),
      registrationDeadline: new Date("2025-07-16T23:59:59.000Z"),
      maxCapacity: 350,
      isFeatured: true,
      metaTitle: "RaibarX Edition 02 — AI & Open Source",
      metaDescription: "RaibarX is back! Join 350+ developers for talks on AI, open-source, and developer careers.",
    },
  });

  // 3. TricityX Edition 01 — Meetup
  const tricityX01 = await prisma.event.upsert({
    where: { slug: "tricityx-01" },
    update: {},
    create: {
      slug: "tricityx-01",
      title: "TricityX Edition 01",
      type: "MEETUP",
      status: "PUBLISHED",
      overview:
        "The inaugural TricityX meetup — connecting developers across Chandigarh, Mohali and Panchkula. Talks on Cloud, DevOps and career growth.",
      cityId: chandigarh.id,
      venue: "PEC Chandigarh",
      venueAddress: "PEC Campus, Sector 12, Chandigarh 160012",
      startDate: new Date("2025-05-10T10:00:00.000Z"),
      endDate: new Date("2025-05-10T17:00:00.000Z"),
      registrationDeadline: new Date("2025-05-07T23:59:59.000Z"),
      maxCapacity: 150,
      metaTitle: "TricityX Edition 01 — Chandigarh Developer Meetup",
      metaDescription: "First ever TricityX meetup for Chandigarh tricity developers.",
    },
  });

  // 4. NirmanX Season 01 — Hackathon
  const nirmanX01 = await prisma.event.upsert({
    where: { slug: "nirmanx-s01" },
    update: {},
    create: {
      slug: "nirmanx-s01",
      title: "NirmanX Season 01 — Hack for Bharat",
      type: "HACKATHON",
      status: "PUBLISHED",
      overview:
        "NirmanX Season 01: Hack for Bharat. 24-hour hackathon challenging developers to build solutions for civic, agricultural and education challenges facing India. ₹1,50,000 in prizes.",
      cityId: jaipur.id,
      venue: "Jaipur Exhibition Centre",
      venueAddress: "JECC, Sitapura, Jaipur, Rajasthan 302022",
      startDate: new Date("2025-09-06T10:00:00.000Z"),
      endDate: new Date("2025-09-07T10:00:00.000Z"),
      registrationDeadline: new Date("2025-08-30T23:59:59.000Z"),
      eligibility: "Open to all — students, professionals, and independent developers. Team size: 2-4.",
      maxCapacity: 500,
      isFeatured: true,
      metaTitle: "NirmanX Season 01 — 24-hr Hackathon Jaipur",
      metaDescription: "24-hour hackathon with ₹1.5L in prizes. Build for Bharat.",
    },
  });

  // 5. AarambhX Edition 01 — Hackathon (Delhi)
  const aarambhX01 = await prisma.event.upsert({
    where: { slug: "aarambhx-01" },
    update: {},
    create: {
      slug: "aarambhx-01",
      title: "AarambhX Edition 01 — Beginner Hackathon",
      type: "HACKATHON",
      status: "PUBLISHED",
      overview:
        "AarambhX is for first-timers. Build something, learn everything, win prizes. 12-hour beginner-friendly hackathon at IIT Delhi for students who have never hacked before.",
      cityId: delhi.id,
      venue: "IIT Delhi",
      venueAddress: "IIT Delhi, Hauz Khas, New Delhi 110016",
      startDate: new Date("2025-10-18T09:00:00.000Z"),
      endDate: new Date("2025-10-18T21:00:00.000Z"),
      registrationDeadline: new Date("2025-10-14T23:59:59.000Z"),
      eligibility: "College students only. First-time hackers preferred. Team size: 2-3.",
      maxCapacity: 200,
      metaTitle: "AarambhX 01 — Beginner Hackathon Delhi",
      metaDescription: "Your first hackathon. 12 hours. IIT Delhi. Build it.",
    },
  });

  // 6. Cloud & DevOps Workshop — Chandigarh
  const cloudWorkshop = await prisma.event.upsert({
    where: { slug: "workshop-cloud-devops-chd-01" },
    update: {},
    create: {
      slug: "workshop-cloud-devops-chd-01",
      title: "Cloud & DevOps Bootcamp",
      type: "WORKSHOP",
      status: "PUBLISHED",
      overview:
        "A full-day hands-on bootcamp covering AWS fundamentals, Docker, Kubernetes and CI/CD pipelines. Bring your laptop — you will deploy real apps.",
      cityId: chandigarh.id,
      venue: "TechPark Chandigarh",
      venueAddress: "IT Park, Phase 8, Chandigarh 160062",
      startDate: new Date("2025-06-21T09:00:00.000Z"),
      endDate: new Date("2025-06-21T17:00:00.000Z"),
      registrationDeadline: new Date("2025-06-18T23:59:59.000Z"),
      eligibility: "Basic programming knowledge required. Bring a laptop.",
      maxCapacity: 60,
      metaTitle: "Cloud & DevOps Bootcamp — KailshiansX Chandigarh",
      metaDescription: "Hands-on full-day bootcamp on AWS, Docker, Kubernetes and CI/CD.",
    },
  });

  console.log("✅ Events:", raibarX01.title, raibarX02.title, tricityX01.title, nirmanX01.title, aarambhX01.title, cloudWorkshop.title);

  // ─── Series Editions ──────────────────────────────────────────────────────
  await Promise.all([
    prisma.seriesEdition.upsert({
      where: { eventId: raibarX01.id },
      update: {},
      create: { seriesId: raibarX.id, eventId: raibarX01.id, editionNo: 1, theme: "Kickoff" },
    }),
    prisma.seriesEdition.upsert({
      where: { eventId: raibarX02.id },
      update: {},
      create: { seriesId: raibarX.id, eventId: raibarX02.id, editionNo: 2, theme: "AI & Open Source" },
    }),
    prisma.seriesEdition.upsert({
      where: { eventId: tricityX01.id },
      update: {},
      create: { seriesId: tricityX.id, eventId: tricityX01.id, editionNo: 1, theme: "Cloud Meets Community" },
    }),
    prisma.seriesEdition.upsert({
      where: { eventId: nirmanX01.id },
      update: {},
      create: { seriesId: nirmanX.id, eventId: nirmanX01.id, editionNo: 1, theme: "Hack for Bharat" },
    }),
    prisma.seriesEdition.upsert({
      where: { eventId: aarambhX01.id },
      update: {},
      create: { seriesId: aarambhX.id, eventId: aarambhX01.id, editionNo: 1, theme: "First Steps" },
    }),
  ]);
  console.log("✅ Series editions linked");

  // ─── Event Speakers ───────────────────────────────────────────────────────
  await Promise.all([
    // RaibarX 01
    prisma.eventSpeaker.upsert({
      where: { eventId_speakerId_role: { eventId: raibarX01.id, speakerId: rahul.id, role: "SPEAKER" } },
      update: {},
      create: { eventId: raibarX01.id, speakerId: rahul.id, role: "SPEAKER", sortOrder: 1 },
    }),
    prisma.eventSpeaker.upsert({
      where: { eventId_speakerId_role: { eventId: raibarX01.id, speakerId: priya.id, role: "SPEAKER" } },
      update: {},
      create: { eventId: raibarX01.id, speakerId: priya.id, role: "SPEAKER", sortOrder: 2 },
    }),
    // RaibarX 02
    prisma.eventSpeaker.upsert({
      where: { eventId_speakerId_role: { eventId: raibarX02.id, speakerId: arjun.id, role: "SPEAKER" } },
      update: {},
      create: { eventId: raibarX02.id, speakerId: arjun.id, role: "SPEAKER", sortOrder: 1 },
    }),
    // NirmanX 01 — judge + mentor
    prisma.eventSpeaker.upsert({
      where: { eventId_speakerId_role: { eventId: nirmanX01.id, speakerId: rahul.id, role: "JUDGE" } },
      update: {},
      create: { eventId: nirmanX01.id, speakerId: rahul.id, role: "JUDGE", sortOrder: 1 },
    }),
    prisma.eventSpeaker.upsert({
      where: { eventId_speakerId_role: { eventId: nirmanX01.id, speakerId: arjun.id, role: "MENTOR" } },
      update: {},
      create: { eventId: nirmanX01.id, speakerId: arjun.id, role: "MENTOR", sortOrder: 2 },
    }),
    // Cloud Workshop
    prisma.eventSpeaker.upsert({
      where: { eventId_speakerId_role: { eventId: cloudWorkshop.id, speakerId: deepa.id, role: "SPEAKER" } },
      update: {},
      create: { eventId: cloudWorkshop.id, speakerId: deepa.id, role: "SPEAKER", sortOrder: 1 },
    }),
  ]);
  console.log("✅ Event speakers linked");

  // ─── Event Partners ───────────────────────────────────────────────────────
  await Promise.all([
    prisma.eventPartner.upsert({
      where: { eventId_partnerId: { eventId: raibarX01.id, partnerId: techCorpPartner.id } },
      update: {},
      create: { eventId: raibarX01.id, partnerId: techCorpPartner.id, tier: "GOLD" },
    }),
    prisma.eventPartner.upsert({
      where: { eventId_partnerId: { eventId: nirmanX01.id, partnerId: techCorpPartner.id } },
      update: {},
      create: { eventId: nirmanX01.id, partnerId: techCorpPartner.id, tier: "TITLE" },
    }),
    prisma.eventPartner.upsert({
      where: { eventId_partnerId: { eventId: nirmanX01.id, partnerId: gitHub.id } },
      update: {},
      create: { eventId: nirmanX01.id, partnerId: gitHub.id, tier: "COMMUNITY" },
    }),
    prisma.eventPartner.upsert({
      where: { eventId_partnerId: { eventId: nirmanX01.id, partnerId: startupIndia.id } },
      update: {},
      create: { eventId: nirmanX01.id, partnerId: startupIndia.id, tier: "COMMUNITY" },
    }),
  ]);
  console.log("✅ Event partners linked");

  // ─── Ticket Types ─────────────────────────────────────────────────────────
  await Promise.all([
    // RaibarX 01 — free
    prisma.ticketType.create({
      data: {
        eventId: raibarX01.id,
        name: "General Admission",
        description: "Free entry for all developers",
        price: 0,
        quota: 200,
        isFree: true,
        saleStart: new Date("2025-02-01"),
        saleEnd: new Date("2025-03-12"),
      },
    }),
    // RaibarX 02 — free
    prisma.ticketType.create({
      data: {
        eventId: raibarX02.id,
        name: "General Admission",
        price: 0,
        quota: 300,
        isFree: true,
        saleStart: new Date("2025-06-01"),
        saleEnd: new Date("2025-07-16"),
      },
    }),
    prisma.ticketType.create({
      data: {
        eventId: raibarX02.id,
        name: "VIP Pass",
        description: "Priority seating, swag bag, and lunch included",
        price: 299,
        quota: 50,
        isFree: false,
        saleStart: new Date("2025-06-01"),
        saleEnd: new Date("2025-07-14"),
        sortOrder: 1,
      },
    }),
    // NirmanX 01 — paid tiers
    prisma.ticketType.create({
      data: {
        eventId: nirmanX01.id,
        name: "Student Team (2-4)",
        description: "Per person price for student teams",
        price: 499,
        quota: 400,
        saleStart: new Date("2025-08-01"),
        saleEnd: new Date("2025-08-30"),
      },
    }),
    prisma.ticketType.create({
      data: {
        eventId: nirmanX01.id,
        name: "Professional Team (2-4)",
        description: "For working professionals",
        price: 999,
        quota: 100,
        saleStart: new Date("2025-08-01"),
        saleEnd: new Date("2025-08-28"),
        sortOrder: 1,
      },
    }),
    // Cloud Workshop — paid
    prisma.ticketType.create({
      data: {
        eventId: cloudWorkshop.id,
        name: "Workshop Seat",
        description: "Full-day bootcamp with hands-on labs",
        price: 799,
        quota: 60,
        saleStart: new Date("2025-05-15"),
        saleEnd: new Date("2025-06-18"),
      },
    }),
    // AarambhX 01 — free
    prisma.ticketType.create({
      data: {
        eventId: aarambhX01.id,
        name: "Participant",
        price: 0,
        quota: 200,
        isFree: true,
        saleStart: new Date("2025-09-15"),
        saleEnd: new Date("2025-10-14"),
      },
    }),
    // TricityX 01 — free
    prisma.ticketType.create({
      data: {
        eventId: tricityX01.id,
        name: "General Admission",
        price: 0,
        quota: 150,
        isFree: true,
        saleStart: new Date("2025-04-01"),
        saleEnd: new Date("2025-05-07"),
      },
    }),
  ]);
  console.log("✅ Ticket types created");

  // ─── Event Schedule Items ─────────────────────────────────────────────────
  await prisma.eventScheduleItem.createMany({
    data: [
      { eventId: raibarX01.id, startTime: new Date("2025-03-15T10:00:00Z"), endTime: new Date("2025-03-15T10:30:00Z"), title: "Registration & Breakfast", sortOrder: 1 },
      { eventId: raibarX01.id, startTime: new Date("2025-03-15T10:30:00Z"), endTime: new Date("2025-03-15T11:00:00Z"), title: "Opening Keynote: Building for Bharat", speakerId: rahul.id, sortOrder: 2 },
      { eventId: raibarX01.id, startTime: new Date("2025-03-15T11:00:00Z"), endTime: new Date("2025-03-15T11:45:00Z"), title: "AI & ML in Production — Lessons from Microsoft", speakerId: priya.id, sortOrder: 3 },
      { eventId: raibarX01.id, startTime: new Date("2025-03-15T13:00:00Z"), endTime: new Date("2025-03-15T14:00:00Z"), title: "Networking Lunch", sortOrder: 4 },
      { eventId: raibarX01.id, startTime: new Date("2025-03-15T15:30:00Z"), endTime: new Date("2025-03-15T17:00:00Z"), title: "Open Mic & Community Announcements", sortOrder: 5 },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Schedule items created");

  // ─── FAQs ─────────────────────────────────────────────────────────────────
  await prisma.eventFaq.createMany({
    data: [
      { eventId: nirmanX01.id, question: "What is the team size?", answer: "Teams of 2 to 4 members.", sortOrder: 1 },
      { eventId: nirmanX01.id, question: "Can I participate alone?", answer: "No, teams of minimum 2 are required.", sortOrder: 2 },
      { eventId: nirmanX01.id, question: "Is food provided?", answer: "Yes — dinner, midnight snacks, and breakfast are provided.", sortOrder: 3 },
      { eventId: nirmanX01.id, question: "What should I bring?", answer: "Laptop, charger, student ID, and your best ideas.", sortOrder: 4 },
      { eventId: nirmanX01.id, question: "What are the tracks?", answer: "Civic Tech, AgriTech, EdTech, and Open Innovation.", sortOrder: 5 },
    ],
    skipDuplicates: true,
  });
  console.log("✅ FAQs created");

  // ─── Event Tracks (NirmanX) ───────────────────────────────────────────────
  await prisma.eventTrack.createMany({
    data: [
      { eventId: nirmanX01.id, name: "Civic Tech", description: "Solutions for government, civic participation and public services", color: "#3d61fc", sortOrder: 1 },
      { eventId: nirmanX01.id, name: "AgriTech", description: "Technology for farmers, supply chains and rural India", color: "#22c55e", sortOrder: 2 },
      { eventId: nirmanX01.id, name: "EdTech", description: "Making quality education accessible to all", color: "#f59e0b", sortOrder: 3 },
      { eventId: nirmanX01.id, name: "Open Innovation", description: "Build anything that creates positive impact", color: "#8b3dff", sortOrder: 4 },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Event tracks created");

  // ─── Gallery Albums ───────────────────────────────────────────────────────
  const raibarX01Album = await prisma.galleryAlbum.create({
    data: {
      eventId: raibarX01.id,
      title: "RaibarX Edition 01 — Official Gallery",
      category: "meetup",
      isPublished: true,
    },
  });
  await prisma.galleryImage.createMany({
    data: [
      { albumId: raibarX01Album.id, url: "https://cdn.kailshiansx.com/gallery/raibarx-01/01.jpg", caption: "Opening keynote by Rahul Sharma", altText: "Speaker on stage", sortOrder: 1 },
      { albumId: raibarX01Album.id, url: "https://cdn.kailshiansx.com/gallery/raibarx-01/02.jpg", caption: "Networking at the event", altText: "Developers networking", sortOrder: 2 },
      { albumId: raibarX01Album.id, url: "https://cdn.kailshiansx.com/gallery/raibarx-01/03.jpg", caption: "Community group photo", altText: "Group photo", sortOrder: 3 },
    ],
  });
  console.log("✅ Gallery albums & images created");

  // ─── Revenue & Expense Items (NirmanX 01) ─────────────────────────────────
  await Promise.all([
    prisma.eventRevenueItem.create({ data: { eventId: nirmanX01.id, category: "TICKET", description: "Student registrations (320 × ₹499)", amount: 159680 } }),
    prisma.eventRevenueItem.create({ data: { eventId: nirmanX01.id, category: "TICKET", description: "Professional registrations (45 × ₹999)", amount: 44955 } }),
    prisma.eventRevenueItem.create({ data: { eventId: nirmanX01.id, category: "SPONSORSHIP", description: "TechCorp — Title Sponsor", amount: 300000 } }),
    prisma.eventRevenueItem.create({ data: { eventId: nirmanX01.id, category: "SPONSORSHIP", description: "GitHub — Community Partner", amount: 50000 } }),
    prisma.eventExpenseItem.create({ data: { eventId: nirmanX01.id, category: "VENUE", description: "JECC venue booking", amount: 150000 } }),
    prisma.eventExpenseItem.create({ data: { eventId: nirmanX01.id, category: "FOOD", description: "Dinner, snacks & breakfast for 500", amount: 125000 } }),
    prisma.eventExpenseItem.create({ data: { eventId: nirmanX01.id, category: "SWAG", description: "T-shirts, stickers, lanyards", amount: 75000 } }),
    prisma.eventExpenseItem.create({ data: { eventId: nirmanX01.id, category: "MARKETING", description: "Social media & print ads", amount: 35000 } }),
    prisma.eventExpenseItem.create({ data: { eventId: nirmanX01.id, category: "PRINTING", description: "Banners, standees, certificates", amount: 20000 } }),
    prisma.eventExpenseItem.create({ data: { eventId: nirmanX01.id, category: "LOGISTICS", description: "Prize delivery & operations", amount: 25000 } }),
  ]);
  console.log("✅ Revenue & expense items created");

  // ─── Core Team Members ────────────────────────────────────────────────────
  await Promise.all([
    prisma.coreTeamMember.upsert({
      where: { slug: "aarav-gorewal" },
      update: {},
      create: {
        name: "Aarav Gorewal",
        slug: "aarav-gorewal",
        role: "Founder & CEO",
        category: "leadership",
        bio: "Building KailshiansX to be the digital home of India's developer community. Passionate about making tech events accessible, inclusive, and impactful.",
        linkedin: "https://linkedin.com/in/aaravgorewal",
        sortOrder: 0,
        isActive: true,
      },
    }),
    prisma.coreTeamMember.upsert({
      where: { slug: "niharika-singh" },
      update: {},
      create: {
        name: "Niharika Singh",
        slug: "niharika-singh",
        role: "Head of Community",
        category: "community",
        bio: "Growing developer communities across Rajasthan and beyond. Ex-GDG organiser with 4 years of community management experience.",
        linkedin: "https://linkedin.com/in/niharika-singh",
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.coreTeamMember.upsert({
      where: { slug: "karan-verma" },
      update: {},
      create: {
        name: "Karan Verma",
        slug: "karan-verma",
        role: "Lead Engineer",
        category: "technology",
        bio: "Full-stack developer building the KailshiansX platform. Loves Rust, TypeScript and developer tooling.",
        linkedin: "https://linkedin.com/in/karan-verma",
        github: "https://github.com/karanverma",
        sortOrder: 2,
        isActive: true,
      },
    }),
  ]);
  console.log("✅ Core team members created");

  // ─── Founder Content ──────────────────────────────────────────────────────
  await prisma.founderContent.upsert({
    where: { founderSlug: "aarav-gorewal" },
    update: {},
    create: {
      founderName: "Aarav Gorewal",
      founderSlug: "aarav-gorewal",
      tagline: "Building communities, one event at a time.",
      message:
        "I started KailshiansX because I believe every developer deserves access to world-class events, mentors, and a community — regardless of their city or college. KailshiansX is my attempt to build that infrastructure for India's next generation of builders.",
      philosophy:
        "Great communities are built on trust, consistency and genuine care for people. We don't just run events — we build long-term relationships between developers, founders, colleges and the industry.",
      milestones: [
        { year: 2024, title: "KailshiansX Founded", description: "Started with a simple idea: better developer events for Tier-2 India." },
        { year: 2025, title: "RaibarX Launched", description: "Rajasthan's first developer meetup series with 200+ attendees at Edition 01." },
        { year: 2025, title: "NirmanX Season 01", description: "500 participants. ₹1.5L in prizes. 4 tracks. 24 hours." },
      ],
      isPublished: true,
    },
  });
  console.log("✅ Founder content created");

  // ─── CMS Pages ────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.contentPage.upsert({
      where: { slug: "who-we-are" },
      update: {},
      create: {
        slug: "who-we-are",
        title: "Who We Are",
        metaTitle: "Who We Are | KailshiansX",
        metaDesc: "KailshiansX is the developer events and community initiative of Kailshians Web Services.",
        isPublished: true,
      },
    }),
    prisma.contentPage.upsert({
      where: { slug: "founder" },
      update: {},
      create: {
        slug: "founder",
        title: "Founder",
        metaTitle: "Founder | KailshiansX",
        metaDesc: "The story behind KailshiansX.",
        isPublished: true,
      },
    }),
  ]);
  console.log("✅ CMS pages created");

  // ─── Tech Talk Resource (RaibarX 01 keynote) ──────────────────────────────
  await prisma.techTalkResource.upsert({
    where: { eventId: raibarX01.id },
    update: {},
    create: {
      eventId: raibarX01.id,
      speakerId: rahul.id,
      slideUrl: "https://cdn.kailshiansx.com/talks/raibarx-01-keynote-slides.pdf",
      videoUrl: "https://youtube.com/watch?v=example-raibarx-01",
      keyTakeaways: [
        "India has 5M+ developers — and most of them lack access to quality community events",
        "Local communities compound: one event creates 10 future speakers",
        "Developer ecosystems need patient, consistent builders",
      ],
      tags: ["community", "developer-ecosystem", "india"],
    },
  });
  console.log("✅ Tech talk resource created");

  console.log("\n🎉 Seed complete! KailshiansX is ready.");
}

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
