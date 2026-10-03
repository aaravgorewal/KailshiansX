"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sparkles,
  ArrowRight,
  Code,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Calendar,
  Search,
  User,
  Mail,
  Lock,
  RefreshCw,
  SlidersHorizontal,
  Flame,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard } from "@/components/ui/EventCard";
import { SeriesCard } from "@/components/ui/SeriesCard";
import { SpeakerCard } from "@/components/ui/SpeakerCard";
import { PartnerLogoGrid } from "@/components/ui/PartnerLogoGrid";
import { StatCounter } from "@/components/ui/StatCounter";
import { TestimonialCarousel } from "@/components/ui/TestimonialCarousel";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadioGroup,
} from "@/components/ui/FormField";
import { toast } from "@/components/ui/useToast";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  EventCardSkeleton,
  SpeakerCardSkeleton,
  SeriesCardSkeleton,
  TableSkeleton,
  TextSkeleton,
} from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { FilterChips } from "@/components/ui/FilterChips";

const SAMPLE_MEETUP_DATE = new Date("2026-10-15T18:30:00Z");
const SAMPLE_LIVE_DATE = new Date("2026-10-03T09:00:00Z");
const SAMPLE_WORKSHOP_DATE = new Date("2026-10-22T14:00:00Z");
const SAMPLE_TECHTALK_DATE = new Date("2026-09-20T17:00:00Z");

// Zod schema for the interactive form demo
const formDemoSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  track: z.string().min(1, "Please select an event track."),
  role: z.enum(["ATTENDEE", "SPEAKER", "VOLUNTEER"], {
    message: "Please select your community role.",
  }),
  bio: z.string().max(200, "Bio cannot exceed 200 characters.").optional(),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Code of Conduct.",
  }),
});

type FormDemoValues = z.infer<typeof formDemoSchema>;

export default function ComponentsPreviewPage() {
  // Demo states
  const [btnLoading, setBtnLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("buttons");
  const [counterKey, setCounterKey] = React.useState(0);
  const [showSkeletonDemo, setShowSkeletonDemo] = React.useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);

  // Filter chips state
  const [singleFilter, setSingleFilter] = React.useState("ALL");
  const [multiFilter, setMultiFilter] = React.useState<string[]>(["web3"]);

  // Form setup
  const form = useForm<FormDemoValues>({
    resolver: zodResolver(formDemoSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      track: "",
      role: "ATTENDEE",
      bio: "",
      agreeTerms: false,
    },
  });

  const onFormSubmit = (data: FormDemoValues) => {
    toast({
      variant: "success",
      title: "Registration Validated!",
      description: `Welcome aboard, ${data.fullName}! Form data confirmed with Zod.`,
    });
  };

  const navSections = [
    { id: "buttons", label: "Buttons & Badges" },
    { id: "cards", label: "Cards & Headers" },
    { id: "domain", label: "Event, Series & Speaker Cards" },
    { id: "partners", label: "Partner Logos" },
    { id: "stats", label: "Animated Stat Counters" },
    { id: "carousel", label: "Testimonials" },
    { id: "accordion", label: "FAQ Accordion" },
    { id: "forms", label: "Forms & Zod Validation" },
    { id: "toasts", label: "Toasts" },
    { id: "empty", label: "Empty States" },
    { id: "skeletons", label: "Skeletons" },
    { id: "navigation", label: "Pagination & Filter Chips" },
  ];

  return (
    <div className="bg-surface-950 min-h-screen pb-24">
      {/* Hero Header */}
      <div className="border-surface-800 bg-surface-900/60 relative border-b pt-10 pb-8 backdrop-blur-md">
        <div className="container-page">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="brand" dot size="sm">
                  Design System Kit v1.0
                </Badge>
                <Badge variant="accent" size="sm">
                  18 Components
                </Badge>
                <Badge variant="outline" size="sm">
                  Accessible • WCAG 2.1 AA
                </Badge>
              </div>
              <h1 className="text-surface-50 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                UI Kit <span className="gradient-text">Component Lab</span>
              </h1>
              <p className="text-surface-400 mt-2 max-w-2xl text-sm leading-relaxed sm:text-base">
                Developer-community-first component collection designed for KailshiansX. Engineered
                with strict TypeScript, keyboard navigation, full ARIA roles, and responsive mobile
                patterns.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Code className="size-4" />}
                onClick={() => {
                  toast({
                    title: "Ready for Production",
                    description: "All components exported from @/components/ui",
                  });
                }}
              >
                Docs
              </Button>
              <Button
                variant="accent"
                size="sm"
                rightIcon={<Sparkles className="size-4" />}
                onClick={() => {
                  setBtnLoading(true);
                  setTimeout(() => setBtnLoading(false), 2000);
                  toast({
                    variant: "info",
                    title: "Interactive Demo Active",
                    description: "Try clicking triggers and submitting the live form below!",
                  });
                }}
              >
                Interactive Mode
              </Button>
            </div>
          </div>

          {/* Sticky Navigation Pills */}
          <div className="mt-8 flex scrollbar-none items-center gap-2 overflow-x-auto pb-1">
            {navSections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setActiveTab(sec.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === sec.id
                    ? "bg-brand-600 font-semibold text-white shadow-sm"
                    : "bg-surface-800/80 text-surface-300 hover:bg-surface-700 hover:text-white"
                }`}
              >
                {sec.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page space-y-20 py-12">
        {/* ─── 1. BUTTONS & BADGES ────────────────────────────────────────── */}
        <section id="buttons" className="scroll-mt-24 space-y-8">
          <SectionHeader
            badge="Primitives"
            title="Buttons & Badges"
            highlight="Badges"
            description="Polished interactive controls with tactile states, subtle glows, and accessible screen-reader indicators."
            align="left"
          />

          {/* Buttons showcase */}
          <Card>
            <CardHeader>
              <CardTitle>Button Variants & States</CardTitle>
              <CardDescription>
                Primary, secondary, accent gradient, outline, ghost, destructive, and link styles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Variants */}
              <div>
                <h4 className="text-surface-400 mb-3 font-mono text-xs tracking-wider uppercase">
                  Variants
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="default">Primary Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="accent" leftIcon={<Sparkles className="size-4" />}>
                    Accent Gradient
                  </Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link Button</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-surface-400 mb-3 font-mono text-xs tracking-wider uppercase">
                  Sizes
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="xs">Extra Small (xs)</Button>
                  <Button size="sm">Small (sm)</Button>
                  <Button size="default">Default (md)</Button>
                  <Button size="lg" rightIcon={<ArrowRight className="size-4" />}>
                    Large (lg)
                  </Button>
                  <Button size="icon" aria-label="Icon only button">
                    <Flame className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Loading & Interactive state */}
              <div>
                <h4 className="text-surface-400 mb-3 font-mono text-xs tracking-wider uppercase">
                  Loading & Interactive States
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    isLoading={btnLoading}
                    onClick={() => {
                      setBtnLoading(true);
                      setTimeout(() => setBtnLoading(false), 2500);
                    }}
                  >
                    {btnLoading ? "Processing..." : "Click to Test Loading"}
                  </Button>
                  <Button disabled>Disabled Button</Button>
                  <Button
                    variant="outline"
                    leftIcon={<RefreshCw className="size-4" />}
                    onClick={() => {
                      toast({ title: "Refreshed component state" });
                    }}
                  >
                    With Left Icon
                  </Button>
                  <Button variant="secondary" rightIcon={<ArrowRight className="size-4" />}>
                    With Right Icon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges showcase */}
          <Card>
            <CardHeader>
              <CardTitle>Badge System</CardTitle>
              <CardDescription>
                Pill badges with pulsing live indicators, semantic statuses, and removable tags.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-surface-400 mb-3 font-mono text-xs tracking-wider uppercase">
                  Color Variants
                </h4>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="brand">Brand Blue</Badge>
                  <Badge variant="accent">Accent Violet</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="gradient">Gradient Special</Badge>
                  <Badge variant="surface">Surface</Badge>
                </div>
              </div>

              <div>
                <h4 className="text-surface-400 mb-3 font-mono text-xs tracking-wider uppercase">
                  Live Dots & Sizes
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="destructive" dot dotPulse size="sm">
                    LIVE STREAM
                  </Badge>
                  <Badge variant="success" dot size="sm">
                    Registration Open
                  </Badge>
                  <Badge variant="brand" dot size="default">
                    Active Meetup
                  </Badge>
                  <Badge variant="accent" dot dotPulse size="lg">
                    Hackathon In Progress
                  </Badge>
                  <Badge
                    variant="brand"
                    removable
                    onRemove={() => toast({ title: "Badge removed", variant: "info" })}
                  >
                    Removable Tag
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ─── 2. CARDS & SECTION HEADERS ─────────────────────────────────── */}
        <section id="cards" className="scroll-mt-24 space-y-8">
          <SectionHeader
            badge="Layout & Surface"
            title="Card & Section Header"
            highlight="Section Header"
            description="Versatile cards with glowing hover states, clean contrast, and modular composition."
            align="left"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card variant="default">
              <CardHeader>
                <Badge variant="brand" size="sm" className="mb-1 w-fit">
                  Default Surface
                </Badge>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>
                  Subtle border, standard background with clean typography.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-surface-400 text-xs">
                  Ideal for standard listings, secondary information, and content blocks.
                </p>
              </CardContent>
              <CardFooter className="text-surface-400 justify-between text-xs">
                <span>Updated today</span>
                <Button size="xs" variant="ghost">
                  Learn More
                </Button>
              </CardFooter>
            </Card>

            <Card variant="glow" interactive>
              <CardHeader>
                <Badge variant="brand" size="sm" className="mb-1 w-fit">
                  Glow on Hover
                </Badge>
                <CardTitle>Interactive Brand Glow</CardTitle>
                <CardDescription>
                  Hover this card to see the neon brand blue glow and micro-elevation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-surface-400 text-xs">
                  Perfect for featured workshops, flagship events, and call-to-action blocks.
                </p>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-brand-400 font-mono text-xs">interactive=true</span>
                <Button size="xs">Explore</Button>
              </CardFooter>
            </Card>

            <Card variant="accentGlow" interactive>
              <CardHeader>
                <Badge variant="accent" size="sm" className="mb-1 w-fit">
                  Violet Glow
                </Badge>
                <CardTitle>Accent Glow Card</CardTitle>
                <CardDescription>
                  Violet lighting tuned for hackathons and special community series.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-surface-400 text-xs">
                  Accented with violet diffuse highlights and glassmorphic depth.
                </p>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-accent-400 font-mono text-xs">accentGlow</span>
                <Button size="xs" variant="accent">
                  Register
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* ─── 3. DOMAIN CARDS ────────────────────────────────────────────── */}
        <section id="domain" className="scroll-mt-24 space-y-8">
          <SectionHeader
            badge="Event & Community"
            title="Event, Series & Speaker Cards"
            highlight="Speaker Cards"
            description="Domain-specific rich cards featuring event formats, meetup series, and speaker spotlights."
            align="left"
          />

          {/* Event Cards Grid */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-surface-100 text-xl font-bold">EventCard Examples</h3>
              <Badge variant="brand" size="sm">
                4 Event Types Shown
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <EventCard
                title="PadharoX Jaipur 2026: The AI Systems Meetup"
                slug="padharox-jaipur-2026"
                type="MEETUP"
                status="UPCOMING"
                startDate={SAMPLE_MEETUP_DATE}
                venue="JECC Auditorium"
                city="Jaipur, Rajasthan"
                isFree={true}
                attendeeCount={240}
                speakerCount={4}
                tags={["AI", "LLMs", "Systems"]}
                onRegister={() => toast({ title: "Registration opened for PadharoX" })}
              />

              <EventCard
                title="NirmanX Hackathon 2026: 36h Build-a-thon"
                slug="nirmanx-hackathon-2026"
                type="HACKATHON"
                status="LIVE"
                startDate={SAMPLE_LIVE_DATE}
                venue="Tech Park Campus"
                city="Bengaluru, Karnataka"
                isFree={false}
                price={499}
                attendeeCount={500}
                speakerCount={8}
                tags={["Hackathon", "Web3", "NextJS"]}
                onRegister={() => toast({ title: "Redirecting to Hackathon portal" })}
              />

              <EventCard
                title="Hands-on Rust & Distributed Systems Masterclass"
                slug="rust-masterclass-2026"
                type="WORKSHOP"
                status="UPCOMING"
                startDate={SAMPLE_WORKSHOP_DATE}
                venue="KWS Virtual Studio"
                city="Online"
                isFree={true}
                attendeeCount={320}
                speakerCount={2}
                tags={["Rust", "Distributed", "Backend"]}
              />

              <EventCard
                title="Scale to 10M Requests: Architecture Deep Dive"
                slug="scale-architecture-techtalk"
                type="TECH_TALK"
                status="COMPLETED"
                startDate={SAMPLE_TECHTALK_DATE}
                venue="Innov8 Coworking"
                city="New Delhi"
                isFree={true}
                attendeeCount={180}
                speakerCount={1}
                tags={["Cloud", "Architecture"]}
              />
            </div>
          </div>

          {/* Series Cards */}
          <div className="pt-4">
            <h3 className="text-surface-100 mb-4 text-xl font-bold">SeriesCard Examples</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <SeriesCard
                name="PadharoX"
                kind="MEETUP"
                tagline="Rajasthan's Premier Tech Meetup Series"
                description="Bringing together top software architects, campus leaders, and builders across Jaipur, Jodhpur, and Udaipur."
                editionsCount={8}
                citiesCount={4}
                cities={["Jaipur", "Jodhpur", "Udaipur", "Kota"]}
                attendeesCount={1400}
                badgeText="Flagship"
              />

              <SeriesCard
                name="NirmanX"
                kind="HACKATHON"
                tagline="National Collegiate Hackathon Circuit"
                description="36-hour intense hackathons powering real-world prototypes with enterprise API tracks and seed grants."
                editionsCount={4}
                citiesCount={6}
                cities={["Bengaluru", "Delhi NCR", "Pune", "Chandigarh"]}
                attendeesCount={3200}
                badgeText="Prize Pool ₹10L"
              />

              <SeriesCard
                name="RaibarX"
                kind="MEETUP"
                tagline="Himalayan Developer Community Connect"
                description="Empowering engineering talent in Uttarakhand and Himachal Pradesh with mentorship and industry tech talks."
                editionsCount={3}
                citiesCount={3}
                cities={["Dehradun", "Shimla", "Haridwar"]}
                attendeesCount={650}
                badgeText="Regional"
              />
            </div>
          </div>

          {/* Speaker Cards */}
          <div className="pt-4">
            <h3 className="text-surface-100 mb-4 text-xl font-bold">SpeakerCard Examples</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              <SpeakerCard
                name="Aarav Sharma"
                role="Principal Cloud Architect"
                company="KWS Platform"
                speakerRole="SPEAKER"
                bio="Building resilient distributed systems, edge architectures, and high-throughput real-time events engines."
                topics={["Distributed Systems", "Kubernetes", "Go"]}
                sessionsCount={6}
                socials={{
                  twitter: "https://twitter.com",
                  linkedin: "https://linkedin.com",
                  github: "https://github.com",
                  website: "https://kailshiansx.com",
                }}
              />

              <SpeakerCard
                name="Dr. Priya Singhania"
                role="Head of AI Research"
                company="Nexus AI Labs"
                speakerRole="JUDGE"
                bio="Specializing in multi-modal LLM alignment, agentic workflows, and ethical machine intelligence architectures."
                topics={["AI Alignment", "Agentic Systems", "PyTorch"]}
                sessionsCount={4}
                socials={{
                  twitter: "https://twitter.com",
                  linkedin: "https://linkedin.com",
                  github: "https://github.com",
                }}
              />

              <SpeakerCard
                name="Vikram Mehta"
                role="Staff Engineer & Open Source Lead"
                company="HyperScale"
                speakerRole="MENTOR"
                bio="Passionate about guiding student developers into high-impact open source contributions and production engineering."
                topics={["Open Source", "Next.js", "TypeScript"]}
                sessionsCount={9}
                socials={{
                  linkedin: "https://linkedin.com",
                  github: "https://github.com",
                }}
              />
            </div>
          </div>
        </section>

        {/* ─── 4. PARTNER LOGO GRID ───────────────────────────────────────── */}
        <section id="partners" className="scroll-mt-24 space-y-8">
          <SectionHeader
            badge="Ecosystem"
            title="Partner Logo Grid"
            highlight="Logo Grid"
            description="Clean grayscale-to-color hover logo matrix with optional tier grouping."
            align="left"
          />

          <Card>
            <CardHeader>
              <CardTitle>Tiered Partner Showcase</CardTitle>
              <CardDescription>
                Categorized by sponsorship and partnership level with interactive links.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PartnerLogoGrid
                groupByTier={true}
                partners={[
                  {
                    name: "Kailshians Cloud",
                    tier: "TITLE",
                    websiteUrl: "https://kailshiansx.com",
                  },
                  {
                    name: "Razorpay",
                    tier: "PLATINUM",
                    websiteUrl: "https://razorpay.com",
                  },
                  {
                    name: "GitHub Education",
                    tier: "PLATINUM",
                    websiteUrl: "https://github.com",
                  },
                  {
                    name: "Postman",
                    tier: "GOLD",
                    websiteUrl: "https://postman.com",
                  },
                  {
                    name: "Resend",
                    tier: "GOLD",
                    websiteUrl: "https://resend.com",
                  },
                  {
                    name: "AWS Community",
                    tier: "COMMUNITY",
                    websiteUrl: "https://aws.amazon.com",
                  },
                  {
                    name: "91Springboard",
                    tier: "VENUE",
                    websiteUrl: "https://91springboard.com",
                  },
                  {
                    name: "Jaipur Dev Club",
                    tier: "ECOSYSTEM",
                    websiteUrl: "https://kailshiansx.com",
                  },
                ]}
              />
            </CardContent>
          </Card>
        </section>

        {/* ─── 5. ANIMATED STAT COUNTER ───────────────────────────────────── */}
        <section id="stats" className="scroll-mt-24 space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeader
              badge="Impact Metrics"
              title="Animated Stat Counters"
              highlight="Stat Counters"
              description="Spring & easing counter animations driven by scroll viewport triggers."
              align="left"
            />
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="size-4" />}
              onClick={() => setCounterKey((k) => k + 1)}
            >
              Replay Animation
            </Button>
          </div>

          <div key={counterKey} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCounter
              value={15000}
              suffix="+"
              label="Community Builders"
              description="Active developers across colleges and tech hubs."
              variant="brand"
              duration={2.2}
            />
            <StatCounter
              value={48}
              suffix="+"
              label="Events Hosted"
              description="Meetups, hackathons, and high-impact workshops."
              variant="accent"
              duration={1.8}
            />
            <StatCounter
              value={120}
              suffix="+"
              label="Colleges & Chapters"
              description="Student campus lead network nationwide."
              variant="default"
              duration={2.0}
            />
            <StatCounter
              value={98.6}
              suffix="%"
              decimals={1}
              label="Attendee Satisfaction"
              description="Rated 4.8+ stars across all major editions."
              variant="brand"
              duration={2.4}
            />
          </div>
        </section>

        {/* ─── 6. TESTIMONIAL CAROUSEL ────────────────────────────────────── */}
        <section id="carousel" className="scroll-mt-24 space-y-8">
          <SectionHeader
            badge="Social Proof"
            title="Testimonial Carousel"
            highlight="Carousel"
            description="Keyboard-navigable (Arrow Left / Right), touch-swipeable, and auto-play friendly carousel."
            align="left"
          />

          <TestimonialCarousel
            autoPlay={false}
            testimonials={[
              {
                id: "1",
                quote:
                  "KailshiansX completely changed how our campus approaches open source and hackathons. The energy at PadharoX was world-class, and our students walked away with internships.",
                author: "Ananya Deshmukh",
                role: "Campus Lead",
                company: "MNIT Jaipur",
                rating: 5,
                eventTitle: "PadharoX Jaipur",
              },
              {
                id: "2",
                quote:
                  "Speaking at KailshiansX tech talks was one of the most rewarding community experiences of the year. The questions from the audience were sharp, deeply technical, and inspiring.",
                author: "Rohan Varma",
                role: "Lead Architect",
                company: "CloudScale Systems",
                rating: 5,
                eventTitle: "Tech Talks Delhi",
              },
              {
                id: "3",
                quote:
                  "The 36-hour NirmanX hackathon was flawlessly organized. From the mentorship to the API sponsor tracks, everything felt like a premier Silicon Valley hackathon.",
                author: "Siddharth Rao",
                role: "Winner & Student Founder",
                company: "BuidlHQ",
                rating: 5,
                eventTitle: "NirmanX Bengaluru",
              },
            ]}
          />
        </section>

        {/* ─── 7. FAQ ACCORDION ───────────────────────────────────────────── */}
        <section id="accordion" className="scroll-mt-24 space-y-8">
          <SectionHeader
            badge="Knowledge Base"
            title="Accessible FAQ Accordion"
            highlight="FAQ Accordion"
            description="WAI-ARIA compliant accordion with keyboard navigation (Up/Down/Home/End) and height animation."
            align="left"
          />

          <FAQAccordion
            allowMultiple={true}
            defaultOpen={["faq-1"]}
            items={[
              {
                id: "faq-1",
                question: "What is KailshiansX and who can participate?",
                answer:
                  "KailshiansX is the developer events and community ecosystem by Kailshians Web Services. Anyone enthusiastic about building software — students, engineering professionals, founders, and designers — can participate in our meetups, workshops, and hackathons.",
              },
              {
                id: "faq-2",
                question: "Are KailshiansX events free of charge?",
                answer:
                  "The vast majority of our community meetups, tech talks, and regional workshops are 100% free of cost thanks to our generous venue and ecosystem partners. Certain flagship multi-day hackathons may have a nominal commitment fee which includes swag, meals, and server grants.",
              },
              {
                id: "faq-3",
                question: "How can I become a Campus Lead or State Lead?",
                answer:
                  "You can apply directly through our Campus Leads and State Leads portals. We review applications on a rolling cohort basis, assessing passion, leadership experience, and vision for developer empowerment on your campus.",
              },
              {
                id: "faq-4",
                question: "Can I sponsor or speak at an upcoming edition?",
                answer:
                  "Yes! We welcome experienced engineers to propose tech talks, and organizations to partner with us on venue, cloud credits, or prizes. Visit our Collaborations page or reach out directly to team@kailshiansx.com.",
              },
            ]}
          />
        </section>

        {/* ─── 8. FORM FIELDS & ZOD VALIDATION ────────────────────────────── */}
        <section id="forms" className="scroll-mt-24 space-y-8">
          <SectionHeader
            badge="Forms & Validation"
            title="FormField Set (react-hook-form + Zod)"
            highlight="Zod"
            description="Accessible form controls with integrated validation, error rings, clear hints, and keyboard focus."
            align="left"
          />

          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>Interactive Registration Form Demo</CardTitle>
              <CardDescription>
                Try submitting with invalid data to see inline accessible error states, or fill it
                out to trigger a success toast.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-5" noValidate>
                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Full Name</FormLabel>
                        <FormControl>
                          <FormInput
                            placeholder="Aarav Saini"
                            leftIcon={<User className="size-4" />}
                            clearable
                            onClear={() => field.onChange("")}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your name as you would like it on your attendee badge.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Email Address</FormLabel>
                        <FormControl>
                          <FormInput
                            type="email"
                            placeholder="developer@kailshiansx.com"
                            leftIcon={<Mail className="size-4" />}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Portal Password</FormLabel>
                        <FormControl>
                          <FormInput
                            type="password"
                            placeholder="Enter secure password"
                            leftIcon={<Lock className="size-4" />}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          At least 6 characters. Use toggle to inspect.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Event Track Select */}
                  <FormField
                    control={form.control}
                    name="track"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Event Track Selection</FormLabel>
                        <FormControl>
                          <FormSelect
                            placeholder="Choose your primary track"
                            options={[
                              { value: "ai-systems", label: "AI Systems & Agents" },
                              { value: "fullstack", label: "Full-Stack Next.js & TypeScript" },
                              { value: "cloud-devops", label: "Cloud & Distributed Systems" },
                              { value: "open-source", label: "Open Source & Tooling" },
                            ]}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Radio Group */}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Participation Role</FormLabel>
                        <FormControl>
                          <FormRadioGroup
                            name="role"
                            value={field.value}
                            onChange={field.onChange}
                            options={[
                              {
                                value: "ATTENDEE",
                                label: "General Attendee",
                                description: "Attending sessions, networking, and workshops.",
                              },
                              {
                                value: "SPEAKER",
                                label: "Speaker / Lightning Talker",
                                description: "Delivering a session or sharing an open source demo.",
                              },
                              {
                                value: "VOLUNTEER",
                                label: "Community Volunteer",
                                description:
                                  "Assisting with check-in, stage handling, and logistics.",
                              },
                            ]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bio Textarea */}
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Bio / Goals (Optional)</FormLabel>
                        <FormControl>
                          <FormTextarea
                            placeholder="Tell us what you're excited to build..."
                            showCount
                            maxLength={200}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Checkbox */}
                  <FormField
                    control={form.control}
                    name="agreeTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FormCheckbox
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            label="I agree to the KailshiansX Code of Conduct"
                            description="We foster an inclusive, welcoming, and harassment-free community."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => form.reset()}>
                      Reset Form
                    </Button>
                    <Button type="submit" variant="accent">
                      Submit & Validate
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </section>

        {/* ─── 9. TOASTS ──────────────────────────────────────────────────── */}
        <section id="toasts" className="scroll-mt-24 space-y-8">
          <SectionHeader
            badge="Feedback"
            title="Toast Notification System"
            highlight="Toast"
            description="Radix-powered non-intrusive notifications with auto-dismiss and accessibility."
            align="left"
          />

          <Card>
            <CardHeader>
              <CardTitle>Trigger Toast Notifications</CardTitle>
              <CardDescription>
                Click each button to test the visual style, icon, and screen reader announcements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  leftIcon={<CheckCircle2 className="size-4 text-emerald-400" />}
                  onClick={() =>
                    toast({
                      variant: "success",
                      title: "Registration Confirmed!",
                      description: "Your QR ticket has been sent to your registered email.",
                    })
                  }
                >
                  Success Toast
                </Button>

                <Button
                  variant="outline"
                  leftIcon={<AlertCircle className="size-4 text-rose-400" />}
                  onClick={() =>
                    toast({
                      variant: "destructive",
                      title: "Transaction Failed",
                      description: "The payment gateway rejected the request. Please retry.",
                    })
                  }
                >
                  Error Toast
                </Button>

                <Button
                  variant="outline"
                  leftIcon={<AlertTriangle className="size-4 text-amber-400" />}
                  onClick={() =>
                    toast({
                      variant: "warning",
                      title: "Quota Almost Full",
                      description: "Only 12 tickets remain for this workshop batch.",
                    })
                  }
                >
                  Warning Toast
                </Button>

                <Button
                  variant="outline"
                  leftIcon={<Info className="text-brand-400 size-4" />}
                  onClick={() =>
                    toast({
                      variant: "info",
                      title: "Schedule Updated",
                      description: "The keynote session starts at 10:30 AM in Hall A.",
                    })
                  }
                >
                  Info Toast
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ─── 10. EMPTY STATES ───────────────────────────────────────────── */}
        <section id="empty" className="scroll-mt-24 space-y-8">
          <SectionHeader
            badge="Feedback"
            title="Empty States"
            highlight="Empty States"
            description="Engaging empty placeholders with clear calls to action when data has not yet arrived."
            align="left"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <EmptyState
              icon={<Search className="size-7" />}
              title="No Events Found"
              description="We couldn't find any meetups or hackathons matching your active filters."
              action={{
                label: "Clear All Filters",
                onClick: () => {
                  setSingleFilter("ALL");
                  setMultiFilter([]);
                  toast({ title: "Filters cleared" });
                },
              }}
              secondaryAction={{
                label: "Request an Event",
                onClick: () => toast({ title: "Opening request modal..." }),
              }}
            />

            <EmptyState
              icon={<Calendar className="text-accent-400 size-7" />}
              title="No Registrations Yet"
              description="You have not registered for any upcoming sessions. Explore our schedule to grab your pass."
              action={{
                label: "Explore Events",
                variant: "accent",
                onClick: () => toast({ title: "Navigating to /events" }),
              }}
            />
          </div>
        </section>

        {/* ─── 11. SKELETONS ──────────────────────────────────────────────── */}
        <section id="skeletons" className="scroll-mt-24 space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeader
              badge="Loading State"
              title="Skeleton Shimmer Placeholders"
              highlight="Shimmer"
              description="High-fidelity shimmers matching production card layouts to eliminate layout shift."
              align="left"
            />
            <Button
              variant="outline"
              size="sm"
              leftIcon={<SlidersHorizontal className="size-4" />}
              onClick={() => setShowSkeletonDemo((v) => !v)}
            >
              Toggle Shimmer Simulation ({showSkeletonDemo ? "Active" : "Static"})
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <h4 className="text-surface-400 mb-3 font-mono text-xs tracking-wider uppercase">
                EventCard Skeleton
              </h4>
              <EventCardSkeleton />
            </div>

            <div>
              <h4 className="text-surface-400 mb-3 font-mono text-xs tracking-wider uppercase">
                SpeakerCard Skeleton
              </h4>
              <SpeakerCardSkeleton />
            </div>

            <div>
              <h4 className="text-surface-400 mb-3 font-mono text-xs tracking-wider uppercase">
                SeriesCard Skeleton
              </h4>
              <SeriesCardSkeleton />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Table & Text Shimmers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <TableSkeleton rows={3} cols={4} />
              <TextSkeleton lines={3} />
            </CardContent>
          </Card>
        </section>

        {/* ─── 12. PAGINATION & FILTER CHIPS ──────────────────────────────── */}
        <section id="navigation" className="scroll-mt-24 space-y-8">
          <SectionHeader
            badge="Navigation & Filtering"
            title="Pagination & Filter Chips"
            highlight="Filter Chips"
            description="Accessible pagination with mobile collapse, and single/multi-select filter chip carousels."
            align="left"
          />

          <Card>
            <CardHeader>
              <CardTitle>Filter Chips Demo</CardTitle>
              <CardDescription>
                Try clicking chips. Demonstrates single-select with &apos;All&apos; option and
                multi-select with counter badges.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Single Select */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-surface-400 font-mono text-xs tracking-wider uppercase">
                    Single Select (Event Types)
                  </h4>
                  <span className="text-brand-400 font-mono text-xs">Selected: {singleFilter}</span>
                </div>
                <FilterChips
                  selected={singleFilter}
                  onChange={setSingleFilter}
                  options={[
                    { id: "MEETUP", label: "Meetups", count: 18 },
                    { id: "HACKATHON", label: "Hackathons", count: 8 },
                    { id: "WORKSHOP", label: "Workshops", count: 12 },
                    { id: "TECH_TALK", label: "Tech Talks", count: 10 },
                  ]}
                />
              </div>

              {/* Multi Select */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-surface-400 font-mono text-xs tracking-wider uppercase">
                    Multi Select (Topics / Tech Stacks)
                  </h4>
                  <span className="text-accent-400 font-mono text-xs">
                    Active: {multiFilter.length} tags
                  </span>
                </div>
                <FilterChips
                  multiple={true}
                  selected={multiFilter}
                  onChange={setMultiFilter}
                  options={[
                    { id: "ai", label: "AI & ML", count: 24 },
                    { id: "web3", label: "Web3 & Blockchain", count: 15 },
                    { id: "systems", label: "Systems & Rust", count: 9 },
                    { id: "frontend", label: "Next.js & React", count: 32 },
                    { id: "devops", label: "Cloud & DevOps", count: 14 },
                    { id: "mobile", label: "Mobile Dev", count: 7 },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagination Demo</CardTitle>
              <CardDescription>
                Keyboard navigable pagination with first/prev/page/next/last controls and mobile
                collapse.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-surface-800 bg-surface-900/40 mb-4 rounded-xl border p-4 text-center">
                <span className="text-surface-300 text-sm">
                  Showing results for page:{" "}
                  <strong className="text-brand-400 font-mono text-base">{currentPage}</strong> of
                  10
                </span>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={10}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  toast({
                    title: `Switched to page ${page}`,
                    variant: "info",
                  });
                }}
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
