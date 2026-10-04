import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.describe("Events Flow Restyle Verification (/events -> detail -> register -> ticket/failed)", () => {
  const screenshotsDir = "/tmp/ui-shots";

  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  const viewports = [
    { name: "375", width: 375, height: 667 },
    { name: "1280", width: 1280, height: 800 },
  ];

  for (const vp of viewports) {
    for (const theme of ["light", "dark"] as const) {
      test(`Walks /events -> detail -> register at ${vp.name}px in ${theme} mode`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.emulateMedia({ colorScheme: theme });

        // ─── 1. /events CATALOG ───────────────────────────────────────────
        await page.goto("/events");
        await page.waitForLoadState("domcontentloaded");

        // Set theme on <html>
        await page.evaluate((t) => {
          if (t === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }, theme);

        await page.waitForTimeout(400);

        // Save /events screenshot
        const catalogShot = path.join(screenshotsDir, `events-catalog-${vp.name}-${theme}.png`);
        await page.screenshot({ path: catalogShot, fullPage: true });
        expect(fs.existsSync(catalogShot)).toBeTruthy();

        // Check filter bar elements
        const searchInput = page.locator('input[type="search"]');
        await expect(searchInput).toBeVisible();

        // Confirm no stray "0" artifacts
        const strayZeroCheck = await page.evaluate(() => {
          const allElements = Array.from(document.querySelectorAll("span, p, div, a, button"));
          const strayZeros = allElements.filter((el) => {
            if (el.children.length > 0) return false;
            const text = el.textContent?.trim();
            return text === "0";
          });
          return strayZeros.length;
        });
        expect(strayZeroCheck).toBe(0);

        // Find the first event card
        const firstCardTitleLink = page.locator("h3 a").first();
        await expect(firstCardTitleLink).toBeVisible();

        // ─── 2. /events/[slug] DETAIL ─────────────────────────────────────
        await firstCardTitleLink.click();
        await page.waitForLoadState("domcontentloaded");
        await expect(page).toHaveURL(/\/events\/[a-zA-Z0-9_-]+/);

        // Ensure theme on detail page
        await page.evaluate((t) => {
          if (t === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }, theme);

        await page.waitForTimeout(400);

        // Save detail screenshot
        const detailShot = path.join(screenshotsDir, `events-detail-${vp.name}-${theme}.png`);
        await page.screenshot({ path: detailShot, fullPage: true });
        expect(fs.existsSync(detailShot)).toBeTruthy();

        // Confirm dates show IST
        const pageContent = await page.textContent("body");
        expect(pageContent).toContain("IST");

        await expect(page.getByTestId("event-countdown").first()).toBeVisible();

        // Confirm no stray "0" artifacts on detail page
        const strayZeroDetail = await page.evaluate(() => {
          const allElements = Array.from(document.querySelectorAll("span, p, div, a, button"));
          const strayZeros = allElements.filter((el) => {
            if (el.children.length > 0) return false;
            const text = el.textContent?.trim();
            return text === "0";
          });
          return strayZeros.length;
        });
        expect(strayZeroDetail).toBe(0);

        // ─── 3. /events/[slug]/register REGISTRATION ──────────────────────
        const claimButton = page.locator('a[href*="/register"]').first();
        await expect(claimButton).toBeVisible();
        await claimButton.click();

        await page.waitForLoadState("domcontentloaded");
        await expect(page).toHaveURL(/\/events\/[a-zA-Z0-9_-]+\/register/);

        // Ensure theme on register page
        await page.evaluate((t) => {
          if (t === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }, theme);

        await page.waitForTimeout(400);

        // Save register screenshot
        const registerShot = path.join(screenshotsDir, `events-register-${vp.name}-${theme}.png`);
        await page.screenshot({ path: registerShot, fullPage: true });
        expect(fs.existsSync(registerShot)).toBeTruthy();

        // Confirm no stray "0" artifacts on register page
        const strayZeroRegister = await page.evaluate(() => {
          const allElements = Array.from(document.querySelectorAll("span, p, div, a, button"));
          const strayZeros = allElements.filter((el) => {
            if (el.children.length > 0) return false;
            const text = el.textContent?.trim();
            return text === "0";
          });
          return strayZeros.length;
        });
        expect(strayZeroRegister).toBe(0);

        // Confirm form elements exist
        const continueBtn = page.getByRole("button", { name: /continue/i });
        await expect(continueBtn).toBeVisible();
      });
    }
  }

  // ─── 4. TICKET & SUCCESS VERIFICATION ────────────────────────────────────
  for (const theme of ["light", "dark"] as const) {
    test(`Ticket pass page renders centered card with QR and next steps in ${theme} mode`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.emulateMedia({ colorScheme: theme });

      await page.goto("/events/padharox-01/ticket/KX-2026-PX001");
      await page.waitForLoadState("domcontentloaded");

      await page.evaluate((t) => {
        if (t === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }, theme);

      await page.waitForTimeout(400);

      // Save ticket screenshot
      const ticketShot = path.join(screenshotsDir, `events-ticket-1280-${theme}.png`);
      await page.screenshot({ path: ticketShot, fullPage: true });
      expect(fs.existsSync(ticketShot)).toBeTruthy();

      // Confirm Registration ID
      const pageText = await page.textContent("body");
      expect(pageText).toContain("KX-2026-PX001");
      expect(pageText).toContain("IST");
      expect(pageText).toContain("Next Steps:");

      // Confirm QR image
      const qrImg = page.locator('img[alt*="QR code"]');
      await expect(qrImg).toBeVisible();

      // Confirm no stray "0"
      const strayZero = await page.evaluate(() => {
        const allElements = Array.from(document.querySelectorAll("span, p, div, a, button"));
        return allElements.filter(
          (el) => el.children.length === 0 && el.textContent?.trim() === "0"
        ).length;
      });
      expect(strayZero).toBe(0);
    });

    test(`Payment failed page renders simple centered card with next steps in ${theme} mode`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.emulateMedia({ colorScheme: theme });

      await page.goto("/events/padharox-01/register/failed?regId=KX-2026-PX001");
      await page.waitForLoadState("domcontentloaded");

      await page.evaluate((t) => {
        if (t === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }, theme);

      await page.waitForTimeout(400);

      // Save failed screenshot
      const failedShot = path.join(screenshotsDir, `events-failed-1280-${theme}.png`);
      await page.screenshot({ path: failedShot, fullPage: true });
      expect(fs.existsSync(failedShot)).toBeTruthy();

      // Confirm Registration ID and Next Steps
      const pageText = await page.textContent("body");
      expect(pageText).toContain("KX-2026-PX001");
      expect(pageText).toContain("Next Steps:");

      // Confirm no stray "0"
      const strayZero = await page.evaluate(() => {
        const allElements = Array.from(document.querySelectorAll("span, p, div, a, button"));
        return allElements.filter(
          (el) => el.children.length === 0 && el.textContent?.trim() === "0"
        ).length;
      });
      expect(strayZero).toBe(0);
    });
  }
});
