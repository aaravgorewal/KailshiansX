"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormCheckbox } from "@/components/forms/FormCheckbox";
import { FormRadioGroup } from "@/components/forms/FormRadioGroup";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCounter } from "@/components/ui/StatCounter";
import { FilterChips } from "@/components/ui/FilterChips";
import { Pagination } from "@/components/ui/Pagination";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton, TextSkeleton } from "@/components/ui/Skeleton";
import { TestimonialCarousel } from "@/components/ui/TestimonialCarousel";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";

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
    textClass: "text-card-foreground",
    borderClass: "border-border",
    desc: "Surface containers, dialogs, cards",
  },
  {
    name: "--card-foreground",
    cssClass: "bg-card-foreground",
    textClass: "text-card",
    borderClass: "border-transparent",
    desc: "Card foreground text",
  },
  {
    name: "--muted",
    cssClass: "bg-muted",
    textClass: "text-foreground",
    borderClass: "border-border",
    desc: "Secondary regions, inputs, tabs",
  },
  {
    name: "--muted-foreground",
    cssClass: "bg-muted-foreground",
    textClass: "text-background",
    borderClass: "border-transparent",
    desc: "Muted subtitles and captions",
  },
  {
    name: "--border",
    cssClass: "bg-border",
    textClass: "text-foreground",
    borderClass: "border-border",
    desc: "Component borders and dividers",
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
    desc: "Solid actions and brand highlights",
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
    desc: "High contrast standalone links & highlights",
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
    desc: "Positive and verified states",
  },
  {
    name: "--destructive",
    cssClass: "bg-destructive",
    textClass: "text-background",
    borderClass: "border-transparent",
    desc: "Errors, destructive actions and alerts",
  },
];

const DEMO_TESTIMONIALS = [
  {
    id: 1,
    quote:
      "KailshiansX helped our university team launch an open-source tool with mentorship and sponsorship.",
    author: "Priya Sharma",
    role: "Campus Ambassador",
    company: "IIT Delhi",
    rating: 5,
    eventTitle: "Hackathon Series #3",
  },
  {
    id: 2,
    quote:
      "The clean architecture masterclasses gave our junior engineers immediate confidence in modern cloud setups.",
    author: "Rohan Verma",
    role: "Engineering Manager",
    company: "Zeta Scale",
    rating: 5,
    eventTitle: "Workshop",
  },
];

const DEMO_FAQS = [
  {
    id: "q1",
    question: "How do I claim my verified certificate?",
    answer:
      "Certificates are automatically generated upon confirmed check-in and are verifiable cryptographically at /verify.",
  },
  {
    id: "q2",
    question: "Can colleges host localized workshop chapters?",
    answer:
      "Yes, campus leads can request an official workshop package with speaker matching and badge credentials.",
  },
];

export function ThemePreviewClient() {
  const [selectedChip, setSelectedChip] = React.useState("ALL");
  const [currentPage, setCurrentPage] = React.useState(2);
  const [radioVal, setRadioVal] = React.useState("standard");
  const [checkboxVal, setCheckboxVal] = React.useState(true);

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            UI Kit & Tokens Review
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Verifying all shared components, variants, and states in Light and Dark mode.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-xs">Active Theme:</span>
          <ThemeToggle />
        </div>
      </div>

      {/* 1. Tokens */}
      <section>
        <SectionHeader
          align="left"
          title="1. Semantic Design Tokens"
          highlight="Design Tokens"
          description="Flat semantic variables with WCAG AAA foreground-to-background contrast."
        />
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOKENS.map((token) => (
            <div
              key={token.name}
              className="border-border bg-card flex items-center gap-3 rounded-lg border p-3"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md border ${token.borderClass} ${token.cssClass}`}
              >
                <span className={`font-mono text-xs font-bold ${token.textClass}`}>Aa</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground font-mono text-xs font-semibold">{token.name}</p>
                <p className="text-muted-foreground text-xs">{token.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Buttons */}
      <section>
        <SectionHeader
          align="left"
          title="2. Buttons (Primary, Secondary, Ghost)"
          highlight="Buttons"
          description="Only three variants allowed: primary (solid), secondary (outline), ghost (text)."
        />
        <div className="border-border bg-card mt-6 rounded-lg border p-6">
          <div className="space-y-6">
            <div>
              <span className="text-muted-foreground mb-2 block font-mono text-xs tracking-wider uppercase">
                Default States
              </span>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary Solid</Button>
                <Button variant="secondary">Secondary Outline</Button>
                <Button variant="ghost">Ghost Text</Button>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground mb-2 block font-mono text-xs tracking-wider uppercase">
                Sizes
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large Action</Button>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground mb-2 block font-mono text-xs tracking-wider uppercase">
                Disabled & Loading States
              </span>
              <div className="flex flex-wrap gap-3">
                <Button disabled variant="primary">
                  Primary Disabled
                </Button>
                <Button disabled variant="secondary">
                  Secondary Disabled
                </Button>
                <Button disabled variant="ghost">
                  Ghost Disabled
                </Button>
                <Button isLoading variant="primary">
                  Saving Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Badges */}
      <section>
        <SectionHeader
          align="left"
          title="3. Badges (Neutral, Selected, Status)"
          highlight="Badges"
          description="Clean single neutral style, selected variant, and status colors (text-success / text-destructive)."
        />
        <div className="border-border bg-card mt-6 rounded-lg border p-6">
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Neutral Badge</Badge>
            <Badge variant="default" dot>
              With Indicator Dot
            </Badge>
            <Badge variant="selected">Selected Category</Badge>
            <Badge variant="success">Confirmed (Success)</Badge>
            <Badge variant="destructive">Cancelled (Destructive)</Badge>
            <Badge variant="default" removable onRemove={() => {}}>
              Removable Chip
            </Badge>
          </div>
        </div>
      </section>

      {/* 4. Form Inputs */}
      <section>
        <SectionHeader
          align="left"
          title="4. Form Inputs & Error States"
          highlight="Form Inputs"
          description="Default, focus, disabled, and destructive error states with descriptive messages."
        />
        <div className="border-border bg-card mt-6 space-y-6 rounded-lg border p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                Default Input
              </label>
              <FormInput placeholder="Enter username or email" />
            </div>

            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                Disabled Input
              </label>
              <FormInput disabled value="readonly_system_account@kailshians.com" />
            </div>

            <div>
              <label className="text-destructive mb-1.5 block text-sm font-medium">
                Error State (With message below)
              </label>
              <FormInput error defaultValue="invalid-email-string" />
              <p className="text-destructive mt-1.5 text-xs font-medium">
                Please enter a valid developer email address.
              </p>
            </div>

            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                Select Dropdown
              </label>
              <FormSelect
                options={[
                  { value: "delhi", label: "New Delhi / NCR" },
                  { value: "blr", label: "Bengaluru" },
                  { value: "mum", label: "Mumbai" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                Textarea with Count
              </label>
              <FormTextarea
                placeholder="Share your technical background or project idea..."
                showCount
                maxLength={200}
                defaultValue="Building agentic systems with clean architecture."
              />
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-foreground mb-2 block text-sm font-medium">Checkboxes</span>
                <div className="space-y-2">
                  <FormCheckbox
                    label="Send event reminders and RSVP updates"
                    description="Receive ICS calendar invitations for registered workshops."
                    checked={checkboxVal}
                    onChange={(e) => setCheckboxVal(e.target.checked)}
                  />
                  <FormCheckbox
                    disabled
                    label="Campus Lead privileges (Assigned by admins)"
                    description="This role requires verified lead application approval."
                  />
                </div>
              </div>

              <div>
                <span className="text-foreground mb-2 block text-sm font-medium">Radio Group</span>
                <FormRadioGroup
                  name="demo-tier"
                  value={radioVal}
                  onChange={setRadioVal}
                  options={[
                    {
                      value: "standard",
                      label: "Standard Attendee Pass",
                      description: "Access to main track.",
                    },
                    {
                      value: "hacker",
                      label: "Hackathon Participant",
                      description: "Submissions & prize pool eligibility.",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Cards & Containers */}
      <section>
        <SectionHeader
          align="left"
          title="5. Cards & Containers"
          highlight="Cards"
          description="bg-card, 1px border-border, rounded-lg, no shadow. Hover: border color change only."
        />
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>Default surface container for page sections.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground text-sm">
                All cards maintain consistent padding, 1px borders, and flat appearance.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="secondary">
                Action
              </Button>
            </CardFooter>
          </Card>

          <Card interactive>
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>Hover over this card to observe border color shift.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground text-sm">
                No hover:scale or glow shadows; strictly changes border-color to muted-foreground.
              </p>
            </CardContent>
            <CardFooter>
              <span className="text-accent-text text-xs font-semibold">Explore Chapter →</span>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="success">Confirmed</Badge>
                <span className="text-muted-foreground text-xs">₹0.00</span>
              </div>
              <CardTitle className="mt-2">Developer Passport</CardTitle>
              <CardDescription>Verified member credential</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Level 3 Contributor • 8 Events Attended
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="primary" className="w-full">
                View Passport
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* 6. Modals, Dropdowns & Overlays */}
      <section>
        <SectionHeader
          align="left"
          title="6. Modals, Dropdowns & Tabs"
          highlight="Modals"
          description="Overlays use var(--scrim) with bg-card dialogs for crisp readability in both modes."
        />
        <div className="border-border bg-card mt-6 flex flex-wrap items-center gap-4 rounded-lg border p-6">
          {/* Dialog Demo */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Open Accessible Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Workshop Check-in</DialogTitle>
                <DialogDescription>
                  Are you ready to scan attendees for the Next.js 16 Masterclass?
                </DialogDescription>
              </DialogHeader>
              <div className="text-foreground py-2 text-sm">
                Camera access will be initialized. All scans run offline through browser worker.
              </div>
              <DialogFooter>
                <Button variant="secondary">Cancel</Button>
                <Button variant="primary">Launch Scanner</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dropdown Menu Demo */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">Open Dropdown Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Developer Passport (/me)</DropdownMenuItem>
              <DropdownMenuItem>Registered Events</DropdownMenuItem>
              <DropdownMenuItem>Claimed Certificates</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tabs Demo */}
          <div className="w-full pt-4">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
                <TabsTrigger value="speakers">Speakers</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <div className="border-border bg-muted/40 text-foreground rounded-lg border p-4 text-sm">
                  Overview tab active content. Clean flat borders with semantic focus rings.
                </div>
              </TabsContent>
              <TabsContent value="agenda">
                <div className="border-border bg-muted/40 text-foreground rounded-lg border p-4 text-sm">
                  Agenda timeline and talk sessions.
                </div>
              </TabsContent>
              <TabsContent value="speakers">
                <div className="border-border bg-muted/40 text-foreground rounded-lg border p-4 text-sm">
                  Keynote speaker profiles and bio details.
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* 7. Stats, Chips & Pagination */}
      <section>
        <SectionHeader
          align="left"
          title="7. Stats, Filter Chips & Pagination"
          highlight="Pagination"
          description="Plain numerals without gradient glow, accessible chips, and pagination controls."
        />
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCounter
              value={42}
              label="Active Chapters"
              suffix="+"
              description="Across Indian Tier 1 & 2 cities"
            />
            <StatCounter
              value={12500}
              label="Community Builders"
              prefix=""
              description="Verified engineers & ambassadors"
            />
            <StatCounter
              value={98}
              suffix="%"
              label="Verification Rate"
              description="Onchain and QR credentials"
            />
          </div>

          <div className="border-border bg-card rounded-lg border p-4">
            <span className="text-muted-foreground mb-2 block text-xs">Category Filter Chips</span>
            <FilterChips
              selected={selectedChip}
              onChange={setSelectedChip}
              options={[
                { id: "ALL", label: "All Formats", count: 24 },
                { id: "HACK", label: "Hackathons", count: 8 },
                { id: "WORKSHOP", label: "Workshops", count: 11 },
                { id: "MEETUP", label: "Meetups", count: 5 },
              ]}
            />
          </div>

          <div className="border-border bg-card rounded-lg border p-4">
            <span className="text-muted-foreground mb-2 block text-xs">Pagination Bar</span>
            <Pagination currentPage={currentPage} totalPages={8} onPageChange={setCurrentPage} />
          </div>
        </div>
      </section>

      {/* 8. Carousel, Accordion & Skeletons */}
      <section>
        <SectionHeader
          align="left"
          title="8. Testimonials, FAQs & Skeletons"
          highlight="Testimonials"
          description="Accessible carousel respecting reduced motion, accordion, and shimmer-free skeletons."
        />
        <div className="mt-6 space-y-8">
          <TestimonialCarousel testimonials={DEMO_TESTIMONIALS} />

          <FAQAccordion items={DEMO_FAQS} />

          <div className="border-border bg-card space-y-4 rounded-lg border p-6">
            <span className="text-muted-foreground block font-mono text-xs tracking-wider uppercase">
              Skeletons & Empty States
            </span>
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <TextSkeleton lines={3} />
              </div>
              <EmptyState
                title="No registrations found"
                description="You have not signed up for any events in this chapter yet."
                action={{ label: "Browse Events", onClick: () => {} }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
