"use client";

import * as React from "react";
import {
  Button,
  TextLink,
  Input,
  Textarea,
  Select,
  Checkbox,
  Badge,
  Row,
  Section,
  Reveal,
  Skeleton,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  useToast,
  ThemeToggle,
} from "@/components/ui";

const TOKENS = [
  {
    name: "--background",
    cssClass: "bg-background",
    textClass: "text-foreground",
    borderClass: "border-border",
    desc: "Page root background",
  },
  {
    name: "--foreground",
    cssClass: "bg-foreground",
    textClass: "text-background",
    borderClass: "border-transparent",
    desc: "Default text and headings",
  },
  {
    name: "--card",
    cssClass: "bg-card",
    textClass: "text-foreground",
    borderClass: "border-border",
    desc: "Surface containers, cards",
  },
  {
    name: "--muted",
    cssClass: "bg-muted",
    textClass: "text-foreground",
    borderClass: "border-border",
    desc: "Muted regions, inputs, tabs",
  },
  {
    name: "--muted-foreground",
    cssClass: "bg-muted-foreground",
    textClass: "text-background",
    borderClass: "border-transparent",
    desc: "Captions and secondary copy",
  },
  {
    name: "--border",
    cssClass: "bg-border",
    textClass: "text-foreground",
    borderClass: "border-border",
    desc: "Component borders & 1px dividers",
  },
  {
    name: "--input",
    cssClass: "bg-input",
    textClass: "text-foreground",
    borderClass: "border-border",
    desc: "Form field borders",
  },
  {
    name: "--primary",
    cssClass: "bg-primary",
    textClass: "text-primary-foreground",
    borderClass: "border-transparent",
    desc: "Solid primary action buttons",
  },
  {
    name: "--primary-hover",
    cssClass: "bg-primary-hover",
    textClass: "text-primary-foreground",
    borderClass: "border-transparent",
    desc: "Hover state for primary action",
  },
  {
    name: "--primary-foreground",
    cssClass: "bg-primary-foreground",
    textClass: "text-primary",
    borderClass: "border-border",
    desc: "Text on primary surfaces",
  },
  {
    name: "--accent-text",
    cssClass: "bg-accent-text",
    textClass: "text-background",
    borderClass: "border-transparent",
    desc: "Standalone text links & highlights",
  },
  {
    name: "--ring",
    cssClass: "bg-ring",
    textClass: "text-primary-foreground",
    borderClass: "border-transparent",
    desc: "Instant focus outline ring",
  },
  {
    name: "--success",
    cssClass: "bg-success",
    textClass: "text-background",
    borderClass: "border-transparent",
    desc: "Verified and success states",
  },
  {
    name: "--destructive",
    cssClass: "bg-destructive",
    textClass: "text-background",
    borderClass: "border-transparent",
    desc: "Errors, destructive actions",
  },
  {
    name: "--scrim",
    cssClass: "bg-[var(--scrim)]",
    textClass: "text-foreground",
    borderClass: "border-border",
    desc: "Backdrop overlays",
  },
];

export function ThemePreviewClient() {
  const { toast } = useToast();
  const [btnLoading, setBtnLoading] = React.useState(false);
  const [checkboxState, setCheckboxState] = React.useState(true);

  return (
    <div className="bg-background text-foreground min-h-screen py-12">
      <Section size="default" className="space-y-16">
        {/* Top Header */}
        <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
          <div>
            <span className="eyebrow-free text-muted-foreground mb-1 block font-mono text-xs">
              Internal Development Sandbox
            </span>
            <h1 className="display">Design Tokens & Foundation</h1>
            <p className="body-lg mt-2 max-w-2xl">
              Canonical design tokens, typography scales, and base components in both light and dark
              themes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs">Theme:</span>
            <ThemeToggle />
          </div>
        </div>

        {/* 1. Design Tokens */}
        <section className="space-y-6">
          <div>
            <h2 className="h2">1. Design Tokens</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Color tokens defined in tokens.css and mapped via Tailwind @theme.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {TOKENS.map((token) => (
              <div
                key={token.name}
                className="border-border bg-card flex items-center gap-3 rounded-lg border p-3"
              >
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded border font-mono text-xs font-bold ${token.borderClass} ${token.cssClass}`}
                >
                  <span className={token.textClass}>Aa</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate font-mono text-xs font-semibold">
                    {token.name}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">{token.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Typography Utilities */}
        <section className="space-y-6">
          <div>
            <h2 className="h2">2. Typography Utilities</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Geist font with system-ui fallback. Defined classes: .display, .h2, .h3, .body-lg,
              .eyebrow-free.
            </p>
          </div>
          <div className="border-border bg-card space-y-6 rounded-lg border p-6">
            <div>
              <span className="text-muted-foreground mb-1 block font-mono text-xs">.display</span>
              <div className="display">Display Heading Scale</div>
            </div>
            <div>
              <span className="text-muted-foreground mb-1 block font-mono text-xs">.h2</span>
              <div className="h2">Heading 2 Component Scale</div>
            </div>
            <div>
              <span className="text-muted-foreground mb-1 block font-mono text-xs">.h3</span>
              <div className="h3">Heading 3 Section Scale</div>
            </div>
            <div>
              <span className="text-muted-foreground mb-1 block font-mono text-xs">.body-lg</span>
              <p className="body-lg">
                Body large copy for lead paragraphs and editorial descriptions, rendering
                comfortably with relaxed line-height.
              </p>
            </div>
            <div>
              <span className="text-muted-foreground mb-1 block font-mono text-xs">
                .eyebrow-free
              </span>
              <p className="eyebrow-free text-muted-foreground text-sm">
                Neutral, unadorned subtitle text without decorative badges or fake eyebrow styles.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Buttons */}
        <section className="space-y-6">
          <div>
            <h2 className="h2">3. Button (primary, secondary, ghost)</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Sizes sm/md/lg, loading states, instant focus ring.
            </p>
          </div>
          <div className="border-border bg-card space-y-6 rounded-lg border p-6">
            <div>
              <p className="text-muted-foreground mb-3 font-mono text-xs">
                Variants (primary, secondary, ghost)
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="ghost">Ghost Action</Button>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-3 font-mono text-xs">Sizes (sm, md, lg)</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small (sm)</Button>
                <Button size="md">Medium (md)</Button>
                <Button size="lg">Large (lg)</Button>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-3 font-mono text-xs">
                Loading & Disabled States
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  isLoading={btnLoading}
                  onClick={() => {
                    setBtnLoading(true);
                    setTimeout(() => setBtnLoading(false), 2000);
                  }}
                >
                  {btnLoading ? "Processing" : "Test Loading State"}
                </Button>
                <Button disabled variant="primary">
                  Disabled Primary
                </Button>
                <Button disabled variant="secondary">
                  Disabled Secondary
                </Button>
                <Button disabled variant="ghost">
                  Disabled Ghost
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. TextLink */}
        <section className="space-y-6">
          <div>
            <h2 className="h2">4. TextLink</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Inline link component with animated underline.
            </p>
          </div>
          <div className="border-border bg-card space-y-4 rounded-lg border p-6">
            <p className="text-foreground text-sm">
              Explore our platform events on the{" "}
              <TextLink href="/events">Events Directory</TextLink> or read about community
              guidelines in the{" "}
              <TextLink href="https://github.com" external>
                Developer Handbook (External)
              </TextLink>
              . Hover or focus to inspect the animated underline.
            </p>
          </div>
        </section>

        {/* 5. Form Fields (Input, Textarea, Select, Checkbox) */}
        <section className="space-y-6">
          <div>
            <h2 className="h2">5. Form Components</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Input, Textarea, Select, Checkbox with accessible labels, hints, and inline error
              states.
            </p>
          </div>
          <div className="border-border bg-card space-y-6 rounded-lg border p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                label="Full Name"
                placeholder="Aarav Saini"
                hint="Your legal or preferred builder name."
              />
              <Input
                label="Email Address (Error State)"
                defaultValue="invalid-email-format"
                error="Please enter a valid email address."
              />
              <Select
                label="Event Track"
                options={[
                  { value: "ai", label: "AI Systems & Agents" },
                  { value: "fullstack", label: "Fullstack Architecture" },
                  { value: "cloud", label: "Cloud & Distributed Systems" },
                ]}
                hint="Select your primary domain track."
              />
              <Select
                label="T-Shirt Size (Error State)"
                placeholder="Choose size"
                options={[
                  { value: "m", label: "Medium (M)" },
                  { value: "l", label: "Large (L)" },
                ]}
                error="Please select a t-shirt size for hackathon swag."
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Textarea
                label="Project Description"
                placeholder="Describe what you plan to build..."
                hint="Max 300 characters."
              />
              <Textarea
                label="Short Bio (Error State)"
                defaultValue="Too short"
                error="Bio must be at least 20 characters."
              />
            </div>
            <div className="space-y-3 pt-2">
              <Checkbox
                label="Accept Community Code of Conduct"
                description="Harassment-free, developer-first peer standards."
                checked={checkboxState}
                onChange={(e) => setCheckboxState(e.target.checked)}
              />
              <Checkbox
                label="Terms of Service (Error State)"
                description="Required before submitting workshop project."
                error="You must agree to the Terms of Service to continue."
              />
            </div>
          </div>
        </section>

        {/* 6. Badges & Rows */}
        <section className="space-y-6">
          <div>
            <h2 className="h2">6. Badge & Row</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Single neutral badge style and list rows with 1px dividers.
            </p>
          </div>
          <div className="border-border bg-card space-y-6 rounded-lg border p-6">
            <div>
              <p className="text-muted-foreground mb-3 font-mono text-xs">
                Badge (Single Neutral Style)
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge>Neutral Default</Badge>
                <Badge dot>With Dot</Badge>
                <Badge removable onRemove={() => toast({ title: "Badge removed" })}>
                  Removable Tag
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-3 font-mono text-xs">
                Row (List rows with 1px divider)
              </p>
              <div className="border-border border-t">
                <Row interactive>
                  <span className="text-sm font-medium">PadharoX Jaipur 2026</span>
                  <Badge>Upcoming</Badge>
                </Row>
                <Row interactive>
                  <span className="text-sm font-medium">NirmanX Hackathon Edition</span>
                  <Badge>Registration Open</Badge>
                </Row>
                <Row interactive>
                  <span className="text-sm font-medium">Distributed Systems Tech Talk</span>
                  <Badge>Verified</Badge>
                </Row>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Reveal & Skeleton */}
        <section className="space-y-6">
          <div>
            <h2 className="h2">7. Reveal & Skeleton</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              IntersectionObserver fade-up once (prefers-reduced-motion disabled) and shimmer-free
              neutral skeleton.
            </p>
          </div>
          <div className="border-border bg-card space-y-6 rounded-lg border p-6">
            <Reveal>
              <div className="border-border bg-muted/40 rounded-lg border p-4">
                <p className="text-sm font-medium">Reveal Component</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Triggered once when scrolled into view. Automatically disabled when
                  prefers-reduced-motion is active.
                </p>
              </div>
            </Reveal>
            <div className="space-y-3">
              <p className="text-muted-foreground font-mono text-xs">Skeleton Placeholders</p>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </section>

        {/* 8. Dialog & Toast */}
        <section className="space-y-6">
          <div>
            <h2 className="h2">8. Dialog & Toast</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Accessible modal dialog and toast notifications.
            </p>
          </div>
          <div className="border-border bg-card flex flex-wrap gap-4 rounded-lg border p-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Open Modal Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Registration</DialogTitle>
                  <DialogDescription>
                    You are confirming attendance for the Next.js masterclass.
                  </DialogDescription>
                </DialogHeader>
                <p className="text-foreground py-2 text-sm">
                  All confirmation passes are saved cryptographically and can be accessed offline.
                </p>
                <DialogFooter>
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="primary">Confirm RSVP</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="secondary"
              onClick={() => {
                toast({
                  title: "Action Recorded",
                  description: "Design system tokens and components verified.",
                });
              }}
            >
              Trigger Toast Notification
            </Button>
          </div>
        </section>

        {/* Both Themes Side-by-Side Comparison */}
        <section className="space-y-6">
          <div>
            <h2 className="h2">9. Dual Theme Comparison (Light vs Dark)</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Side-by-side rendering guaranteeing instant visual parity in both color schemes.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Forced Light */}
            <div className="border-border bg-card text-foreground rounded-lg border p-6">
              <span className="text-muted-foreground mb-2 block font-mono text-xs">
                LIGHT / SYSTEM VIEW
              </span>
              <h3 className="h3">KailshiansX Light Surface</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Standard background, card surface, and border tokens.
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="primary" size="sm">
                  Primary Action
                </Button>
                <Button variant="secondary" size="sm">
                  Secondary Action
                </Button>
              </div>
            </div>

            {/* Forced Dark */}
            <div className="dark border-border bg-card text-foreground rounded-lg border p-6">
              <span className="text-muted-foreground mb-2 block font-mono text-xs">
                DARK THEME VIEW
              </span>
              <h3 className="h3">KailshiansX Dark Surface</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Dark mode variables mapped to --background, --card, --border.
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="primary" size="sm">
                  Primary Action
                </Button>
                <Button variant="secondary" size="sm">
                  Secondary Action
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Section>
    </div>
  );
}
