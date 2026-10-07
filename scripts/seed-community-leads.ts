// scripts/seed-community-leads.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding realistic Community, Campus Leads, and State Leads...");

  // 1. Ensure Cities
  const citiesData = [
    { name: "Dehradun", state: "Uttarakhand" },
    { name: "Jaipur", state: "Rajasthan" },
    { name: "Chandigarh", state: "Punjab" },
    { name: "Delhi", state: "Delhi" },
    { name: "Roorkee", state: "Uttarakhand" },
    { name: "Patiala", state: "Punjab" },
    { name: "Noida", state: "Uttar Pradesh" },
    { name: "Gurgaon", state: "Haryana" },
  ];

  const citiesMap = new Map<string, { id: string; name: string }>();
  for (const c of citiesData) {
    const city = await prisma.city.upsert({
      where: { name: c.name },
      update: { state: c.state },
      create: { name: c.name, state: c.state },
    });
    citiesMap.set(c.name, city);
  }

  // 2. Ensure Colleges
  const collegesData = [
    { name: "Graphic Era University", cityName: "Dehradun", state: "Uttarakhand" },
    { name: "UPES Dehradun", cityName: "Dehradun", state: "Uttarakhand" },
    { name: "IIT Roorkee", cityName: "Roorkee", state: "Uttarakhand" },
    { name: "MNIT Jaipur", cityName: "Jaipur", state: "Rajasthan" },
    { name: "BITS Pilani", cityName: "Jaipur", state: "Rajasthan" },
    { name: "PEC Chandigarh", cityName: "Chandigarh", state: "Punjab" },
    { name: "Thapar Institute of Eng & Tech", cityName: "Patiala", state: "Punjab" },
    { name: "IIT Delhi", cityName: "Delhi", state: "Delhi" },
    { name: "Delhi Technological University", cityName: "Delhi", state: "Delhi" },
  ];

  const collegesMap = new Map<string, { id: string; name: string }>();
  for (const col of collegesData) {
    const city = citiesMap.get(col.cityName)!;
    const college = await prisma.college.upsert({
      where: { name_cityId: { name: col.name, cityId: city.id } },
      update: { state: col.state },
      create: { name: col.name, cityId: city.id, state: col.state },
    });
    collegesMap.set(col.name, college);
  }

  // 3. State Leads ()
  const stateLeadsSeed = [
    {
      name: "Rahul Rawat",
      email: "rahul.statelead@kailshiansx.com",
      state: "Uttarakhand",
      city: "Dehradun",
      citiesCovered: "Dehradun, Haridwar, Roorkee, Rishikesh",
      currentRole: "Lead Community Architect & Systems Engineer",
      experience:
        "7+ years building developer communities in the Himalayas. Founder of RaibarX meetup initiative.",
      leadershipEvidence:
        "Led 14 regional developer conferences with 3,500+ attendees. Scaled local college chapters across 6 universities.",
      communityVision:
        "Establish Uttarakhand as a premier destination for mountain hackathons, high-altitude tech retreats, and systems engineering hubs.",
    },
    {
      name: "Karan Singh",
      email: "karan.statelead@kailshiansx.com",
      state: "Rajasthan",
      city: "Jaipur",
      citiesCovered: "Jaipur, Jodhpur, Udaipur, Kota",
      currentRole: "Founder & Cloud Consultant",
      experience:
        "5+ years in tech ecosystem acceleration, former GDG Organizer, organizer of PadharoX.",
      leadershipEvidence:
        "Built Jaipur Tech Collective from 100 to 2,800 active developers. Organized 8 hackathons across Rajasthan universities.",
      communityVision:
        "Unite royal heritage campuses with cutting-edge AI and open-source tooling, establishing Rajasthan's first decentralized builder corridor.",
    },
    {
      name: "Simranpreet Kaur",
      email: "simran.statelead@kailshiansx.com",
      state: "Punjab & Chandigarh",
      city: "Chandigarh",
      citiesCovered: "Chandigarh, Mohali, Panchkula, Patiala, Ludhiana",
      currentRole: "Senior Developer Advocate & Rust Enthusiast",
      experience:
        "Organized TricityX meetups, keynote speaker at 10+ developer summits, advisor to student incubation cells.",
      leadershipEvidence:
        "Spearheaded Tricity Builder Summit with 1,200 attendees. Mentored 40+ college hackathon teams to national podiums.",
      communityVision:
        "Drive deep-tech systems programming, robotics, and high-frequency backend engineering throughout the Tricity corridor.",
    },
    {
      name: "Aditya Verma",
      email: "aditya.statelead@kailshiansx.com",
      state: "Delhi NCR",
      city: "Delhi",
      citiesCovered: "Delhi, Noida, Gurgaon, Faridabad",
      currentRole: "Staff Platform Engineer & Open Source Maintainer",
      experience:
        "8 years in Kubernetes and distributed consensus. Active contributor to CNCF ecosystem.",
      leadershipEvidence:
        "Organized Delhi Open Infra Days, mentored 500+ student developers across NCR institutions.",
      communityVision:
        "Bridge national enterprise leaders with raw college engineering talent through immersive 36-hour weekend buildathons.",
    },
  ];

  for (const sl of stateLeadsSeed) {
    const user = await prisma.user.upsert({
      where: { email: sl.email },
      update: { name: sl.name, role: "STATE_LEAD" },
      create: {
        name: sl.name,
        email: sl.email,
        role: "STATE_LEAD",
        image: `https://images.unsplash.com/photo-${sl.name.includes("Kaur") ? "1534528741775-53994a69daeb" : "1535713875002-d1d0cf377fde"}?w=200&h=200&fit=crop&crop=face`,
      },
    });

    const app = await prisma.stateLeadApplication.upsert({
      where: { id: `state-app-${sl.state.toLowerCase().replace(/[^a-z0-9]/g, "-")}` },
      update: {
        status: "ACTIVE",
        name: sl.name,
        state: sl.state,
        city: sl.city,
        citiesCovered: sl.citiesCovered,
      },
      create: {
        id: `state-app-${sl.state.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        userId: user.id,
        name: sl.name,
        email: sl.email,
        state: sl.state,
        city: sl.city,
        citiesCovered: sl.citiesCovered,
        currentRole: sl.currentRole,
        experience: sl.experience,
        leadershipEvidence: sl.leadershipEvidence,
        communityVision: sl.communityVision,
        status: "ACTIVE",
      },
    });

    await prisma.stateLead.upsert({
      where: { userId: user.id },
      update: {
        status: "ACTIVE",
        state: sl.state,
      },
      create: {
        applicationId: app.id,
        userId: user.id,
        state: sl.state,
        status: "ACTIVE",
      },
    });
  }

  // 4. Campus Leads ()
  const campusLeadsSeed = [
    {
      name: "Aayush Negi",
      email: "aayush.lead@geu.ac.in",
      collegeName: "Graphic Era University",
      cityName: "Dehradun",
      courseYear: "B.Tech CSE - 3rd Year",
      eventsSupported: 5,
      referrals: 140,
      experience:
        "Full-stack Next.js and Go builder. Led college coding club with 300 active members.",
    },
    {
      name: "Tanya Sharma",
      email: "tanya.lead@upes.ac.in",
      collegeName: "UPES Dehradun",
      cityName: "Dehradun",
      courseYear: "B.Tech Cloud Computing - 4th Year",
      eventsSupported: 6,
      referrals: 185,
      experience: "Cloud architectures and DevSecOps. Organized RaibarX campus side-track.",
    },
    {
      name: "Ananya Deshmukh",
      email: "ananya.deshmukh@mnit.ac.in",
      collegeName: "MNIT Jaipur",
      cityName: "Jaipur",
      courseYear: "B.Tech CSE - 3rd Year",
      eventsSupported: 7,
      referrals: 210,
      experience:
        "Algorithmic engineering & hackathon veteran (podium winner at NirmanX Season 01).",
    },
    {
      name: "Vikramaditya Rathore",
      email: "vikram.lead@pec.ac.in",
      collegeName: "PEC Chandigarh",
      cityName: "Chandigarh",
      courseYear: "B.Tech ECE - 3rd Year",
      eventsSupported: 4,
      referrals: 115,
      experience:
        "Hardware & IoT enthusiast, founder of campus Robotics and Embedded Systems circle.",
    },
    {
      name: "Meera Sen",
      email: "meera.lead@thapar.edu",
      collegeName: "Thapar Institute of Eng & Tech",
      cityName: "Patiala",
      courseYear: "B.Tech Computer Science - 2nd Year",
      eventsSupported: 3,
      referrals: 95,
      experience:
        "Frontend designer and Web3 advocate, organized student workshops on React and Solidity.",
    },
    {
      name: "Rohan Khanna",
      email: "rohan.lead@iitd.ac.in",
      collegeName: "IIT Delhi",
      cityName: "Delhi",
      courseYear: "B.Tech Mathematics & Computing - 3rd Year",
      eventsSupported: 8,
      referrals: 260,
      experience: "Distributed systems and consensus protocols. Lead of IIT Delhi Hacker Society.",
    },
  ];

  for (const cl of campusLeadsSeed) {
    const college = collegesMap.get(cl.collegeName)!;
    const city = citiesMap.get(cl.cityName)!;

    const user = await prisma.user.upsert({
      where: { email: cl.email },
      update: { name: cl.name, role: "CAMPUS_LEAD" },
      create: {
        name: cl.name,
        email: cl.email,
        role: "CAMPUS_LEAD",
        image: `https://images.unsplash.com/photo-${cl.name.includes("Tanya") || cl.name.includes("Ananya") || cl.name.includes("Meera") ? "1494790108377-be9c29b29330" : "1507003211169-0a1dd7228f2d"}?w=200&h=200&fit=crop&crop=face`,
      },
    });

    const app = await prisma.campusLeadApplication.upsert({
      where: { id: `campus-app-${cl.collegeName.toLowerCase().replace(/[^a-z0-9]/g, "-")}` },
      update: {
        status: "ACTIVE",
        name: cl.name,
        college: cl.collegeName,
        city: cl.cityName,
      },
      create: {
        id: `campus-app-${cl.collegeName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        userId: user.id,
        name: cl.name,
        email: cl.email,
        college: cl.collegeName,
        city: cl.cityName,
        cityId: city.id,
        courseYear: cl.courseYear,
        experience: cl.experience,
        status: "ACTIVE",
      },
    });

    await prisma.campusLead.upsert({
      where: { userId: user.id },
      update: {
        status: "ACTIVE",
        collegeId: college.id,
        cityId: city.id,
        eventsSupported: cl.eventsSupported,
        referrals: cl.referrals,
      },
      create: {
        applicationId: app.id,
        userId: user.id,
        collegeId: college.id,
        cityId: city.id,
        status: "ACTIVE",
        eventsSupported: cl.eventsSupported,
        referrals: cl.referrals,
      },
    });
  }

  console.log("✅ Community, Campus Leads, and State Leads successfully seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
