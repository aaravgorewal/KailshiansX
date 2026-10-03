import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "passes@kailshiansx.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kailshiansx.com";

const resend =
  RESEND_API_KEY && !RESEND_API_KEY.includes("your_") ? new Resend(RESEND_API_KEY) : null;

export interface SendConfirmationEmailParams {
  email: string;
  name: string;
  eventTitle: string;
  eventSlug: string;
  eventDate: Date;
  venue?: string | null;
  cityName?: string | null;
  ticketTierName: string;
  registrationCode: string;
  qrCodeDataUrl?: string | null;
}

export async function sendRegistrationConfirmationEmail(
  params: SendConfirmationEmailParams
): Promise<{ success: boolean; id?: string }> {
  const {
    email,
    name,
    eventTitle,
    eventSlug,
    eventDate,
    venue,
    cityName,
    ticketTierName,
    registrationCode,
    qrCodeDataUrl,
  } = params;

  const dateStr = new Date(eventDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeStr = new Date(eventDate).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const ticketUrl = `${APP_URL}/events/${eventSlug}/ticket/${registrationCode}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Pass for ${eventTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #07090e; color: #f1f5f9; margin: 0; padding: 30px 15px; }
    .container { max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 30px; text-align: center; border-bottom: 1px solid #334155; }
    .logo { display: inline-block; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; }
    .logo span { color: #60a5fa; }
    .tagline { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1.5px; margin-top: 4px; }
    .body { padding: 32px 28px; }
    .greeting { font-size: 20px; font-weight: bold; color: #f8fafc; margin-bottom: 8px; }
    .subtext { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    .pass-card { background: #0b0f19; border: 1px solid #3b82f6; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 28px; }
    .badge { display: inline-block; background: rgba(59, 130, 246, 0.2); color: #93c5fd; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
    .code { font-family: ui-monospace, Menlo, monospace; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; margin: 6px 0; }
    .tier { font-size: 13px; color: #cbd5e1; }
    .qr-container { margin: 20px auto; padding: 12px; background: #ffffff; border-radius: 10px; width: 180px; height: 180px; }
    .details { background: #131b2e; border-radius: 10px; padding: 18px; margin-bottom: 24px; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #1e293b; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #94a3b8; }
    .detail-value { color: #f1f5f9; font-weight: 600; }
    .cta-btn { display: block; width: 220px; margin: 0 auto; text-align: center; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; }
    .footer { text-align: center; padding: 20px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Kailshians<span>X</span></div>
      <div class="tagline">Developer Ecosystem Pass</div>
    </div>
    <div class="body">
      <div class="greeting">Hey ${name}, you're in! 🎉</div>
      <div class="subtext">
        Your registration for <strong>${eventTitle}</strong> is officially confirmed. Show this QR code at the check-in desk for entry and your welcome kit.
      </div>

      <div class="pass-card">
        <div class="badge">${ticketTierName}</div>
        <div class="code">${registrationCode}</div>
        <div class="tier">Confirmed Attendee Pass</div>
        
        ${
          qrCodeDataUrl
            ? `<div class="qr-container"><img src="${qrCodeDataUrl}" alt="Check-in QR Code" width="180" height="180" style="display:block;" /></div>`
            : ""
        }
        
        <p style="font-size: 11px; color: #64748b; margin-top: 10px;">Scannable at entrance by staff</p>
      </div>

      <div class="details">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
          <tr>
            <td style="color: #94a3b8;">Event:</td>
            <td style="color: #f1f5f9; font-weight: 600; text-align: right;">${eventTitle}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Date &amp; Time:</td>
            <td style="color: #f1f5f9; font-weight: 600; text-align: right;">${dateStr} (${timeStr})</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Location:</td>
            <td style="color: #f1f5f9; font-weight: 600; text-align: right;">${venue || "Venue"}${cityName ? `, ${cityName}` : ""}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Pass Type:</td>
            <td style="color: #f1f5f9; font-weight: 600; text-align: right;">${ticketTierName}</td>
          </tr>
        </table>
      </div>

      <a href="${ticketUrl}" class="cta-btn">View Digital Pass</a>
    </div>

    <div class="footer">
      KailshiansX • Kailshians Web Services Developer Community<br>
      Need assistance? Reply to this email or visit support at kailshiansx.com
    </div>
  </div>
</body>
</html>
  `.trim();

  if (!resend) {
    console.log(
      `[Email Mock] Sent registration confirmation to ${email} for code ${registrationCode}`
    );
    return { success: true, id: `mock_email_${Date.now()}` };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Confirmed Pass: ${eventTitle} (${registrationCode})`,
      html,
    });

    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error("Resend confirmation email failed:", error);
    // Do not fail the transaction if email provider has transient failure
    return { success: false };
  }
}
