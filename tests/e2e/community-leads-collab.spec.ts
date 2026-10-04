import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.describe("Community, Leads, Collaborations & Join Team Restyle Verification", () => {
  const screenshotsDir = "/tmp/ui-shots";

  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  const routes = [
    { name: "collaborations", path: "/collaborations" },
    { name: "community", path: "/community" },
    { name: "campus-leads", path: "/campus-leads" },
    { name: "state-leads", path: "/state-leads" },
    { name: "join-team", path: "/join-team" },
  ];

  const viewports = [
    { name: "375", width: 375, height: 667 },
    { name: "1280", width: 1280, height: 800 },
  ];

  for (const vp of viewports) {
    for (const theme of ["light", "dark"] as const) {
      for (const r of routes) {
        test(`Renders ${r.name} at ${vp.name}px in ${theme} mode without horizontal overflow`, async ({
          page,
        }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.emulateMedia({ colorScheme: theme });

          await page.goto(r.path);
          await page.waitForLoadState("domcontentloaded");

          // Explicitly set theme class on html
          await page.evaluate((t) => {
            if (t === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }, theme);

          await page.waitForTimeout(300);

          // Capture full page screenshot
          const shotName = `${r.name}-${vp.name}-${theme}.png`;
          const shotPath = path.join(screenshotsDir, shotName);
          await page.screenshot({ path: shotPath, fullPage: true });
          expect(fs.existsSync(shotPath)).toBeTruthy();

          // Horizontal overflow check
          const overflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth + 1;
          });
          expect(overflow, `Horizontal overflow detected on ${r.path} at ${vp.name}px`).toBeFalsy();
        });
      }
    }
  }

  // ─── Collaborations Form Tests ─────────────────────────────────────────────
  for (const theme of ["light", "dark"] as const) {
    test(`Collaborations: College form invalid & valid submissions in ${theme} mode`, async ({
      page,
    }) => {
      await page.goto("/collaborations");
      await page.waitForLoadState("domcontentloaded");
      await page.evaluate((t) => {
        if (t === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }, theme);

      // Scroll to form
      const submitBtn = page.getByRole("button", { name: "Submit College Proposal" });
      await submitBtn.scrollIntoViewIfNeeded();

      // Submit invalid (empty)
      await submitBtn.click();
      await page.waitForTimeout(300);

      // Verify validation error messages are visible and have role="alert"
      const errorAlerts = page.locator('p[role="alert"]');
      const errorCount = await errorAlerts.count();
      expect(errorCount).toBeGreaterThan(0);

      // Check first error is visible and has text-destructive styling
      const firstError = errorAlerts.first();
      await expect(firstError).toBeVisible();

      // Submit valid data
      await page.fill(
        'input[placeholder="e.g. Graphic Era Hill University"]',
        "National Institute of Technology"
      );
      await page.fill('input[placeholder="Full name of representative"]', "Dr. Rajesh Kumar");
      await page.fill(
        'input[placeholder="e.g. Dean, HOD CSE, Club President"]',
        "Head of Department, CSE"
      );
      await page.fill(
        'input[placeholder="faculty@university.edu.in"]',
        `rajesh.${Date.now()}@nit.ac.in`
      );
      await page.fill('input[placeholder="+91 98765 43210"]', "+91 9876543210");
      await page.fill('input[placeholder="e.g. Dehradun"]', "Dehradun");
      await page.fill(
        'textarea[placeholder*="Describe your initiative"]',
        "Hosting a 24-hour national hackathon for 500+ undergraduate student builders."
      );
      await page.fill(
        'textarea[placeholder*="500-seater Auditorium"]',
        "600-seater auditorium, gigabit Wi-Fi, computer labs, and institutional permissions."
      );

      await submitBtn.click();
      await page.waitForTimeout(1000);

      // Success message block should be visible
      const successTitle = page.getByText("Proposal Submitted Successfully");
      await expect(successTitle).toBeVisible();
    });
  }

  // ─── Campus Leads Form Tests ───────────────────────────────────────────────
  for (const theme of ["light", "dark"] as const) {
    test(`Campus Leads: form invalid & valid submissions in ${theme} mode`, async ({ page }) => {
      await page.goto("/campus-leads");
      await page.waitForLoadState("domcontentloaded");
      await page.evaluate((t) => {
        if (t === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }, theme);

      const submitBtn = page.getByRole("button", { name: "Submit Campus Lead Application" });
      await submitBtn.scrollIntoViewIfNeeded();

      // Submit invalid (empty)
      await submitBtn.click();
      await page.waitForTimeout(300);

      const errorAlerts = page.locator('p[role="alert"]');
      const errorCount = await errorAlerts.count();
      expect(errorCount).toBeGreaterThan(0);
      await expect(errorAlerts.first()).toBeVisible();

      // Submit valid data
      await page.fill('input[placeholder="e.g. Aarav Sharma"]', "Aarav Lead");
      await page.fill('input[placeholder="aarav@college.edu"]', `lead.${Date.now()}@gehu.ac.in`);
      await page.fill('input[placeholder="+91 98765 43210"]', "+91 9876543210");
      await page.fill(
        'input[placeholder="e.g. Graphic Era Hill University"]',
        "Graphic Era University"
      );
      await page.fill('input[placeholder="e.g. Dehradun"]', "Dehradun");
      await page.fill('input[placeholder="e.g. B.Tech CSE - 3rd Year"]', "B.Tech CSE - 3rd Year");
      await page.fill(
        'input[placeholder="https://linkedin.com/in/username"]',
        "https://linkedin.com/in/aaravlead"
      );
      await page.fill(
        'textarea[placeholder*="Describe your tech stack"]',
        "I have built distributed systems with Next.js, Go, and PostgreSQL. Shipped 3 production apps."
      );
      await page.fill(
        'textarea[placeholder*="Mention any existing tech club"]',
        "Vice President of the open source club, led 4 coding workshops for 200+ students."
      );
      await page.fill(
        'textarea[placeholder*="What vision do you have"]',
        "To establish KailshiansX as the premier engineering chapter driving national hackathon wins."
      );

      await submitBtn.click();
      await page.waitForTimeout(1000);

      const successTitle = page.getByText("You're in the Pipeline!");
      await expect(successTitle).toBeVisible();
    });
  }

  // ─── State Leads Form Tests ────────────────────────────────────────────────
  for (const theme of ["light", "dark"] as const) {
    test(`State Leads: form invalid & valid submissions in ${theme} mode`, async ({ page }) => {
      await page.goto("/state-leads");
      await page.waitForLoadState("domcontentloaded");
      await page.evaluate((t) => {
        if (t === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }, theme);

      const submitBtn = page.getByRole("button", { name: "Submit State Lead Application" });
      await submitBtn.scrollIntoViewIfNeeded();

      // Submit invalid (empty)
      await submitBtn.click();
      await page.waitForTimeout(300);

      const errorAlerts = page.locator('p[role="alert"]');
      const errorCount = await errorAlerts.count();
      expect(errorCount).toBeGreaterThan(0);
      await expect(errorAlerts.first()).toBeVisible();

      // Submit valid data
      await page.fill('input[placeholder="e.g. Aarav Sharma"]', "Vikram Director");
      await page.fill(
        'input[placeholder="name@company.com"]',
        `vikram.${Date.now()}@ecosystem.org`
      );
      await page.fill('input[placeholder="+91 98765 43210"]', "+91 9876543210");
      await page.fill('input[placeholder="e.g. Rajasthan, Uttarakhand, Punjab"]', "Uttarakhand");
      await page.fill('input[placeholder="e.g. Jaipur"]', "Dehradun");
      await page.fill(
        'input[placeholder="e.g. Jaipur, Jodhpur, Udaipur, Kota"]',
        "Dehradun, Haridwar, Roorkee"
      );
      await page.fill(
        'input[placeholder="e.g. Tech Lead, Community Organizer"]',
        "Principal Community Architect"
      );
      await page.fill(
        'input[placeholder="https://linkedin.com/in/username"]',
        "https://linkedin.com/in/vikramstate"
      );
      await page.fill(
        'textarea[placeholder*="Outline your engineering background"]',
        "10+ years as a backend engineer and community organizer scaling developer conferences across North India."
      );
      await page.fill(
        'textarea[placeholder*="Detail tech meetups"]',
        "Organized 20+ meetups, 3 city-wide hackathons, mentored 50+ college teams and founded Dehradun Devs."
      );
      await page.fill(
        'textarea[placeholder*="How will you build campus chapters"]',
        "Unify campus chapters across Graphic Era, DIT, UPES and Roorkee with recurring monthly meetups."
      );
      await page.fill(
        'textarea[placeholder*="Why do you choose to lead"]',
        "KailshiansX offers the authentic grassroots developer culture that our region desperately needs."
      );

      await submitBtn.click();
      await page.waitForTimeout(1000);

      const successTitle = page.getByText("State Lead Application Received");
      await expect(successTitle).toBeVisible();
    });
  }

  // ─── Join Team Form Tests ──────────────────────────────────────────────────
  for (const theme of ["light", "dark"] as const) {
    test(`Join Team: form invalid & valid submissions in ${theme} mode`, async ({ page }) => {
      await page.goto("/join-team");
      await page.waitForLoadState("domcontentloaded");
      await page.evaluate((t) => {
        if (t === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }, theme);

      const submitBtn = page.getByRole("button", { name: "Submit Application" });
      await submitBtn.scrollIntoViewIfNeeded();

      // Submit invalid (empty)
      await submitBtn.click();
      await page.waitForTimeout(300);

      const errorAlerts = page.locator('p[role="alert"]');
      const errorCount = await errorAlerts.count();
      expect(errorCount).toBeGreaterThan(0);
      await expect(errorAlerts.first()).toBeVisible();

      // Submit valid data
      await page.fill('input[placeholder="e.g. Aarav Sharma"]', "Rohan Dev");
      await page.fill('input[placeholder="aarav@example.com"]', `rohan.${Date.now()}@builder.in`);
      await page.fill(
        'input[placeholder="e.g. Platform Engineer, Stage Producer, Campus Chapter Lead"]',
        "Platform Engineer"
      );
      await page.fill(
        'textarea[placeholder*="Detail technical stacks used"]',
        "Built full stack applications with TypeScript, Next.js, Tailwind CSS, Prisma, and PostgreSQL."
      );
      await page.fill(
        'textarea[placeholder*="What excites you about our mission"]',
        "I am passionate about empowering Indian developer communities with state-of-the-art tooling and events."
      );

      await submitBtn.click();
      await page.waitForTimeout(1000);

      const successTitle = page.getByText("Application Received!");
      await expect(successTitle).toBeVisible();
    });
  }

  // ─── Community Hierarchy Stepper & Modals ──────────────────────────────────
  test("Community: vertical hierarchy stepper & chapter modal in both themes", async ({ page }) => {
    await page.goto("/community");
    await page.waitForLoadState("domcontentloaded");

    // Stepper should have border-l border-border and step numbers 01 to 06
    const stepper = page.locator(".border-l");
    await expect(stepper.first()).toBeVisible();
    await expect(page.getByText("01").first()).toBeVisible();
    await expect(page.getByText("KailshiansX Foundation")).toBeVisible();
    await expect(page.getByRole("heading", { name: "State Leads", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Campus Leads", exact: true })).toBeVisible();

    // Trigger Chapter modal
    const startChapterBtn = page.getByRole("button", { name: "Submit Chapter Proposal" });
    await startChapterBtn.scrollIntoViewIfNeeded();
    await startChapterBtn.click();
    await page.waitForTimeout(300);

    // Assert modal is open
    const modalTitle = page.getByText("Start a KailshiansX Chapter");
    await expect(modalTitle).toBeVisible();

    // Submit invalid empty form inside modal
    const modalSubmitBtn = page.getByRole("button", { name: "Submit Chapter Inquiry" });
    await modalSubmitBtn.click();
    await page.waitForTimeout(300);

    // Verify modal inline error
    const modalErrors = page.locator('p[role="alert"]');
    expect(await modalErrors.count()).toBeGreaterThan(0);
    await expect(modalErrors.first()).toBeVisible();

    // Fill valid data in modal
    await page.fill('input[placeholder="e.g. Graphic Era Hill University"]', "DIT University");
    await page.fill('input[placeholder="e.g. Dehradun"]', "Dehradun");
    await page.fill('input[placeholder="e.g. Uttarakhand"]', "Uttarakhand");
    await page.fill('input[placeholder="Aarav Sharma"]', "Priya Singh");
    await page.fill('input[placeholder="e.g. Club Lead, Faculty"]', "President, ACM Chapter");
    await page.fill('input[placeholder="student@college.edu"]', `priya.${Date.now()}@dit.edu.in`);
    await page.fill('input[placeholder="+91 98765 43210"]', "+91 9876543210");
    await page.fill(
      'textarea[placeholder*="Tell us about existing coding clubs"]',
      "We run an active student club of 250+ coders and want to bring NirmanX workshops to campus."
    );

    await modalSubmitBtn.click();
    await page.waitForTimeout(1000);

    // Success inside modal
    const modalSuccess = page.getByText("Chapter Inquiry Submitted");
    await expect(modalSuccess).toBeVisible();
  });
});
