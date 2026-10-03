import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await db.event.findUnique({
    where: { slug },
    include: { city: true },
  });

  const title = event?.title || "KailshiansX Developer Gathering";
  const type = event?.type?.replace("_", " ") || "EVENT";
  const city = event?.city?.name || "India";
  const venue = event?.venue || "Verified Tech Hub";
  const dateStr = event?.startDate
    ? new Date(event.startDate).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Active 2026 Season";

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
              fontWeight: "900",
              fontSize: "22px",
              color: "#ffffff",
            }}
          >
            KX
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                letterSpacing: "-0.5px",
                color: "#f8fafc",
              }}
            >
              KailshiansX
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              KWS Developer Ecosystem
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "9999px",
            backgroundColor: "rgba(61, 97, 252, 0.15)",
            border: "1px solid rgba(61, 97, 252, 0.4)",
            color: "#93c5fd",
            fontSize: "14px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          <span>{type}</span>
        </div>
      </div>

      {/* Central Event Information */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "980px" }}>
        <h1
          style={{
            fontSize: title.length > 55 ? "44px" : "54px",
            fontWeight: "900",
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
            gap: "24px",
            fontSize: "20px",
            color: "#cbd5e1",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#60a5fa" }}>📅</span>
            <span>{dateStr}</span>
          </div>
          <span style={{ color: "#475569" }}>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#a78bfa" }}>📍</span>
            <span>
              {venue}, {city}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "24px",
          borderTop: "1px solid rgba(148, 163, 184, 0.15)",
          fontSize: "15px",
          color: "#94a3b8",
        }}
      >
        <span>Developer Events. Builder Communities. Real Connections.</span>
        <span style={{ color: "#60a5fa", fontWeight: "600" }}>kailshiansx.com/events</span>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
