import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Geist } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
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
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} bg-surface-950 text-surface-100 font-sans antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
