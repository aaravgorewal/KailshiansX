// src/lib/tokens.ts
// KailshiansX design tokens — single source of truth
// These values mirror the Tailwind config extension in tailwind.config.ts

export const colors = {
  // Brand blue — primary actions, links, interactive states
  brand: {
    50: "#f0f4ff",
    100: "#e0eaff",
    200: "#c2d4ff",
    300: "#93b3ff",
    400: "#6288fe",
    500: "#3d61fc", // ← primary
    600: "#2641f0",
    700: "#1d30d6",
    800: "#1929ac",
    900: "#192888",
    950: "#131853",
  },
  // Accent violet — secondary CTA, tags, highlights
  accent: {
    50: "#f5f0ff",
    100: "#ede3ff",
    200: "#dac9ff",
    300: "#bf9fff",
    400: "#a06aff",
    500: "#8b3dff", // ← accent
    600: "#7c19f5",
    700: "#6a0fd9",
    800: "#5810b5",
    900: "#4a1194",
    950: "#2d0664",
  },
  // Dark neutral (zinc-based) surface system
  surface: {
    950: "#09090b", // ← page bg
    900: "#111113", // ← card bg
    800: "#18181b", // ← elevated card
    700: "#27272a", // ← border
    600: "#3f3f46", // ← muted border
    500: "#52525b", // ← muted text
    400: "#71717a", // ← placeholder
    300: "#a1a1aa", // ← secondary text
    200: "#d4d4d8", // ← primary text dim
    100: "#f4f4f5", // ← primary text bright
    50: "#fafafa", // ← white-ish
  },
} as const;

export const fonts = {
  sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
  mono: ["var(--font-geist-mono)", "Geist Mono", "ui-monospace", "monospace"],
} as const;

export const radius = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  "3xl": "2rem",
  full: "9999px",
} as const;

export const shadows = {
  glow: "0 0 24px 4px rgba(61, 97, 252, 0.20)",
  glowAccent: "0 0 24px 4px rgba(139, 61, 255, 0.20)",
  card: "0 4px 24px 0 rgba(0, 0, 0, 0.40)",
} as const;

export const animation = {
  fadeIn: "fadeIn 0.3s ease-in-out",
  slideDown: "slideDown 0.25s ease-out",
  slideUp: "slideUp 0.25s ease-out",
} as const;
