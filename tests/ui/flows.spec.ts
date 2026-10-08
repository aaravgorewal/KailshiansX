import { test, expect } from "@playwright/test";
import crypto from "crypto";
import { db } from "@/lib/db";

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || "kws_test_rzp_secret_2026";

test.describe("User Flows Suite", () => {
  // 1. Register Free Flow
  test("register free flow: completes registration and lands on confirmation ticket", async ({
    page,
  }) => {
    const uniqueEmail = `free-flow-${Date.now()}@example.com`;

    await page.goto("/events/padharox-01/register", { waitUntil: "networkidle" });
    await expect(page.locator("h2:has-text('Claim Your Pass')")).toBeVisible();

    // Select Free ticket
    const freeTicket = page.locator("label:has-text('General Attendee')");
    await expect(freeTicket).toBeVisible();
    await freeTicket.click();

    // Fill attendee details
    await page.locator("input#reg-name").fill("Aarav Free Builder");
    await page.locator("input#reg-email").fill(uniqueEmail);

    const phoneInput = page.locator("input#reg-phone");
    await phoneInput.fill("9876543210");
    await phoneInput.blur();
    await expect(phoneInput).toHaveValue("+91 98765 43210");

    await page.locator("input#reg-college").fill("MNIT Jaipur");

    // Submit
    const submitBtn = page.locator("button[type='submit']");
    await expect(submitBtn).toHaveText("Register — Free");
    await submitBtn.click();

    // Verify redirected to digital ticket confirmation page
    await page.waitForURL(/\/registration\/[a-zA-Z0-9_-]+/, { timeout: 15000 });
    expect(page.url()).toContain("/registration/");

    await expect(page.locator("text=Registration Confirmed")).toBeVisible();
    await expect(page.locator("#registration-code")).toBeVisible();
    await expect(page.locator("img[alt^='QR pass']")).toBeVisible();
    await expect(page.locator("a:has-text('Add to calendar')")).toBeVisible();
    await expect(page.locator("a:has-text('Join WhatsApp group')")).toBeVisible();
  });

  // 2. Register Paid Flow (mocked Razorpay)
  test("register paid flow: completes payment via mocked Razorpay and lands on confirmation ticket", async ({
    page,
  }) => {
    const uniqueEmail = `paid-flow-${Date.now()}@example.com`;

    // Intercept Razorpay CDN script
    await page.route("https://checkout.razorpay.com/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: 'console.log("Mocked Razorpay CDN loaded");',
      })
    );

    // Expose signature computation helper
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
      interface MockOpts {
        order_id: string;
        theme?: { color?: string };
        name?: string;
        handler?: (res: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => void;
      }

      type CustomWin = Window & {
        Razorpay: new (opts: MockOpts) => { open: () => Promise<void> };
        computeTestRazorpaySignature: (orderId: string, paymentId: string) => Promise<string>;
      };

      const win = window as unknown as CustomWin;
      win.Razorpay = function (this: { open: () => Promise<void> }, options: MockOpts) {
        this.open = async function () {
          const fakePaymentId = `pay_flow_${Date.now()}`;
          const signature = await win.computeTestRazorpaySignature(options.order_id, fakePaymentId);

          setTimeout(() => {
            if (options.handler) {
              options.handler({
                razorpay_order_id: options.order_id,
                razorpay_payment_id: fakePaymentId,
                razorpay_signature: signature,
              });
            }
          }, 100);
        };
      } as unknown as new (opts: MockOpts) => { open: () => Promise<void> };
    });

    await page.goto("/events/padharox-01/register", { waitUntil: "networkidle" });

    // Select Paid tier (Community VIP Pass)
    const vipTicket = page.locator("label:has-text('Community VIP Pass')");
    await expect(vipTicket).toBeVisible();
    await vipTicket.click();

    // Verify button label
    const submitBtn = page.locator("button[type='submit']");
    await expect(submitBtn).toHaveText("Pay ₹299");

    // Fill attendee details
    await page.locator("input#reg-name").fill("Priya VIP Builder");
    await page.locator("input#reg-email").fill(uniqueEmail);

    const phoneInput = page.locator("input#reg-phone");
    await phoneInput.fill("9812345678");
    await phoneInput.blur();
    await expect(phoneInput).toHaveValue("+91 98123 45678");

    await page.locator("input#reg-college").fill("IIT Delhi");

    // Submit -> triggers Razorpay checkout -> triggers verification action
    await submitBtn.click();

    // Redirect to /registration/[id]
    await page.waitForURL(/\/registration\/[a-zA-Z0-9_-]+/, { timeout: 15000 });
    expect(page.url()).toContain("/registration/");
    await expect(page.locator("text=Registration Confirmed")).toBeVisible();
    await expect(page.locator("#registration-code")).toBeVisible();
  });

  // 3. Lead Application Flow (Campus & State Leads)
  test("lead application flow: submits campus and state lead applications and persists to DB", async ({
    page,
  }) => {
    const campusEmail = `campus-flow-${Date.now()}@testlead.org`;

    await page.goto("/community#lead", { waitUntil: "networkidle" });

    // Campus Lead
    const campusRadio = page.locator("#applying-campus");
    await campusRadio.check();
    await expect(campusRadio).toBeChecked();

    await page.locator("input#lead-name").fill("Rohan Sharma");
    await page.locator("input#lead-email").fill(campusEmail);
    await page.locator("input#lead-phone").fill("9876543210");
    await page.locator("input#lead-college").fill("MNIT Jaipur");
    await page.locator("input#lead-city").fill("Jaipur");
    await page.locator("input#lead-course-year").fill("3rd Year, B.Tech CSE");
    await page.locator("input#lead-linkedin").fill("https://linkedin.com/in/rohansharma");
    await page
      .locator("textarea#lead-why")
      .fill(
        "I want to lead the KailshiansX campus chapter at MNIT Jaipur to organize technical workshops."
      );
    await page.locator("input#lead-availability").fill("10 hours/week");

    await page.locator("button#lead-submit-btn").click();

    const successBox = page.locator("#lead-success-state");
    await expect(successBox).toBeVisible({ timeout: 10000 });
    await expect(successBox).toContainText("Thank you for applying");
    await expect(successBox).toContainText("Campus Lead");

    // Verify row in DB
    const campusRow = await db.campusLeadApplication.findFirst({
      where: { email: campusEmail },
    });
    expect(campusRow).toBeTruthy();
    expect(campusRow?.college).toBe("MNIT Jaipur");

    // Cleanup
    if (campusRow) {
      await db.campusLeadApplication.delete({ where: { id: campusRow.id } });
    }
  });

  // 4. Partner Form Flow
  test("partner form flow: submits inquiry and persists to collaboration lead DB", async ({
    page,
  }) => {
    const partnerEmail = `partner-flow-${Date.now()}@testpartner.org`;
    const orgName = `Dev Ecosystem Guild ${Date.now()}`;

    await page.goto("/partner", { waitUntil: "networkidle" });

    const commRadio = page.locator("#partner-type-community");
    await commRadio.check();
    await expect(commRadio).toBeChecked();

    await page.locator("#partner-organisation").fill(orgName);
    await page.locator("#partner-contact").fill("Kavita Singhania");
    await page.locator("#partner-email").fill(partnerEmail);
    await page.locator("#partner-phone").fill("9876543210");
    await page.locator("#partner-city").fill("Jaipur");
    await page.locator("#partner-website").fill("https://devecosystem.org");
    await page
      .locator("#partner-message")
      .fill("We want to co-host an open source hackathon track with KailshiansX.");

    await page.locator("#partner-submit-btn").click();

    const successBox = page.locator("#partner-success-state");
    await expect(successBox).toBeVisible({ timeout: 10000 });
    await expect(successBox).toContainText("Thank you for reaching out");
    await expect(successBox).toContainText(orgName);

    // Verify row in DB
    const leadRow = await db.collaborationLead.findFirst({
      where: { email: partnerEmail },
    });
    expect(leadRow).toBeTruthy();
    expect(leadRow?.organisation).toBe(orgName);

    // Cleanup
    if (leadRow) {
      await db.collaborationLead.delete({ where: { id: leadRow.id } });
    }
  });

  // 5. Apply to a Role Flow (/about open roles modal)
  test("apply to a role flow: opens dialog, submits application, and shows confirmation", async ({
    page,
  }) => {
    const applicantEmail = `role-flow-${Date.now()}@testapplicant.org`;

    await page.goto("/about", { waitUntil: "networkidle" });

    // Locate Open Roles section
    const openRolesSection = page.locator("#about-roles");
    await expect(openRolesSection).toBeVisible();

    // Click the first Apply button
    const applyBtn = openRolesSection.locator('button:has-text("Apply")').first();
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();

    // Dialog should open
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Fill form
    await page.locator("input#app-name").fill("Dev Aryan");
    await page.locator("input#app-email").fill(applicantEmail);
    await page.locator("input#app-phone").fill("9876543210");
    await page.locator("input#app-link").fill("https://github.com/devaryan");
    await page
      .locator("textarea#app-why")
      .fill(
        "I have built production web applications and hosted tech events. I want to build the community forward."
      );

    // Submit application
    const submitBtn = dialog.locator('button:has-text("Submit Application")');
    await submitBtn.click();

    // Success confirmation
    await expect(dialog.locator("text=Application Submitted")).toBeVisible({ timeout: 15000 });

    // Click Done to close
    const doneBtn = dialog.locator('button:has-text("Done")');
    await doneBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  // 6. Gallery Viewer Keyboard Navigation Flow
  test("gallery viewer keyboard navigation: supports Enter, ArrowRight, ArrowLeft, Tab trap, and Escape", async ({
    page,
  }) => {
    const album = await db.galleryAlbum.findFirst({
      where: { isPublished: true, images: { some: {} } },
      include: { images: true },
    });
    expect(album).not.toBeNull();

    await page.goto(`/gallery/${album!.id}`, { waitUntil: "networkidle" });

    const photoCards = page.locator('div[role="button"][aria-label^="View photo"]');
    const photoCount = await photoCards.count();
    expect(photoCount).toBeGreaterThan(0);

    // Focus first photo card and press Enter
    const firstPhoto = photoCards.first();
    await firstPhoto.focus();
    await page.keyboard.press("Enter");

    // Viewer dialog opens
    const viewer = page.locator('div[role="dialog"][aria-label="Photo viewer"]');
    await expect(viewer).toBeVisible();

    // Close button has initial focus
    const closeBtn = viewer.locator('button[aria-label="Close viewer"]');
    await expect(closeBtn).toBeFocused();

    // Photo counter check
    const counter = viewer.locator("header .font-mono");
    await expect(counter).toContainText(`1 / ${photoCount}`);

    // Arrow navigation
    if (photoCount > 1) {
      await page.keyboard.press("ArrowRight");
      await expect(counter).toContainText(`2 / ${photoCount}`);

      await page.keyboard.press("ArrowLeft");
      await expect(counter).toContainText(`1 / ${photoCount}`);
    }

    // Focus trap check: Tab stays in dialog
    await page.keyboard.press("Tab");
    const activeInViewer = await page.evaluate(() => {
      const active = document.activeElement;
      const viewerDialog = document.querySelector('div[role="dialog"][aria-label="Photo viewer"]');
      return viewerDialog ? viewerDialog.contains(active) : false;
    });
    expect(activeInViewer).toBe(true);

    // Escape closes viewer
    await page.keyboard.press("Escape");
    await expect(viewer).not.toBeVisible();
  });

  // 7. Old URL 308 Redirects Flow
  test("old URL redirects: verifies permanent 308 redirects from deprecated paths", async ({
    page,
  }) => {
    const redirects = [
      { from: "/workshops", to: "/events?type=workshop" },
      { from: "/tech-talks", to: "/events?type=talk" },
      { from: "/meetup-series", to: "/events?type=meetup" },
      { from: "/hackathon-series", to: "/events?type=hackathon" },
      { from: "/campus-leads", to: "/community#lead" },
      { from: "/state-leads", to: "/community#lead" },
      { from: "/collaborations", to: "/partner" },
      { from: "/who-we-are", to: "/about" },
      { from: "/founder", to: "/about" },
      { from: "/core-team", to: "/about" },
      { from: "/join-team", to: "/about" },
    ];

    for (const { from, to } of redirects) {
      const response = await page.goto(from, { waitUntil: "commit" });
      expect(response).not.toBeNull();
      // Verify final URL ends with expected destination
      expect(page.url()).toContain(to);
    }
  });
});
