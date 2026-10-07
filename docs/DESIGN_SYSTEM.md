# KailshiansX Design System & Guardrails

This document defines the canonical visual design language, semantic tokens, component rules, and automated enforcement mechanisms for KailshiansX. Adherence to these guidelines is strictly enforced by automated CI pipelines, Husky pre-commit hooks, and ESLint rules.

---

## 1. Core Philosophy & Principles

- **Clean, Minimal, Flat**: KailshiansX adopts a disciplined, modern developer aesthetic.
- **Single Source of Truth**: All colors are defined exclusively as CSS custom properties in `src/styles/tokens.css` and mapped via Tailwind v4 in `src/app/globals.css`.
- **Zero Raw Literals**: No raw color literals (`#hex`, `rgb()`, `hsl()`, `oklch()`) or Tailwind palette utilities (`slate-*`, `purple-*`, `emerald-*`, etc.) exist anywhere in application UI code.
- **Semantic Pairing**: Every background token has a matching foreground token designed to guarantee WCAG 2.1 AA compliance (> 4.5:1 contrast ratio) in both light and dark modes.
- **Impossible to Regress**: Any attempt to introduce palette colors, arbitrary color brackets, or legacy alias classes fails locally in pre-commit and blocks in CI.

---

## 2. Canonical Semantic Tokens

All UI components must be styled using only the semantic tokens listed below:

| Semantic Class            | Token Property         | Light Mode Value      | Dark Mode Value         | Purpose / Usage                                  |
| ------------------------- | ---------------------- | --------------------- | ----------------------- | ------------------------------------------------ |
| `bg-background`           | `--background`         | `#ffffff`             | `#0b0b0c`               | Primary page & container background              |
| `text-foreground`         | `--foreground`         | `#0a0a0a`             | `#ededed`               | Primary body, title, & content text              |
| `bg-card`                 | `--card`               | `#fafafa`             | `#141416`               | Cards, panels, elevated surfaces                 |
| `text-card-foreground`    | `--card-foreground`    | `#0a0a0a`             | `#ededed`               | Text inside cards and panels                     |
| `bg-muted`                | `--muted`              | `#f4f4f5`             | `#1b1b1e`               | Secondary fills, badge backgrounds, hover states |
| `text-muted-foreground`   | `--muted-foreground`   | `#525252`             | `#9a9aa2`               | Subtitles, helper text, timestamps, labels       |
| `border-border`           | `--border`             | `#e5e5e5`             | `#26262a`               | All borders, dividers, outlines                  |
| `bg-primary`              | `--primary`            | `#1d4ed8`             | `#5b8def`               | Primary action buttons, active tab states        |
| `text-primary-foreground` | `--primary-foreground` | `#ffffff`             | `#0b0b0c`               | Text inside solid primary elements               |
| `text-primary`            | `--primary`            | `#1d4ed8`             | `#5b8def`               | Primary emphasis text, links, active icons       |
| `text-accent-text`        | `--accent-text`        | `#1d4ed8`             | `#8fb0f7`               | Subheadings, category highlights, link hovers    |
| `ring-ring`               | `--ring`               | `#1d4ed8`             | `#5b8def`               | Accessible keyboard focus rings                  |
| `text-success`            | `--success`            | `#166534`             | `#4ade80`               | Positive state text, confirmed metrics           |
| `border-success/30`       | `--success` (30%)      | `rgba(22,101,52,0.3)` | `rgba(74,222,128,0.3)`  | Success container border                         |
| `bg-success/10`           | `--success` (10%)      | `rgba(22,101,52,0.1)` | `rgba(74,222,128,0.1)`  | Success container subtle fill                    |
| `text-destructive`        | `--destructive`        | `#b91c1c`             | `#f87171`               | Danger, error states, cancellations              |
| `border-destructive/30`   | `--destructive` (30%)  | `rgba(185,28,28,0.3)` | `rgba(248,113,113,0.3)` | Error container border                           |
| `bg-destructive/10`       | `--destructive` (10%)  | `rgba(185,28,28,0.1)` | `rgba(248,113,113,0.1)` | Error container subtle fill                      |
| `text-warning`            | `--warning`            | `#b45309`             | `#fbbf24`               | Warning badges, pending reviews                  |

---

## 3. Pairing Rules & Contrast Guarantees

WCAG 2.1 AA mandates a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (18pt+ / 14pt bold). To guarantee compliance across both light and dark themes:

1. **`bg-primary` must ALWAYS pair with `text-primary-foreground`**:
   - In light mode: `#1d4ed8` background with `#ffffff` text yields **7.3:1** ratio.
   - In dark mode: `#5b8def` background with `#0b0b0c` text yields **10.5:1** ratio.
   - _Never_ use `text-white` with `bg-primary` (in dark mode, white on `#5b8def` yields only 3.23:1 and fails).
2. **`bg-card` and `bg-background` must pair with `text-foreground` or `text-muted-foreground`**:
   - In light mode: `#0a0a0a` on `#ffffff` / `#fafafa` yields **19.8:1** ratio.
   - In dark mode: `#ededed` on `#0b0b0c` / `#141416` yields **16.2:1** ratio.
   - _Never_ use `text-white` on card surfaces (in light mode, white on `#fafafa` yields 1.04:1 and is invisible).
3. **No manual `dark:` overrides for theme colors**:
   - Tokens switch values automatically when the root `<html class="dark">` toggle changes.
   - Manual `dark:text-white` or `dark:bg-slate-900` is forbidden.

---

## 4. Component Rules

### Buttons

- Defined in `src/components/ui/Button.tsx`.
- Variants:
  - `primary`: `bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm`
  - `secondary` / `outline`: `border border-border bg-background text-foreground hover:bg-muted`
  - `ghost`: `text-foreground hover:bg-muted`
- Instant focus rings: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.

### Cards & Panels

- Background: `bg-card`
- Border: `border border-border rounded-2xl`
- Shadows: `shadow-sm` or none (no colored or heavy glow shadows).
- Hover effect: border emphasis (`hover:border-border` or subtle contrast), no `hover:scale-*`.

### Badges & Chips

- Defined in `src/components/ui/Badge.tsx`.
- Neutral status: `border-border bg-muted text-muted-foreground`.
- Selected filter: `border-primary bg-muted text-accent-text`.
- Status indicators: `border-border bg-muted text-success` or `border-border bg-muted text-destructive`.

### Navigation Tabs

```tsx
<button
  className={cn(
    "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
    isActive
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  )}
>
  {tab.label}
</button>
```

### Form Inputs

```tsx
<input className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none" />
```

---

## 5. Automated Enforcement & Guardrails

Three layers of automated enforcement ensure zero color regressions:

1. **`scripts/check-colors.mjs`** (Run with `npm run check:colors`):
   - Scans all files in `src/**/*.{ts,tsx,css}`.
   - Flags hex literals, rgb/hsl/oklch literals, Tailwind palette color utilities, gradients, blur blobs, and legacy alias classes.
   - Exits 1 on any violation (blocking in Husky pre-commit via `lint-staged`).
2. **ESLint Custom Rule `kailshiansx-design/no-forbidden-colors`** (in `eslint.config.mjs`):
   - AST-based rule inspecting JSX `className`, `cn(...)`, and `cva(...)`.
   - Errors on forbidden palette classes, arbitrary color brackets (`bg-[#...]`), and legacy classes.
   - Enforced via `npx eslint . --max-warnings=0`.
3. **CI Pipeline (`.github/workflows/ci.yml`)**:
   - Executes `check:colors`, `typecheck`, `eslint --max-warnings=0`, `build`, `test:unit`, and `test:ui` on every push and pull request.

---

## 6. How to Add New Components Safely

Follow this checklist when creating a new component:

1. **Check Tokens**: Use only tokens from the table in Section 2.
2. **Pair Colors**: If you use `bg-primary`, pair with `text-primary-foreground`. If you use cards, use `text-foreground`.
3. **No Gradients or Blur Blobs**: Use flat, clean background fills.
4. **Run Local Verification**:
   ```bash
   npm run check:colors
   npm run typecheck
   npx eslint . --max-warnings=0
   npm run build
   ```
5. **Verify Contrast**: Ensure text passes WCAG AA in both light and dark mode using the Theme Matrix test suite (`npm run test:ui`).
