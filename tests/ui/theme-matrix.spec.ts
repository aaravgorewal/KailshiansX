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
  "/workshops",
  "/tech-talks",
  "/meetup-series",
  "/hackathon-series",
  "/community",
  "/campus-leads",
  "/state-leads",
  "/collaborations",
  "/gallery",
  "/join-team",
  "/core-team",
  "/founder",
  "/who-we-are",
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
  "/events/nirmanx-s01",
  "/meetup-series/raibarx",
  "/meetup-series/padharox",
  "/hackathon-series/nirmanx",
  "/hackathon-series/aarambhx",
];

const ADMIN_ROUTES = [
  "/admin",
  "/admin/events",
  "/admin/registrations",
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

test.describe("Theme Matrix Testing: Theme × Viewport × Routes", () => {
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

          // 1. Page loads with status < 400
          const response = await page.goto(route, { waitUntil: "domcontentloaded" });
          expect(response?.status()).toBeLessThan(400);

          // Fail on any application console errors or network request failures
          expect(consoleErrors).toEqual([]);
          expect(failedRequests).toEqual([]);

          // 2. No horizontal overflow: document.documentElement.scrollWidth <= window.innerWidth
          const hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
          });
          expect(hasOverflow).toBe(false);

          // 3. All <img> elements loaded (naturalWidth > 0) or fallback; none shows alt text
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

          // 4. Axe color-contrast, label, button-name, image-alt: zero violations
          const axeResults = await new AxeBuilder({ page })
            .withRules(["color-contrast", "label", "button-name", "image-alt"])
            .analyze();
          expect(axeResults.violations).toEqual([]);

          // 5. No element with visible text has computed color equal to its effective background color
          const invisibleTexts = await page.evaluate(() => {
            function parseRgb(color: string): [number, number, number] | null {
              const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
              if (!m) return null;
              return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
            }

            function getEffectiveBg(el: HTMLElement): string {
              let curr: HTMLElement | null = el;
              while (curr) {
                const style = window.getComputedStyle(curr);
                const bg = style.backgroundColor;
                if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
                  return bg;
                }
                curr = curr.parentElement;
              }
              return (
                window.getComputedStyle(document.body).backgroundColor ||
                window.getComputedStyle(document.documentElement).backgroundColor ||
                "rgb(255, 255, 255)"
              );
            }

            const bad: { tag: string; text: string; color: string; bg: string }[] = [];
            const allElements = Array.from(document.body.querySelectorAll("*")) as HTMLElement[];

            for (const el of allElements) {
              const directText = Array.from(el.childNodes)
                .filter((n) => n.nodeType === Node.TEXT_NODE)
                .map((n) => (n.nodeValue || "").trim())
                .join("");

              if (directText.length === 0) continue;

              const style = window.getComputedStyle(el);
              const rect = el.getBoundingClientRect();
              const isVisible =
                rect.width > 0 &&
                rect.height > 0 &&
                style.visibility !== "hidden" &&
                style.display !== "none" &&
                parseFloat(style.opacity || "1") > 0.05;

              if (!isVisible) continue;

              const rgbColor = parseRgb(style.color);
              const rgbBg = parseRgb(getEffectiveBg(el));

              if (rgbColor && rgbBg) {
                if (
                  rgbColor[0] === rgbBg[0] &&
                  rgbColor[1] === rgbBg[1] &&
                  rgbColor[2] === rgbBg[2]
                ) {
                  bad.push({
                    tag: el.tagName,
                    text: directText.slice(0, 30),
                    color: style.color,
                    bg: getEffectiveBg(el),
                  });
                }
              }
            }
            return bad;
          });
          expect(invisibleTexts).toEqual([]);

          // 6. html element has class "dark" iff theme is dark, and computed background-color matches --background
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

          // 7. Full-page screenshot saved to tests/ui/__screens__/{route}-{theme}-{width}.png
          const screenSlug = sanitizeRouteName(route);
          const screenPath = path.join(
            process.cwd(),
            "tests/ui/__screens__",
            `${screenSlug}-${theme}-${viewport.width}.png`
          );
          await page.screenshot({ path: screenPath, fullPage: true });

          await context.close();
        });
      }
    }
  }
});
