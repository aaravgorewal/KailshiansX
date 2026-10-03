import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from S3/CDN and common avatar providers
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.kailshiansx.com",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile pictures
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  // Strict mode for better dev-time error catching
  reactStrictMode: true,
  // Enable server actions
  experimental: {
    serverActions: {
      allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"],
    },
  },
};

export default nextConfig;
