import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, relative } from "path";

const REPO_ROOT = process.cwd();
const ROOT = join(REPO_ROOT, "src");

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (!["node_modules", ".next", ".git"].includes(e.name)) yield* walk(full);
    } else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) {
      yield full;
    }
  }
}

let changedCount = 0;

for (const abs of walk(ROOT)) {
  const rel = relative(REPO_ROOT, abs);
  if (rel.startsWith("src/server/email/") || rel === "src/components/auth/GoogleIcon.tsx") continue;

  let text = readFileSync(abs, "utf8");
  const orig = text;

  // 1. Sparkles icon removal / replacement
  // If Sparkles is imported from lucide-react, replace Sparkles with Zap
  if (text.includes("Sparkles")) {
    text = text.replace(/\bSparkles\b/g, "Zap");
  }

  // 2. blur-3xl blobs
  // Remove self-closing or empty div with blur-3xl
  text = text.replace(/<div[^>]*\bblur-3xl\b[^>]*\/>/g, "");
  text = text.replace(/<div[^>]*\bblur-3xl\b[^>]*>[\s\S]*?<\/div>/g, "");

  // 3. hover:scale-*
  text = text.replace(/\bhover:scale-[0-9]+\b/g, "");
  text = text.replace(/\bgroup-hover:scale-[0-9]+\b/g, "");

  // 4. text-[10px], text-[11px]
  text = text.replace(/\btext-\[10px\]/g, "text-xs");
  text = text.replace(/\btext-\[11px\]/g, "text-xs");

  // 5. gradient-text
  text = text.replace(/\bgradient-text\b/g, "text-foreground font-semibold");

  // 6. brand-* migrations
  text = text.replace(/\b(bg|border|text)-brand-500\/([0-9]+)\b/g, "$1-primary/$2");
  text = text.replace(/\b(bg|border|text)-brand-600\/([0-9]+)\b/g, "$1-primary-hover/$2");
  text = text.replace(/\b(bg|border|text)-brand-400\/([0-9]+)\b/g, "$1-primary/$2");
  text = text.replace(/\bbg-brand-600\b/g, "bg-primary-hover");
  text = text.replace(/\bbg-brand-500\b/g, "bg-primary");
  text = text.replace(/\bhover:bg-brand-600\b/g, "hover:bg-primary-hover");
  text = text.replace(/\bhover:bg-brand-500\b/g, "hover:bg-primary-hover");
  text = text.replace(/\btext-brand-500\b/g, "text-primary");
  text = text.replace(/\btext-brand-400\b/g, "text-primary");
  text = text.replace(/\btext-brand-300\b/g, "text-primary");
  text = text.replace(/\btext-brand-600\b/g, "text-primary");
  text = text.replace(/\bborder-brand-500\b/g, "border-primary");
  text = text.replace(/\bborder-brand-600\b/g, "border-primary");
  text = text.replace(/\bborder-brand-400\b/g, "border-primary");
  text = text.replace(/\bfocus:border-brand-500\b/g, "focus:border-primary");
  text = text.replace(/\bfocus:ring-brand-500\b/g, "focus:ring-ring");
  text = text.replace(/\bshadow-brand-[0-9a-z\/]+\b/g, "");

  // 7. surface-* migrations
  text = text.replace(/\bbg-surface-950(\/[0-9]+)?\b/g, "bg-background");
  text = text.replace(/\bbg-surface-900(\/[0-9]+)?\b/g, "bg-card");
  text = text.replace(/\bbg-surface-850(\/[0-9]+)?\b/g, "bg-muted");
  text = text.replace(/\bbg-surface-800(\/[0-9]+)?\b/g, "bg-muted");
  text = text.replace(/\bbg-surface-700(\/[0-9]+)?\b/g, "bg-muted");
  text = text.replace(/\bhover:bg-surface-800(\/[0-9]+)?\b/g, "hover:bg-muted");
  text = text.replace(/\bhover:bg-surface-700(\/[0-9]+)?\b/g, "hover:bg-muted");
  text = text.replace(/\bhover:bg-surface-900(\/[0-9]+)?\b/g, "hover:bg-muted");
  text = text.replace(/\bborder-surface-800(\/[0-9]+)?\b/g, "border-border");
  text = text.replace(/\bborder-surface-700(\/[0-9]+)?\b/g, "border-border");
  text = text.replace(/\bborder-surface-600(\/[0-9]+)?\b/g, "border-border");
  text = text.replace(/\bborder-surface-500(\/[0-9]+)?\b/g, "border-border");
  text = text.replace(/\btext-surface-500\b/g, "text-muted-foreground");
  text = text.replace(/\btext-surface-400\b/g, "text-muted-foreground");
  text = text.replace(/\btext-surface-300\b/g, "text-muted-foreground");
  text = text.replace(/\btext-surface-200\b/g, "text-foreground");
  text = text.replace(/\btext-surface-100\b/g, "text-foreground");
  text = text.replace(/\btext-surface-50\b/g, "text-foreground");
  text = text.replace(/\bhover:text-surface-200\b/g, "hover:text-foreground");
  text = text.replace(/\bhover:text-surface-100\b/g, "hover:text-foreground");

  // 8. accent-* migrations
  text = text.replace(/\bbg-accent-500(\/[0-9]+)?\b/g, "bg-primary");
  text = text.replace(/\bbg-accent-600(\/[0-9]+)?\b/g, "bg-primary-hover");
  text = text.replace(/\btext-accent-400\b/g, "text-primary");
  text = text.replace(/\btext-accent-300\b/g, "text-primary");
  text = text.replace(/\bborder-accent-500(\/[0-9]+)?\b/g, "border-primary");

  // 9. Standard Tailwind palettes (emerald, red, amber, purple, blue, zinc, slate, gray)
  // emerald / green -> success
  text = text.replace(/\btext-emerald-400\b/g, "text-success");
  text = text.replace(/\btext-emerald-500\b/g, "text-success");
  text = text.replace(/\btext-green-400\b/g, "text-success");
  text = text.replace(/\btext-green-500\b/g, "text-success");
  text = text.replace(/\bbg-emerald-500\/([0-9]+)\b/g, "bg-success/$1");
  text = text.replace(/\bbg-emerald-950\/([0-9]+)\b/g, "bg-success/10");
  text = text.replace(/\bborder-emerald-500\/([0-9]+)\b/g, "border-success/$1");
  text = text.replace(/\bborder-emerald-800\/([0-9]+)\b/g, "border-success/20");

  // red / rose -> destructive
  text = text.replace(/\btext-red-400\b/g, "text-destructive");
  text = text.replace(/\btext-red-500\b/g, "text-destructive");
  text = text.replace(/\btext-rose-400\b/g, "text-destructive");
  text = text.replace(/\btext-rose-500\b/g, "text-destructive");
  text = text.replace(/\bbg-red-500\/([0-9]+)\b/g, "bg-destructive/$1");
  text = text.replace(/\bbg-red-950\/([0-9]+)\b/g, "bg-destructive/10");
  text = text.replace(/\bborder-red-500\/([0-9]+)\b/g, "border-destructive/$1");
  text = text.replace(/\bborder-red-800\/([0-9]+)\b/g, "border-destructive/20");

  // amber / yellow / orange
  text = text.replace(/\btext-amber-400\b/g, "text-primary");
  text = text.replace(/\btext-amber-500\b/g, "text-primary");
  text = text.replace(/\btext-yellow-400\b/g, "text-primary");
  text = text.replace(/\btext-orange-400\b/g, "text-primary");
  text = text.replace(/\bbg-amber-500\/([0-9]+)\b/g, "bg-primary/10");
  text = text.replace(/\bbg-amber-950\/([0-9]+)\b/g, "bg-muted");
  text = text.replace(/\bborder-amber-500\/([0-9]+)\b/g, "border-border");
  text = text.replace(/\bborder-amber-800\/([0-9]+)\b/g, "border-border");

  // purple / violet / indigo / cyan / sky / blue
  text = text.replace(/\btext-(purple|violet|indigo|cyan|sky|blue)-[3-6]00\b/g, "text-primary");
  text = text.replace(/\bbg-(purple|violet|indigo|cyan|sky|blue)-[5-7]00\b/g, "bg-primary");
  text = text.replace(/\bbg-(purple|violet|indigo|cyan|sky|blue)-[5-7]00\/([0-9]+)\b/g, "bg-primary/$2");
  text = text.replace(/\bborder-(purple|violet|indigo|cyan|sky|blue)-[5-7]00\/([0-9]+)\b/g, "border-primary/$2");

  // zinc / slate / gray
  text = text.replace(/\bbg-(zinc|slate|gray)-950\b/g, "bg-background");
  text = text.replace(/\bbg-(zinc|slate|gray)-900\b/g, "bg-card");
  text = text.replace(/\bbg-(zinc|slate|gray)-800\b/g, "bg-muted");
  text = text.replace(/\bborder-(zinc|slate|gray)-800\b/g, "border-border");
  text = text.replace(/\bborder-(zinc|slate|gray)-700\b/g, "border-border");
  text = text.replace(/\btext-(zinc|slate|gray)-500\b/g, "text-muted-foreground");
  text = text.replace(/\btext-(zinc|slate|gray)-400\b/g, "text-muted-foreground");
  text = text.replace(/\btext-(zinc|slate|gray)-300\b/g, "text-foreground");
  text = text.replace(/\btext-(zinc|slate|gray)-200\b/g, "text-foreground");
  text = text.replace(/\btext-(zinc|slate|gray)-100\b/g, "text-foreground");

  if (text !== orig) {
    writeFileSync(abs, text, "utf8");
    changedCount++;
  }
}

console.log(`Migrated ${changedCount} files.`);
