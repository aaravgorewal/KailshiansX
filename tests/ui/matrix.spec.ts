import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
import { createAdminSessionToken } from "../e2e/helpers/auth";

dotenv.config({ path: ".env.local" });

const THEMES = ["light", "dark"] as const;

const VIEWPORTS = [
  { width: 375, height: 812, name: "mobile" },
  { width: 768, height: 1024, name: "tablet" },
  { width: 1280, height: 800, name: "desktop" },
] as const;

const PUBLIC_STATIC_ROUTES = [
  "/",
  "/events",
  "/community",
  "/gallery",
  "/about",
  "/partner",
  "/privacy",
  "/terms",
  "/refunds",
  "/contact",
  "/signin",
  "/verify",
];

const PUBLIC_DYNAMIC_ROUTES = [
  "/events/padharox-01",
  "/events/raibarx-01",
  "/events/nirmanx-2026",
  "/gallery/cmuzn6q9g001y29ruq6j6xgl0",
  "/gallery/cmuzn6q9q002229ru9lm32va2",
];

const ADMIN_ROUTES = [
  "/admin",
  "/admin/events",
  "/admin/registrations",
  "/admin/payments",
  "/admin/applications",
  "/admin/gallery",
  "/admin/sponsors",
  "/admin/pnl",
  "/admin/analytics",
  "/admin/campus-leads",
  "/admin/state-leads",
  "/admin/community",
  "/admin/certificates",
  "/admin/cms",
  "/admin/checkin",
];

const ALL_ROUTES = [
  ...PUBLIC_STATIC_ROUTES.map((r) => ({ path: r, isAdmin: false })),
  ...PUBLIC_DYNAMIC_ROUTES.map((r) => ({ path: r, isAdmin: false })),
  ...ADMIN_ROUTES.map((r) => ({ path: r, isAdmin: true })),
];

function sanitizeRouteName(route: string): string {
  const clean = route.replace(/^\//, "").replace(/[\/:]/g, "-");
  return clean === "" ? "root" : clean;
}

test.describe("Automated UI Matrix: Routes × Themes × Viewports", () => {
  let adminSessionToken: string;

  test.beforeAll(async () => {
    fs.mkdirSync(path.join(process.cwd(), "tests/ui/__screens__"), { recursive: true });
    adminSessionToken = await createAdminSessionToken();
  });

  for (const routeObj of ALL_ROUTES) {
    const route = routeObj.path;
    const isAdmin = routeObj.isAdmin;

    for (const theme of THEMES) {
      for (const viewport of VIEWPORTS) {
        test(`${route} [${theme} @ ${viewport.width}x${viewport.height}]`, async ({
          browser,
          baseURL,
        }) => {
          const context = await browser.newContext({
            baseURL,
            viewport: { width: viewport.width, height: viewport.height },
            colorScheme: theme,
          });

          if (isAdmin) {
            await context.addCookies([
              {
                name: "authjs.session-token",
                value: adminSessionToken,
                domain: "127.0.0.1",
                path: "/",
              },
              {
                name: "next-auth.session-token",
                value: adminSessionToken,
                domain: "127.0.0.1",
                path: "/",
              },
              {
                name: "authjs.session-token",
                value: adminSessionToken,
                domain: "localhost",
                path: "/",
              },
              {
                name: "next-auth.session-token",
                value: adminSessionToken,
                domain: "localhost",
                path: "/",
              },
            ]);
          }

          const page = await context.newPage();

          // Set theme in localStorage prior to page script execution
          await page.addInitScript((t) => {
            window.localStorage.setItem("theme", t);
          }, theme);

          const consoleErrors: string[] = [];
          page.on("console", (msg) => {
            if (msg.type() === "error") {
              const text = msg.text();
              // Ignore third-party analytics / telemetry / font errors
              if (
                text.includes("google-analytics") ||
                text.includes("googletagmanager") ||
                text.includes("sentry") ||
                (text.includes("Failed to load resource") &&
                  (text.includes("google") ||
                    text.includes("sentry") ||
                    text.includes("analytics")))
              ) {
                return;
              }
              consoleErrors.push(text);
            }
          });

          const failedRequests: string[] = [];
          page.on("requestfailed", (req) => {
            const url = req.url();
            const failure = req.failure()?.errorText || "";
            if (
              failure.includes("ERR_ABORTED") ||
              url.includes("google-analytics.com") ||
              url.includes("googletagmanager.com") ||
              url.includes("sentry.io") ||
              url.includes("vercel-insights")
            ) {
              return;
            }
            failedRequests.push(`${req.method()} ${url}: ${failure}`);
          });

          // 1. Status < 400; fail on console errors and failed requests
          const response = await page.goto(route, { waitUntil: "domcontentloaded" });
          expect(response?.status()).toBeLessThan(400);

          expect(consoleErrors).toEqual([]);
          expect(failedRequests).toEqual([]);

          // 2. No horizontal overflow (scrollWidth <= innerWidth)
          const hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
          });
          expect(hasOverflow).toBe(false);

          // 3. All images loaded or replaced by the fallback; no alt text visible
          await page.evaluate(async () => {
            const imgs = Array.from(document.querySelectorAll("img"));
            await Promise.all(
              imgs.map((img) => {
                if (img.complete) return Promise.resolve();
                return new Promise((resolve) => {
                  img.addEventListener("load", resolve);
                  img.addEventListener("error", resolve);
                  setTimeout(resolve, 3000);
                });
              })
            );
          });

          const brokenImages = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll("img"));
            const broken: string[] = [];
            for (const img of imgs) {
              const rect = img.getBoundingClientRect();
              const isVisible =
                rect.width > 0 &&
                rect.height > 0 &&
                window.getComputedStyle(img).visibility !== "hidden";
              if (isVisible && img.complete && img.naturalWidth === 0) {
                broken.push(img.src || img.getAttribute("src") || img.alt || "unnamed-img");
              }
            }
            return broken;
          });
          expect(brokenImages).toEqual([]);

          // 4. Axe: zero violations for color-contrast, label, button-name, image-alt, link-name
          const axeResults = await new AxeBuilder({ page })
            .withRules(["color-contrast", "label", "button-name", "image-alt", "link-name"])
            .analyze();
          expect(axeResults.violations).toEqual([]);

          // 5. html has class "dark" iff theme is dark; computed background equals --background
          const { hasDark, computedBg } = await page.evaluate(() => {
            const html = document.documentElement;
            return {
              hasDark: html.classList.contains("dark"),
              computedBg: window.getComputedStyle(html).backgroundColor,
            };
          });

          if (theme === "dark") {
            expect(hasDark).toBe(true);
            expect(computedBg).toBe("rgb(11, 11, 12)");
          } else {
            expect(hasDark).toBe(false);
            expect(computedBg).toBe("rgb(255, 255, 255)");
          }

          // 6. Save a screenshot per combination to tests/ui/__screens__/
          const screenSlug = sanitizeRouteName(route);
          const screenPath = path.join(
            process.cwd(),
            "tests/ui/__screens__",
            `${screenSlug}-${theme}-${viewport.width}x${viewport.height}.png`
          );
          await page.screenshot({ path: screenPath, fullPage: true });

          await context.close();
        });
      }
    }
  }
});
