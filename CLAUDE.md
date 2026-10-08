You are the lead engineer building KailshiansX, the developer events & community platform of Kailshians Web Services. The full spec is in docs/PRD.md and the design system specification is in docs/DESIGN_SYSTEM.md — treat them as sources of truth.

Product principle: this is NOT a static events site. Every feature should move a person: attendee -> member -> contributor -> lead -> organiser -> mentor/speaker.

Stack: Next.js (App Router) + TypeScript (strict) + Tailwind, PostgreSQL + Prisma, Auth.js (Google + email), Razorpay, Resend for email, S3-compatible storage, deploy on Vercel.

## Core Rules & Guardrails

- Mobile-first, responsive, SEO-friendly (metadata, OG tags, sitemap, JSON-LD for events).
- Server Components by default; Client Components only when needed.
- Validate every input with Zod on client AND server. Add spam protection (honeypot + rate limit + Turnstile/reCAPTCHA) to all public forms.
- Role-based access: SUPER_ADMIN, ADMIN, EVENT_MANAGER, VIEWER (+ CAMPUS_LEAD, STATE_LEAD, MEMBER).
- Non-technical admins must manage everything from the admin UI — no code changes to publish events/content.
- Keep code modular: `/src/app`, `/src/components`, `/src/lib`, `/src/server` (services), `/prisma`.
- Write small, typed, tested functions. Add seed data for every model.
- Production bootstrap (`npm run db:bootstrap`) is strictly seed-free. For development, use `npm run db:seed` and `npm run seed:clear`.

## PRODUCT + UI RULES

- Product: minimal events & community site. Canonical Pages: Home (`/`), Events (`/events`, `/events/[slug]`, `/events/[slug]/register`), Community (`/community`), Gallery (`/gallery`, `/gallery/[albumId]`), About (`/about`), Partner (`/partner`), Sign in (`/signin`), Admin (`/admin`), Legal (`/privacy`, `/terms`, `/refunds`). Do NOT add other pages or features. Prefer deleting UI over adding UI.
- Look: editorial minimal. Big typographic hierarchy, generous whitespace, hairline borders, real photos, ONE accent color. Zero gradients, zero glows/shadows, zero blur blobs, zero emoji/sparkle icons, zero eyebrow badges, zero per-category colors, zero stat counters, zero carousels, zero logo walls, zero "PRD §" labels, zero "Lorem" or "TODO".
- Colors: NEVER hardcode. Only semantic tokens (`bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `border-input`, `bg-primary`, `text-primary-foreground`, `text-primary`, `text-accent-text`, `ring-ring`, `text-success`, `text-destructive`). Never use the `dark:` variant for color.
- Type: one font (Geist). Display up to `clamp(2.75rem, 8vw, 6rem)` weight 600, tracking -0.03em, line-height 1.02. H2 `clamp(1.75rem, 4vw, 3rem)`. Body 17–18px/1.6 in max-w 65ch. Minimum text 12px.
- Layout: 12-col grid, max-w 1200px, section padding py-24 md:py-32, left-aligned, asymmetric layouts welcome. Cards only where a photo is involved; otherwise rows with a 1px divider.
- Motion: opacity + translateY(12px) reveal once on scroll (400–500ms ease-out), link underline slide, button color transitions 150ms. Respect `prefers-reduced-motion`. No parallax, no hover scale, no smooth-scroll libraries.
- Smoothness: every route has loading.tsx skeletons, links prefetch, no layout shift (reserve image/space sizes), optimistic form states, no full-page spinners.
- Accessibility: contrast >= 4.5:1, visible focus, labelled inputs, alt text.
- Do not remove database models or server logic; only remove/redirect UI. Keep lint clean (no `any`, no unused vars).
- Automated CI pipeline: install -> prisma generate -> typecheck -> lint -> check:colors -> build -> unit tests -> test:ui -> Lighthouse CI.
- Blocking hooks: Husky runs `npm run check:colors` and `lint-staged` (`eslint --max-warnings=0`, `prettier --write`, `node scripts/check-colors.mjs`). Never commit with `--no-verify`.
- Local verification commands:
  ```bash
  npm run check:colors
  npm run typecheck
  npx eslint . --max-warnings=0
  npm run build
  npm run test
  npm run test:ui
  npx @lhci/cli autorun
  ```
