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
      update: { isSeed: true },
      create: { name: "Jaipur", state: "Rajasthan", isSeed: true },
    }),
    prisma.city.upsert({
      where: { name: "Chandigarh" },
      update: { isSeed: true },
      create: { name: "Chandigarh", state: "Punjab", isSeed: true },
    }),
    prisma.city.upsert({
      where: { name: "Delhi" },
      update: { isSeed: true },
      create: { name: "Delhi", state: "Delhi", isSeed: true },
    }),
  ]);
  console.log("✅ Cities:", jaipur.name, chandigarh.name, delhi.name);

  // ─── Colleges ────────────────────────────────────────────────────────────────
  const [mnit, pec, iitd] = await Promise.all([
    prisma.college.upsert({
      where: { name_cityId: { name: "MNIT Jaipur", cityId: jaipur.id } },
      update: { isSeed: true },
      create: {
        isSeed: true,
        name: "MNIT Jaipur",
        cityId: jaipur.id,
        state: "Rajasthan",
        website: "https://mnit.ac.in",
      },
    }),
    prisma.college.upsert({
      where: { name_cityId: { name: "PEC Chandigarh", cityId: chandigarh.id } },
      update: { isSeed: true },
      create: {
        isSeed: true,
        name: "PEC Chandigarh",
        cityId: chandigarh.id,
        state: "Punjab",
        website: "https://pec.ac.in",
      },
    }),
    prisma.college.upsert({
      where: { name_cityId: { name: "IIT Delhi", cityId: delhi.id } },
      update: { isSeed: true },
      create: {
        isSeed: true,
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
      update: { isSeed: true },
      create: {
        isSeed: true,
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
      update: { isSeed: true },
      create: {
        isSeed: true,
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
      update: { isSeed: true },
      create: {
        isSeed: true,
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
      update: { isSeed: true },
      create: {
        isSeed: true,
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
  const [razorpayPartner, startupIndia, gitHub] = await Promise.all([
    prisma.partner.upsert({
      where: { slug: "razorpay" },
      update: { isSeed: true },
      create: {
        isSeed: true,
        name: "Razorpay",
        slug: "razorpay",
        website: "https://razorpay.com",
        category: "brand",
      },
    }),
    prisma.partner.upsert({
      where: { slug: "startup-india" },
      update: { isSeed: true },
      create: {
        isSeed: true,
        name: "Startup India",
        slug: "startup-india",
        website: "https://startupindia.gov.in",
        category: "community",
      },
    }),
    prisma.partner.upsert({
      where: { slug: "github" },
      update: { isSeed: true },
      create: {
        isSeed: true,
        name: "GitHub",
        slug: "github",
        website: "https://github.com",
        category: "community",
      },
    }),
  ]);
  console.log("✅ Partners:", razorpayPartner.name, startupIndia.name, gitHub.name);

  // ─── Series ────────────────────────────────────────────────────────────────
  const [raibarX, tricityX, padharoX, nirmanX, aarambhX] = await Promise.all([
    prisma.series.upsert({
      where: { slug: "raibarx" },
      update: { isSeed: true },
      create: {
        isSeed: true,
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
      update: { isSeed: true },
      create: {
        isSeed: true,
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
      update: { isSeed: true },
      create: {
        isSeed: true,
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
      update: { isSeed: true },
      create: {
        isSeed: true,
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
      update: { isSeed: true },
      create: {
        isSeed: true,
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
  console.log(
    "✅ Series:",
    raibarX.name,
    tricityX.name,
    padharoX.name,
    nirmanX.name,
    aarambhX.name
  );

  // ─── Certificate Template ────────────────────────────────────────────────────
  const defaultTemplate = await prisma.certificateTemplate.upsert({
    where: { id: "seed-cert-template-01" },
    update: { isSeed: true },
    create: {
      isSeed: true,
      id: "seed-cert-template-01",
      name: "KailshiansX Standard Certificate",
      description: "Default certificate template for all events",
      templateUrl: "https://cdn.kailshiansx.com/templates/cert-standard.png",
      fields: [
        {
          key: "participantName",
          x: 540,
          y: 320,
          fontSize: 36,
          color: "#1a1a2e",
          fontFamily: "Inter",
        },
        { key: "eventName", x: 540, y: 390, fontSize: 22, color: "#3d61fc", fontFamily: "Inter" },
        { key: "issuedAt", x: 540, y: 460, fontSize: 16, color: "#71717a", fontFamily: "Inter" },
        {
          key: "uniqueId",
          x: 820,
          y: 560,
          fontSize: 12,
          color: "#a1a1aa",
          fontFamily: "Geist Mono",
        },
      ],
      isDefault: true,
    },
  });
  console.log("✅ Certificate template:", defaultTemplate.name);

  // ─── Events ──────────────────────────────────────────────────────────────────

  // 1. RaibarX Edition 01 — Meetup
  const raibarX01 = await prisma.event.upsert({
    where: { slug: "raibarx-01" },
    update: { isSeed: true },
    create: {
      isSeed: true,
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
    update: { isSeed: true },
    create: {
      isSeed: true,
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
      metaDescription:
        "RaibarX is back! Join 350+ developers for talks on AI, open-source, and developer careers.",
    },
  });

  // 3. TricityX Edition 01 — Meetup
  const tricityX01 = await prisma.event.upsert({
    where: { slug: "tricityx-01" },
    update: { isSeed: true },
    create: {
      isSeed: true,
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
    update: { isSeed: true },
    create: {
      isSeed: true,
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
      eligibility:
        "Open to all — students, professionals, and independent developers. Team size: 2-4.",
      maxCapacity: 500,
      isFeatured: true,
      metaTitle: "NirmanX Season 01 — 24-hr Hackathon Jaipur",
      metaDescription: "24-hour hackathon with ₹1.5L in prizes. Build for Bharat.",
    },
  });

  // 5. AarambhX Edition 01 — Hackathon (Delhi)
  const aarambhX01 = await prisma.event.upsert({
    where: { slug: "aarambhx-01" },
    update: { isSeed: true },
    create: {
      isSeed: true,
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
    update: { isSeed: true },
    create: {
      isSeed: true,
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

  console.log(
    "✅ Events:",
    raibarX01.title,
    raibarX02.title,
    tricityX01.title,
    nirmanX01.title,
    aarambhX01.title,
    cloudWorkshop.title
  );

  // ─── Series Editions ──────────────────────────────────────────────────────
  await Promise.all([
    prisma.seriesEdition.upsert({
      where: { eventId: raibarX01.id },
      update: { isSeed: true },
      create: {
        seriesId: raibarX.id,
        eventId: raibarX01.id,
        editionNo: 1,
        theme: "Kickoff",
        isSeed: true,
      },
    }),
    prisma.seriesEdition.upsert({
      where: { eventId: raibarX02.id },
      update: { isSeed: true },
      create: {
        isSeed: true,
        seriesId: raibarX.id,
        eventId: raibarX02.id,
        editionNo: 2,
        theme: "AI & Open Source",
      },
    }),
    prisma.seriesEdition.upsert({
      where: { eventId: tricityX01.id },
      update: { isSeed: true },
      create: {
        isSeed: true,
        seriesId: tricityX.id,
        eventId: tricityX01.id,
        editionNo: 1,
        theme: "Cloud Meets Community",
      },
    }),
    prisma.seriesEdition.upsert({
      where: { eventId: nirmanX01.id },
      update: { isSeed: true },
      create: {
        isSeed: true,
        seriesId: nirmanX.id,
        eventId: nirmanX01.id,
        editionNo: 1,
        theme: "Hack for Bharat",
      },
    }),
    prisma.seriesEdition.upsert({
      where: { eventId: aarambhX01.id },
      update: { isSeed: true },
      create: {
        seriesId: aarambhX.id,
        eventId: aarambhX01.id,
        editionNo: 1,
        theme: "First Steps",
        isSeed: true,
      },
    }),
  ]);
  console.log("✅ Series editions linked");

  // ─── Event Speakers ───────────────────────────────────────────────────────
  await Promise.all([
    // RaibarX 01
    prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: raibarX01.id, speakerId: rahul.id, role: "SPEAKER" },
      },
      update: { isSeed: true },
      create: {
        eventId: raibarX01.id,
        speakerId: rahul.id,
        role: "SPEAKER",
        sortOrder: 1,
        isSeed: true,
      },
    }),
    prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: raibarX01.id, speakerId: priya.id, role: "SPEAKER" },
      },
      update: { isSeed: true },
      create: {
        eventId: raibarX01.id,
        speakerId: priya.id,
        role: "SPEAKER",
        sortOrder: 2,
        isSeed: true,
      },
    }),
    // RaibarX 02
    prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: raibarX02.id, speakerId: arjun.id, role: "SPEAKER" },
      },
      update: { isSeed: true },
      create: {
        eventId: raibarX02.id,
        speakerId: arjun.id,
        role: "SPEAKER",
        sortOrder: 1,
        isSeed: true,
      },
    }),
    // NirmanX 01 — judge + mentor
    prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: nirmanX01.id, speakerId: rahul.id, role: "JUDGE" },
      },
      update: { isSeed: true },
      create: {
        eventId: nirmanX01.id,
        speakerId: rahul.id,
        role: "JUDGE",
        sortOrder: 1,
        isSeed: true,
      },
    }),
    prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: nirmanX01.id, speakerId: arjun.id, role: "MENTOR" },
      },
      update: { isSeed: true },
      create: {
        eventId: nirmanX01.id,
        speakerId: arjun.id,
        role: "MENTOR",
        sortOrder: 2,
        isSeed: true,
      },
    }),
    // Cloud Workshop
    prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: cloudWorkshop.id, speakerId: deepa.id, role: "SPEAKER" },
      },
      update: { isSeed: true },
      create: {
        eventId: cloudWorkshop.id,
        speakerId: deepa.id,
        role: "SPEAKER",
        sortOrder: 1,
        isSeed: true,
      },
    }),
  ]);
  console.log("✅ Event speakers linked");

  // ─── Event Partners ───────────────────────────────────────────────────────
  await Promise.all([
    prisma.eventPartner.upsert({
      where: { eventId_partnerId: { eventId: raibarX01.id, partnerId: razorpayPartner.id } },
      update: { isSeed: true },
      create: { eventId: raibarX01.id, partnerId: razorpayPartner.id, tier: "GOLD", isSeed: true },
    }),
    prisma.eventPartner.upsert({
      where: { eventId_partnerId: { eventId: nirmanX01.id, partnerId: razorpayPartner.id } },
      update: { isSeed: true },
      create: { eventId: nirmanX01.id, partnerId: razorpayPartner.id, tier: "TITLE", isSeed: true },
    }),
    prisma.eventPartner.upsert({
      where: { eventId_partnerId: { eventId: nirmanX01.id, partnerId: gitHub.id } },
      update: { isSeed: true },
      create: { eventId: nirmanX01.id, partnerId: gitHub.id, tier: "COMMUNITY", isSeed: true },
    }),
    prisma.eventPartner.upsert({
      where: { eventId_partnerId: { eventId: nirmanX01.id, partnerId: startupIndia.id } },
      update: { isSeed: true },
      create: {
        eventId: nirmanX01.id,
        partnerId: startupIndia.id,
        tier: "COMMUNITY",
        isSeed: true,
      },
    }),
  ]);
  console.log("✅ Event partners linked");

  // ─── Ticket Types ─────────────────────────────────────────────────────────
  await Promise.all([
    // RaibarX 01 — free
    prisma.ticketType.create({
      data: {
        isSeed: true,
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
        isSeed: true,
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
        isSeed: true,
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
        isSeed: true,
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
        isSeed: true,
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
        isSeed: true,
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
        isSeed: true,
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
        isSeed: true,
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
      {
        isSeed: true,
        eventId: raibarX01.id,
        startTime: new Date("2025-03-15T10:00:00Z"),
        endTime: new Date("2025-03-15T10:30:00Z"),
        title: "Registration & Breakfast",
        sortOrder: 1,
      },
      {
        isSeed: true,
        eventId: raibarX01.id,
        startTime: new Date("2025-03-15T10:30:00Z"),
        endTime: new Date("2025-03-15T11:00:00Z"),
        title: "Opening Keynote: Building for Bharat",
        speakerId: rahul.id,
        sortOrder: 2,
      },
      {
        isSeed: true,
        eventId: raibarX01.id,
        startTime: new Date("2025-03-15T11:00:00Z"),
        endTime: new Date("2025-03-15T11:45:00Z"),
        title: "AI & ML in Production — Lessons from Microsoft",
        speakerId: priya.id,
        sortOrder: 3,
      },
      {
        isSeed: true,
        eventId: raibarX01.id,
        startTime: new Date("2025-03-15T13:00:00Z"),
        endTime: new Date("2025-03-15T14:00:00Z"),
        title: "Networking Lunch",
        sortOrder: 4,
      },
      {
        isSeed: true,
        eventId: raibarX01.id,
        startTime: new Date("2025-03-15T15:30:00Z"),
        endTime: new Date("2025-03-15T17:00:00Z"),
        title: "Open Mic & Community Announcements",
        sortOrder: 5,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Schedule items created");

  // ─── FAQs ─────────────────────────────────────────────────────────────────
  await prisma.eventFaq.createMany({
    data: [
      {
        isSeed: true,
        eventId: nirmanX01.id,
        question: "What is the team size?",
        answer: "Teams of 2 to 4 members.",
        sortOrder: 1,
      },
      {
        isSeed: true,
        eventId: nirmanX01.id,
        question: "Can I participate alone?",
        answer: "No, teams of minimum 2 are required.",
        sortOrder: 2,
      },
      {
        isSeed: true,
        eventId: nirmanX01.id,
        question: "Is food provided?",
        answer: "Yes — dinner, midnight snacks, and breakfast are provided.",
        sortOrder: 3,
      },
      {
        isSeed: true,
        eventId: nirmanX01.id,
        question: "What should I bring?",
        answer: "Laptop, charger, student ID, and your best ideas.",
        sortOrder: 4,
      },
      {
        isSeed: true,
        eventId: nirmanX01.id,
        question: "What are the tracks?",
        answer: "Civic Tech, AgriTech, EdTech, and Open Innovation.",
        sortOrder: 5,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ FAQs created");

  // ─── Event Tracks (NirmanX) ───────────────────────────────────────────────
  await prisma.eventTrack.createMany({
    data: [
      {
        isSeed: true,
        eventId: nirmanX01.id,
        name: "Civic Tech",
        description: "Solutions for government, civic participation and public services",
        color: "#3d61fc",
        sortOrder: 1,
      },
      {
        isSeed: true,
        eventId: nirmanX01.id,
        name: "AgriTech",
        description: "Technology for farmers, supply chains and rural India",
        color: "#22c55e",
        sortOrder: 2,
      },
      {
        isSeed: true,
        eventId: nirmanX01.id,
        name: "EdTech",
        description: "Making quality education accessible to all",
        color: "#f59e0b",
        sortOrder: 3,
      },
      {
        isSeed: true,
        eventId: nirmanX01.id,
        name: "Open Innovation",
        description: "Build anything that creates positive impact",
        color: "#8b3dff",
        sortOrder: 4,
      },
      {
        isSeed: true,
        eventId: nirmanX01.id,
        name: "Distributed Systems & Cloud",
        description: "High-throughput message queues, edge consensus, and cloud-native backends",
        color: "#0284c7",
        sortOrder: 5,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Event tracks created");

  // ─── Gallery Albums ───────────────────────────────────────────────────────
  const existingRaibarAlbum = await prisma.galleryAlbum.findFirst({
    where: { eventId: raibarX01.id },
  });
  if (!existingRaibarAlbum) {
    const raibarX01Album = await prisma.galleryAlbum.create({
      data: {
        isSeed: true,
        eventId: raibarX01.id,
        title: "RaibarX Edition 01 — Official Gallery",
        category: "meetup",
        coverImage:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
        isPublished: true,
      },
    });
    await prisma.galleryImage.createMany({
      data: [
        {
          isSeed: true,
          albumId: raibarX01Album.id,
          url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
          caption: "Opening keynote by Rahul Sharma",
          altText: "Speaker on stage",
          sortOrder: 1,
        },
        {
          isSeed: true,
          albumId: raibarX01Album.id,
          url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80",
          caption: "Networking at the event",
          altText: "Developers networking",
          sortOrder: 2,
        },
        {
          isSeed: true,
          albumId: raibarX01Album.id,
          url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
          caption: "Community group photo",
          altText: "Group photo",
          sortOrder: 3,
        },
      ],
    });
  }
  const existingNirmanAlbum = await prisma.galleryAlbum.findFirst({
    where: { eventId: nirmanX01.id },
  });
  if (!existingNirmanAlbum) {
    const nirmanAlbum = await prisma.galleryAlbum.create({
      data: {
        isSeed: true,
        eventId: nirmanX01.id,
        title: "NirmanX 2025 — National Hackathon Showcase",
        category: "hackathon",
        coverImage:
          "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
        isPublished: true,
      },
    });
    await prisma.galleryImage.createMany({
      data: [
        {
          isSeed: true,
          albumId: nirmanAlbum.id,
          url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
          caption: "Hackers collaborating during midnight sprint",
          altText: "Hackers collaborating",
          sortOrder: 1,
        },
        {
          isSeed: true,
          albumId: nirmanAlbum.id,
          url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80",
          caption: "Project demo presentation to judges",
          altText: "Demo presentation",
          sortOrder: 2,
        },
        {
          isSeed: true,
          albumId: nirmanAlbum.id,
          url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
          caption: "Winners receiving awards and trophies",
          altText: "Award ceremony",
          sortOrder: 3,
        },
      ],
    });
  }

  const existingTricityAlbum = await prisma.galleryAlbum.findFirst({
    where: { eventId: tricityX01.id },
  });
  if (!existingTricityAlbum) {
    const tricityAlbum = await prisma.galleryAlbum.create({
      data: {
        isSeed: true,
        eventId: tricityX01.id,
        title: "TricityX Edition 01 — Chandigarh Tech Summit",
        category: "meetup",
        coverImage:
          "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&auto=format&fit=crop&q=80",
        isPublished: true,
      },
    });
    await prisma.galleryImage.createMany({
      data: [
        {
          isSeed: true,
          albumId: tricityAlbum.id,
          url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&auto=format&fit=crop&q=80",
          caption: "Keynote presentation on stage",
          altText: "Stage keynote",
          sortOrder: 1,
        },
        {
          isSeed: true,
          albumId: tricityAlbum.id,
          url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&auto=format&fit=crop&q=80",
          caption: "Panel discussion on tech careers",
          altText: "Panel discussion",
          sortOrder: 2,
        },
        {
          isSeed: true,
          albumId: tricityAlbum.id,
          url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
          caption: "Developers mingling during lunch session",
          altText: "Community gathering",
          sortOrder: 3,
        },
      ],
    });
  }

  const existingWorkshopAlbum = await prisma.galleryAlbum.findFirst({
    where: { category: "workshop" },
  });
  if (!existingWorkshopAlbum) {
    const workshopAlbum = await prisma.galleryAlbum.create({
      data: {
        isSeed: true,
        eventId: cloudWorkshop.id,
        title: "Cloud & DevOps Bootcamp — Hands-on Labs",
        category: "workshop",
        coverImage: "/images/hero.webp",
        isPublished: true,
      },
    });
    await prisma.galleryImage.createMany({
      data: [
        {
          isSeed: true,
          albumId: workshopAlbum.id,
          url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&q=80",
          caption: "Hands-on container orchestration lab",
          altText: "Engineers working on laptops",
          sortOrder: 1,
        },
        {
          isSeed: true,
          albumId: workshopAlbum.id,
          url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
          caption: "Peer programming and architecture reviews",
          altText: "Group collaboration",
          sortOrder: 2,
        },
        {
          isSeed: true,
          albumId: workshopAlbum.id,
          url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
          caption: "Q&A and real-world deployment teardown",
          altText: "Speaker demonstrating on screen",
          sortOrder: 3,
        },
      ],
    });
  }

  console.log("✅ Gallery albums & images created");

  // ─── Revenue & Expense Items (NirmanX 01) ─────────────────────────────────
  await Promise.all([
    prisma.eventRevenueItem.create({
      data: {
        isSeed: true,
        eventId: nirmanX01.id,
        category: "TICKET",
        description: "Student registrations (320 × ₹499)",
        amount: 159680,
      },
    }),
    prisma.eventRevenueItem.create({
      data: {
        isSeed: true,
        eventId: nirmanX01.id,
        category: "TICKET",
        description: "Professional registrations (45 × ₹999)",
        amount: 44955,
      },
    }),
    prisma.eventRevenueItem.create({
      data: {
        isSeed: true,
        eventId: nirmanX01.id,
        category: "SPONSORSHIP",
        description: "Razorpay — Title Sponsor",
        amount: 300000,
      },
    }),
    prisma.eventRevenueItem.create({
      data: {
        isSeed: true,
        eventId: nirmanX01.id,
        category: "SPONSORSHIP",
        description: "GitHub — Community Partner",
        amount: 50000,
      },
    }),
    prisma.eventExpenseItem.create({
      data: {
        isSeed: true,
        eventId: nirmanX01.id,
        category: "VENUE",
        description: "JECC venue booking",
        amount: 150000,
      },
    }),
    prisma.eventExpenseItem.create({
      data: {
        isSeed: true,
        eventId: nirmanX01.id,
        category: "FOOD",
        description: "Dinner, snacks & breakfast for 500",
        amount: 125000,
      },
    }),
    prisma.eventExpenseItem.create({
      data: {
        isSeed: true,
        eventId: nirmanX01.id,
        category: "SWAG",
        description: "T-shirts, stickers, lanyards",
        amount: 75000,
      },
    }),
    prisma.eventExpenseItem.create({
      data: {
        isSeed: true,
        eventId: nirmanX01.id,
        category: "MARKETING",
        description: "Social media & print ads",
        amount: 35000,
      },
    }),
    prisma.eventExpenseItem.create({
      data: {
        isSeed: true,
        eventId: nirmanX01.id,
        category: "PRINTING",
        description: "Banners, standees, certificates",
        amount: 20000,
      },
    }),
    prisma.eventExpenseItem.create({
      data: {
        isSeed: true,
        eventId: nirmanX01.id,
        category: "LOGISTICS",
        description: "Prize delivery & operations",
        amount: 25000,
      },
    }),
  ]);
  console.log("✅ Revenue & expense items created");

  // ─── Core Team Members ────────────────────────────────────────────────────
  await Promise.all([
    prisma.coreTeamMember.upsert({
      where: { slug: "aarav-gorewal" },
      update: { isSeed: true },
      create: {
        isSeed: true,
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
      update: { isSeed: true },
      create: {
        isSeed: true,
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
      update: { isSeed: true },
      create: {
        isSeed: true,
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
    update: { isSeed: true },
    create: {
      isSeed: true,
      founderName: "Aarav Gorewal",
      founderSlug: "aarav-gorewal",
      tagline: "Building communities, one event at a time.",
      message:
        "I started KailshiansX because I believe every developer deserves access to world-class events, mentors, and a community — regardless of their city or college. KailshiansX is my attempt to build that infrastructure for India's next generation of builders.",
      philosophy:
        "Great communities are built on trust, consistency and genuine care for people. We don't just run events — we build long-term relationships between developers, founders, colleges and the industry.",
      milestones: [
        {
          year: 2024,
          title: "KailshiansX Founded",
          description: "Started with a simple idea: better developer events for Tier-2 India.",
        },
        {
          year: 2025,
          title: "RaibarX Launched",
          description:
            "Rajasthan's first developer meetup series with 200+ attendees at Edition 01.",
        },
        {
          year: 2025,
          title: "NirmanX Season 01",
          description: "500 participants. ₹1.5L in prizes. 4 tracks. 24 hours.",
        },
      ],
      isPublished: true,
    },
  });
  console.log("✅ Founder content created");

  // ─── CMS Pages ────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.contentPage.upsert({
      where: { slug: "who-we-are" },
      update: { isSeed: true },
      create: {
        isSeed: true,
        slug: "who-we-are",
        title: "Who We Are",
        metaTitle: "Who We Are | KailshiansX",
        metaDesc:
          "KailshiansX is the developer events and community initiative of Kailshians Web Services.",
        isPublished: true,
      },
    }),
    prisma.contentPage.upsert({
      where: { slug: "founder" },
      update: { isSeed: true },
      create: {
        isSeed: true,
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
    update: { isSeed: true },
    create: {
      isSeed: true,
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

  // ─── Home Page CMS & Testimonials ──────────────────────────────────────────
  const homePage = await prisma.contentPage.upsert({
    where: { slug: "home" },
    update: { isSeed: true },
    create: {
      isSeed: true,
      slug: "home",
      title: "Home",
      metaTitle: "KailshiansX — Developer Events & Community",
      metaDesc:
        "Developer Events. Builder Communities. Real Connections. Discover hackathons, meetups, workshops, tech talks and community programs by Kailshians Web Services.",
      isPublished: true,
    },
  });

  const existingTestimonials = await prisma.contentBlock.findMany({
    where: { pageId: homePage.id, type: "TESTIMONIAL" },
  });

  if (existingTestimonials.length === 0) {
    const testimonialData = [
      {
        quote:
          "KailshiansX completely changed how our campus approaches open source and hackathons. The energy at PadharoX was world-class, and our students walked away with internships.",
        author: "Ananya Deshmukh",
        role: "Campus Lead",
        company: "MNIT Jaipur",
        rating: 5,
        eventTitle: "PadharoX Jaipur",
      },
      {
        quote:
          "Speaking at KailshiansX tech talks was one of the most rewarding community experiences of the year. The questions from the audience were sharp, deeply technical, and inspiring.",
        author: "Rohan Varma",
        role: "Lead Architect",
        company: "CloudScale Systems",
        rating: 5,
        eventTitle: "Tech Talks Delhi",
      },
      {
        quote:
          "The 36-hour NirmanX hackathon was flawlessly organized. From the mentorship to the API sponsor tracks, everything felt like a premier Silicon Valley hackathon.",
        author: "Siddharth Rao",
        role: "Winner & Student Founder",
        company: "BuidlHQ",
        rating: 5,
        eventTitle: "NirmanX Bengaluru",
      },
      {
        quote:
          "The hands-on distributed systems workshop was exceptional. Real production architectural war stories, zero fluff. Exactly what engineering students need.",
        author: "Meera Krishnan",
        role: "Senior Backend Engineer",
        company: "HyperScale",
        rating: 5,
        eventTitle: "Cloud Masterclass",
      },
    ];

    for (let i = 0; i < testimonialData.length; i++) {
      await prisma.contentBlock.create({
        data: {
          isSeed: true,
          pageId: homePage.id,
          type: "TESTIMONIAL",
          sortOrder: i,
          data: testimonialData[i],
          isVisible: true,
        },
      });
    }
    console.log("✅ Home page CMS testimonials seeded");
  }

  // ─── Additional Partners ───────────────────────────────────────────────────
  const [, resend, awsCommunity, springboard] = await Promise.all([
    prisma.partner.upsert({
      where: { slug: "cloudflare" },
      update: { isSeed: true },
      create: {
        isSeed: true,
        name: "Cloudflare",
        slug: "cloudflare",
        website: "https://cloudflare.com",
        category: "brand",
      },
    }),
    prisma.partner.upsert({
      where: { slug: "resend" },
      update: { isSeed: true },
      create: {
        isSeed: true,
        name: "Resend",
        slug: "resend",
        website: "https://resend.com",
        category: "brand",
      },
    }),
    prisma.partner.upsert({
      where: { slug: "aws-community" },
      update: { isSeed: true },
      create: {
        isSeed: true,
        name: "AWS Community India",
        slug: "aws-community",
        website: "https://aws.amazon.com",
        category: "community",
      },
    }),
    prisma.partner.upsert({
      where: { slug: "91springboard" },
      update: { isSeed: true },
      create: {
        isSeed: true,
        name: "91springboard",
        slug: "91springboard",
        website: "https://91springboard.com",
        category: "venue",
      },
    }),
  ]);
  console.log("✅ Additional ecosystem partners seeded");

  // ─── Upcoming 2026/2027 Events ─────────────────────────────────────────────
  const [padharoX01, nirmanX2026, techTalkScale, techTalkAgents, workshopRust] = await Promise.all([
    prisma.event.upsert({
      where: { slug: "padharox-01" },
      update: {
        isSeed: true,
        coverImage:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&auto=format&fit=crop&q=80",
      },
      create: {
        isSeed: true,
        slug: "padharox-01",
        title: "PadharoX Edition 01 — Jaipur AI & Cloud Summit",
        type: "MEETUP",
        status: "PUBLISHED",
        overview:
          "Rajasthan's biggest developer gathering of 2026. Deep dives on generative AI agents, cloud architectures, and open source scaling.",
        coverImage:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&auto=format&fit=crop&q=80",
        cityId: jaipur.id,
        venue: "JECC Auditorium",
        venueAddress: "RIICO Industrial Area, Sitapura, Jaipur, Rajasthan 302022",
        venueMapUrl: "https://maps.google.com/?q=JECC+Jaipur",
        eligibility:
          "Open to software engineers, college students, tech founders, and open-source contributors. Prior programming experience in Python, JavaScript, or Cloud services is helpful.",
        startDate: new Date("2026-11-14T10:00:00.000Z"),
        endDate: new Date("2026-11-14T18:00:00.000Z"),
        registrationDeadline: new Date("2026-11-12T23:59:59.000Z"),
        maxCapacity: 500,
        isFeatured: true,
        metaTitle: "PadharoX Edition 01 — Jaipur AI & Cloud Summit",
        metaDescription:
          "Join 500+ builders at PadharoX 01 in Jaipur for talks on generative AI, cloud, and systems engineering.",
      },
    }),
    prisma.event.upsert({
      where: { slug: "nirmanx-2026" },
      update: {
        isSeed: true,
        venueMapUrl: "https://maps.google.com/?q=IIT+Delhi+Research+Park",
        eligibility:
          "Open to teams of 2 to 4 developers. All members must be registered college students or early-stage builders (graduated within last 2 years). Valid ID proof required.",
      },
      create: {
        isSeed: true,
        slug: "nirmanx-2026",
        title: "NirmanX 2026 — National Hackathon Season 02",
        type: "HACKATHON",
        status: "PUBLISHED",
        overview:
          "36 hours of non-stop building. ₹10 Lakhs in prizes and seed grants for student and early-stage developer prototypes across India.",
        cityId: delhi.id,
        venue: "IIT Delhi Research Park",
        venueAddress: "IIT Delhi, Hauz Khas, New Delhi 110016",
        venueMapUrl: "https://maps.google.com/?q=IIT+Delhi+Research+Park",
        eligibility:
          "Open to teams of 2 to 4 developers. All members must be registered college students or early-stage builders (graduated within last 2 years). Valid ID proof required.",
        startDate: new Date("2026-12-05T09:00:00.000Z"),
        endDate: new Date("2026-12-06T20:00:00.000Z"),
        registrationDeadline: new Date("2026-11-30T23:59:59.000Z"),
        maxCapacity: 600,
        isFeatured: true,
        metaTitle: "NirmanX 2026 — 36h National Hackathon",
        metaDescription:
          "Build prototypes, solve real problems, and compete for ₹10L prize pool at NirmanX 2026.",
      },
    }),
    prisma.event.upsert({
      where: { slug: "techtalk-scaling-10m" },
      update: { isSeed: true },
      create: {
        isSeed: true,
        slug: "techtalk-scaling-10m",
        title: "Scaling to 10M Requests: Microservices Architecture Deep Dive",
        type: "TECH_TALK",
        status: "PUBLISHED",
        overview:
          "An architectural breakdown of high-throughput backend services, rate limiters, database connection pooling, and multi-region replication.",
        cityId: delhi.id,
        venue: "Innov8 Coworking Connaught Place",
        venueAddress: "Regal Building, CP, New Delhi 110001",
        startDate: new Date("2026-10-24T17:00:00.000Z"),
        endDate: new Date("2026-10-24T20:00:00.000Z"),
        registrationDeadline: new Date("2026-10-23T23:59:59.000Z"),
        maxCapacity: 120,
        isFeatured: true,
        metaTitle: "Scaling to 10M Requests — Tech Talk",
        metaDescription:
          "Deep dive into production microservices, distributed caching, and zero-downtime deploys.",
      },
    }),
    prisma.event.upsert({
      where: { slug: "techtalk-agentic-ai" },
      update: { isSeed: true },
      create: {
        isSeed: true,
        slug: "techtalk-agentic-ai",
        title: "Building Agentic AI Systems in Production",
        type: "TECH_TALK",
        status: "PUBLISHED",
        overview:
          "Exploring autonomous LLM agents, tool-calling loops, evaluation benchmarks, and latency optimizations in Next.js applications.",
        cityId: jaipur.id,
        venue: "MNIT Mini Auditorium",
        venueAddress: "MNIT Campus, Jaipur, Rajasthan 302017",
        startDate: new Date("2026-11-28T16:00:00.000Z"),
        endDate: new Date("2026-11-28T19:00:00.000Z"),
        registrationDeadline: new Date("2026-11-27T23:59:59.000Z"),
        maxCapacity: 180,
        isFeatured: true,
        metaTitle: "Building Agentic AI Systems — Tech Talk",
        metaDescription:
          "Hands-on talk on autonomous agents, tool orchestration, and LLM reliability.",
      },
    }),
    prisma.event.upsert({
      where: { slug: "workshop-rust-systems" },
      update: { isSeed: true },
      create: {
        isSeed: true,
        slug: "workshop-rust-systems",
        title: "Hands-on Rust & Distributed Systems Masterclass",
        type: "WORKSHOP",
        status: "PUBLISHED",
        overview:
          "A full-day interactive coding masterclass building a distributed key-value store and Raft consensus engine in Rust.",
        cityId: chandigarh.id,
        venue: "TechPark Chandigarh Campus",
        venueAddress: "Rajiv Gandhi Chandigarh Technology Park, Chandigarh 160101",
        startDate: new Date("2026-10-31T09:30:00.000Z"),
        endDate: new Date("2026-10-31T17:30:00.000Z"),
        registrationDeadline: new Date("2026-10-29T23:59:59.000Z"),
        maxCapacity: 80,
        isFeatured: true,
        metaTitle: "Rust & Distributed Systems Workshop | KailshiansX",
        metaDescription:
          "Build a distributed storage engine from scratch in Rust with industry mentors.",
      },
    }),
  ]);
  console.log("✅ Upcoming 2026/2027 events created");

  // Link PadharoX series edition
  const padharoXSeries = await prisma.series.findUnique({ where: { slug: "padharox" } });
  if (padharoXSeries) {
    await prisma.seriesEdition.upsert({
      where: { seriesId_editionNo: { seriesId: padharoXSeries.id, editionNo: 1 } },
      update: { isSeed: true },
      create: {
        isSeed: true,
        seriesId: padharoXSeries.id,
        eventId: padharoX01.id,
        editionNo: 1,
        theme: "AI Systems & Cloud Scaling",
      },
    });
  }

  // Link NirmanX Season 02 series edition
  await prisma.seriesEdition.upsert({
    where: { seriesId_editionNo: { seriesId: nirmanX.id, editionNo: 2 } },
    update: { isSeed: true },
    create: {
      isSeed: true,
      seriesId: nirmanX.id,
      eventId: nirmanX2026.id,
      editionNo: 2,
      theme: "National Hackathon Season 02",
    },
  });

  // Hackathon Details for NirmanX 01, NirmanX 2026, and AarambhX 01
  await prisma.hackathonDetail.upsert({
    where: { eventId: nirmanX01.id },
    update: { isSeed: true },
    create: {
      isSeed: true,
      eventId: nirmanX01.id,
      minTeamSize: 2,
      maxTeamSize: 4,
      rules: "36-hour non-stop building sprint. All code must be committed to GitHub.",
      submissionUrl: "https://github.com/kailshiansx/nirmanx-submissions",
      problemStatements: [
        {
          id: "ps-1",
          title: "Distributed Transaction Coordination on Edge",
          track: "Distributed Systems & Cloud",
          description: "Build a fault-tolerant edge consensus state machine.",
        },
        {
          id: "ps-2",
          title: "Autonomous Developer Assistant for CLI",
          track: "Civic Tech",
          description: "Agentic terminal tools for automated code refactoring.",
        },
        {
          id: "ps-3",
          title: "Decentralized Agri-Logistics Marketplace",
          track: "AgriTech",
          description: "Real-time transparent pricing for regional farmers.",
        },
      ],
      prizes: [
        {
          title: "Grand Champion",
          amount: "₹2,50,000",
          perks: ["Direct Incubation Access", "Cloud Credits", "Investor Demo Day"],
        },
        {
          title: "First Runner-up",
          amount: "₹1,50,000",
          perks: ["Cloud Credits", "Mentorship Fast-track"],
        },
        {
          title: "Track Winners",
          amount: "₹50,000",
          perks: ["Swag Box", "Mentorship"],
        },
      ],
      results: [
        {
          rank: 1,
          title: "Grand Champion",
          teamName: "VectorNodes",
          projectName: "KailashEdge Consensus Engine",
          repoUrl: "https://github.com/vectornodes/kailash-edge",
          demoUrl: "https://vectornodes.dev",
        },
      ],
      isResultsPublished: true,
    },
  });

  await prisma.hackathonDetail.upsert({
    where: { eventId: nirmanX2026.id },
    update: { isSeed: true },
    create: {
      isSeed: true,
      eventId: nirmanX2026.id,
      minTeamSize: 2,
      maxTeamSize: 4,
      rules: "36-hour national hackathon sprint. Dedicated jury deliberation.",
      submissionUrl: "https://github.com/kailshiansx/nirmanx-2026-submissions",
      problemStatements: [
        {
          id: "ps-2026-1",
          title: "Multi-Modal Autonomous AI Agents",
          track: "Autonomous AI Agents",
          description: "Autonomous workflow solvers with verifiable tool-calling.",
        },
        {
          id: "ps-2026-2",
          title: "Digital Public Goods at Scale",
          track: "Digital Public Goods & FinTech",
          description: "Open banking, UPI telemetry, and decentralized verification.",
        },
      ],
      prizes: [
        {
          title: "Grand Champion Grant",
          amount: "₹5,00,000",
          perks: ["Seed Grant", "Cloud Credits"],
        },
      ],
    },
  });

  await prisma.hackathonDetail.upsert({
    where: { eventId: aarambhX01.id },
    update: { isSeed: true },
    create: {
      isSeed: true,
      eventId: aarambhX01.id,
      minTeamSize: 1,
      maxTeamSize: 4,
      rules: "Beginner-friendly 24-hour sprint. First-time hackers welcome.",
      problemStatements: [
        {
          id: "ps-aarambh-1",
          title: "Campus Open Source Starter",
          track: "Beginner Web",
          description: "Interactive tools to simplify club management on campus.",
        },
        {
          id: "ps-aarambh-2",
          title: "Student Portfolio Builder",
          track: "Frontend & Design",
          description: "Showcase proof-of-work with dynamic GitHub stats.",
        },
      ],
    },
  });

  // Link speakers to upcoming events
  await Promise.all([
    prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: padharoX01.id, speakerId: rahul.id, role: "SPEAKER" },
      },
      update: { isSeed: true },
      create: { eventId: padharoX01.id, speakerId: rahul.id, role: "SPEAKER", isSeed: true },
    }),
    prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: padharoX01.id, speakerId: priya.id, role: "SPEAKER" },
      },
      update: { isSeed: true },
      create: { eventId: padharoX01.id, speakerId: priya.id, role: "SPEAKER", isSeed: true },
    }),
    prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: nirmanX2026.id, speakerId: arjun.id, role: "JUDGE" },
      },
      update: { isSeed: true },
      create: { eventId: nirmanX2026.id, speakerId: arjun.id, role: "JUDGE", isSeed: true },
    }),
    prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: techTalkScale.id, speakerId: deepa.id, role: "SPEAKER" },
      },
      update: { isSeed: true },
      create: { eventId: techTalkScale.id, speakerId: deepa.id, role: "SPEAKER", isSeed: true },
    }),
    prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: {
          eventId: techTalkAgents.id,
          speakerId: priya.id,
          role: "SPEAKER",
        },
      },
      update: { isSeed: true },
      create: { eventId: techTalkAgents.id, speakerId: priya.id, role: "SPEAKER", isSeed: true },
    }),
    prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: workshopRust.id, speakerId: rahul.id, role: "MENTOR" },
      },
      update: { isSeed: true },
      create: { eventId: workshopRust.id, speakerId: rahul.id, role: "MENTOR", isSeed: true },
    }),
  ]);

  // Link partners to upcoming events
  await Promise.all([
    prisma.eventPartner.upsert({
      where: { eventId_partnerId: { eventId: padharoX01.id, partnerId: razorpayPartner.id } },
      update: { isSeed: true },
      create: {
        eventId: padharoX01.id,
        partnerId: razorpayPartner.id,
        tier: "TITLE",
        isSeed: true,
      },
    }),
    prisma.eventPartner.upsert({
      where: { eventId_partnerId: { eventId: padharoX01.id, partnerId: gitHub.id } },
      update: { isSeed: true },
      create: { eventId: padharoX01.id, partnerId: gitHub.id, tier: "GOLD", isSeed: true },
    }),
    prisma.eventPartner.upsert({
      where: { eventId_partnerId: { eventId: nirmanX2026.id, partnerId: resend.id } },
      update: { isSeed: true },
      create: { eventId: nirmanX2026.id, partnerId: resend.id, tier: "GOLD", isSeed: true },
    }),
    prisma.eventPartner.upsert({
      where: { eventId_partnerId: { eventId: workshopRust.id, partnerId: awsCommunity.id } },
      update: { isSeed: true },
      create: {
        eventId: workshopRust.id,
        partnerId: awsCommunity.id,
        tier: "COMMUNITY",
        isSeed: true,
      },
    }),
    prisma.eventPartner.upsert({
      where: { eventId_partnerId: { eventId: techTalkScale.id, partnerId: springboard.id } },
      update: { isSeed: true },
      create: {
        eventId: techTalkScale.id,
        partnerId: springboard.id,
        tier: "COMMUNITY",
        isSeed: true,
      },
    }),
  ]);

  // Create sample users and registrations
  const sampleUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: "ananya.deshmukh@mnit.ac.in" },
      update: { isSeed: true },
      create: {
        isSeed: true,
        name: "Ananya Deshmukh",
        email: "ananya.deshmukh@mnit.ac.in",
        role: "CAMPUS_LEAD",
      },
    }),
    prisma.user.upsert({
      where: { email: "rohan.pec@pec.edu.in" },
      update: { isSeed: true },
      create: {
        isSeed: true,
        name: "Rohan Varma",
        email: "rohan.pec@pec.edu.in",
        role: "CAMPUS_LEAD",
      },
    }),
    prisma.user.upsert({
      where: { email: "karan.statelead@kailshiansx.com" },
      update: { isSeed: true },
      create: {
        isSeed: true,
        name: "Karan Singh",
        email: "karan.statelead@kailshiansx.com",
        role: "STATE_LEAD",
      },
    }),
  ]);

  // Create campus lead applications and active campus leads
  let campusApp1 = await prisma.campusLeadApplication.findFirst({
    where: { email: "ananya.deshmukh@mnit.ac.in" },
  });
  if (!campusApp1) {
    campusApp1 = await prisma.campusLeadApplication.create({
      data: {
        isSeed: true,
        userId: sampleUsers[0].id,
        name: "Ananya Deshmukh",
        email: "ananya.deshmukh@mnit.ac.in",
        college: "MNIT Jaipur",
        cityId: jaipur.id,
        courseYear: "3rd Year",
        status: "SELECTED",
      },
    });
  }

  await prisma.campusLead.upsert({
    where: { userId: sampleUsers[0].id },
    update: { isSeed: true },
    create: {
      isSeed: true,
      applicationId: campusApp1.id,
      userId: sampleUsers[0].id,
      collegeId: mnit.id,
      cityId: jaipur.id,
      status: "ACTIVE",
      eventsSupported: 4,
      referrals: 120,
    },
  });

  let stateApp1 = await prisma.stateLeadApplication.findFirst({
    where: { email: "karan.statelead@kailshiansx.com" },
  });
  if (!stateApp1) {
    stateApp1 = await prisma.stateLeadApplication.create({
      data: {
        isSeed: true,
        userId: sampleUsers[2].id,
        name: "Karan Singh",
        email: "karan.statelead@kailshiansx.com",
        state: "Rajasthan",
        citiesCovered: "Jaipur, Jodhpur, Udaipur, Kota",
        status: "SELECTED",
      },
    });
  }

  await prisma.stateLead.upsert({
    where: { userId: sampleUsers[2].id },
    update: { isSeed: true },
    create: {
      isSeed: true,
      applicationId: stateApp1.id,
      userId: sampleUsers[2].id,
      state: "Rajasthan",
      status: "ACTIVE",
    },
  });
  console.log("✅ Campus Leads & State Leads seeded");

  // Create tickets and schedule for upcoming events
  let ticketPadharo = await prisma.ticketType.findFirst({
    where: { eventId: padharoX01.id, name: "General Attendee" },
  });
  if (!ticketPadharo) {
    ticketPadharo = await prisma.ticketType.create({
      data: {
        isSeed: true,
        eventId: padharoX01.id,
        name: "General Attendee",
        price: 0,
        quota: 500,
        isFree: true,
        description: "Full event access, keynote sessions, partner expo & lunch.",
        saleStart: new Date("2026-09-01T00:00:00Z"),
        saleEnd: new Date("2026-11-13T23:59:59Z"),
      },
    });
  }

  const existingVip = await prisma.ticketType.findFirst({
    where: { eventId: padharoX01.id, name: "Community VIP Pass" },
  });
  if (!existingVip) {
    await prisma.ticketType.create({
      data: {
        isSeed: true,
        eventId: padharoX01.id,
        name: "Community VIP Pass",
        price: 299,
        quota: 50,
        isFree: false,
        description: "Priority front-row seating, exclusive speaker dinner invite & swag kit.",
        saleStart: new Date("2026-09-01T00:00:00Z"),
        saleEnd: new Date("2026-11-12T23:59:59Z"),
      },
    });
  }

  const existingNirmanTicket = await prisma.ticketType.findFirst({
    where: { eventId: nirmanX2026.id, name: "Hacker Team Pass (2-4 pax)" },
  });
  if (!existingNirmanTicket) {
    await prisma.ticketType.create({
      data: {
        isSeed: true,
        eventId: nirmanX2026.id,
        name: "Hacker Team Pass (2-4 pax)",
        price: 0,
        quota: 150,
        isFree: true,
        description: "Includes hackathon team entry, 36h food, snacks, mentor access & swag.",
        saleStart: new Date("2026-10-01T00:00:00Z"),
        saleEnd: new Date("2026-11-28T23:59:59Z"),
      },
    });
  }

  // Schedule for PadharoX 01
  await prisma.eventScheduleItem.deleteMany({ where: { eventId: padharoX01.id } });
  await prisma.eventScheduleItem.createMany({
    data: [
      {
        isSeed: true,
        eventId: padharoX01.id,
        startTime: new Date("2026-11-14T10:00:00Z"),
        endTime: new Date("2026-11-14T10:45:00Z"),
        title: "Check-in, Morning Chai & Swag Collection",
        description: "Collect your personalized developer badge and KailshiansX welcome kit.",
        sortOrder: 1,
      },
      {
        isSeed: true,
        eventId: padharoX01.id,
        startTime: new Date("2026-11-14T10:45:00Z"),
        endTime: new Date("2026-11-14T11:45:00Z"),
        title: "Opening Keynote: Scaling GenAI Infrastructure from 0 to 1M Users",
        description:
          "Real-world war stories from building high-scale distributed agentic platforms.",
        speakerId: rahul.id,
        sortOrder: 2,
      },
      {
        isSeed: true,
        eventId: padharoX01.id,
        startTime: new Date("2026-11-14T11:45:00Z"),
        endTime: new Date("2026-11-14T12:45:00Z"),
        title: "Architecture Session: Event-Driven Microservices with Next.js & Postgres",
        description:
          "Deep dive into CDC pipelines, server actions, and resilient queue processing.",
        speakerId: priya.id,
        sortOrder: 3,
      },
      {
        isSeed: true,
        eventId: padharoX01.id,
        startTime: new Date("2026-11-14T12:45:00Z"),
        endTime: new Date("2026-11-14T14:15:00Z"),
        title: "Community Networking Lunch & Ecosystem Partner Expo",
        description: "Connect with founders, campus leads, and tech recruiters at sponsor booths.",
        sortOrder: 4,
      },
      {
        isSeed: true,
        eventId: padharoX01.id,
        startTime: new Date("2026-11-14T14:15:00Z"),
        endTime: new Date("2026-11-14T16:00:00Z"),
        title: "Live Terminal Lab: Building Autonomous Tool-Calling Agents",
        description: "Hands-on terminal coding session deploying agents to edge containers.",
        sortOrder: 5,
      },
      {
        isSeed: true,
        eventId: padharoX01.id,
        startTime: new Date("2026-11-14T16:00:00Z"),
        endTime: new Date("2026-11-14T17:30:00Z"),
        title: "Open Mic, Campus Chapter Awards & Closing Remarks",
        description: "Celebrating top campus leaders, community giveaways, and open mic pitches.",
        sortOrder: 6,
      },
    ],
    skipDuplicates: true,
  });

  // FAQs for PadharoX 01
  await prisma.eventFaq.deleteMany({ where: { eventId: padharoX01.id } });
  await prisma.eventFaq.createMany({
    data: [
      {
        isSeed: true,
        eventId: padharoX01.id,
        question: "Is PadharoX free to attend?",
        answer:
          "Yes! General Admission and Student passes are 100% free of charge sponsored by our ecosystem partners.",
        sortOrder: 1,
      },
      {
        isSeed: true,
        eventId: padharoX01.id,
        question: "Will verifiable certificates be provided?",
        answer:
          "Yes, all verified attendees will receive a cryptographically verifiable digital certificate powered by KailshiansX.",
        sortOrder: 2,
      },
      {
        isSeed: true,
        eventId: padharoX01.id,
        question: "What should I bring with me?",
        answer:
          "Bring your laptop, charger, student or professional ID, and enthusiasm to learn and connect with fellow builders.",
        sortOrder: 3,
      },
      {
        isSeed: true,
        eventId: padharoX01.id,
        question: "Where is the venue and is parking available?",
        answer:
          "JECC Auditorium is located in the RIICO Industrial Area, Sitapura, Jaipur. Ample two-wheeler and four-wheeler parking is available on-site.",
        sortOrder: 4,
      },
    ],
    skipDuplicates: true,
  });

  // Tracks for PadharoX 01
  await prisma.eventTrack.deleteMany({ where: { eventId: padharoX01.id } });
  await prisma.eventTrack.createMany({
    data: [
      {
        isSeed: true,
        eventId: padharoX01.id,
        name: "Agentic AI & LLM Systems",
        description:
          "Multi-agent orchestration, tool use, memory architectures, and model evaluations.",
        color: "#3d61fc",
        sortOrder: 1,
      },
      {
        isSeed: true,
        eventId: padharoX01.id,
        name: "High-Scale Cloud Infrastructure",
        description: "Distributed databases, event queues, edge deployments, and Kubernetes.",
        color: "#8b3dff",
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  // Schedule and FAQs for NirmanX 2026
  await prisma.eventScheduleItem.deleteMany({ where: { eventId: nirmanX2026.id } });
  await prisma.eventScheduleItem.createMany({
    data: [
      {
        isSeed: true,
        eventId: nirmanX2026.id,
        startTime: new Date("2026-12-05T09:00:00Z"),
        endTime: new Date("2026-12-05T10:30:00Z"),
        title: "Hacker Team Check-in, Desk Setup & Breakfast",
        description: "Pick up your hacker badges, access credentials, and setup workstations.",
        sortOrder: 1,
      },
      {
        isSeed: true,
        eventId: nirmanX2026.id,
        startTime: new Date("2026-12-05T10:30:00Z"),
        endTime: new Date("2026-12-05T11:30:00Z"),
        title: "Opening Ceremony, Problem Statements & Track Reveals",
        description: "Jury introduction, judging criteria briefing, and sponsor API unlocks.",
        sortOrder: 2,
      },
      {
        isSeed: true,
        eventId: nirmanX2026.id,
        startTime: new Date("2026-12-05T11:30:00Z"),
        endTime: new Date("2026-12-06T17:00:00Z"),
        title: "36-Hour Hackathon Sprints & Mentorship Rounds",
        description:
          "Continuous building with dedicated industry mentors roving throughout the night.",
        sortOrder: 3,
      },
      {
        isSeed: true,
        eventId: nirmanX2026.id,
        startTime: new Date("2026-12-06T17:00:00Z"),
        endTime: new Date("2026-12-06T19:00:00Z"),
        title: "Code Freeze & Top 10 Live Stage Demos",
        description: "Finalist teams demo working prototypes live to the executive jury.",
        sortOrder: 4,
      },
      {
        isSeed: true,
        eventId: nirmanX2026.id,
        startTime: new Date("2026-12-06T19:00:00Z"),
        endTime: new Date("2026-12-06T20:00:00Z"),
        title: "Awards Ceremony & ₹10 Lakhs Grants Distribution",
        description: "Winner announcements, grant felicitations, and closing celebrations.",
        sortOrder: 5,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.eventFaq.deleteMany({ where: { eventId: nirmanX2026.id } });
  await prisma.eventFaq.createMany({
    data: [
      {
        isSeed: true,
        eventId: nirmanX2026.id,
        question: "What is the team size limit?",
        answer:
          "Teams must consist of 2 to 4 members. Inter-college teams and cross-functional teams are welcome.",
        sortOrder: 1,
      },
      {
        isSeed: true,
        eventId: nirmanX2026.id,
        question: "Are food, snacks, and accommodation provided?",
        answer:
          "Yes, 36 hours of continuous meals, midnight pizza, energy drinks, and designated resting zones are provided.",
        sortOrder: 2,
      },
      {
        isSeed: true,
        eventId: nirmanX2026.id,
        question: "Who owns the intellectual property (IP) created?",
        answer:
          "You and your team retain 100% ownership of your code, design, and intellectual property.",
        sortOrder: 3,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.eventTrack.deleteMany({ where: { eventId: nirmanX2026.id } });
  await prisma.eventTrack.createMany({
    data: [
      {
        isSeed: true,
        eventId: nirmanX2026.id,
        name: "Autonomous AI Agents",
        description:
          "Multi-modal agents, autonomous task solvers, and developer productivity tools.",
        color: "#3d61fc",
        sortOrder: 1,
      },
      {
        isSeed: true,
        eventId: nirmanX2026.id,
        name: "Digital Public Goods & FinTech",
        description: "UPI ecosystem innovations, decentralized identity, and financial access.",
        color: "#10b981",
        sortOrder: 2,
      },
      {
        isSeed: true,
        eventId: nirmanX2026.id,
        name: "Open Bharat Tech",
        description: "Local language interfaces, smart agriculture, and healthcare systems.",
        color: "#f59e0b",
        sortOrder: 3,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.registration.upsert({
    where: { registrationCode: "KX-2026-PX001" },
    update: { isSeed: true },
    create: {
      isSeed: true,
      registrationCode: "KX-2026-PX001",
      eventId: padharoX01.id,
      userId: sampleUsers[0].id,
      ticketTypeId: ticketPadharo.id,
      name: "Ananya Deshmukh",
      email: "ananya.deshmukh@mnit.ac.in",
      status: "CONFIRMED",
    },
  });

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
