// src/lib/team-constants.ts
// Shared constants for team recruitment, core team categories, and openings (, )

export const TEAM_AREAS = [
  "Technology",
  "Events",
  "Operations",
  "Community",
  "Partnerships",
  "Sponsorship",
  "Marketing",
  "Design",
  "Content",
  "Social Media",
  "Developer Relations",
] as const;

export type TeamArea = (typeof TEAM_AREAS)[number];

export const TEAM_APPLICATION_STATUSES = [
  "NEW",
  "REVIEWING",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
] as const;

export type TeamApplicationStatus = (typeof TEAM_APPLICATION_STATUSES)[number];

export const STATUS_CONFIG: Record<
  TeamApplicationStatus,
  {
    label: string;
    variant: "default" | "brand" | "accent" | "success" | "destructive" | "surface";
    description: string;
  }
> = {
  NEW: {
    label: "New Application",
    variant: "surface",
    description: "Application received and queued for initial qualification screening.",
  },
  REVIEWING: {
    label: "In Review",
    variant: "brand",
    description: "Core team leads are evaluating technical portfolio and prior involvement.",
  },
  INTERVIEW: {
    label: "Interview Scheduled",
    variant: "accent",
    description: "Invited to a 30-minute culture and domain alignment discussion.",
  },
  SELECTED: {
    label: "Selected / Offered",
    variant: "success",
    description: "Welcome to the team! Onboarding and chapter assignment in progress.",
  },
  REJECTED: {
    label: "Archived",
    variant: "destructive",
    description: "Not selected for this cycle. Retained for future opportunities.",
  },
};

export const CORE_TEAM_CATEGORIES = [
  {
    key: "leadership",
    label: "Leadership & Vision",
    description: "Founders and steering leads driving national direction.",
  },
  {
    key: "technology",
    label: "Engineering & Platform",
    description: "Architects building the KailshiansX digital infrastructure.",
  },
  {
    key: "community",
    label: "Community & Chapters",
    description: "Nurturing campus chapters, developer clubs, and state leads.",
  },
  {
    key: "events",
    label: "Events & Hackathons",
    description: "Stage managers, track owners, and flagship hackathon producers.",
  },
  {
    key: "partnerships",
    label: "Partnerships & Alliances",
    description: "Connecting industry sponsors, colleges, and ecosystem partners.",
  },
  {
    key: "marketing",
    label: "Brand & Outreach",
    description: "Campaign architects, visual storytellers, and developer advocates.",
  },
  {
    key: "operations",
    label: "Operations & Logistics",
    description: "Venue coordinators, equipment managers, and operational support.",
  },
] as const;

export interface TeamOpening {
  id: string;
  area: TeamArea;
  title: string;
  type: "Core Volunteer" | "Associate Lead" | "Domain Specialist";
  location: "Remote / Hybrid" | "On-ground (City-based)" | "Remote" | "Hybrid";
  commitment: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
}

export const OPENINGS: TeamOpening[] = [
  {
    id: "tech-lead-eng",
    area: "Technology",
    title: "Full-Stack Platform Engineer (Next.js / Node.js)",
    type: "Domain Specialist",
    location: "Remote",
    commitment: "8-12 hours / week",
    summary:
      "Help architect and scale the KailshiansX platform — powering live QR check-ins, atomic ticketing, hackathon leaderboards, and certificate issuance.",
    responsibilities: [
      "Build high-concurrency event registration workflows with atomic reservation semantics.",
      "Integrate AWS S3 presigned asset pipelines and automated PDF certificate engines.",
      "Ship high-fidelity, accessible UI with Tailwind CSS and Next.js App Router.",
    ],
    requirements: [
      "Strong proficiency in TypeScript, React, Next.js, and PostgreSQL/Prisma.",
      "Familiarity with atomic transactions, Redis rate limiting, and webhooks.",
      "Active GitHub profile with demonstrable shipped projects or open-source work.",
    ],
    perks: [
      "Direct code ownership on production infrastructure used by thousands of developers.",
      "Recommendation letter from Founder & Engineering Leads.",
      "VIP access to all KailshiansX national hackathons.",
    ],
  },
  {
    id: "events-prod-lead",
    area: "Events",
    title: "Flagship Hackathon & Event Producer",
    type: "Associate Lead",
    location: "On-ground (City-based)",
    commitment: "10-15 hours / week (Event Peaks)",
    summary:
      "Run stage operations, mentor coordination, and run-of-show logistics for 36-hour hackathons like NirmanX and regional meetups.",
    responsibilities: [
      "Manage on-ground run-of-show schedules, AV checks, and keynote speaker arrivals.",
      "Coordinate mentor walkthroughs, judge scorecards, and demo hour floor logistics.",
      "Liaise with university authorities and venue partners for seamless execution.",
    ],
    requirements: [
      "Prior experience organizing college hackathons, technical fests, or tech meetups.",
      "Strong crisis management and high-pressure event execution skills.",
      "Exceptional verbal communication and team coordination abilities.",
    ],
    perks: [
      "Event Host credential and official reference for management/MS applications.",
      "Direct networking with top-tier startup CTOs and sponsors.",
      "Exclusive event producer merchandise kit.",
    ],
  },
  {
    id: "ops-logistics",
    area: "Operations",
    title: "Operations & Supply Coordinator",
    type: "Core Volunteer",
    location: "Hybrid",
    commitment: "6-8 hours / week",
    summary:
      "Oversee equipment dispatch, swag kit production, venue checklist verification, and vendor procurement across multiple cities.",
    responsibilities: [
      "Coordinate swag manufacturing (hoodies, badges, lanyards) with verified vendors.",
      "Maintain hardware inventory (microcontrollers, banners, AV adapters, networking gear).",
      "Ensure food, beverage, and emergency medical kits are staged at venue locations.",
    ],
    requirements: [
      "High attention to operational detail and deadline rigor.",
      "Ability to negotiate quotes with suppliers and track expense ledgers.",
      "Basic spreadsheet proficiency (Google Sheets / Excel).",
    ],
    perks: [
      "Hands-on operations experience at national-scale builder events.",
      "Operations Lead verified credential.",
      "All-expenses-covered travel to major regional summits.",
    ],
  },
  {
    id: "comm-growth-lead",
    area: "Community",
    title: "Community Chapters & Discord Lead",
    type: "Associate Lead",
    location: "Remote",
    commitment: "8-10 hours / week",
    summary:
      "Nurture the KailshiansX online community, onboard campus leads, and facilitate technical discussions, project showcases, and weekly office hours.",
    responsibilities: [
      "Moderate and grow our official builder Discord and Telegram channels.",
      "Organize weekly community showcases, project roast sessions, and peer learning circles.",
      "Track community health metrics: active weekly members, repeat attendees, project repos.",
    ],
    requirements: [
      "Previous community moderation experience in developer or gaming communities.",
      "Deep empathy for junior developers and enthusiastic builder mindset.",
      "Good understanding of Discord bots, role automation, and onboarding flows.",
    ],
    perks: [
      "Direct leadership of 5,000+ developer community channels.",
      "Mentorship from established community architects.",
      "Official community leadership certificate.",
    ],
  },
  {
    id: "partnerships-lead",
    area: "Partnerships",
    title: "College & Ecosystem Partnership Associate",
    type: "Domain Specialist",
    location: "Remote / Hybrid",
    commitment: "8-10 hours / week",
    summary:
      "Build relationships with Tier-1 and Tier-2 engineering universities, student clubs, and regional tech incubators to establish official KailshiansX chapters.",
    responsibilities: [
      "Reach out to college HODs, TPO cells, and developer society presidents.",
      "Pitch joint hackathons, masterclass workshops, and Campus Lead onboarding.",
      "Facilitate MOUs and institutional collaboration agreements.",
    ],
    requirements: [
      "Strong professional communication, email etiquette, and negotiation skills.",
      "Network within university technical clubs (GDSC, ACM, IEEE chapters).",
      "Goal-driven attitude and structured outreach tracking.",
    ],
    perks: [
      "High-value institutional liaison and business development experience.",
      "Personal recommendation letters for consulting/management admissions.",
      "Performance incentives and travel stipends for college summits.",
    ],
  },
  {
    id: "sponsorship-exec",
    area: "Sponsorship",
    title: "Brand Sponsorship & Developer Grants Executive",
    type: "Domain Specialist",
    location: "Remote",
    commitment: "8-12 hours / week",
    summary:
      "Connect developer-first companies, cloud providers, and venture funds with KailshiansX hackathons for API bounties and hiring tracks.",
    responsibilities: [
      "Identify developer tools, SaaS companies, and Web3 protocols looking to reach builders.",
      "Prepare customized sponsorship decks and track deliverables.",
      "Coordinate sponsor API booths, mentor sessions, and post-event candidate handoffs.",
    ],
    requirements: [
      "Understanding of developer tooling market (cloud, databases, AI APIs).",
      "Demonstrated ability to write compelling, concise outreach emails.",
      "Persistence, high responsiveness, and CRM hygiene.",
    ],
    perks: [
      "Direct access to enterprise sponsor decision-makers and venture partners.",
      "Executive sponsorship achievement credential.",
      "Substantial sponsorship commission pool.",
    ],
  },
  {
    id: "marketing-lead",
    area: "Marketing",
    title: "Growth Marketing & Campaign Strategist",
    type: "Associate Lead",
    location: "Remote",
    commitment: "8-10 hours / week",
    summary:
      "Design and execute launch campaigns for upcoming hackathons and meetups, driving registrations through viral engineering challenges and targeted outreach.",
    responsibilities: [
      "Plan multi-channel registration funnels across X, LinkedIn, Reddit, and WhatsApp.",
      "Analyze CAC, conversion rates on event pages, and traffic drop-offs.",
      "Run referral challenges and early-bird ticket activations.",
    ],
    requirements: [
      "Familiarity with growth loops in tech communities.",
      "Strong copywriting with zero corporate buzzwords.",
      "Basic understanding of SEO, web analytics, and UTM tracking.",
    ],
    perks: [
      "Lead marketing campaigns reaching 100,000+ developer impressions.",
      "Growth strategist credential and personal case study asset.",
      "Stipend allocations for top-performing campaigns.",
    ],
  },
  {
    id: "design-product-lead",
    area: "Design",
    title: "Brand & Visual Experience Designer",
    type: "Domain Specialist",
    location: "Remote",
    commitment: "8-10 hours / week",
    summary:
      "Create high-craft design systems, hackathon themes, stage backdrops, social media assets, and digital badges that make KailshiansX feel unforgettable.",
    responsibilities: [
      "Design distinct identity packs for hackathon editions (NirmanX, AarambhX).",
      "Craft social announcement cards, speaker posters, and presentation slide templates.",
      "Collaborate with engineering on design tokens, SVG icons, and typography.",
    ],
    requirements: [
      "Strong portfolio in Figma, Illustrator, or Blender.",
      "Taste aligned with modern developer aesthetics (clean typography, sleek dark mode, zero AI slop).",
      "Familiarity with responsive layout principles and SVG optimization.",
    ],
    perks: [
      "Work showcased on physical stages, badges, and national billboards.",
      "Design Director reference letter.",
      "Featured designer profile on the KailshiansX platform.",
    ],
  },
  {
    id: "content-writer",
    area: "Content",
    title: "Technical Content Writer & Chronicler",
    type: "Core Volunteer",
    location: "Remote",
    commitment: "6-8 hours / week",
    summary:
      "Document post-event recaps, write architectural summaries of winning hackathon projects, and craft developer newsletters that people actually read.",
    responsibilities: [
      "Interview hackathon winners and author project deep dives.",
      "Curate the bi-weekly KailshiansX builder dispatch newsletter.",
      "Refine copy across the platform, FAQs, and application guidelines.",
    ],
    requirements: [
      "Clear, punchy technical writing style without fluff or filler.",
      "Ability to read GitHub codebases and summarize technical architectures.",
      "Impeccable grammar and attention to editorial tone.",
    ],
    perks: [
      "Byline on high-traffic developer publications and newsletters.",
      "Editorial leadership credential.",
      "Direct interaction with top builders and founders.",
    ],
  },
  {
    id: "social-media-lead",
    area: "Social Media",
    title: "Social Media & Memes Producer (X & LinkedIn)",
    type: "Core Volunteer",
    location: "Remote",
    commitment: "6-8 hours / week",
    summary:
      "Run the pulse of KailshiansX on X (Twitter) and LinkedIn with live event coverage, developer memes, speaker quote cards, and builder spotlights.",
    responsibilities: [
      "Live-tweet during major summits and hackathon midnight rounds.",
      "Produce relatable engineering humor and culture content.",
      "Engage with developer communities, speakers, and ecosystem partners.",
    ],
    requirements: [
      "Active personal presence on X (Twitter) and understanding of developer culture.",
      "Speed, wit, and high contextual awareness of tech trends.",
      "Basic Canva/Figma skills for quick turnaround graphics.",
    ],
    perks: [
      "Voice behind the KailshiansX brand handle.",
      "Social media strategist verified credential.",
      "Direct networking with tech influencers and engineering leads.",
    ],
  },
  {
    id: "devrel-evangelist",
    area: "Developer Relations",
    title: "Developer Relations & Campus Evangelist",
    type: "Associate Lead",
    location: "Hybrid",
    commitment: "8-10 hours / week",
    summary:
      "Act as the bridge between developers and KailshiansX. Deliver lightning talks, mentor collegiate builders, and unblock teams during 24-hour sprints.",
    responsibilities: [
      "Host lightning talks and hands-on onboarding sessions at partner colleges.",
      "Offer technical office hours for student builders submitting hackathon projects.",
      "Gather developer feedback to continuously improve our event tooling.",
    ],
    requirements: [
      "Comfort speaking in front of developer audiences.",
      "Technical background in web, cloud, or open-source engineering.",
      "Passionate about teaching and lifting up junior builders.",
    ],
    perks: [
      "Speaking slots at flagship KailshiansX summits.",
      "Official DevRel credential and personal brand boost.",
      "Direct access to sponsoring partner engineering teams.",
    ],
  },
];
