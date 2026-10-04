import { test, expect } from "@playwright/test";
import crypto from "crypto";
import { db } from "@/lib/db";
import { createAdminSessionToken, createUserSessionToken } from "./helpers/auth";

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

  test("Flow 5: Submit application on /join-team", async ({ page }) => {
    await page.goto("/join-team");
    await expect(page.locator("h2").first()).toContainText(/Build the Infrastructure/i);

    // Click "Apply for this Role" on any role
    const applyButton = page.locator('button:has-text("Apply for this Role")').first();
    await applyButton.click();

    // Fill form
    await page.fill('input[placeholder="e.g. Aarav Sharma"]', "Aarav E2E Applicant");
    await page.fill(
      'input[placeholder="aarav@example.com"]',
      `applicant-${Date.now()}@example.com`
    );
    await page.fill('input[placeholder="+91 98765 43210"]', "+91 9876543210");
    await page.fill(
      'textarea[placeholder*="Detail technical stacks used"]',
      "Built scalable microservices and Next.js applications handling thousands of users."
    );
    await page.fill(
      'textarea[placeholder*="What excites you about our mission?"]',
      "Passionate about growing developer communities and empowering student builders."
    );

    // Submit application
    await page.click('button[type="submit"]:has-text("Submit Application")');

    // Verify success banner appears
    await expect(page.locator("text=Application Received!")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("text=Application Reference:")).toBeVisible();
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
});
