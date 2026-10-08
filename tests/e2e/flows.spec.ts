import { test, expect } from "@playwright/test";
import crypto from "crypto";
import { db } from "@/lib/db";
import {
  createAdminSessionToken,
  createUserSessionToken,
  createCampusLeadSessionToken,
  createStateLeadSessionToken,
} from "./helpers/auth";

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || "kws_test_rzp_secret_2026";

test.describe("KailshiansX End-to-End User Journeys", () => {
  let paidRegistrationCode = "";

  test("Flow 1: Browse events directory and inspect details", async ({ page }) => {
    // 1. Visit events index
    await page.goto("/events");
    await expect(page).toHaveTitle(/Events|KailshiansX/i);

    // Verify event cards exist
    const eventCards = page.locator('a[href^="/events/"]');
    await expect(eventCards.first()).toBeVisible({ timeout: 10000 });

    // 2. Click through or navigate directly to PadharoX Edition 01
    await page.goto("/events/padharox-01");
    await expect(page.locator("h1")).toContainText(/PadharoX/i);
    const registerCta = page.locator('a[href*="/register"]').first();
    await expect(registerCta).toBeVisible();
  });

  test("Flow 2: Register for a free ticket tier", async ({ page }) => {
    const uniqueEmail = `free-attendee-${Date.now()}@example.com`;

    await page.goto("/events/padharox-01/register");

    // Step 1: Default or select free pass, advance to Step 2
    const freePassOption = page.locator("text=General Attendee").first();
    await freePassOption.click();
    await page.click('button:has-text("Continue to Builder Profile")');

    // Step 2: Builder Profile
    await page.fill('input[name="name"]', "Test Free User");
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="phone"]', "9876543210");
    await page.fill('input[name="college"]', "IIT Jodhpur");
    await page.fill('input[name="city"]', "Jaipur");
    await page.click('button:has-text("Next: Event Details")');

    // Step 3: Custom Questions
    await page.click('button:has-text("Review & Finalize")');

    // Step 4: Confirm Registration
    const submitBtn = page.locator('button:has-text("Complete Free Registration")');
    await expect(submitBtn).toBeVisible({ timeout: 10000 });
    await submitBtn.click();

    // Verify redirection to digital ticket pass
    await page.waitForURL(/\/events\/padharox-01\/ticket\/KX-/, { timeout: 15000 });
    await expect(page.locator("text=Test Free User")).toBeVisible();
    await expect(page.locator("text=KailshiansX Verified Pass")).toBeVisible();
  });

  test("Flow 3: Register for a paid ticket tier (Razorpay test mode)", async ({ page }) => {
    const uniqueEmail = `vip-attendee-${Date.now()}@example.com`;

    // Intercept Razorpay CDN script so mock is not overwritten
    await page.route("https://checkout.razorpay.com/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: 'console.log("Mocked Razorpay CDN loaded");',
      })
    );

    // Expose signature computation helper to browser
    await page.exposeFunction(
      "computeTestRazorpaySignature",
      (orderId: string, paymentId: string) => {
        return crypto
          .createHmac("sha256", RAZORPAY_SECRET)
          .update(`${orderId}|${paymentId}`)
          .digest("hex");
      }
    );

    // Mock window.Razorpay checkout modal in page
    await page.addInitScript(() => {
      interface RazorpayMockOptions {
        order_id: string;
        handler?: (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => void;
      }

      type ExtendedWindow = Window &
        typeof globalThis & {
          Razorpay: new (options: RazorpayMockOptions) => { open: () => Promise<void> };
          computeTestRazorpaySignature: (orderId: string, paymentId: string) => Promise<string>;
        };

      const win = window as unknown as ExtendedWindow;
      win.Razorpay = function (this: { open: () => Promise<void> }, options: RazorpayMockOptions) {
        this.open = async function () {
          const fakePaymentId = `pay_test_${Date.now()}`;
          const signature = await win.computeTestRazorpaySignature(options.order_id, fakePaymentId);

          setTimeout(() => {
            if (options.handler) {
              options.handler({
                razorpay_order_id: options.order_id,
                razorpay_payment_id: fakePaymentId,
                razorpay_signature: signature,
              });
            }
          }, 150);
        };
      } as unknown as new (options: RazorpayMockOptions) => { open: () => Promise<void> };
    });

    await page.goto("/events/padharox-01/register");

    // Step 1: Select Paid Pass (Community VIP Pass)
    const paidPassOption = page.locator("text=Community VIP Pass").first();
    await paidPassOption.click();
    await page.click('button:has-text("Continue to Builder Profile")');

    // Step 2: Builder Profile
    await page.fill('input[name="name"]', "Test VIP Attendee");
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="phone"]', "9876543211");
    await page.fill('input[name="college"]', "BITS Pilani");
    await page.fill('input[name="city"]', "Jaipur");
    await page.click('button:has-text("Next: Event Details")');

    // Step 3: Custom Questions
    await page.click('button:has-text("Review & Finalize")');

    // Step 4: Pay & Complete Registration
    const payBtn = page.locator('button:has-text("Pay ₹299 & Complete Registration")');
    await expect(payBtn).toBeVisible({ timeout: 10000 });
    await payBtn.click();

    // Verify redirection to digital ticket pass
    await page.waitForURL(/\/events\/padharox-01\/ticket\/KX-/, { timeout: 15000 });
    await expect(page.locator("text=Test VIP Attendee")).toBeVisible();
    await expect(page.locator("text=KailshiansX Verified Pass")).toBeVisible();

    // Extract registration code from URL for Flow 4 check-in
    const url = page.url();
    const match = url.match(/\/ticket\/(KX-[A-Z0-9-]+)/);
    expect(match).not.toBeNull();
    paidRegistrationCode = match![1];
    expect(paidRegistrationCode).toMatch(/^KX-/);
  });

  test("Flow 4: Admin check-in scanner verifies attendee pass", async ({ browser, baseURL }) => {
    // 1. Create admin session token in database
    const sessionToken = await createAdminSessionToken();

    // 2. Create authenticated browser context with NextAuth cookie
    const context = await browser.newContext({ baseURL });
    await context.addCookies([
      {
        name: "authjs.session-token",
        value: sessionToken,
        domain: "127.0.0.1",
        path: "/",
      },
      {
        name: "next-auth.session-token",
        value: sessionToken,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);

    const page = await context.newPage();
    await page.goto("/admin/checkin");

    // Verify admin scanner loaded
    await expect(page.locator("h1")).toContainText(/On-Site Venue Check-in/i);

    // Enter registration code in manual code input
    const codeInput = page.locator('input[name="passCode"]');
    await expect(codeInput).toBeVisible({ timeout: 10000 });

    // Use code from Flow 3 or fetch any confirmed registration from database
    let codeToCheckIn = paidRegistrationCode;
    if (!codeToCheckIn) {
      const reg = await db.registration.findFirst({
        where: { status: "CONFIRMED" },
        select: { registrationCode: true },
      });
      codeToCheckIn = reg?.registrationCode || "KX-PA01-0001";
    }

    await codeInput.fill(codeToCheckIn);
    await page.click('button:has-text("Verify")');

    // Verify result card
    const resultHeading = page.locator(
      'h3:has-text("Access Approved"), h3:has-text("Already Checked In!")'
    );
    await expect(resultHeading.first()).toBeVisible({ timeout: 10000 });

    await context.close();
  });

  test("Flow 6: Member profile (/me) and public Developer Passport (/passport/[username])", async ({
    browser,
  }) => {
    // Authenticate as a community member
    const userSession = await createUserSessionToken({
      email: `passport-member-${Date.now()}@example.com`,
      name: "Dev Builder",
      role: "MEMBER",
    });

    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "authjs.session-token",
        value: userSession.sessionToken,
        domain: "localhost",
        path: "/",
      },
      {
        name: "next-auth.session-token",
        value: userSession.sessionToken,
        domain: "localhost",
        path: "/",
      },
      {
        name: "authjs.session-token",
        value: userSession.sessionToken,
        domain: "127.0.0.1",
        path: "/",
      },
      {
        name: "next-auth.session-token",
        value: userSession.sessionToken,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);

    const page = await context.newPage();

    // 1. Visit /me member dashboard
    await page.goto("/me");
    await expect(page).toHaveURL(/\/me/);

    // Verify passport header elements
    await expect(page.locator("text=Pass ID")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Community Progression Ladder")).toBeVisible();
    await expect(page.locator("text=Milestone Achievement Badges")).toBeVisible();

    // 2. Check tab switching
    const ticketsTab = page.locator("#tab-tickets");
    await ticketsTab.click();
    await expect(page.locator("text=My Event Tickets & Access Passes")).toBeVisible();

    // 3. Visit public passport view
    const publicBtn = page.locator("#view-public-passport");
    await expect(publicBtn).toBeVisible();
    const passportHref = await publicBtn.getAttribute("href");
    expect(passportHref).toBeTruthy();

    await page.goto(passportHref!);
    await expect(page.locator("text=Verified Developer Credential")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("text=Community Progression Ladder")).toBeVisible();
    await expect(page.locator("text=Milestone Achievement Badges")).toBeVisible();

    await context.close();
  });

  test("Flow 7: Public Certificate Verification (/verify) & Admin Certificate Studio (/admin/certificates)", async ({
    browser,
  }) => {
    // 1. Ensure an event and certificate exists in the database
    const event = await db.event.findFirst({
      where: { status: "PUBLISHED" },
    });
    expect(event).toBeTruthy();

    const template = await db.certificateTemplate.findFirst();
    expect(template).toBeTruthy();

    const uniqueCertId = `KX-TEST-${Date.now().toString(36).toUpperCase()}`;
    const testCert = await db.certificate.create({
      data: {
        uniqueId: uniqueCertId,
        participantName: "Aryan Certificate Tester",
        participantEmail: `cert-tester-${Date.now()}@example.com`,
        event: { connect: { id: event!.id } },
        template: { connect: { id: template!.id } },
        certificateUrl: `/api/certificates/${uniqueCertId}/download`,
        deliveryStatus: "SENT",
      },
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // 2. Visit public /verify page
    await page.goto("/verify");
    await expect(page.locator("h1")).toContainText(/Verify KailshiansX Credential/i);
    await expect(page.locator("#input-verify-search")).toBeVisible();

    // Search by certificate ID
    await page.fill("#input-verify-search", uniqueCertId);
    await page.click("#btn-verify-submit");

    // Verify result card renders with cryptographic proof
    await expect(page.locator("text=Cryptographically Verified")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("h2:has-text('Aryan Certificate Tester')")).toBeVisible();
    await expect(page.locator(`text=${uniqueCertId}`).first()).toBeVisible();
    await expect(page.locator("#btn-download-verified-pdf")).toBeVisible();

    // 3. Test direct URL param verification (/verify?id=...)
    await page.goto(`/verify?id=${uniqueCertId}`);
    await expect(page.locator("text=Cryptographically Verified")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("h2:has-text('Aryan Certificate Tester')")).toBeVisible();

    // 4. Admin Certificate Studio
    const adminToken = await createAdminSessionToken();
    await context.addCookies([
      { name: "authjs.session-token", value: adminToken, domain: "localhost", path: "/" },
      { name: "next-auth.session-token", value: adminToken, domain: "localhost", path: "/" },
      { name: "authjs.session-token", value: adminToken, domain: "127.0.0.1", path: "/" },
      { name: "next-auth.session-token", value: adminToken, domain: "127.0.0.1", path: "/" },
    ]);

    await page.goto("/admin/certificates");
    await expect(page.locator("text=Certificate Studio & Delivery")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("#tab-certificate-studio")).toBeVisible();
    await expect(page.locator("#tab-delivery-tracker")).toBeVisible();
    await expect(page.locator("#select-cert-event")).toBeVisible();

    // Switch to Delivery Tracker tab
    await page.click("#tab-delivery-tracker");
    await expect(page.getByText("Delivery Rate", { exact: true })).toBeVisible();
    await expect(page.getByText("Total Issued", { exact: true })).toBeVisible();

    // Clean up test certificate
    await db.certificate.delete({ where: { id: testCert.id } }).catch(() => {});
    await context.close();
  });

  test("Flow 8: Sponsor CRM (Deals, Deliverables, Invoices) & Event P&L per ", async ({
    browser,
  }) => {
    const adminToken = await createAdminSessionToken();
    const context = await browser.newContext();
    await context.addCookies([
      { name: "authjs.session-token", value: adminToken, domain: "localhost", path: "/" },
      { name: "next-auth.session-token", value: adminToken, domain: "localhost", path: "/" },
      { name: "authjs.session-token", value: adminToken, domain: "127.0.0.1", path: "/" },
      { name: "next-auth.session-token", value: adminToken, domain: "127.0.0.1", path: "/" },
    ]);

    const page = await context.newPage();

    // 1. Visit /admin/sponsors
    await page.goto("/admin/sponsors");
    await expect(page.locator("h1")).toContainText(/Sponsor CRM/i);
    await expect(page.locator("text=Total Pipeline")).toBeVisible({ timeout: 10000 });

    // Verify all 4 tabs exist
    await expect(page.locator("#tab-deals-pipeline")).toBeVisible();
    await expect(page.locator("#tab-sponsors-directory")).toBeVisible();
    await expect(page.locator("#tab-deliverables")).toBeVisible();
    await expect(page.locator("#tab-invoices")).toBeVisible();

    // Switch between CRM tabs
    await page.click("#tab-sponsors-directory");
    await expect(page.locator("text=Corporate & Ecosystem Partners Catalog")).toBeVisible();

    await page.click("#tab-deliverables");
    await expect(
      page.locator("text=Sponsor Perks & Contract Deliverables Checklist")
    ).toBeVisible();

    await page.click("#tab-invoices");
    await expect(page.locator("text=Sponsor Invoices & Financial Settlement")).toBeVisible();

    // 2. Visit /admin/pnl
    await page.goto("/admin/pnl");
    await expect(page.locator("h1")).toContainText(/Revenue & Event P&L Control Room/i);
    await expect(page.locator("text=Event Profit & Loss Intelligence")).toBeVisible({
      timeout: 10000,
    });

    // Verify 4 primary KPI cards
    await expect(page.locator("text=Total Revenue")).toBeVisible();
    await expect(page.locator("text=Total Expenses")).toBeVisible();
    await expect(page.locator("text=/Net (Profit|Loss)/i")).toBeVisible();
    await expect(page.locator("text=Profit Margin")).toBeVisible();

    // Verify export buttons exist
    await expect(page.locator("#btn-export-pnl-csv")).toBeVisible();
    await expect(page.locator("#btn-export-pnl-pdf")).toBeVisible();

    // Test Series Rollup mode
    await page.click("#mode-series-pnl");
    await expect(page.locator("#select-pnl-series")).toBeVisible();
    await expect(page.locator("text=Series Profit Margin")).toBeVisible({ timeout: 10000 });

    // Switch back to Event mode
    await page.click("#mode-event-pnl");
    await expect(page.locator("#select-pnl-event")).toBeVisible();
    await expect(page.locator("#btn-sync-tickets")).toBeVisible();

    await context.close();
  });

  test("Flow 9: Campus and State Lead Dashboards & Leadership Network Control Room per ", async ({
    browser,
  }) => {
    // 1. Admin Scope: Access Leader Portal (/lead) as SUPER_ADMIN
    const adminToken = await createAdminSessionToken();
    const adminContext = await browser.newContext();
    await adminContext.addCookies([
      { name: "authjs.session-token", value: adminToken, domain: "localhost", path: "/" },
      { name: "next-auth.session-token", value: adminToken, domain: "localhost", path: "/" },
      { name: "authjs.session-token", value: adminToken, domain: "127.0.0.1", path: "/" },
      { name: "next-auth.session-token", value: adminToken, domain: "127.0.0.1", path: "/" },
    ]);

    const adminPage = await adminContext.newPage();
    await adminPage.goto("/lead");
    await expect(adminPage.locator("h1")).toContainText(/Campus & State Lead Intelligence Hub/i);
    await expect(adminPage.locator("text= · Leadership Control Room")).toBeVisible({
      timeout: 10000,
    });

    // Verify mode switcher
    await expect(adminPage.locator("#btn-admin-campus-mode")).toBeVisible();
    await expect(adminPage.locator("#btn-admin-state-mode")).toBeVisible();

    // Toggle State Mode
    await adminPage.click("#btn-admin-state-mode");
    await expect(adminPage.locator("text=Active State Chapters")).toBeVisible();

    // Toggle back to Campus Mode
    await adminPage.click("#btn-admin-campus-mode");
    await expect(adminPage.locator("text=Active Campus Chapters")).toBeVisible();

    await adminContext.close();

    // 2. Campus Lead Scope: Access Campus Dashboard (/lead/campus)
    const campusAuth = await createCampusLeadSessionToken();
    const campusContext = await browser.newContext();
    await campusContext.addCookies([
      {
        name: "authjs.session-token",
        value: campusAuth.sessionToken,
        domain: "localhost",
        path: "/",
      },
      {
        name: "next-auth.session-token",
        value: campusAuth.sessionToken,
        domain: "localhost",
        path: "/",
      },
      {
        name: "authjs.session-token",
        value: campusAuth.sessionToken,
        domain: "127.0.0.1",
        path: "/",
      },
      {
        name: "next-auth.session-token",
        value: campusAuth.sessionToken,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);

    const campusPage = await campusContext.newPage();
    await campusPage.goto("/lead/campus");
    await expect(campusPage.locator("text=Campus Lead").first()).toBeVisible({
      timeout: 10000,
    });

    // Check college scope & referral box
    await expect(campusPage.locator(`text=${campusAuth.collegeName}`)).toBeVisible();
    await expect(campusPage.locator("#btn-copy-code")).toBeVisible();
    await expect(campusPage.locator("#btn-copy-referral-link")).toBeVisible();

    // Verify 4 KPI cards
    await expect(campusPage.getByText("Attendee Referrals", { exact: true })).toBeVisible();
    await expect(campusPage.getByText("Events Supported", { exact: true })).toBeVisible();
    await expect(campusPage.getByText("Activities Logged", { exact: true })).toBeVisible();
    await expect(campusPage.locator("text=Performance Score").first()).toBeVisible();

    // Verify tabs
    await expect(campusPage.locator("#tab-activities")).toBeVisible();
    await expect(campusPage.locator("#tab-reports")).toBeVisible();
    await expect(campusPage.locator("#tab-events")).toBeVisible();

    // Switch to Monthly Reports tab
    await campusPage.click("#tab-reports");
    await expect(campusPage.locator("#btn-submit-monthly-report")).toBeVisible();

    // Switch to Supported Events tab
    await campusPage.click("#tab-events");
    await expect(campusPage.locator("text=/supported events/i").first()).toBeVisible();

    // Switch back to Activities tab
    await campusPage.click("#tab-activities");
    await expect(campusPage.locator("#btn-log-activity")).toBeVisible();

    await campusContext.close();

    // 3. State Lead Scope: Access State Dashboard (/lead/state)
    const stateAuth = await createStateLeadSessionToken();
    const stateContext = await browser.newContext();
    await stateContext.addCookies([
      {
        name: "authjs.session-token",
        value: stateAuth.sessionToken,
        domain: "localhost",
        path: "/",
      },
      {
        name: "next-auth.session-token",
        value: stateAuth.sessionToken,
        domain: "localhost",
        path: "/",
      },
      {
        name: "authjs.session-token",
        value: stateAuth.sessionToken,
        domain: "127.0.0.1",
        path: "/",
      },
      {
        name: "next-auth.session-token",
        value: stateAuth.sessionToken,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);

    const statePage = await stateContext.newPage();
    await statePage.goto("/lead/state");
    await expect(statePage.locator("text=State Lead").first()).toBeVisible({
      timeout: 10000,
    });

    // Check state scope
    await expect(statePage.locator(`text=State of ${stateAuth.state}`)).toBeVisible();
    await expect(statePage.locator("#btn-copy-code")).toBeVisible();
    await expect(statePage.locator("#btn-copy-referral-link")).toBeVisible();

    // Check statewide aggregates
    await expect(statePage.getByText("Statewide Referrals", { exact: true })).toBeVisible();
    await expect(statePage.getByText("Regional Events", { exact: true })).toBeVisible();
    await expect(statePage.getByText("Active Campus Leads", { exact: true })).toBeVisible();
    await expect(statePage.locator("text=Performance Score").first()).toBeVisible();

    // Check tabs
    await expect(statePage.locator("#tab-campus-leads")).toBeVisible();
    await expect(statePage.locator("#tab-activities")).toBeVisible();
    await expect(statePage.locator("#tab-reports")).toBeVisible();
    await expect(statePage.locator("#tab-events")).toBeVisible();

    await stateContext.close();
  });

  test("Flow 10: Full hackathon engine: team formation/invites, problem-statement selection, project submissions, judge rubric scoring, leaderboard, results publishing, certificate + prize tracking", async ({
    browser,
    request,
  }) => {
    // 1. Fetch a real hackathon event from DB
    const hackathon = await db.event.findFirst({
      where: { type: "HACKATHON", deletedAt: null },
      include: {
        hackathonDetail: {
          include: {
            problemStatementsList: true,
            rubricCriteria: true,
            prizesList: true,
          },
        },
      },
    });

    expect(hackathon).not.toBeNull();
    const detailId = hackathon!.hackathonDetail!.id;
    const slug = hackathon!.slug;

    // Ensure hackathon is active with future deadline for test flow
    await db.hackathonDetail.update({
      where: { id: detailId },
      data: {
        submissionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isResultsPublished: false,
      },
    });

    // 2. Setup Team Leader User
    const leaderAuth = await createUserSessionToken({
      name: "Satya Nadella",
      email: `builder-leader-${Date.now()}@example.com`,
      role: "MEMBER",
    });

    const leaderContext = await browser.newContext();
    await leaderContext.addCookies([
      {
        name: "authjs.session-token",
        value: leaderAuth.sessionToken,
        domain: "localhost",
        path: "/",
      },
      {
        name: "next-auth.session-token",
        value: leaderAuth.sessionToken,
        domain: "localhost",
        path: "/",
      },
      {
        name: "authjs.session-token",
        value: leaderAuth.sessionToken,
        domain: "127.0.0.1",
        path: "/",
      },
      {
        name: "next-auth.session-token",
        value: leaderAuth.sessionToken,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);

    const leaderPage = await leaderContext.newPage();
    await leaderPage.goto(`/events/${slug}`);
    await expect(leaderPage.locator("#hackathon-portal")).toBeVisible({ timeout: 15000 });

    // Create Team via API
    const teamName = `NeuralCore ${Date.now().toString().slice(-4)}`;
    const teamRes = await request.post("/api/hackathons/teams", {
      headers: {
        cookie: `authjs.session-token=${leaderAuth.sessionToken}; next-auth.session-token=${leaderAuth.sessionToken}`,
      },
      data: {
        hackathonDetailId: detailId,
        name: teamName,
        track: "Autonomous AI Agents",
      },
    });
    expect(teamRes.ok()).toBeTruthy();
    const teamJson = await teamRes.json();
    const createdTeam = teamJson.data;
    expect(createdTeam.inviteCode).toMatch(/^KX-TEAM-/);
    const inviteCode = createdTeam.inviteCode;

    // 3. Setup Second Teammate & Join via Invite Code
    const teammateAuth = await createUserSessionToken({
      name: "Andrej Karpathy",
      email: `builder-dev-${Date.now()}@example.com`,
      role: "MEMBER",
    });

    const joinRes = await request.post("/api/hackathons/teams/join", {
      headers: {
        cookie: `authjs.session-token=${teammateAuth.sessionToken}; next-auth.session-token=${teammateAuth.sessionToken}`,
      },
      data: {
        inviteCode,
        role: "DEVELOPER",
      },
    });
    expect(joinRes.ok()).toBeTruthy();
    const joinJson = await joinRes.json();
    expect(joinJson.data.members.length).toBe(2);

    // 4. Select Problem Statement
    const firstPs = hackathon!.hackathonDetail!.problemStatementsList[0];
    if (firstPs) {
      const psRes = await request.post("/api/hackathons/teams/problem-statement", {
        headers: {
          cookie: `authjs.session-token=${leaderAuth.sessionToken}; next-auth.session-token=${leaderAuth.sessionToken}`,
        },
        data: {
          teamId: createdTeam.id,
          problemStatementId: firstPs.id,
        },
      });
      expect(psRes.ok()).toBeTruthy();
    }

    // 5. Submit Project (GitHub, Live Demo, Pitch Deck, Video Demo, Tech Stack)
    const subRes = await request.post("/api/hackathons/submissions", {
      headers: {
        cookie: `authjs.session-token=${leaderAuth.sessionToken}; next-auth.session-token=${leaderAuth.sessionToken}`,
      },
      data: {
        teamId: createdTeam.id,
        title: "Autonomous Kubernetes SRE Agent",
        tagline: "Zero-downtime distributed consensus operator",
        description: "Self-healing Kubernetes clusters running custom autonomous eBPF probes.",
        track: "Autonomous AI Agents",
        repoUrl: "https://github.com/kailshiansx/autonomous-sre",
        demoUrl: "https://sre.kailshiansx.com",
        deckUrl: "https://pitch.kailshiansx.com/deck.pdf",
        videoUrl: "https://youtube.com/watch?v=mock-demo",
        techStack: ["Next.js", "Go", "eBPF", "Kubernetes", "PostgreSQL"],
      },
    });
    const subJson = await subRes.json();
    if (!subRes.ok()) {
      console.error("Submission failed response:", subJson);
    }
    expect(subRes.ok()).toBeTruthy();
    const submissionId = subJson.data.id;
    expect(subJson.data.status).toBe("SUBMITTED");

    // 6. Judge Account Rubric Scoring
    const judgeAuth = await createUserSessionToken({
      name: "Guillermo Rauch",
      email: `judge-${Date.now()}@example.com`,
      role: "JUDGE",
    });

    const judgeContext = await browser.newContext();
    await judgeContext.addCookies([
      {
        name: "authjs.session-token",
        value: judgeAuth.sessionToken,
        domain: "localhost",
        path: "/",
      },
      {
        name: "next-auth.session-token",
        value: judgeAuth.sessionToken,
        domain: "localhost",
        path: "/",
      },
      {
        name: "authjs.session-token",
        value: judgeAuth.sessionToken,
        domain: "127.0.0.1",
        path: "/",
      },
      {
        name: "next-auth.session-token",
        value: judgeAuth.sessionToken,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);

    const judgePage = await judgeContext.newPage();
    await judgePage.goto(`/events/${slug}/judge`);
    await expect(judgePage.locator("text=Grand Jury Evaluation Cockpit").first()).toBeVisible({
      timeout: 15000,
    });

    // Score submission via API
    const criteriaScores: Record<string, number> = {};
    for (const r of hackathon!.hackathonDetail!.rubricCriteria) {
      criteriaScores[r.id] = Math.round(r.maxScore * 0.95);
    }

    const scoreRes = await request.post("/api/hackathons/judging/scores", {
      headers: {
        cookie: `authjs.session-token=${judgeAuth.sessionToken}; next-auth.session-token=${judgeAuth.sessionToken}`,
      },
      data: {
        submissionId,
        criteriaScores,
        feedback: "Exceptional architecture, production-grade telemetry, and intuitive UI.",
        privateNotes: "Unanimous top contender for Grand Prize.",
      },
    });
    expect(scoreRes.ok()).toBeTruthy();
    const scoreJson = await scoreRes.json();
    expect(Number(scoreJson.data.totalScore)).toBeGreaterThan(80);

    // 7. Admin Control Room: Results Publishing & Official Winner Assignment
    const adminToken = await createAdminSessionToken();
    const adminContext = await browser.newContext();
    await adminContext.addCookies([
      { name: "authjs.session-token", value: adminToken, domain: "localhost", path: "/" },
      { name: "next-auth.session-token", value: adminToken, domain: "localhost", path: "/" },
      { name: "authjs.session-token", value: adminToken, domain: "127.0.0.1", path: "/" },
      { name: "next-auth.session-token", value: adminToken, domain: "127.0.0.1", path: "/" },
    ]);

    const adminPage = await adminContext.newPage();
    await adminPage.goto(`/admin/hackathons/${detailId}`);
    await expect(adminPage.locator("h1")).toContainText(/Control Room/i, { timeout: 15000 });

    // Publish results officially via API
    const publishRes = await request.post("/api/admin/hackathons/publish", {
      headers: {
        cookie: `authjs.session-token=${adminToken}; next-auth.session-token=${adminToken}`,
      },
      data: {
        hackathonDetailId: detailId,
        winnerSelections: [
          {
            submissionId,
            rank: 1,
            winnerTier: "GRAND_PRIZE",
          },
        ],
      },
    });
    expect(publishRes.ok()).toBeTruthy();

    // 8. Prize Disbursement Tracking & Automated Certificate Generation
    const prizes = await db.hackathonPrize.findMany({
      where: { hackathonDetailId: detailId },
      orderBy: { rank: "asc" },
    });

    if (prizes.length > 0) {
      const prizeId = prizes[0].id;
      const prizeRes = await request.patch("/api/admin/hackathons/prizes", {
        headers: {
          cookie: `authjs.session-token=${adminToken}; next-auth.session-token=${adminToken}`,
        },
        data: {
          prizeId,
          status: "DISBURSED",
          transactionRef: "UPI-HACK-2026-WINNER-01",
        },
      });
      expect(prizeRes.ok()).toBeTruthy();
      const prizeJson = await prizeRes.json();
      expect(prizeJson.data.disbursementStatus).toBe("DISBURSED");
    }

    // Issue Certificates
    const certRes = await request.post("/api/admin/hackathons/certificates", {
      headers: {
        cookie: `authjs.session-token=${adminToken}; next-auth.session-token=${adminToken}`,
      },
      data: {
        hackathonDetailId: detailId,
        issueType: "ALL",
      },
    });
    expect(certRes.ok()).toBeTruthy();
    const certJson = await certRes.json();
    expect(certJson.data.issuedCount).toBeGreaterThanOrEqual(2);

    // Verify certificate in DB
    const cert = await db.certificate.findFirst({
      where: { participantEmail: leaderAuth.email },
    });
    expect(cert).not.toBeNull();
    expect(cert!.uniqueId).toMatch(/^KX-HACK-/);

    // 9. Public Results Verification: Reload Public Event Page
    await leaderPage.reload();
    await expect(leaderPage.locator("#tab-hackathon-leaderboard")).toBeVisible();
    await leaderPage.click("#tab-hackathon-leaderboard");
    await expect(leaderPage.locator("text=Hackathon Leaderboard")).toBeVisible();

    await leaderContext.close();
    await judgeContext.close();
    await adminContext.close();
  });

  test("Flow 11: Campus Chapters Cockpit, Mentor Network Booking & Partner Portal Telemetry", async ({
    browser,
    baseURL,
  }) => {
    const adminToken = await createAdminSessionToken();
    await createUserSessionToken({
      email: `builder-e2e-${Date.now()}@example.com`,
      name: "E2E Student Builder",
      role: "MEMBER",
    });

    const context = await browser.newContext({
      baseURL,
      extraHTTPHeaders: {
        cookie: `authjs.session-token=${adminToken}; next-auth.session-token=${adminToken}`,
      },
    });
    const page = await context.newPage();

    // 1. Campus Chapters Directory
    await page.goto("/chapters");
    await expect(page).toHaveTitle(/Collegiate & Regional Chapters|KailshiansX/i);
    await expect(page.locator("h1")).toContainText(/Collegiate & Regional/i);

    // Verify Chapter Card exists (e.g. IIT Delhi)
    const chapterCard = page.locator('a[href^="/chapters/"]').first();
    await expect(chapterCard).toBeVisible({ timeout: 10000 });

    // 2. Chapter Public Page
    await page.goto("/chapters/iit-delhi");
    await expect(page.locator("h1")).toContainText(/IIT Delhi/i);
    const cockpitBtn = page.locator('a[href*="/dashboard"]').first();
    await expect(cockpitBtn).toBeVisible();

    // 3. Chapter Dashboard Cockpit
    await page.goto("/chapters/iit-delhi/dashboard");
    await expect(page.locator("h1")).toContainText(/Chapter Cockpit/i);

    // Verify 4 Cockpit Tabs
    await expect(page.locator("#tab-overview")).toBeVisible();
    await expect(page.locator("#tab-roster")).toBeVisible();
    await expect(page.locator("#tab-events")).toBeVisible();
    await expect(page.locator("#tab-settings")).toBeVisible();

    // Check Diagnostics & Health Score
    await expect(page.locator("text=Composite Health Score").first()).toBeVisible();

    // Tab switching
    await page.click("#tab-roster");
    await expect(page.locator("text=Active Roster").first()).toBeVisible();

    await page.click("#tab-events");
    await expect(page.locator("text=Meetups & Hackathons").first()).toBeVisible();

    // 4. Mentor / Speaker Network Discovery
    await page.goto("/network/speakers");
    await expect(page.locator("h1")).toContainText(/Mentor & Speaker Network/i);

    const speakerCard = page.locator('a[href^="/network/speakers/"]').first();
    await expect(speakerCard).toBeVisible({ timeout: 10000 });

    // 5. Speaker Profile & Booking Request Modal
    await page.goto("/network/speakers/ananya-sharma");
    await expect(page.locator("h1")).toContainText(/Ananya Sharma/i);

    const bookBtn = page.locator("#btn-open-booking-modal");
    await expect(bookBtn).toBeVisible();
    await bookBtn.click();

    // Booking Modal
    const modalHeading = page.locator("#booking-modal-title");
    await expect(modalHeading).toBeVisible();

    await page.fill("#booking-topic", "Agentic Workflows in Production");
    await page.fill("#booking-description", "Seeking guidance on multi-agent consensus protocols.");
    const dateInput = page.locator("#booking-date");
    await dateInput.fill("2026-11-15T16:00");

    const submitBookingBtn = page.locator("#btn-submit-booking");
    await expect(submitBookingBtn).toBeVisible();
    await submitBookingBtn.click();

    // 6. User Bookings Hub
    await page.goto("/me/bookings");
    await expect(page.locator("h1")).toContainText(/Mentorship Sessions/i);
    await expect(page.locator("text=Agentic Workflows in Production").first()).toBeVisible({
      timeout: 10000,
    });

    // 7. Mentor Cockpit
    await page.goto("/me/mentor");
    await expect(page.locator("h1")).toContainText(/Mentor Cockpit/i);
    await expect(page.locator("text=Availability & Hours").first()).toBeVisible();

    // 8. Partner Portal Gateway
    await page.goto("/partners/portal");
    await expect(page.locator("h1")).toContainText(/Partner Portal/i);

    const accessInput = page.locator("#partner-access-code-input");
    await expect(accessInput).toBeVisible();

    // Find demo partner code or use DEVREL26
    const demoPartner = await db.partner.findFirst({
      where: { portalAccessCode: { not: null } },
    });
    const testCode = demoPartner?.portalAccessCode || "DEVREL26";

    await accessInput.fill(testCode);
    await page.click("#btn-access-portal");

    // Verify Partner Portal Dashboard
    await page.waitForURL(new RegExp(`/partners/portal/${testCode}`), { timeout: 15000 });
    await expect(page.locator("text=Sponsor Deliverables").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Audience Reach Telemetry").first()).toBeVisible();

    await context.close();
  });
});
