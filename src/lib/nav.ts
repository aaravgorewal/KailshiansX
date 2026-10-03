// src/lib/nav.ts
// Navigation config — single source of truth for Navbar and Drawer

export type NavItem = {
  label: string;
  href: string;
  description?: string;
  children?: NavItem[];
};

/**
 * Full nav listing (used in mobile drawer — all 15 PRD §3 routes).
 */
export const ALL_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events", description: "All upcoming & past events" },
  { label: "Workshops", href: "/workshops", description: "Hands-on technical workshops" },
  { label: "Tech Talks", href: "/tech-talks", description: "Expert sessions & talks" },
  { label: "Meetup Series", href: "/meetup-series", description: "City community meetup brands" },
  {
    label: "Hackathon Series",
    href: "/hackathon-series",
    description: "Recurring hackathon properties",
  },
  { label: "Community", href: "/community", description: "Join the KailshiansX community" },
  { label: "Campus Leads", href: "/campus-leads", description: "Represent us at your college" },
  {
    label: "State Leads",
    href: "/state-leads",
    description: "Lead community growth across your state",
  },
  { label: "Collaborations", href: "/collaborations", description: "Partner with KailshiansX" },
  { label: "Gallery", href: "/gallery", description: "Photos from our events" },
  { label: "Join Team", href: "/join-team", description: "Work with us" },
  { label: "Core Team", href: "/core-team", description: "Meet the team" },
  { label: "Founder", href: "/founder", description: "The origin story" },
  { label: "Who We Are", href: "/who-we-are", description: "Our mission, vision and values" },
];

/**
 * Desktop primary nav — grouped with dropdowns.
 */
export const PRIMARY_NAV: NavItem[] = [
  {
    label: "Events",
    href: "/events",
    children: [
      { label: "All Events", href: "/events", description: "Browse all upcoming & past events" },
      { label: "Workshops", href: "/workshops", description: "Hands-on technical workshops" },
      { label: "Tech Talks", href: "/tech-talks", description: "Expert sessions & industry talks" },
      {
        label: "Meetup Series",
        href: "/meetup-series",
        description: "City community meetup brands",
      },
      {
        label: "Hackathon Series",
        href: "/hackathon-series",
        description: "Recurring hackathon properties",
      },
    ],
  },
  {
    label: "Community",
    href: "/community",
    children: [
      { label: "Community Hub", href: "/community", description: "Join the KailshiansX network" },
      {
        label: "Campus Leads",
        href: "/campus-leads",
        description: "Represent KailshiansX at your college",
      },
      {
        label: "State Leads",
        href: "/state-leads",
        description: "Drive expansion across your state",
      },
    ],
  },
  { label: "Collaborations", href: "/collaborations" },
  { label: "Gallery", href: "/gallery" },
  {
    label: "About",
    href: "/who-we-are",
    children: [
      { label: "Who We Are", href: "/who-we-are", description: "Mission, vision & values" },
      { label: "Core Team", href: "/core-team", description: "Meet the people behind KailshiansX" },
      { label: "Founder", href: "/founder", description: "The story behind KailshiansX" },
    ],
  },
  { label: "Join Team", href: "/join-team" },
];
