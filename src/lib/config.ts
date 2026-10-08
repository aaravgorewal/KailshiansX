// src/lib/config.ts
// Platform configuration values

export const SITE_CONFIG = {
  name: "KailshiansX",
  tagline: "Developer events and community by Kailshians Web Services.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com",
  whatsappUrl:
    process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://chat.whatsapp.com/KailshiansXCommunity",
  githubUrl: "https://github.com/kailshiansx",
  twitterUrl: "https://twitter.com/kailshiansx",
  linkedinUrl: "https://linkedin.com/company/kailshiansx",
};
