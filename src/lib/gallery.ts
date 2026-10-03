// src/lib/gallery.ts
// Shared Gallery categories, types, and constants (safe for both server & client components)

export type GalleryCategoryKey =
  "ALL" | "meetup" | "hackathon" | "workshop" | "tech-talk" | "community" | "bts";

export const GALLERY_CATEGORIES: {
  key: GalleryCategoryKey;
  label: string;
  description: string;
  badgeVariant: "brand" | "accent" | "success" | "warning" | "default" | "surface";
}[] = [
  {
    key: "ALL",
    label: "All Photos",
    description: "Every gathering, hackathon, workshop, and builder moment across India.",
    badgeVariant: "default",
  },
  {
    key: "meetup",
    label: "Meetups",
    description: "Citywide developer meetups, lightning talks, and grassroots chapter meetups.",
    badgeVariant: "brand",
  },
  {
    key: "hackathon",
    label: "Hackathons",
    description: "36-hour flagship hackathons, intense midnight coding, and demo days.",
    badgeVariant: "accent",
  },
  {
    key: "workshop",
    label: "Workshops",
    description: "Hands-on engineering masterclasses, system architecture labs, and code sprints.",
    badgeVariant: "success",
  },
  {
    key: "tech-talk",
    label: "Tech Talks",
    description: "Architecture deep dives, distributed systems talks, and guest keynotes.",
    badgeVariant: "warning",
  },
  {
    key: "community",
    label: "Community",
    description: "Campus chapter summits, lead orientations, and peer celebrations.",
    badgeVariant: "brand",
  },
  {
    key: "bts",
    label: "Behind the Scenes",
    description:
      "Organizers setting up stages, tech rehearsals, midnight coffee, and candid banter.",
    badgeVariant: "surface",
  },
];
