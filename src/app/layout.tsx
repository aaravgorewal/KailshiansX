import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { NavbarWrapper } from "@/components/layout/NavbarWrapper";
import { Footer } from "@/components/layout/Footer";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui"],
  adjustFontFallback: true,
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";
const APP_NAME = "KailshiansX";
const APP_DESCRIPTION =
  "Developer events & community platform by Kailshians Web Services. Hackathons, meetups, workshops, tech talks, campus leads and more.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Developer Events & Community`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  alternates: {
    canonical: APP_URL,
  },
  keywords: [
    "developer events",
    "hackathon",
    "meetup",
    "workshop",
    "tech talk",
    "campus lead",
    "developer community",
    "KailshiansX",
    "Kailshians Web Services",
  ],
  authors: [{ name: "Kailshians Web Services" }],
  creator: "Kailshians Web Services",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — Developer Events & Community`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} — Developer Events & Community`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Developer Events & Community`,
    description: APP_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@kailshiansx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${APP_URL}#organization`,
      name: APP_NAME,
      url: APP_URL,
      logo: `${APP_URL}/og-image.png`,
      description: APP_DESCRIPTION,
      parentOrganization: {
        "@type": "Organization",
        name: "Kailshians Web Services",
        url: "https://kailshians.com",
      },
      sameAs: [
        "https://twitter.com/kailshiansx",
        "https://github.com/kailshiansx",
        "https://linkedin.com/company/kailshiansx",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${APP_URL}#website`,
      url: APP_URL,
      name: APP_NAME,
      publisher: { "@id": `${APP_URL}#organization` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <meta name="description" content={APP_DESCRIPTION} />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){try{var d=document.documentElement,c=d.classList;var e=localStorage.getItem("theme");if("dark"===e||(!e&&window.matchMedia("(prefers-color-scheme: dark)").matches)||(e==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches)){c.add("dark")}else{c.remove("dark")}}catch(t){}}();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="bg-background text-foreground flex min-h-screen flex-col font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell navbar={<NavbarWrapper />} footer={<Footer />}>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
