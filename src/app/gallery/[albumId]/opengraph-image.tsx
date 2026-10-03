// src/app/gallery/[albumId]/opengraph-image.tsx
// Dynamic OpenGraph share card generator for KailshiansX Gallery Albums

import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;

  const album = await db.galleryAlbum.findUnique({
    where: { id: albumId },
    include: {
      event: { select: { title: true, city: { select: { name: true } } } },
      _count: { select: { images: true } },
    },
  });

  const title = album?.title || "KailshiansX Gallery Album";
  const category = (album?.category || "EVENT").toUpperCase();
  const photoCount = album?._count?.images || 0;
  const eventName = album?.event?.title || "Developer Gathering";
  const city = album?.event?.city?.name || "India";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 64px",
        backgroundColor: "#07090e",
        backgroundImage:
          "radial-gradient(ellipse at 15% 15%, rgba(61, 97, 252, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 85% 85%, rgba(139, 61, 255, 0.25) 0%, transparent 50%)",
        color: "#f8fafc",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top Header Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "#3d61fc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: 900,
              color: "#ffffff",
            }}
          >
            K
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px" }}>
              KailshiansX
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
              }}
            >
              Photo & Event Archive
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 18px",
            borderRadius: "9999px",
            backgroundColor: "rgba(61, 97, 252, 0.15)",
            border: "1px solid rgba(61, 97, 252, 0.4)",
            color: "#93c5fd",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "1px",
          }}
        >
          {category}
        </div>
      </div>

      {/* Main Center Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "950px" }}>
        <h1
          style={{
            fontSize: "48px",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-1.5px",
            color: "#ffffff",
            margin: 0,
          }}
        >
          {title}
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "20px",
            color: "#cbd5e1",
          }}
        >
          <span>{eventName}</span>
          <span style={{ color: "#475569" }}>•</span>
          <span>{city}</span>
          <span style={{ color: "#475569" }}>•</span>
          <span style={{ color: "#93c5fd", fontWeight: 600 }}>{photoCount} High-Res Photos</span>
        </div>
      </div>

      {/* Footer Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(148, 163, 184, 0.15)",
          paddingTop: "24px",
          width: "100%",
        }}
      >
        <span style={{ fontSize: "15px", color: "#64748b", fontFamily: "monospace" }}>
          kailshiansx.com/gallery
        </span>
        <span style={{ fontSize: "15px", color: "#94a3b8", fontWeight: 600 }}>
          Kailshians Web Services • Developer Ecosystem
        </span>
      </div>
    </div>
  );
}
