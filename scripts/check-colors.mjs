#!/usr/bin/env node
/**
 * check-colors.mjs
 * UI color-compliance guardrail for KailshiansX.
 *
 * Scans src/**\/*.{ts,tsx,css} and exits 1 if any violation is found.
 * Violations are printed as  file:line  message.
 *
 * Allowed exception: src/app/globals.css (and src/styles/tokens.css if it
 * exists) may contain raw color literals because those files are the single
 * source of truth for CSS custom-property values.
 *
 * Run:  node scripts/check-colors.mjs
 *       npm run check:colors
 */

import { readFileSync, readdirSync } from "fs";
import { join, relative, isAbsolute } from "path";
import { fileURLToPath } from "url";

// ─── Configuration ────────────────────────────────────────────────────────────

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..", "src");
const REPO_ROOT = join(__dirname, "..");

/** Files whose raw color literals are intentional (tokens.css is single source of truth; brand icon exceptions, OG images, canvas editors). */
const ALLOWED_RAW_COLOR_FILES = new Set([
  "src/styles/tokens.css",
  "src/components/auth/GoogleIcon.tsx",
  "src/app/gallery/[albumId]/opengraph-image.tsx",
  "src/components/admin/certificates/CertificateDesignerCanvas.tsx",
]);

/** Folders whose raw color literals are intentional (server email/PDF/QR generation, api mock endpoints). */
const ALLOWED_DIRECTORIES = ["src/server/", "src/app/api/"];

function isColorExempt(f) {
  return ALLOWED_RAW_COLOR_FILES.has(f) || ALLOWED_DIRECTORIES.some((dir) => f.startsWith(dir));
}

/**
 * Rules: each has
 *   id       – short identifier
 *   pattern  – RegExp tested against each line
 *   message  – human-readable description
 *   skip     – optional fn(relFilePath:string) → bool to exempt a file
 */
const RULES = [
  {
    id: "hex-literal",
    pattern: /#[0-9a-fA-F]{3,8}\b/,
    message: "Hardcoded hex color literal",
    skip: (f) => isColorExempt(f),
  },
  {
    id: "rgb-literal",
    // Allow rgb() only in server-side PDF/email files (they use pdf-lib / react-email inline styles)
    pattern: /\brgba?\s*\(/,
    message: "Hardcoded rgb()/rgba() color literal",
    skip: (f) => isColorExempt(f) || f.startsWith("src/server/") || f.startsWith("src/lib/"),
  },
  {
    id: "hsl-literal",
    pattern: /\bhsl\s*\(/,
    message: "Hardcoded hsl() color literal",
    skip: (f) => isColorExempt(f),
  },
  {
    id: "oklch-literal",
    pattern: /\boklch\s*\(/,
    message: "Hardcoded oklch() color literal",
    skip: (f) => isColorExempt(f),
  },
  {
    id: "tw-palette",
    pattern:
      /\b(slate|gray|zinc|cyan|blue|purple|pink|indigo|emerald|green|amber|red|rose|orange|yellow|lime|teal|sky|violet|fuchsia|neutral|stone)-(50|100|200|300|400|500|600|700|800|900|950)\b/,
    message: "Forbidden Tailwind palette utility (use semantic tokens instead)",
    skip: (f) => isColorExempt(f),
  },
  {
    id: "bg-gradient",
    pattern: /\bbg-gradient\b/,
    message: "bg-gradient utility is forbidden (no gradients)",
  },
  {
    id: "gradient-text",
    pattern: /\bgradient-text\b/,
    message: "gradient-text is forbidden (no gradient text)",
  },
  {
    id: "tw-gradient-stop",
    pattern:
      /\b(from|via|to)-(black|white|transparent|current|inherit|[a-z]+-[0-9]{2,3}|\[#[0-9a-fA-F]+\]|[0-9]{1,3}%)/,
    message: "Tailwind gradient stop (from-/via-/to-) is forbidden",
  },
  {
    id: "blur-3xl",
    pattern: /\bblur-3xl\b/,
    message: "blur-3xl blob is forbidden",
  },
  {
    id: "hover-scale",
    pattern: /\bhover:scale-/,
    message: "hover:scale-* is forbidden",
  },
  {
    id: "text-sub-12px",
    pattern: /\btext-\[(?:[0-9]|1[01])px\]/,
    message: "Sub-12px arbitrary font size is below minimum text size (12px)",
  },
  {
    id: "sparkles-icon",
    pattern: /\bSparkles\b/,
    message: "Sparkles icon is forbidden (no sparkle/emoji icons in UI)",
    skip: (f) => !f.endsWith(".tsx"),
  },
  {
    id: "prd-label",
    pattern: new RegExp("PRD" + " " + "§"),
    message: '"PRD" + " " + "§" label must not appear in UI source files',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function* walkFiles(dir, exts) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "out"]);
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walkFiles(full, exts);
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      yield full;
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const violations = [];

// If file paths are passed as arguments (e.g. by lint-staged), only scan those files.
const fileArgs = process.argv
  .slice(2)
  .filter(
    (arg) =>
      !arg.startsWith("--") && (arg.endsWith(".ts") || arg.endsWith(".tsx") || arg.endsWith(".css"))
  );

const targetFiles =
  fileArgs.length > 0
    ? fileArgs.map((f) => (isAbsolute(f) ? f : join(REPO_ROOT, f)))
    : Array.from(walkFiles(ROOT, [".ts", ".tsx", ".css"]));

for (const absPath of targetFiles) {
  const relPath = relative(REPO_ROOT, absPath); // e.g. "src/app/page.tsx"
  let content;
  try {
    content = readFileSync(absPath, "utf8");
  } catch {
    continue;
  }
  const lines = content.split("\n");

  for (const rule of RULES) {
    if (rule.skip && rule.skip(relPath)) continue;

    lines.forEach((line, idx) => {
      if (rule.pattern.test(line)) {
        violations.push({
          file: relPath,
          line: idx + 1,
          rule: rule.id,
          message: rule.message,
          snippet: line.trim().slice(0, 120),
        });
      }
    });
  }
}

// ─── Report ──────────────────────────────────────────────────────────────────

if (violations.length === 0) {
  console.log("check:colors — no violations found.");
  process.exit(0);
}

// Group by rule for a clean summary
const byRule = {};
for (const v of violations) {
  (byRule[v.rule] = byRule[v.rule] || []).push(v);
}

process.stderr.write(`\ncheck:colors — ${violations.length} violation(s) found:\n\n`);

for (const [ruleId, items] of Object.entries(byRule)) {
  process.stderr.write(`  [${ruleId}] ${items[0].message} — ${items.length} occurrence(s)\n`);
  for (const v of items) {
    process.stderr.write(`    ${v.file}:${v.line}\n`);
    process.stderr.write(`      ${v.snippet}\n`);
  }
  process.stderr.write("\n");
}

const fileCount = new Set(violations.map((v) => v.file)).size;
process.stderr.write(`Total: ${violations.length} violation(s) across ${fileCount} file(s).\n`);
process.stderr.write(
  "\nFix all violations before committing. See docs/DESIGN_SYSTEM.md for design system guidelines.\n\n"
);

process.exit(1);
