# KailshiansX Design System & Guardrails

This document defines the canonical visual design language, semantic tokens, typography scale, component library, motion standards, and automated enforcement mechanisms for KailshiansX. Adherence to these guidelines is strictly enforced by automated CI pipelines, Husky pre-commit hooks, and custom ESLint rules.

---

## 1. Core Philosophy & Principles

- **Editorial Minimalist Aesthetic**: KailshiansX adopts a disciplined, content-forward developer platform aesthetic.
- **Single Source of Truth**: All colors are defined exclusively as CSS custom properties in `src/styles/tokens.css` and mapped via Tailwind in `src/app/globals.css`.
- **Zero Raw Literals**: No raw color literals (`#hex`, `rgb()`, `hsl()`, `oklch()`) or Tailwind palette utilities (`slate-*`, `purple-*`, `blue-*`, `emerald-*`, etc.) are permitted in application UI code.
- **Semantic Pairing**: Every background token has a matching foreground token designed to guarantee WCAG 2.1 AA compliance (>= 4.5:1 contrast ratio) across both light and dark modes.
- **Strict Motion Discipline**: Clean, subtle micro-interactions (150ms transitions, 400-500ms reveal once), respecting `prefers-reduced-motion`. No dizzying spinners, particle canvasses, parallax, or floating blur blobs.
- **Impossible to Regress**: Any attempt to introduce palette colors, arbitrary color brackets, or legacy alias classes fails locally in pre-commit and blocks in CI.

---

## 2. Canonical Semantic Tokens

All UI styling must use exclusively the semantic tokens listed below:

| Semantic Utility          | CSS Custom Property    | Light Mode Value      | Dark Mode Value         | Purpose / Usage                                  |
| :------------------------ | :--------------------- | :-------------------- | :---------------------- | :----------------------------------------------- |
| `bg-background`           | `--background`         | `#ffffff`             | `#0b0b0c`               | Primary page & canvas background                 |
| `text-foreground`         | `--foreground`         | `#0a0a0a`             | `#ededed`               | Primary body, headings, & title text             |
| `bg-card`                 | `--card`               | `#fafafa`             | `#141416`               | Cards, panels, elevated surfaces                 |
| `text-card-foreground`    | `--card-foreground`    | `#0a0a0a`             | `#ededed`               | Text inside cards and panels                     |
| `bg-muted`                | `--muted`              | `#f4f4f5`             | `#1b1b1e`               | Secondary fills, badge backgrounds, hover states |
| `text-muted-foreground`   | `--muted-foreground`   | `#525252`             | `#a1a1aa`               | Subtitles, helper text, timestamps, labels       |
| `border-border`           | `--border`             | `#e5e5e5`             | `#26262a`               | All borders, dividers, outlines                  |
| `border-input`            | `--input`              | `#e5e5e5`             | `#2e2e33`               | Form input borders                               |
| `bg-primary`              | `--primary`            | `#2563eb`             | `#70a6ff`               | Primary action buttons, active tab states        |
| `hover:bg-primary-hover`  | `--primary-hover`      | `#1d4ed8`             | `#8dbaff`               | Hover state for primary buttons                  |
| `text-primary-foreground` | `--primary-foreground` | `#ffffff`             | `#0b0b0c`               | High-contrast text on solid primary elements     |
| `text-primary`            | `--primary`            | `#2563eb`             | `#70a6ff`               | Primary link & icon accents                      |
| `text-accent-text`        | `--accent-text`        | `#1d4ed8`             | `#8dbaff`               | Subheadings, high-contrast badges                |
| `ring-ring`               | `--ring`               | `#2563eb`             | `#70a6ff`               | Accessible keyboard focus rings                  |
| `text-success`            | `--success`            | `#166534`             | `#4ade80`               | Positive state text, confirmed metrics           |
| `border-success/30`       | `--success` (30%)      | `rgba(22,101,52,0.3)` | `rgba(74,222,128,0.3)`  | Success container border                         |
| `bg-success/10`           | `--success` (10%)      | `rgba(22,101,52,0.1)` | `rgba(74,222,128,0.1)`  | Success container subtle fill                    |
| `text-destructive`        | `--destructive`        | `#b91c1c`             | `#f87171`               | Danger, error states, cancellations              |
| `border-destructive/30`   | `--destructive` (30%)  | `rgba(185,28,28,0.3)` | `rgba(248,113,113,0.3)` | Error container border                           |
| `bg-destructive/10`       | `--destructive` (10%)  | `rgba(185,28,28,0.1)` | `rgba(248,113,113,0.1)` | Error container subtle fill                      |

### Pairing Rules & Contrast Guarantees

WCAG 2.1 AA mandates a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text.

1. **`bg-primary` must ALWAYS pair with `text-primary-foreground`**:
   - Light mode: `#2563eb` with `#ffffff` text yields **4.56:1** ratio.
   - Dark mode: `#70a6ff` with `#0b0b0c` text yields **9.8:1** ratio.
   - Never use `text-white` with `bg-primary` (fails in dark mode).
2. **`bg-card` and `bg-background` must pair with `text-foreground` or `text-muted-foreground`**:
   - Light mode: `#0a0a0a` on `#ffffff` / `#fafafa` yields **19.8:1** ratio.
   - Dark mode: `#ededed` on `#0b0b0c` / `#141416` yields **16.2:1** ratio.
3. **Badges on Tinted Backgrounds**:
   - For `bg-primary/10`, use `text-primary-hover dark:text-primary` to guarantee >= 4.5:1 ratio against the light tint.
   - For `bg-success/10`, use `text-success` (which is `#166534` in light mode, yielding 6.8:1).
4. **No manual `dark:` overrides for colors**:
   - Design tokens switch automatically with `<html class="dark">`.
   - Never write `dark:text-white` or `dark:bg-black`.

---

## 3. Typography Scale & Hierarchy

All typography uses the system Geist font stack with strict clamp-based scaling:

| Level               | Size / Clamp                       | Weight                 | Tracking   | Line Height       | Usage                                                    |
| :------------------ | :--------------------------------- | :--------------------- | :--------- | :---------------- | :------------------------------------------------------- |
| **Display / Hero**  | `clamp(2.75rem, 8vw, 5.5rem)`      | `font-extrabold` / 800 | `-0.03em`  | `leading-[1.05]`  | Home hero & main brand statements                        |
| **H1 (Page Title)** | `clamp(2rem, 5vw, 3.5rem)`         | `font-bold` / 700      | `-0.025em` | `leading-tight`   | Top-level route headings (`/events`, `/about`)           |
| **H2 (Section)**    | `clamp(1.5rem, 3.5vw, 2.5rem)`     | `font-bold` / 700      | `-0.02em`  | `leading-snug`    | Major page sections and feature blocks                   |
| **H3 (Subhead)**    | `clamp(1.125rem, 2vw, 1.5rem)`     | `font-semibold` / 600  | `-0.015em` | `leading-normal`  | Card titles, modal headers, subsection titles            |
| **H4 / Eyebrow**    | `0.75rem` (12px)                   | `font-mono font-bold`  | `0.05em`   | `leading-none`    | Section categorizers, uppercase metadata tags            |
| **Body Large**      | `1.125rem` (18px)                  | `font-normal` / 400    | `normal`   | `leading-relaxed` | Hero lede paragraphs, editorial quotes                   |
| **Body Regular**    | `1rem` (16px) or `0.875rem` (14px) | `font-normal` / 400    | `normal`   | `leading-relaxed` | Standard content (constrained to `max-w-prose` / `65ch`) |
| **Small / Caption** | `0.75rem` (12px)                   | `font-medium` / 500    | `normal`   | `leading-normal`  | Timestamps, helper text, input labels                    |

---

## 4. Component Standards

All components live in `src/components/ui/` and export through `src/components/ui/index.ts`:

### Button (`src/components/ui/Button.tsx`)

```tsx
import { Button } from "@/components/ui/Button";

<Button variant="primary" size="default">Register Now</Button>
<Button variant="secondary" size="sm">Learn More</Button>
<Button variant="destructive" size="sm">Cancel Registration</Button>
```

- **Variants**: `primary`, `secondary`, `destructive`, `ghost`, `outline`.
- **Keyboard Access**: Focus rings `focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none`.

### Form Controls (`Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Checkbox.tsx`)

```tsx
import { Input, Textarea, Select, Checkbox } from "@/components/ui";

<Input label="Full Name" placeholder="e.g. Priya Sharma" required />
<Textarea label="Why do you want to join?" rows={4} required />
<Select label="T-shirt Size" options={SIZES} />
<Checkbox label="I agree to the code of conduct" />
```

- Every form input includes an explicit `<label htmlFor="...">` and ARIA attributes for full accessibility.

### Badge (`src/components/ui/Badge.tsx`)

```tsx
import { Badge } from "@/components/ui/Badge";

<Badge variant="default">General Admission</Badge>
<Badge variant="success">Confirmed</Badge>
<Badge variant="destructive">Sold Out</Badge>
```

### Layout Primitives (`Section.tsx`, `Row.tsx`, `Reveal.tsx`)

- **`Section`**: Max-width container (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24`).
- **`Row`**: Clean 1px border-divided data item row (replacing heavy cards).
- **`Reveal`**: Viewport-triggered fade-and-rise micro-animation (`opacity` and `translateY(12px)`).

---

## 5. Motion Rules & Accessibility

1. **Duration**: Fast, crisp transitions (150ms for buttons/links, 250ms for dialog overlays, 400-500ms for section reveals).
2. **Easing**: Standard `cubic-bezier(0.16, 1, 0.3, 1)` or CSS `ease-out`.
3. **Scroll Reveal**: Elements reveal once when entering viewport (`motion-safe:animate-in motion-safe:fade-in`).
4. **Reduced Motion**: All animations must respect `prefers-reduced-motion: reduce`. The `globals.css` rule automatically disables transforms and transitions when requested by OS settings:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *,
     ::before,
     ::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```
5. **Prohibited Motion Patterns**:
   - No continuous infinite rotating elements or glowing borders.
   - No smooth-scroll interceptors hijacking native trackpad velocity.
   - No hover scale zooms (`hover:scale-105`).

---

## 6. How to Add a Page Without Breaking the Rules

Follow this step-by-step checklist whenever creating or editing a route:

### Step 1: Create the Server Component

Always create `src/app/<route>/page.tsx` as a Server Component:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title | KailshiansX",
  description: "Descriptive page summary for SEO and social sharing.",
};

export default async function NewPage() {
  // Fetch data on the server
  return <main className="bg-background text-foreground min-h-screen">{/* Content */}</main>;
}
```

### Step 2: Add Route Loading & Error States

Create `loading.tsx` and `error.tsx` in the route directory:

- `loading.tsx`: Render skeleton layout (`TableSkeleton` or `TextSkeleton`) without full-page spinners.
- `error.tsx`: Render accessible error boundary with retry trigger.

### Step 3: Use Only Semantic Tokens

- Background: `bg-background` or `bg-card`.
- Text: `text-foreground` or `text-muted-foreground`.
- Borders: `border-border`.
- Primary CTA: `bg-primary text-primary-foreground hover:bg-primary-hover`.
- Badges: `bg-muted text-muted-foreground border-border` or `bg-primary/10 text-primary-hover dark:text-primary`.

### Step 4: Run Local Guardrail Verification

Before committing, execute the automated verification suite:

```bash
# 1. Color compliance (blocking in pre-commit)
npm run check:colors

# 2. TypeScript typecheck
npm run typecheck

# 3. ESLint with zero warnings & no 'any'
npx eslint . --max-warnings=0

# 4. Production build
npm run build

# 5. UI & Theme Matrix tests (192 combinations)
npm run test:ui
```

### Step 5: Check Automated Lighthouse Scores

Ensure the new route maintains 95+ scores across all four Lighthouse categories:

- Performance >= 95
- Accessibility == 100
- Best Practices == 100
- SEO == 100

---

## 7. Automated Guardrail Infrastructure

| Guardrail              | Tool / Config                                | Trigger                                   | Behavior on Failure                                               |
| :--------------------- | :------------------------------------------- | :---------------------------------------- | :---------------------------------------------------------------- |
| **Color Scanner**      | `scripts/check-colors.mjs`                   | `git commit` (Husky + `lint-staged`) & CI | **Blocks commit & PR**                                            |
| **ESLint Custom Rule** | `eslint.config.mjs` (`no-forbidden-colors`)  | `npx eslint . --max-warnings=0` & CI      | **Blocks commit & PR**                                            |
| **TypeScript Strict**  | `tsconfig.json` (`strict: true`)             | `npm run typecheck` & CI                  | **Blocks build & PR**                                             |
| **UI Matrix Tests**    | `tests/ui/matrix.spec.ts` (Playwright + Axe) | `npm run test:ui` & CI                    | **Fails on <4.5:1 contrast, horizontal overflow, console errors** |
| **Lighthouse CI**      | `.lighthouserc.json` (`@lhci/cli`)           | CI & Local audit                          | **Fails if accessibility, SEO, or best practices < 95%**          |
