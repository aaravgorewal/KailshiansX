import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Enriching Meetup Series, Hackathon Series & Edition Details...");

  // 1. Update Series Metadata (Logos, Regions, Taglines, Deep Purpose)
  await prisma.series.upsert({
    where: { slug: "raibarx" },
    update: {
      name: "RaibarX",
      kind: "MEETUP",
      tagline: "The Flagship Developer Meetup Series of Rajasthan",
      city: "Jaipur",
      region: "Rajasthan & North India",
      logo: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&h=200&fit=crop",
      coverImage:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&h=900&fit=crop",
      purpose:
        "RaibarX is the flagship developer meetup series by KailshiansX for the Rajasthan tech community. Built as a grassroots developer movement, RaibarX connects indie hackers, open-source contributors, student builders, and senior engineers across Jaipur, Jodhpur, Kota, and Udaipur. Each edition features deep-dive engineering talks, unscripted panel sessions, lightning demos, and high-trust peer networking.",
    },
    create: {
      slug: "raibarx",
      name: "RaibarX",
      kind: "MEETUP",
      tagline: "The Flagship Developer Meetup Series of Rajasthan",
      city: "Jaipur",
      region: "Rajasthan & North India",
      logo: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&h=200&fit=crop",
      coverImage:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&h=900&fit=crop",
      purpose:
        "RaibarX is the flagship developer meetup series by KailshiansX for the Rajasthan tech community. Built as a grassroots developer movement, RaibarX connects indie hackers, open-source contributors, student builders, and senior engineers across Jaipur, Jodhpur, Kota, and Udaipur. Each edition features deep-dive engineering talks, unscripted panel sessions, lightning demos, and high-trust peer networking.",
    },
  });

  await prisma.series.upsert({
    where: { slug: "padharox" },
    update: {
      name: "PadharoX",
      kind: "MEETUP",
      tagline: "Western Rajasthan's Premier Developer Gathering",
      city: "Jodhpur",
      region: "Western Rajasthan (Sun City)",
      logo: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&h=200&fit=crop",
      coverImage:
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1600&h=900&fit=crop",
      purpose:
        "PadharoX brings Tier-1 technical discourse and developer energy to the Sun City and Western Rajasthan. Designed to democratize access to industry-grade knowledge, PadharoX unites engineering colleges, young developers, and remote software engineers with Silicon Valley & Bangalore tech leaders.",
    },
    create: {
      slug: "padharox",
      name: "PadharoX",
      kind: "MEETUP",
      tagline: "Western Rajasthan's Premier Developer Gathering",
      city: "Jodhpur",
      region: "Western Rajasthan (Sun City)",
      logo: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&h=200&fit=crop",
      coverImage:
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1600&h=900&fit=crop",
      purpose:
        "PadharoX brings Tier-1 technical discourse and developer energy to the Sun City and Western Rajasthan. Designed to democratize access to industry-grade knowledge, PadharoX unites engineering colleges, young developers, and remote software engineers with Silicon Valley & Bangalore tech leaders.",
    },
  });

  await prisma.series.upsert({
    where: { slug: "tricityx" },
    update: {
      name: "TricityX",
      kind: "MEETUP",
      tagline: "Fueling the Northern Tech Corridor",
      city: "Chandigarh",
      region: "Chandigarh • Mohali • Panchkula",
      logo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop",
      coverImage:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&h=900&fit=crop",
      purpose:
        "TricityX is the recurring developer and founder gathering for Chandigarh, Mohali, and Panchkula. Home to top SaaS companies, product engineering studios, and premier engineering institutes (PEC, Chitkara, UIET), TricityX acts as the collaborative crucible for Northern India's builder ecosystem.",
    },
    create: {
      slug: "tricityx",
      name: "TricityX",
      kind: "MEETUP",
      tagline: "Fueling the Northern Tech Corridor",
      city: "Chandigarh",
      region: "Chandigarh • Mohali • Panchkula",
      logo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop",
      coverImage:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&h=900&fit=crop",
      purpose:
        "TricityX is the recurring developer and founder gathering for Chandigarh, Mohali, and Panchkula. Home to top SaaS companies, product engineering studios, and premier engineering institutes (PEC, Chitkara, UIET), TricityX acts as the collaborative crucible for Northern India's builder ecosystem.",
    },
  });

  await prisma.series.upsert({
    where: { slug: "nirmanx" },
    update: {
      name: "NirmanX",
      kind: "HACKATHON",
      tagline: "36 Hours to Build Sovereign Infrastructure & Future Tech",
      city: "Chandigarh",
      region: "Pan-India National Flagship",
      logo: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&h=200&fit=crop",
      coverImage:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&h=900&fit=crop",
      purpose:
        "NirmanX is the national flagship product hackathon of KailshiansX. Dedicated to building production-grade distributed systems, generative AI infrastructure, and public digital goods. NirmanX pairs 500+ handpicked engineers with real-world industry problem statements, heavy compute resources, top engineering mentors, and seed incubation backing.",
    },
    create: {
      slug: "nirmanx",
      name: "NirmanX",
      kind: "HACKATHON",
      tagline: "36 Hours to Build Sovereign Infrastructure & Future Tech",
      city: "Chandigarh",
      region: "Pan-India National Flagship",
      logo: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&h=200&fit=crop",
      coverImage:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&h=900&fit=crop",
      purpose:
        "NirmanX is the national flagship product hackathon of KailshiansX. Dedicated to building production-grade distributed systems, generative AI infrastructure, and public digital goods. NirmanX pairs 500+ handpicked engineers with real-world industry problem statements, heavy compute resources, top engineering mentors, and seed incubation backing.",
    },
  });

  await prisma.series.upsert({
    where: { slug: "aarambhx" },
    update: {
      name: "AarambhX",
      kind: "HACKATHON",
      tagline: "Your Gateway into the World of Competitive Hacking",
      city: "Jaipur",
      region: "National Rookie & Campus Builders",
      logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=200&fit=crop",
      coverImage:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&h=900&fit=crop",
      purpose:
        "AarambhX is KailshiansX's dedicated beginner-first 24-hour campus hackathon series. Specially crafted for first-time hackers, second-year students, and student society innovators. With zero intimidation, hands-on workshops before the hack, 1:1 round-the-clock mentorship, and verified proof-of-work certificates.",
    },
    create: {
      slug: "aarambhx",
      name: "AarambhX",
      kind: "HACKATHON",
      tagline: "Your Gateway into the World of Competitive Hacking",
      city: "Jaipur",
      region: "National Rookie & Campus Builders",
      logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=200&fit=crop",
      coverImage:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&h=900&fit=crop",
      purpose:
        "AarambhX is KailshiansX's dedicated beginner-first 24-hour campus hackathon series. Specially crafted for first-time hackers, second-year students, and student society innovators. With zero intimidation, hands-on workshops before the hack, 1:1 round-the-clock mentorship, and verified proof-of-work certificates.",
    },
  });

  const nirmanx = await prisma.series.findUniqueOrThrow({ where: { slug: "nirmanx" } });

  // 2. Link nirmanx-2026 as Edition 02 of NirmanX
  const nirmanx2026Event = await prisma.event.findUnique({ where: { slug: "nirmanx-2026" } });
  if (nirmanx2026Event) {
    await prisma.seriesEdition.upsert({
      where: { seriesId_editionNo: { seriesId: nirmanx.id, editionNo: 2 } },
      update: {
        eventId: nirmanx2026Event.id,
        theme: "Building Sovereign Infrastructure",
      },
      create: {
        seriesId: nirmanx.id,
        eventId: nirmanx2026Event.id,
        editionNo: 2,
        theme: "Building Sovereign Infrastructure",
      },
    });
  }

  // 3. Enrich NirmanX Season 01 (Past) with full HackathonDetail
  const nirmanxS01 = await prisma.event.findUnique({ where: { slug: "nirmanx-s01" } });
  if (nirmanxS01) {
    const nirmanxS01Data = {
      minTeamSize: 2,
      maxTeamSize: 4,
      rules: `1. All code, prototypes, and designs must be created during the official 36-hour hacking period.
2. Teams can consist of 2 to 4 members. Inter-college teams are welcome.
3. Open-source libraries, public APIs, and pre-trained models are allowed, provided they are attributed in the README.
4. Git commit history must show continuous development throughout the 36 hours.
5. All final submissions must include a working demo video (under 3 minutes) and a public GitHub repository.`,
      submissionUrl: "https://github.com/kailshiansx/nirmanx-s01-submissions",
      submissionDeadline: new Date(nirmanxS01.startDate.getTime() + 36 * 3600 * 1000),
      prizes: [
        {
          title: "Grand Champion (1st Place)",
          amount: "₹2,50,000",
          perks: [
            "Direct entry to KailshiansX Accelerator Evaluation",
            "₹5,00,000 AWS & Azure Cloud Credits",
            "Direct interview rounds at leading product unicorns",
            "Gold NirmanX Trophy & Builder Rings",
          ],
        },
        {
          title: "1st Runner Up (2nd Place)",
          amount: "₹1,50,000",
          perks: [
            "₹2,50,000 Cloud Credits",
            "3 Months 1:1 Architecture Mentorship",
            "Silver NirmanX Plaque",
          ],
        },
        {
          title: "2nd Runner Up (3rd Place)",
          amount: "₹75,000",
          perks: ["₹1,00,000 Cloud Credits", "Exclusive KailshiansX Swag Kit"],
        },
        {
          title: "Best All-Girls Team",
          amount: "₹25,000",
          perks: ["Women in Tech Leadership Fellowship & Sponsorship"],
        },
        {
          title: "Best Open Source DevTool",
          amount: "₹25,000",
          perks: ["GitHub Arctic Code Vault Nomination & Spotlight"],
        },
      ],
      problemStatements: [
        {
          id: "PS-01",
          track: "Distributed Systems & Cloud",
          title: "Fault-Tolerant Distributed Consensus with Micro-second Latency",
          description:
            "Design and implement a Raft or Paxos based replication engine in Go or Rust that guarantees linearizable consistency under 30% network packet drop and sudden node partitioning.",
          criteria: [
            "Formal linearizability benchmarks",
            "Jepsen test suite results showing zero data corruption",
            "Deterministic leader re-election under 50ms",
          ],
        },
        {
          id: "PS-02",
          track: "Generative AI & Agentic Workflows",
          title: "Autonomous Security Audit Agent for Smart Contracts",
          description:
            "Build a multi-agent system utilizing LLMs and AST static analysis that scans Solidity codebases for reentrancy, integer overflow, and flash loan attack vectors.",
          criteria: [
            "Vulnerability detection recall on curated benchmark CVEs",
            "Zero hallucinated exploits with step-by-step PoC generation",
            "Automated gas optimization recommendations",
          ],
        },
        {
          id: "PS-03",
          track: "Public Digital Infrastructure",
          title: "Offline-First Decentralized Identity & Credential Verifier",
          description:
            "Build a zero-knowledge verifiable credential system that allows university students to prove degrees and identity attributes completely offline using cryptographic QR codes.",
          criteria: [
            "Proof generation time under 300ms on mobile devices",
            "Zero leak of underlying PII data",
            "Seamless fallback to decentralized storage (IPFS)",
          ],
        },
        {
          id: "PS-04",
          track: "FinTech & High Frequency Streams",
          title: "High-Throughput Fraud Anomaly Detector for Real-Time UPI",
          description:
            "Process 50,000 TPS synthetic financial transactions with sub-15ms anomaly detection using Apache Kafka, Flink, and streaming graph embeddings.",
          criteria: [
            "Hard SLA compliance under 15ms p99",
            "Low false-positive classification rate (< 0.1%)",
            "Memory efficiency under stress load",
          ],
        },
      ],
      results: [
        {
          rank: 1,
          title: "Grand Champion",
          teamName: "VectorNodes",
          projectName: "ConsensusMesh",
          description:
            "High-performance Raft consensus engine written in Rust achieving 140,000 linearizable writes/sec with automated Jepsen chaos verification.",
          repoUrl: "https://github.com/kailshiansx/vector-nodes-consensus",
          demoUrl: "https://consensusmesh.live",
          track: "Distributed Systems & Cloud",
        },
        {
          rank: 2,
          title: "1st Runner Up",
          teamName: "ByteSentinels",
          projectName: "SolidityCopilot",
          description:
            "Autonomous agentic security scanner detecting complex flash loan vectors and compiling verifiable Hardhat test suites.",
          repoUrl: "https://github.com/kailshiansx/solidity-copilot-ai",
          demoUrl: "https://soliditycopilot.dev",
          track: "Generative AI & Agentic Workflows",
        },
        {
          rank: 3,
          title: "2nd Runner Up",
          teamName: "ZeroVault",
          projectName: "ZK-CampusID",
          description:
            "Zero-knowledge verifiable credential protocol allowing university verification without internet connectivity.",
          repoUrl: "https://github.com/kailshiansx/zk-campus-id",
          demoUrl: "https://zkcampus.id",
          track: "Public Digital Infrastructure",
        },
      ],
    };

    await prisma.hackathonDetail.upsert({
      where: { eventId: nirmanxS01.id },
      update: nirmanxS01Data,
      create: { eventId: nirmanxS01.id, ...nirmanxS01Data },
    });

    // Ensure NirmanX Season 01 has tracks
    await prisma.eventTrack.deleteMany({ where: { eventId: nirmanxS01.id } });
    await prisma.eventTrack.createMany({
      data: [
        {
          eventId: nirmanxS01.id,
          name: "Distributed Systems & Cloud",
          description: "High-throughput engines, consensus protocols, and resilient microservices",
          color: "#3b82f6",
          sortOrder: 1,
        },
        {
          eventId: nirmanxS01.id,
          name: "Generative AI & Agents",
          description: "Autonomous reasoning agents, multi-modal applications, and edge inference",
          color: "#8b5cf6",
          sortOrder: 2,
        },
        {
          eventId: nirmanxS01.id,
          name: "Public Digital Infrastructure",
          description: "Identity, zero-knowledge proofs, open data, and sovereign digital goods",
          color: "#10b981",
          sortOrder: 3,
        },
        {
          eventId: nirmanxS01.id,
          name: "FinTech & Streaming",
          description: "High-frequency payment processing, fraud graphs, and cryptographic ledgers",
          color: "#f59e0b",
          sortOrder: 4,
        },
      ],
    });
  }

  // 4. Enrich NirmanX 2026 (Season 02, Upcoming) with HackathonDetail
  if (nirmanx2026Event) {
    const nirmanx2026Data = {
      minTeamSize: 2,
      maxTeamSize: 4,
      rules: `1. 36 continuous hours of intense engineering.
2. All members must check-in on-site with valid photo IDs.
3. API credentials and cloud sandboxes will be provided at kickoff.
4. Mentors will conduct 2 mandatory checkpoint evaluations.
5. Final code must be pushed to the designated repository before 9:00 AM on Sunday.`,
      submissionUrl: "https://github.com/kailshiansx/nirmanx-2026-portal",
      submissionDeadline: new Date(nirmanx2026Event.startDate.getTime() + 36 * 3600 * 1000),
      prizes: [
        {
          title: "Grand Champion (1st Place)",
          amount: "₹3,00,000",
          perks: [
            "₹10,00,000 Cloud Compute Credits",
            "Direct Seed Evaluation with Angel Syndicate",
            "Championship Trophy & Swag for all team members",
          ],
        },
        {
          title: "1st Runner Up (2nd Place)",
          amount: "₹2,00,000",
          perks: ["₹5,00,000 Cloud Credits", "Pre-seed VC Office Hours"],
        },
        {
          title: "2nd Runner Up (3rd Place)",
          amount: "₹1,00,000",
          perks: ["₹2,50,000 Cloud Credits", "Exclusive Hardware Goodies"],
        },
        {
          title: "AI Track Bounty",
          amount: "₹50,000",
          perks: ["Sponsored by AI Cloud Partner"],
        },
      ],
      problemStatements: [
        {
          id: "PS-01",
          track: "Autonomous AI Agents",
          title: "Self-Healing Distributed Microservices Agent",
          description:
            "Build an autonomous SRE agent that ingests OpenTelemetry metrics and logs to automatically identify cascading failures and execute automated canary rollbacks.",
          criteria: ["Accurate root-cause diagnosis", "Zero false-positive automated rollbacks"],
        },
        {
          id: "PS-02",
          track: "High-Performance Web Infrastructure",
          title: "Edge-Native Dynamic Cache Invalidation Engine",
          description:
            "Architect a decentralized peer-to-peer CDN invalidation network using WebRTC and CRDT state synchronization.",
          criteria: ["Global propagation latency < 50ms", "Zero cache stampede under heavy load"],
        },
        {
          id: "PS-03",
          track: "Developer Experience & Tooling",
          title: "Interactive Architecture-as-Code Compiler",
          description:
            "Create a visual compiler that transforms multi-cloud architecture diagrams into verified Terraform & Kubernetes YAML configs in real time.",
          criteria: ["Deterministic code generation", "Automated security policy enforcement"],
        },
      ],
    };

    await prisma.hackathonDetail.upsert({
      where: { eventId: nirmanx2026Event.id },
      update: nirmanx2026Data,
      create: {
        eventId: nirmanx2026Event.id,
        ...nirmanx2026Data,
      },
    });

    // Add tracks to NirmanX 2026
    await prisma.eventTrack.deleteMany({ where: { eventId: nirmanx2026Event.id } });
    await prisma.eventTrack.createMany({
      data: [
        {
          eventId: nirmanx2026Event.id,
          name: "Autonomous AI Agents",
          description: "Multi-agent workflows, code generation, and automated reasoning systems",
          color: "#8b5cf6",
          sortOrder: 1,
        },
        {
          eventId: nirmanx2026Event.id,
          name: "High-Performance Web Infrastructure",
          description: "Edge networks, low-latency streaming, and cloud primitives",
          color: "#3b82f6",
          sortOrder: 2,
        },
        {
          eventId: nirmanx2026Event.id,
          name: "Developer Experience & Tooling",
          description: "Compilers, debuggers, observability, and CLI tools",
          color: "#10b981",
          sortOrder: 3,
        },
      ],
    });
  }

  // 5. Enrich AarambhX Edition 01 with HackathonDetail
  const aarambhx01 = await prisma.event.findUnique({ where: { slug: "aarambhx-01" } });
  if (aarambhx01) {
    const aarambhx01Data = {
      minTeamSize: 1,
      maxTeamSize: 4,
      rules: `1. Open exclusively to college undergraduates and first-time hackathon participants.
2. Mentors will be present to help you with Git, project setup, and API keys.
3. Focus on working prototypes over polished pitch decks.
4. Code must be published on GitHub with an open-source license.`,
      submissionUrl: "https://github.com/kailshiansx/aarambhx-01-submissions",
      submissionDeadline: new Date(aarambhx01.startDate.getTime() + 24 * 3600 * 1000),
      prizes: [
        {
          title: "First Place (Best Project)",
          amount: "₹1,00,000",
          perks: [
            "KailshiansX Mentorship Fellowship",
            "Exclusive Swag Boxes",
            "Certificate of Excellence",
          ],
        },
        {
          title: "Runner Up (2nd Place)",
          amount: "₹50,000",
          perks: ["Cloud credits", "KailshiansX Backpacks"],
        },
        {
          title: "Best Rookie Team (1st Year Students)",
          amount: "₹25,000",
          perks: ["Special Recognition & Trophy"],
        },
      ],
      problemStatements: [
        {
          id: "PS-01",
          track: "Campus & Student Life",
          title: "Smart Campus Lost & Found with Image Vector Search",
          description:
            "Build a mobile-first web application where students can snap a photo of a lost item (calculator, ID card, jacket) and find matching reported items using vector similarity search.",
          criteria: [
            "Accurate image matching",
            "Seamless WhatsApp/email alerts",
            "Mobile responsive UI",
          ],
        },
        {
          id: "PS-02",
          track: "AI & Learning Assistants",
          title: "Interactive Lecture-to-Flashcards Generator",
          description:
            "An app that accepts professor lecture audio or PDF slides and generates spaced-repetition interactive quizzes with explanations.",
          criteria: [
            "Clean summary accuracy",
            "Interactive quiz interface",
            "Offline review capability",
          ],
        },
        {
          id: "PS-03",
          track: "Open Innovation",
          title: "Student Community Micro-Gig & Collab Board",
          description:
            "A platform connecting student designers, developers, and writers within a campus to team up for projects and hackathons.",
          criteria: ["Skill-based matching", "Simple portfolio integration", "Fast onboarding"],
        },
      ],
      results: [
        {
          rank: 1,
          title: "First Place",
          teamName: "CampusCrafters",
          projectName: "FoundItAI",
          description:
            "Visual AI lost and found engine that matched 85% of test items across campus using multimodal embeddings.",
          repoUrl: "https://github.com/kailshiansx/foundit-ai",
          demoUrl: "https://foundit-campus.vercel.app",
          track: "Campus & Student Life",
        },
        {
          rank: 2,
          title: "Runner Up",
          teamName: "FlashLearn",
          projectName: "LecturePulse",
          description: "Real-time slide summarizer and AI quiz generator for engineering lectures.",
          repoUrl: "https://github.com/kailshiansx/lecture-pulse",
          demoUrl: "https://lecturepulse.dev",
          track: "AI & Learning Assistants",
        },
      ],
    };

    await prisma.hackathonDetail.upsert({
      where: { eventId: aarambhx01.id },
      update: aarambhx01Data,
      create: {
        eventId: aarambhx01.id,
        ...aarambhx01Data,
      },
    });

    // Add tracks to AarambhX 01
    await prisma.eventTrack.deleteMany({ where: { eventId: aarambhx01.id } });
    await prisma.eventTrack.createMany({
      data: [
        {
          eventId: aarambhx01.id,
          name: "Campus & Student Life",
          description: "Practical digital tools making daily university life effortless",
          color: "#10b981",
          sortOrder: 1,
        },
        {
          eventId: aarambhx01.id,
          name: "AI & Learning Assistants",
          description: "Leveraging foundational models for student education and productivity",
          color: "#8b5cf6",
          sortOrder: 2,
        },
        {
          eventId: aarambhx01.id,
          name: "Open Innovation",
          description: "Creative student projects solving real-world local problems",
          color: "#3b82f6",
          sortOrder: 3,
        },
      ],
    });
  }

  // 6. Ensure Speakers have Judge & Mentor roles mapped for Hackathons
  const rahul = await prisma.speaker.findFirst({ where: { slug: "rahul-sharma" } });
  const priya = await prisma.speaker.findFirst({ where: { slug: "priya-mehta" } });
  const arjun = await prisma.speaker.findFirst({ where: { slug: "arjun-kapoor" } });
  const deepa = await prisma.speaker.findFirst({ where: { slug: "deepa-nair" } });

  if (nirmanxS01 && rahul && priya && arjun && deepa) {
    await prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: nirmanxS01.id, speakerId: rahul.id, role: "JUDGE" },
      },
      update: {},
      create: { eventId: nirmanxS01.id, speakerId: rahul.id, role: "JUDGE", sortOrder: 1 },
    });
    await prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: nirmanxS01.id, speakerId: priya.id, role: "JUDGE" },
      },
      update: {},
      create: { eventId: nirmanxS01.id, speakerId: priya.id, role: "JUDGE", sortOrder: 2 },
    });
    await prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: nirmanxS01.id, speakerId: arjun.id, role: "MENTOR" },
      },
      update: {},
      create: { eventId: nirmanxS01.id, speakerId: arjun.id, role: "MENTOR", sortOrder: 3 },
    });
    await prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: { eventId: nirmanxS01.id, speakerId: deepa.id, role: "MENTOR" },
      },
      update: {},
      create: { eventId: nirmanxS01.id, speakerId: deepa.id, role: "MENTOR", sortOrder: 4 },
    });
  }

  if (nirmanx2026Event && rahul && arjun) {
    await prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: {
          eventId: nirmanx2026Event.id,
          speakerId: rahul.id,
          role: "JUDGE",
        },
      },
      update: {},
      create: { eventId: nirmanx2026Event.id, speakerId: rahul.id, role: "JUDGE", sortOrder: 1 },
    });
    await prisma.eventSpeaker.upsert({
      where: {
        eventId_speakerId_role: {
          eventId: nirmanx2026Event.id,
          speakerId: arjun.id,
          role: "MENTOR",
        },
      },
      update: {},
      create: { eventId: nirmanx2026Event.id, speakerId: arjun.id, role: "MENTOR", sortOrder: 2 },
    });
  }

  console.log("✅ Series & Hackathon Editions enrichment complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
