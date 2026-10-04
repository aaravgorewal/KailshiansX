import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format-date";

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
  const dateStr = event?.startDate ? formatDate(event.startDate) : "Active 2026 Season";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 64px",
        backgroundColor: "black",
        color: "white",
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
              borderRadius: "8px",
              border: "1px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              fontSize: "20px",
              color: "white",
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
                color: "white",
              }}
            >
              KailshiansX
            </span>
            <span
              style={{
                fontSize: "12px",
                opacity: 0.6,
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
            padding: "6px 16px",
            borderRadius: "9999px",
            border: "1px solid white",
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
            color: "white",
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
            opacity: 0.85,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>{dateStr}</span>
          </div>
          <span>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
          borderTop: "1px solid white",
          fontSize: "15px",
          opacity: 0.7,
        }}
      >
        <span>Developer Events. Builder Communities. Real Connections.</span>
        <span style={{ fontWeight: "600" }}>kailshiansx.com/events</span>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
