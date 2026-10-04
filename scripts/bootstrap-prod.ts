// scripts/bootstrap-prod.ts — Seed-Free Production Database Bootstrap
// Initializes production database with Super Admin and essential content singletons
// Strictly ZERO dummy mock events, ZERO test registrations, ZERO fake attendees.
// Safe and idempotent to execute multiple times.
// Run: npm run db:bootstrap

import { db } from "../src/lib/db";
import { DEFAULT_FOUNDER_MILESTONES, DEFAULT_WHO_WE_ARE } from "../src/server/cms/content";

const ADMIN_EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL || "aaravgorewal1@gmail.com";
const ADMIN_NAME = process.env.BOOTSTRAP_ADMIN_NAME || "Aarav Gorewal";

async function main() {
  console.log("🚀 Starting KailshiansX Production Bootstrap (Seed-Free)...\n");

  // 1. Verify Database Connection
  try {
    await db.$queryRaw`SELECT 1`;
    console.log("✅ Database connectivity verified.");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("❌ Failed to connect to database:", errorMsg);
    process.exit(1);
  }

  // 2. Provision or elevate initial Super Admin account
  console.log(`[1/3] Provisioning Super Admin account: ${ADMIN_EMAIL}...`);
  const adminUser = await db.user.upsert({
    where: { email: ADMIN_EMAIL.trim().toLowerCase() },
    update: {
      role: "SUPER_ADMIN",
      name: ADMIN_NAME,
    },
    create: {
      email: ADMIN_EMAIL.trim().toLowerCase(),
      name: ADMIN_NAME,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`✅ Super Admin configured with ID: ${adminUser.id} (${adminUser.role})`);

  // 3. Initialize Founder Content Singleton
  console.log("[2/3] Checking Founder Content singleton...");
  const existingFounder = await db.founderContent.findFirst();
  if (!existingFounder) {
    const founder = await db.founderContent.create({
      data: {
        founderName: ADMIN_NAME,
        founderSlug: "aarav-saini",
        tagline: "Founder, Kailshians Web Services • Architecting India's Developer Ecosystem",
        message:
          "I built KailshiansX because I was frustrated by the transactional nature of tech events in India. Too many conferences are vendor trade shows where tickets cost weeks of an engineer's salary, and students are treated as lead-generation databases. KailshiansX is an intentional antidote: developer-owned, deeply technical, radically accessible, and committed to turning participants into community leaders.",
        philosophy:
          "True community cannot be bought through marketing budgets. It is grown with patient consistency, authentic technical respect, and genuine investment in individual potential. We measure success not by registrations or ticket revenues, but by how many attendees build production systems, launch open-source initiatives, or step up to become mentors and organizers.",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
        linkedin: "https://linkedin.com/in/aaravgorewal",
        twitter: "https://twitter.com/aaravgorewal",
        milestones: DEFAULT_FOUNDER_MILESTONES,
        isPublished: true,
      },
    });
    console.log(`✅ Founder Content initialized (ID: ${founder.id})`);
  } else {
    console.log(`ℹ️  Founder Content already exists (ID: ${existingFounder.id})`);
  }

  // 4. Initialize Who We Are Singleton
  console.log("[3/3] Checking Who We Are Content singleton...");
  const existingWhoWeAre = await db.contentPage.findUnique({
    where: { slug: "who-we-are" },
    include: { blocks: true },
  });

  if (!existingWhoWeAre) {
    const page = await db.contentPage.create({
      data: {
        slug: "who-we-are",
        title: DEFAULT_WHO_WE_ARE.title,
        metaTitle: `${DEFAULT_WHO_WE_ARE.title} | KailshiansX`,
        metaDesc: DEFAULT_WHO_WE_ARE.introDescription.slice(0, 160),
        isPublished: true,
        blocks: {
          create: {
            type: "TEXT",
            data: JSON.parse(JSON.stringify(DEFAULT_WHO_WE_ARE)),
            sortOrder: 0,
            isVisible: true,
          },
        },
      },
    });
    console.log(`✅ Who We Are Content initialized (ID: ${page.id})`);
  } else {
    console.log(`ℹ️  Who We Are Content already exists (ID: ${existingWhoWeAre.id})`);
  }

  // 5. Default Certificate Templates (PRD §21)
  const existingTemplates = await db.certificateTemplate.count();
  if (existingTemplates === 0) {
    await db.certificateTemplate.createMany({
      data: [
        {
          id: "template-obsidian-gold",
          name: "Obsidian & Gold Executive",
          description: "Deep obsidian backdrop with metallic gold borders and crisp typography.",
          templateUrl: "",
          fields: {
            recipientName: { x: 50, y: 35, fontSize: 32, color: "#ffffff", align: "center" },
            eventTitle: { x: 50, y: 53, fontSize: 20, color: "#38bdf8", align: "center" },
            issueDate: { x: 50, y: 64, fontSize: 11, color: "#94a3b8", align: "center" },
            qrCode: { x: 50, y: 76, size: 68, align: "center" },
            uniqueId: { x: 50, y: 92, fontSize: 10, color: "#94a3b8", align: "center" },
          },
          isDefault: true,
        },
      ],
    });
    console.log("✅ Default Certificate Templates initialized");
  } else {
    console.log(`ℹ️  Certificate Templates already exist (${existingTemplates} found)`);
  }

  // 6. Audit Log Entry for Bootstrap
  await db.auditLog.create({
    data: {
      userId: adminUser.id,
      action: "CREATE",
      entityType: "SystemBootstrap",
      entityId: "PROD_INIT",
      after: {
        bootstrapType: "SEED_FREE_PRODUCTION",
        adminEmail: ADMIN_EMAIL,
        timestamp: new Date().toISOString(),
      },
    },
  });

  console.log("\n✨ Production Bootstrap Complete! Summary:");
  console.log("--------------------------------------------------");
  console.log(`• Super Admin:       ${adminUser.email} (SUPER_ADMIN)`);
  console.log("• CMS Singletons:     Founder & Who-We-Are active");
  console.log("• Dummy Events:       0 created (Clean slate)");
  console.log("• Mock Registrations: 0 created (Clean slate)");
  console.log("--------------------------------------------------");
  console.log(
    "Next Step: Sign in at /signin with your Super Admin email to begin managing production events in /admin."
  );
}

main()
  .catch((e) => {
    console.error("❌ Bootstrap failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
