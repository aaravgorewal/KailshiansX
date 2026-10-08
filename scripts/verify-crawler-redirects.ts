// scripts/verify-crawler-redirects.ts
// Automated crawler and redirect verification suite

const BASE_URL = process.env.TEST_URL || "http://localhost:3001";

interface RedirectCase {
  source: string;
  expectedDestination: string;
}

const REDIRECT_CASES: RedirectCase[] = [
  { source: "/workshops", expectedDestination: "/events?type=workshop" },
  { source: "/workshops/intro-to-nextjs", expectedDestination: "/events?type=workshop" },
  { source: "/tech-talks", expectedDestination: "/events?type=talk" },
  { source: "/tech-talks/scaling-postgres", expectedDestination: "/events?type=talk" },
  { source: "/meetup-series", expectedDestination: "/events?type=meetup" },
  { source: "/meetup-series/padharox", expectedDestination: "/events?type=meetup" },
  { source: "/hackathon-series", expectedDestination: "/events?type=hackathon" },
  { source: "/hackathon-series/nirmanx", expectedDestination: "/events?type=hackathon" },
  { source: "/campus-leads", expectedDestination: "/community#lead" },
  { source: "/state-leads", expectedDestination: "/community#lead" },
  { source: "/collaborations", expectedDestination: "/partner" },
  { source: "/who-we-are", expectedDestination: "/about" },
  { source: "/founder", expectedDestination: "/about" },
  { source: "/core-team", expectedDestination: "/about" },
  { source: "/join-team", expectedDestination: "/about" },
];

async function testRedirects(): Promise<number> {
  console.log("=== 1. VERIFYING 308 REDIRECTS ===");
  let failures = 0;

  for (const { source, expectedDestination } of REDIRECT_CASES) {
    const url = `${BASE_URL}${source}`;
    const res = await fetch(url, { redirect: "manual" });
    const status = res.status;
    const location = res.headers.get("location");

    if (status !== 308) {
      console.error(`❌ [FAIL] ${source}: Expected HTTP 308, got ${status}`);
      failures++;
    } else if (location !== expectedDestination) {
      console.error(
        `❌ [FAIL] ${source}: Expected Location '${expectedDestination}', got '${location}'`
      );
      failures++;
    } else {
      console.log(`✅ [PASS] ${source} -> 308 -> ${location}`);
    }
  }

  return failures;
}

async function crawlSitemapAndLinks(): Promise<number> {
  console.log("\n=== 2. CRAWLING SITEMAP & INTERNAL LINKS ===");
  let failures = 0;

  // 1. Fetch sitemap.xml
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  const sitemapRes = await fetch(sitemapUrl);
  if (!sitemapRes.ok) {
    console.error(`❌ [FAIL] Failed to fetch sitemap: ${sitemapRes.status}`);
    return 1;
  }

  const sitemapXml = await sitemapRes.text();
  const locMatches = Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);

  console.log(`Found ${locMatches.length} URLs in sitemap.xml`);

  const visitedUrls = new Set<string>();
  const queue: string[] = [];

  for (const rawUrl of locMatches) {
    try {
      const parsed = new URL(rawUrl);
      queue.push(parsed.pathname + parsed.search);
    } catch {
      queue.push(rawUrl);
    }
  }

  // Also include the primary 6 pages explicitly
  const primaryPages = ["/", "/events", "/community", "/gallery", "/about", "/partner"];
  for (const p of primaryPages) {
    if (!queue.includes(p)) queue.push(p);
  }

  while (queue.length > 0) {
    const path = queue.shift()!;
    if (visitedUrls.has(path)) continue;
    visitedUrls.add(path);

    const fullUrl = `${BASE_URL}${path}`;
    try {
      const res = await fetch(fullUrl, {
        headers: { Accept: "text/html" },
      });

      if (res.status === 404) {
        console.error(`❌ [404 BROKEN LINK] ${path}`);
        failures++;
        continue;
      }

      if (!res.ok && res.status !== 308 && res.status !== 307) {
        console.warn(`⚠️ [STATUS ${res.status}] ${path}`);
      } else {
        console.log(`✅ [OK ${res.status}] ${path}`);
      }

      // If HTML, parse internal links from anchor tags
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        const html = await res.text();
        const hrefMatches = Array.from(html.matchAll(/<a\b[^>]*\bhref=["'](\/[^"']*)["']/gi)).map(
          (m) => m[1]
        );

        for (const href of hrefMatches) {
          // Clean hash
          const cleanHref = href.split("#")[0] || "/";
          // Ignore api, static files, admin routes for unauthenticated crawl
          if (
            !cleanHref.startsWith("/_next") &&
            !cleanHref.startsWith("/api") &&
            !cleanHref.startsWith("/admin") &&
            !cleanHref.match(/\.(png|jpg|jpeg|svg|ico|webmanifest|xml|txt|pdf)$/i) &&
            !visitedUrls.has(cleanHref) &&
            !queue.includes(cleanHref)
          ) {
            queue.push(cleanHref);
          }
        }
      }
    } catch (err) {
      console.error(`❌ [FETCH ERROR] ${path}:`, err);
      failures++;
    }
  }

  console.log(`Crawled ${visitedUrls.size} unique internal routes.`);
  return failures;
}

async function main() {
  const redirectFailures = await testRedirects();
  const crawlFailures = await crawlSitemapAndLinks();

  const totalFailures = redirectFailures + crawlFailures;
  if (totalFailures > 0) {
    console.error(`\n❌ VERIFICATION FAILED with ${totalFailures} errors.`);
    process.exit(1);
  } else {
    console.log("\n🎉 ALL CHECKS PASSED: 308 redirects verified, no 404 broken links.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
