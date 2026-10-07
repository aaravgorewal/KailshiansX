import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const THEMES = ["light", "dark"] as const;

test.describe("Forms Validation & Submission Suite across Themes", () => {
  for (const theme of THEMES) {
    test.describe(`Theme: ${theme}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.addInitScript((t) => {
          window.localStorage.setItem("theme", t);
        }, theme);
      });

      test("Registration Form: invalid submit shows readable errors, valid submit succeeds", async ({
        page,
      }) => {
        await page.goto("/events/padharox-01/register");
        await expect(page.locator("text=Claim Your Pass")).toBeVisible();

        // Advance from ticket selection to builder profile (step 2)
        const continueBtn = page.locator('button:has-text("Continue")');
        await expect(continueBtn).toBeVisible();
        await continueBtn.click();

        // Step 2: Test invalid submission by clicking "Next" without required fields
        const nextBtn = page.locator('button:has-text("Next")');
        await expect(nextBtn).toBeVisible();
        await nextBtn.click();

        // Assert error messages are shown
        const errorEl = page.locator(".text-destructive").first();
        await expect(errorEl).toBeVisible();

        // Check contrast and labels
        const axeResults = await new AxeBuilder({ page })
          .withRules(["color-contrast", "label"])
          .analyze();
        expect(axeResults.violations).toEqual([]);

        // Fill valid details
        const uniqueEmail = `attendee-${Date.now()}-${theme}@example.com`;
        await page.fill("#reg-name", "Automated Test Attendee");
        await page.fill("#reg-email", uniqueEmail);
        await page.fill("#reg-phone", "9876543210");
        await page.fill("#reg-college", "MNIT Jaipur");
        await page.fill("#reg-city", "Jaipur");

        await nextBtn.click();

        // Step 3: Preferences -> advance to review
        const reviewBtn = page.locator('button:has-text("Review Summary")');
        await expect(reviewBtn).toBeVisible();
        await reviewBtn.click();

        // Step 4: Complete free registration
        const completeBtn = page.locator('button:has-text("Complete Registration")');
        await expect(completeBtn).toBeVisible();
        await completeBtn.click();

        // Redirect to digital ticket
        await page.waitForURL(/\/events\/padharox-01\/ticket\/KX-/, { timeout: 15000 });
        await expect(page.locator("text=Automated Test Attendee")).toBeVisible();
      });

      test("Campus Lead Form: invalid submit shows readable errors, valid submit succeeds", async ({
        page,
      }) => {
        await page.goto("/campus-leads");
        const submitBtn = page.locator('button:has-text("Submit Campus Lead Application")');
        await expect(submitBtn).toBeVisible();

        // Invalid submit
        await submitBtn.click();

        const errors = page.locator('[role="alert"]');
        await expect(errors.first()).toBeVisible();

        const axeResults = await new AxeBuilder({ page })
          .withRules(["color-contrast", "label"])
          .analyze();
        expect(axeResults.violations).toEqual([]);

        // Valid submit
        const uniqueEmail = `campus-lead-${Date.now()}-${theme}@college.edu`;
        await page.fill('input[name="name"]', "Aarav Lead");
        await page.fill('input[name="email"]', uniqueEmail);
        await page.fill('input[name="phone"]', "9876543210");
        await page.fill('input[name="college"]', "MNIT Jaipur");
        await page.fill('input[name="city"]', "Jaipur");
        await page.fill('input[name="courseYear"]', "B.Tech CSE 3rd Year");
        await page.fill('input[name="linkedin"]', "https://linkedin.com/in/aarav-lead");
        await page.fill(
          'textarea[name="experience"]',
          "Full-stack React/Node developer, built multiple community projects."
        );
        await page.fill(
          'textarea[name="communityInvolvement"]',
          "Active organizer of university developer club with 150 members."
        );
        await page.fill(
          'textarea[name="whyKailshiansX"]',
          "Want to empower campus peers with tier-1 hackathons and mentorship."
        );

        await submitBtn.click();
        await expect(
          page.locator("text=Your Campus Lead application has been registered.")
        ).toBeVisible({ timeout: 10000 });
      });

      test("State Lead Form: invalid submit shows readable errors, valid submit succeeds", async ({
        page,
      }) => {
        await page.goto("/state-leads");
        const submitBtn = page.locator('button:has-text("Submit State Lead Application")');
        await expect(submitBtn).toBeVisible();

        // Invalid submit
        await submitBtn.click();

        const errors = page.locator('[role="alert"]');
        await expect(errors.first()).toBeVisible();

        const axeResults = await new AxeBuilder({ page })
          .withRules(["color-contrast", "label"])
          .analyze();
        expect(axeResults.violations).toEqual([]);

        // Valid submit
        const uniqueEmail = `state-lead-${Date.now()}-${theme}@example.com`;
        await page.fill('input[name="name"]', "State Coordinator");
        await page.fill('input[name="email"]', uniqueEmail);
        await page.fill('input[name="phone"]', "9876543211");
        await page.fill('input[name="state"]', "Rajasthan");
        await page.fill('input[name="city"]', "Jaipur");
        await page.fill('input[name="citiesCovered"]', "Jaipur, Jodhpur, Kota");
        await page.fill('input[name="currentRole"]', "Community Lead");
        await page.fill('input[name="linkedin"]', "https://linkedin.com/in/state-lead");
        await page.fill(
          'textarea[name="experience"]',
          "Led 10+ developer meetups and mentored 500+ student developers across the state."
        );
        await page.fill(
          'textarea[name="leadershipEvidence"]',
          "Organized hackathons with 800 participants and led university alliances."
        );
        await page.fill(
          'textarea[name="communityVision"]',
          "Establish student technical chapters in every engineering college in the state."
        );
        await page.fill(
          'textarea[name="whyKailshiansX"]',
          "Committed to scaling decentralized developer culture across tier 2 cities."
        );

        await submitBtn.click();
        await expect(page.locator("text=State Lead Application Received")).toBeVisible({
          timeout: 10000,
        });
      });

      test("Collaboration Form: invalid submit shows readable errors, valid submit succeeds", async ({
        page,
      }) => {
        await page.goto("/collaborations");
        const submitBtn = page.locator('button:has-text("Submit College Proposal")');
        await expect(submitBtn).toBeVisible();

        // Invalid submit
        await submitBtn.click();

        const errors = page.locator('[role="alert"]');
        await expect(errors.first()).toBeVisible();

        const axeResults = await new AxeBuilder({ page })
          .withRules(["color-contrast", "label"])
          .analyze();
        expect(axeResults.violations).toEqual([]);

        // Valid submit
        const uniqueEmail = `collab-${Date.now()}-${theme}@mnit.ac.in`;
        await page.fill('input[name="organisation"]', "MNIT Jaipur");
        await page.fill('input[name="contactPerson"]', "Dr. R. K. Sharma");
        await page.fill('input[name="roleDesignation"]', "Dean Student Affairs");
        await page.fill('input[name="email"]', uniqueEmail);
        await page.fill('input[name="phone"]', "9876543212");
        await page.fill('input[name="city"]', "Jaipur");
        await page.fill(
          'textarea[name="proposedEvent"]',
          "Host an annual 36-hour national hackathon on campus."
        );
        await page.fill(
          'textarea[name="resourcesOffered"]',
          "Auditorium, 1000 seat capacity, 1 Gbps LAN, student volunteer force."
        );

        await submitBtn.click();
        await expect(page.locator("text=Proposal Submitted Successfully")).toBeVisible({
          timeout: 10000,
        });
      });

      test("Join Team Form: invalid submit shows readable errors, valid submit succeeds", async ({
        page,
      }) => {
        await page.goto("/join-team");
        const submitBtn = page.locator('button:has-text("Submit Application")');
        await expect(submitBtn).toBeVisible();

        // Invalid submit
        await submitBtn.click();

        const errors = page.locator('[role="alert"]');
        await expect(errors.first()).toBeVisible();

        const axeResults = await new AxeBuilder({ page })
          .withRules(["color-contrast", "label"])
          .analyze();
        expect(axeResults.violations).toEqual([]);

        // Valid submit
        const uniqueEmail = `team-${Date.now()}-${theme}@example.com`;
        await page.fill('input[name="name"]', "Kavya Core");
        await page.fill('input[name="email"]', uniqueEmail);
        await page.fill('input[name="phone"]', "9876543213");
        await page.fill('input[name="roleApplied"]', "Senior Platform Engineer");
        await page.fill(
          'textarea[name="experience"]',
          "4 years shipping TypeScript, Next.js, and PostgreSQL high-concurrency systems."
        );
        await page.fill(
          'textarea[name="motivation"]',
          "Passionate about building developer tooling and transparent community infrastructure."
        );

        await submitBtn.click();
        await expect(page.locator("text=Application Received!")).toBeVisible({ timeout: 10000 });
      });
    });
  }
});
