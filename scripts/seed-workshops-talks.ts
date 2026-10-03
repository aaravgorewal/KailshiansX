import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedWorkshopsAndTalks() {
  console.log("🌱 Enriching Workshops and Tech Talks data...");

  // Fetch cities
  const jaipur = await prisma.city.findFirst({ where: { name: "Jaipur" } });
  const chandigarh = await prisma.city.findFirst({ where: { name: "Chandigarh" } });
  const delhi = await prisma.city.findFirst({ where: { name: "Delhi" } });

  // Fetch speakers
  const rahul = await prisma.speaker.findFirst({ where: { slug: "rahul-sharma" } });
  const priya = await prisma.speaker.findFirst({ where: { slug: "priya-mehta" } });
  const arjun = await prisma.speaker.findFirst({ where: { slug: "arjun-kapoor" } });
  const deepa = await prisma.speaker.findFirst({ where: { slug: "deepa-nair" } });

  // Update existing workshops with category
  await prisma.event.updateMany({
    where: { slug: "workshop-cloud-devops-chd-01" },
    data: { category: "DevOps" },
  });
  await prisma.event.updateMany({
    where: { slug: "workshop-rust-systems" },
    data: { category: "Backend" },
  });

  // Seed Workshops across categories
  const workshopsData = [
    {
      slug: "workshop-fullstack-mern",
      title: "Production MERN Architecture & Real-Time Next.js",
      type: "WORKSHOP" as const,
      category: "MERN",
      status: "PUBLISHED" as const,
      overview:
        "Build a production-grade SaaS application with Next.js 15, TypeScript, MongoDB, Express microservices, and WebSockets. Hands-on coding from schema design to CI/CD container deployment.",
      cityId: jaipur?.id,
      venue: "MNIT Jaipur Computer Center",
      venueAddress: "Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur 302017",
      attendanceMode: "IN_PERSON" as const,
      startDate: new Date("2026-10-18T09:30:00.000Z"),
      endDate: new Date("2026-10-18T17:30:00.000Z"),
      registrationDeadline: new Date("2026-10-17T23:59:59.000Z"),
      eligibility: "Familiarity with JavaScript and React. Bring your laptop.",
      maxCapacity: 90,
      isFeatured: true,
      speakerId: rahul?.id,
      price: 0,
    },
    {
      slug: "workshop-system-design-mastery",
      title: "Distributed System Design & High-Concurrency Architecture",
      type: "WORKSHOP" as const,
      category: "System Design",
      status: "PUBLISHED" as const,
      overview:
        "Deep-dive into designing distributed systems capable of handling 50k+ requests per second. Real-world case studies on Kafka partitioning, Redis cluster caching, database sharding, and fault tolerance.",
      cityId: chandigarh?.id,
      venue: "PEC Campus Auditorium",
      venueAddress: "Sector 12, Chandigarh 160012",
      attendanceMode: "IN_PERSON" as const,
      startDate: new Date("2026-11-08T10:00:00.000Z"),
      endDate: new Date("2026-11-08T18:00:00.000Z"),
      registrationDeadline: new Date("2026-11-06T23:59:59.000Z"),
      eligibility: "Backend engineers, students with CS fundamentals. Intermediate level.",
      maxCapacity: 120,
      isFeatured: true,
      speakerId: arjun?.id,
      price: 299,
    },
    {
      slug: "workshop-agentic-ai-hack",
      title: "Building Autonomous Agentic AI Systems with LangGraph & Claude",
      type: "WORKSHOP" as const,
      category: "AI",
      status: "PUBLISHED" as const,
      overview:
        "Hands-on workshop constructing multi-agent architectures, dynamic tool invocation, memory indexing with vector DBs, and human-in-the-loop validation.",
      cityId: delhi?.id,
      venue: "IIT Delhi LH-101",
      venueAddress: "Hauz Khas, New Delhi 110016",
      attendanceMode: "IN_PERSON" as const,
      startDate: new Date("2026-11-14T09:00:00.000Z"),
      endDate: new Date("2026-11-14T17:00:00.000Z"),
      registrationDeadline: new Date("2026-11-12T23:59:59.000Z"),
      eligibility: "Python or TypeScript basics required.",
      maxCapacity: 100,
      isFeatured: true,
      speakerId: priya?.id,
      price: 499,
    },
    {
      slug: "workshop-solidity-web3",
      title: "Smart Contract Engineering & DeFi Security on Ethereum",
      type: "WORKSHOP" as const,
      category: "Blockchain",
      status: "PUBLISHED" as const,
      overview:
        "A rigorous masterclass on Solidity security patterns, reentrancy attacks, flash loans, and gas optimization with Foundry.",
      cityId: jaipur?.id,
      venue: "KWS Tech Hub Jaipur",
      venueAddress: "Mansarovar, Jaipur 302020",
      attendanceMode: "IN_PERSON" as const,
      startDate: new Date("2025-11-15T09:00:00.000Z"),
      endDate: new Date("2025-11-15T17:00:00.000Z"),
      registrationDeadline: new Date("2025-11-14T23:59:59.000Z"),
      maxCapacity: 60,
      speakerId: arjun?.id,
      price: 0,
    },
    {
      slug: "workshop-open-source-gsoc",
      title: "Open Source Blueprint: Contributing to Kubernetes & Global Ecosystems",
      type: "WORKSHOP" as const,
      category: "Open Source",
      status: "PUBLISHED" as const,
      overview:
        "Learn how to navigate large GitHub codebases, write impactful RFCs, make clean PRs, and apply for mentorship programs like GSoC and LFX Mentorship.",
      cityId: chandigarh?.id,
      venue: "PEC Mini Hall",
      venueAddress: "PEC Campus, Chandigarh",
      attendanceMode: "IN_PERSON" as const,
      startDate: new Date("2026-01-20T10:00:00.000Z"),
      endDate: new Date("2026-01-20T16:00:00.000Z"),
      registrationDeadline: new Date("2026-01-19T23:59:59.000Z"),
      maxCapacity: 150,
      speakerId: rahul?.id,
      price: 0,
    },
    {
      slug: "workshop-tech-career-playbook",
      title: "Tech Career Playbook: From Campus Builder to Tier-1 Product Engineer",
      type: "WORKSHOP" as const,
      category: "Career",
      status: "PUBLISHED" as const,
      overview:
        "Comprehensive roadmap for breaking into top product companies, engineering resume teardowns, behavioral interviews, and portfolio architecture.",
      cityId: delhi?.id,
      venue: "Virtual Live Stage",
      venueAddress: "Online Livestream & Discord",
      attendanceMode: "VIRTUAL" as const,
      startDate: new Date("2026-10-25T14:00:00.000Z"),
      endDate: new Date("2026-10-25T18:00:00.000Z"),
      registrationDeadline: new Date("2026-10-24T23:59:59.000Z"),
      maxCapacity: 500,
      speakerId: deepa?.id,
      price: 0,
    },
    {
      slug: "workshop-aws-serverless",
      title: "Cloud Native Mastery: AWS Lambda, DynamoDB & Event-Driven Systems",
      type: "WORKSHOP" as const,
      category: "Cloud",
      status: "PUBLISHED" as const,
      overview:
        "Hands-on building of resilient serverless backends using AWS CDK, SQS, SNS, and DynamoDB single-table design.",
      cityId: chandigarh?.id,
      venue: "TechPark Chandigarh",
      venueAddress: "IT Park, Chandigarh",
      attendanceMode: "IN_PERSON" as const,
      startDate: new Date("2025-12-10T09:00:00.000Z"),
      endDate: new Date("2025-12-10T17:00:00.000Z"),
      registrationDeadline: new Date("2025-12-08T23:59:59.000Z"),
      maxCapacity: 75,
      speakerId: rahul?.id,
      price: 199,
    },
  ];

  for (const w of workshopsData) {
    const { speakerId, price, ...eventFields } = w;
    const ev = await prisma.event.upsert({
      where: { slug: eventFields.slug },
      update: {
        category: eventFields.category,
        title: eventFields.title,
        overview: eventFields.overview,
        venue: eventFields.venue,
        venueAddress: eventFields.venueAddress,
        startDate: eventFields.startDate,
        endDate: eventFields.endDate,
      },
      create: eventFields,
    });

    if (speakerId) {
      await prisma.eventSpeaker.upsert({
        where: {
          eventId_speakerId_role: { eventId: ev.id, speakerId, role: "SPEAKER" },
        },
        update: {},
        create: { eventId: ev.id, speakerId, role: "SPEAKER" },
      });
    }

    // Ensure ticket type exists
    const existingTicket = await prisma.ticketType.findFirst({ where: { eventId: ev.id } });
    if (!existingTicket) {
      await prisma.ticketType.create({
        data: {
          eventId: ev.id,
          name: price === 0 ? "General Workshop Pass" : "Workshop Pro Pass",
          price,
          quota: ev.maxCapacity || 100,
        },
      });
    }
  }

  // Update existing Tech Talks
  await prisma.event.updateMany({
    where: { slug: "techtalk-scaling-10m" },
    data: { category: "Backend" },
  });
  await prisma.event.updateMany({
    where: { slug: "techtalk-agentic-ai" },
    data: { category: "AI" },
  });

  // Seed Past Tech Talks with rich knowledge archive resources
  const techTalksData = [
    {
      slug: "techtalk-nextjs-internals",
      title: "Inside Next.js 15: React Server Components & Turbopack Engine",
      type: "TECH_TALK" as const,
      category: "Frontend",
      status: "PUBLISHED" as const,
      overview:
        "An in-depth technical exploration into React Server Component streaming architecture, Flight RPC protocols, Turbopack incremental bundle compilation, and high-performance SSR patterns.",
      cityId: delhi?.id,
      venue: "IIT Delhi Senate Hall",
      venueAddress: "IIT Delhi Campus, Hauz Khas, New Delhi 110016",
      attendanceMode: "IN_PERSON" as const,
      startDate: new Date("2026-08-15T15:00:00.000Z"),
      endDate: new Date("2026-08-15T18:00:00.000Z"),
      registrationDeadline: new Date("2026-08-14T23:59:59.000Z"),
      maxCapacity: 150,
      isFeatured: true,
      speakerId: rahul?.id,
      hostInstitution: "IIT Delhi ACM Student Chapter",
      resources: {
        slideUrl: "https://cdn.kailshiansx.com/talks/nextjs15-internals-slides.pdf",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        repoUrl: "https://github.com/kailshians/nextjs-internals-masterclass",
        keyTakeaways: [
          "React Server Components render exclusively on Node/Edge runtimes without bloating client JavaScript bundles.",
          "Streaming SSR splits HTML responses into asynchronous boundaries, cutting TTFB in half.",
          "Turbopack leverages Rust-based incremental function caches for sub-10ms hot-module updates.",
          "Route handlers and Server Actions execute with cryptographically signed closure payloads for zero-leak security.",
        ],
        tags: ["nextjs", "react", "turbopack", "ssr", "typescript", "architecture"],
      },
    },
    {
      slug: "techtalk-database-internals",
      title: "PostgreSQL Under the Hood: B-Trees, WAL, MVCC & Query Optimization",
      type: "TECH_TALK" as const,
      category: "System Design",
      status: "PUBLISHED" as const,
      overview:
        "Demystifying relational database engines: how PostgreSQL executes queries, stores pages on NVMe disks, handles concurrent write conflicts with MVCC, and optimizes complex joins via EXPLAIN ANALYZE.",
      cityId: chandigarh?.id,
      venue: "PEC Chandigarh Main Auditorium",
      venueAddress: "Sector 12, Chandigarh 160012",
      attendanceMode: "IN_PERSON" as const,
      startDate: new Date("2026-07-22T16:00:00.000Z"),
      endDate: new Date("2026-07-22T19:00:00.000Z"),
      registrationDeadline: new Date("2026-07-21T23:59:59.000Z"),
      maxCapacity: 200,
      isFeatured: true,
      speakerId: arjun?.id,
      hostInstitution: "PEC Developers Guild",
      resources: {
        slideUrl: "https://cdn.kailshiansx.com/talks/postgres-internals.pdf",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        repoUrl: "https://github.com/kailshians/postgres-performance-benchmarks",
        keyTakeaways: [
          "Write-Ahead Logging (WAL) ensures atomic durability before flushing dirty buffer pool pages to disk.",
          "Multi-Version Concurrency Control (MVCC) creates tuple snapshots, preventing read queries from blocking writes.",
          "Compound B-Tree index ordering directly dictates whether index range scans or sequential scans are picked by the planner.",
          "Connection poolers like PgBouncer prevent backend process OS context switching bottlenecks under heavy loads.",
        ],
        tags: ["postgresql", "databases", "system-design", "performance", "indexing"],
      },
    },
    {
      slug: "techtalk-zero-knowledge",
      title: "Zero-Knowledge Cryptography: Practical ZK-SNARKs for Web Developers",
      type: "TECH_TALK" as const,
      category: "Blockchain",
      status: "PUBLISHED" as const,
      overview:
        "A practical guide to zero-knowledge proofs: how arithmetic circuits are constructed, polynomial commitments work, and how developers can build identity verification without exposing personal data.",
      cityId: jaipur?.id,
      venue: "Virtual Stage / Stream",
      venueAddress: "Online Livestream",
      attendanceMode: "VIRTUAL" as const,
      startDate: new Date("2026-06-18T17:00:00.000Z"),
      endDate: new Date("2026-06-18T19:30:00.000Z"),
      registrationDeadline: new Date("2026-06-17T23:59:59.000Z"),
      maxCapacity: 300,
      speakerId: priya?.id,
      hostInstitution: "KailshiansX Web3 Community",
      resources: {
        slideUrl: "https://cdn.kailshiansx.com/talks/zkp-practical-guide.pdf",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        repoUrl: "https://github.com/kailshians/zkp-circom-starter",
        keyTakeaways: [
          "Zero-knowledge proofs prove validity of a computation while keeping secret inputs strictly confidential.",
          "Circom enables compiling intuitive arithmetic constraint systems down to R1CS formats.",
          "Groth16 and PLONK systems produce tiny 128-byte cryptographic proofs verifiable in milliseconds.",
          "Use-cases extend far beyond crypto into anonymous KYC, private voting, and verifiable AI inference.",
        ],
        tags: ["cryptography", "zkp", "blockchain", "privacy", "web3"],
      },
    },
  ];

  for (const t of techTalksData) {
    const { speakerId, resources, hostInstitution, ...eventFields } = t;
    const talk = await prisma.event.upsert({
      where: { slug: eventFields.slug },
      update: {
        title: eventFields.title,
        overview: eventFields.overview,
        venue: eventFields.venue,
        venueAddress: eventFields.venueAddress,
        startDate: eventFields.startDate,
        endDate: eventFields.endDate,
        category: eventFields.category,
      },
      create: eventFields,
    });

    if (speakerId) {
      await prisma.eventSpeaker.upsert({
        where: {
          eventId_speakerId_role: { eventId: talk.id, speakerId, role: "SPEAKER" },
        },
        update: {},
        create: { eventId: talk.id, speakerId, role: "SPEAKER" },
      });
    }

    // Attach host institution partner
    if (hostInstitution) {
      let partner = await prisma.partner.findFirst({ where: { name: hostInstitution } });
      if (!partner) {
        partner = await prisma.partner.create({
          data: {
            name: hostInstitution,
            slug: hostInstitution.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            category: "college",
            website: "https://kailshiansx.com",
          },
        });
      }

      await prisma.eventPartner.upsert({
        where: {
          eventId_partnerId: { eventId: talk.id, partnerId: partner.id },
        },
        update: {},
        create: {
          eventId: talk.id,
          partnerId: partner.id,
          tier: "COMMUNITY",
        },
      });
    }

    // Attach tech talk post-event resources
    if (resources) {
      await prisma.techTalkResource.upsert({
        where: { eventId: talk.id },
        update: {
          slideUrl: resources.slideUrl,
          videoUrl: resources.videoUrl,
          repoUrl: resources.repoUrl,
          keyTakeaways: resources.keyTakeaways,
          tags: resources.tags,
        },
        create: {
          eventId: talk.id,
          speakerId,
          slideUrl: resources.slideUrl,
          videoUrl: resources.videoUrl,
          repoUrl: resources.repoUrl,
          keyTakeaways: resources.keyTakeaways,
          tags: resources.tags,
        },
      });
    }

    // Ensure free ticket tier for tech talk
    const existingTicket = await prisma.ticketType.findFirst({ where: { eventId: talk.id } });
    if (!existingTicket) {
      await prisma.ticketType.create({
        data: {
          eventId: talk.id,
          name: "General Attendee Pass",
          price: 0,
          quota: talk.maxCapacity || 150,
        },
      });
    }
  }

  console.log("✅ Successfully seeded workshops and tech talks with resources!");
}

seedWorkshopsAndTalks()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
