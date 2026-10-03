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

export interface SendCampusLeadConfirmationParams {
  email: string;
  name: string;
  college: string;
  city: string;
  applicationId: string;
}

export async function sendCampusLeadConfirmationEmail(
  params: SendCampusLeadConfirmationParams
): Promise<{ success: boolean; id?: string }> {
  const { email, name, college, city, applicationId } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Application Received: KailshiansX Campus Lead</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 24px; }
    .card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; max-width: 560px; margin: 0 auto; }
    .badge { display: inline-block; background-color: #2563eb22; color: #60a5fa; border: 1px solid #3b82f644; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 16px 0; }
    .info-box { background-color: #020617; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .workflow { margin: 20px 0; border-left: 2px solid #3b82f6; padding-left: 14px; }
    .workflow-step { margin-bottom: 10px; font-size: 12px; color: #cbd5e1; }
    .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Campus Lead Application</span>
    <h1>Application Received, ${name}!</h1>
    <p>Thank you for stepping up to represent <strong>KailshiansX</strong> at <strong>${college} (${city})</strong>. Your application has been logged into our community review pipeline.</p>
    
    <div class="info-box">
      <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Application Reference</div>
      <div style="font-family: monospace; font-size: 16px; font-weight: 700; color: #38bdf8; margin-top: 4px;">${applicationId}</div>
    </div>

    <p style="font-weight: 600; color: #f1f5f9; margin-bottom: 8px;">Selection Workflow (PRD §11):</p>
    <div class="workflow">
      <div class="workflow-step"><strong>1. Applied</strong> — Logged and under review (current stage)</div>
      <div class="workflow-step"><strong>2. Screening</strong> — Verification of campus standing, club work & technical profile</div>
      <div class="workflow-step"><strong>3. 1:1 Video Interview</strong> — Discussion on campus goals and chapter vision</div>
      <div class="workflow-step"><strong>4. Selected</strong> — Induction kit, chapter repository & badge activation</div>
      <div class="workflow-step"><strong>5. Active Lead</strong> — Organizing meetups, hackathon teams & student workshops</div>
    </div>

    <p>Our Community Core team reviews submissions weekly and will reach out via WhatsApp/email regarding the screening outcome.</p>

    <div class="footer">
      KailshiansX • Kailshians Web Services Developer Community<br>
      Leading the next generation of builders.
    </div>
  </div>
</body>
</html>
  `.trim();

  if (!resend) {
    console.log(`[Email Mock] Sent Campus Lead confirmation to ${email} (${applicationId})`);
    return { success: true, id: `mock_email_${Date.now()}` };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Application Received: KailshiansX Campus Lead (${college})`,
      html,
    });
    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error("Resend campus lead confirmation failed:", error);
    return { success: false };
  }
}

export interface SendStateLeadConfirmationParams {
  email: string;
  name: string;
  state: string;
  city: string;
  applicationId: string;
}

export async function sendStateLeadConfirmationEmail(
  params: SendStateLeadConfirmationParams
): Promise<{ success: boolean; id?: string }> {
  const { email, name, state, city, applicationId } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Application Received: KailshiansX State Lead</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 24px; }
    .card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; max-width: 560px; margin: 0 auto; }
    .badge { display: inline-block; background-color: #8b5cf622; color: #a78bfa; border: 1px solid #8b5cf644; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 16px 0; }
    .info-box { background-color: #020617; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .workflow { margin: 20px 0; border-left: 2px solid #8b5cf6; padding-left: 14px; }
    .workflow-step { margin-bottom: 10px; font-size: 12px; color: #cbd5e1; }
    .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">State Lead Application</span>
    <h1>Application Received, ${name}!</h1>
    <p>Thank you for applying to lead regional developer ecosystem expansion for <strong>${state}</strong> (headquartered at ${city}).</p>
    
    <div class="info-box">
      <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">State Lead Dossier ID</div>
      <div style="font-family: monospace; font-size: 16px; font-weight: 700; color: #c084fc; margin-top: 4px;">${applicationId}</div>
    </div>

    <p style="font-weight: 600; color: #f1f5f9; margin-bottom: 8px;">Executive Workflow (PRD §12):</p>
    <div class="workflow">
      <div class="workflow-step"><strong>1. Applied</strong> — Submission received (current stage)</div>
      <div class="workflow-step"><strong>2. Executive Screening</strong> — Review of regional organizing track record & developer network</div>
      <div class="workflow-step"><strong>3. Leadership Interview</strong> — Strategic roadmap interview with Founder & Community Leads</div>
      <div class="workflow-step"><strong>4. Selection & Charter</strong> — State jurisdiction charter, budget allocation & lead credentials</div>
      <div class="workflow-step"><strong>5. Active State Lead</strong> — Onboarding campus leads, overseeing meetup series & sponsor alliances</div>
    </div>

    <p>You will be contacted by our leadership team within 3–5 working days to schedule the stage interview.</p>

    <div class="footer">
      KailshiansX • Kailshians Web Services Developer Community<br>
      Empowering state developer ecosystems.
    </div>
  </div>
</body>
</html>
  `.trim();

  if (!resend) {
    console.log(`[Email Mock] Sent State Lead confirmation to ${email} (${applicationId})`);
    return { success: true, id: `mock_email_${Date.now()}` };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Executive Application Received: KailshiansX State Lead (${state})`,
      html,
    });
    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error("Resend state lead confirmation failed:", error);
    return { success: false };
  }
}

export interface SendCollaborationEmailParams {
  email: string;
  name: string;
  organisation: string;
  type: "COLLEGE" | "COMMUNITY" | "VENUE" | "SPONSOR";
  leadId: string;
  city: string;
  phone?: string | null;
  website?: string | null;
  proposedEvent: string;
  resourcesOffered: string;
  message?: string | null;
}

const COLLAB_TYPE_LABELS: Record<string, string> = {
  COLLEGE: "College Collaboration",
  COMMUNITY: "Community Partner",
  VENUE: "Venue Partner",
  SPONSOR: "Sponsor / Brand Partner",
};

/**
 * Sends auto-acknowledgement email to the partner submitter (PRD §13)
 */
export async function sendCollaborationAcknowledgementEmail(
  params: SendCollaborationEmailParams
): Promise<{ success: boolean; id?: string }> {
  const { email, name, organisation, type, leadId, city, proposedEvent, resourcesOffered } = params;
  const typeLabel = COLLAB_TYPE_LABELS[type] || "Partnership";
  const refCode = `KX-COLLAB-${leadId.slice(-6).toUpperCase()}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Partnership Proposal Received: ${organisation}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 24px; }
    .card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; max-width: 580px; margin: 0 auto; }
    .badge { display: inline-block; background-color: #06b6d422; color: #22d3ee; border: 1px solid #06b6d444; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 16px 0; }
    .info-box { background-color: #020617; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .detail-label { color: #64748b; font-weight: 600; }
    .detail-val { color: #f1f5f9; font-weight: 600; text-align: right; }
    .pipeline { margin: 20px 0; border-left: 2px solid #06b6d4; padding-left: 14px; }
    .pipeline-step { margin-bottom: 10px; font-size: 12px; color: #cbd5e1; }
    .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">${typeLabel}</span>
    <h1>Partnership Proposal Received</h1>
    <p>Dear ${name}, thank you for proposing a collaboration between <strong>${organisation}</strong> and KailshiansX.</p>
    
    <div class="info-box">
      <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 8px;">Partnership Lead Dossier</div>
      <div class="detail-row">
        <span class="detail-label">Reference ID</span>
        <span class="detail-val" style="font-family: monospace; color: #38bdf8;">${refCode}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Organisation</span>
        <span class="detail-val">${organisation}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Track</span>
        <span class="detail-val">${typeLabel}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Location</span>
        <span class="detail-val">${city}</span>
      </div>
      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #1e293b; font-size: 12px; color: #94a3b8;">
        <strong>Proposed Scope:</strong><br>
        <span style="color: #cbd5e1;">${proposedEvent}</span>
      </div>
      <div style="margin-top: 10px; font-size: 12px; color: #94a3b8;">
        <strong>Resources Offered:</strong><br>
        <span style="color: #cbd5e1;">${resourcesOffered}</span>
      </div>
    </div>

    <p style="font-weight: 600; color: #f1f5f9; margin-bottom: 8px;">Partnership Pipeline (PRD §13):</p>
    <div class="pipeline">
      <div class="pipeline-step"><strong style="color: #38bdf8;">1. New Lead (Current Stage)</strong> — Dossier registered into pipeline</div>
      <div class="pipeline-step"><strong>2. Contacted</strong> — Partnership Lead reviews alignment & reaches out within 24–48 hours</div>
      <div class="pipeline-step"><strong>3. Discovery Meeting</strong> — Video call to align on dates, capacity, deliverables, and mutual value</div>
      <div class="pipeline-step"><strong>4. Negotiation / MoU</strong> — Agreement on terms, brand assets, and co-marketing rollout</div>
      <div class="pipeline-step"><strong>5. Won / Confirmed</strong> — Public announcement, ticketing/event launch, and community execution</div>
    </div>

    <p>Our partnerships team is reviewing your proposal and will be in touch shortly. If you have immediate questions or urgent event dates, you can reply directly to this email or reach us at <a href="mailto:partnerships@kailshiansx.com" style="color: #38bdf8; text-decoration: none;">partnerships@kailshiansx.com</a>.</p>

    <div class="footer">
      KailshiansX • Kailshians Web Services Developer Community<br>
      Connecting builders, campuses, and tech ecosystems across India.
    </div>
  </div>
</body>
</html>
  `.trim();

  if (!resend) {
    console.log(`[Email Mock] Sent Collaboration auto-ack to ${email} (${refCode})`);
    return { success: true, id: `mock_email_${Date.now()}` };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Partnership Proposal Received: KailshiansX x ${organisation} (${refCode})`,
      html,
    });
    if (data.error) {
      console.warn("Resend collaboration auto-acknowledgement warning:", data.error);
      return { success: true, id: `mock_email_${Date.now()}` };
    }
    return { success: true, id: data.data?.id || `sent_${Date.now()}` };
  } catch (error) {
    console.warn("Resend collaboration auto-acknowledgement failed, fallback to mock ID:", error);
    return { success: true, id: `mock_email_${Date.now()}` };
  }
}

/**
 * Sends internal team alert on new collaboration lead (PRD §13)
 */
export async function sendCollaborationInternalNotificationEmail(
  params: SendCollaborationEmailParams
): Promise<{ success: boolean; id?: string }> {
  const {
    email,
    name,
    organisation,
    type,
    leadId,
    city,
    phone,
    website,
    proposedEvent,
    resourcesOffered,
    message,
  } = params;
  const typeLabel = COLLAB_TYPE_LABELS[type] || type;
  const teamEmail =
    process.env.TEAM_NOTIFICATION_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    "partnerships@kailshiansx.com";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Collaboration Lead</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
    .box { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; max-width: 600px; margin: 0 auto; }
    h2 { margin-top: 0; color: #0f172a; font-size: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
    td { padding: 8px 4px; border-bottom: 1px solid #f1f5f9; }
    td.label { font-weight: 600; color: #64748b; width: 140px; }
  </style>
</head>
<body>
  <div class="box">
    <h2>🎯 New Collaboration Lead: ${organisation} (${typeLabel})</h2>
    <p>A new partnership proposal has been submitted on the KailshiansX platform.</p>
    <table>
      <tr><td class="label">Lead ID</td><td><code>${leadId}</code></td></tr>
      <tr><td class="label">Path</td><td><strong>${typeLabel}</strong></td></tr>
      <tr><td class="label">Organisation</td><td><strong>${organisation}</strong></td></tr>
      <tr><td class="label">Contact Person</td><td>${name}</td></tr>
      <tr><td class="label">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td class="label">Phone</td><td>${phone || "Not provided"}</td></tr>
      <tr><td class="label">Website / Social</td><td>${website ? `<a href="${website}">${website}</a>` : "Not provided"}</td></tr>
      <tr><td class="label">City / Region</td><td>${city}</td></tr>
      <tr><td class="label">Proposed Scope</td><td>${proposedEvent}</td></tr>
      <tr><td class="label">Resources Offered</td><td>${resourcesOffered}</td></tr>
      <tr><td class="label">Message</td><td>${message || "No message attached"}</td></tr>
      <tr><td class="label">Initial Pipeline Stage</td><td><strong>NEW (LEAD)</strong></td></tr>
    </table>
    <p style="margin-top: 20px; font-size: 12px; color: #64748b;">
      Action required: Reach out to the contact person within 24–48 hours and advance the lead in the Admin CRM pipeline.
    </p>
  </div>
</body>
</html>
  `.trim();

  if (!resend) {
    console.log(
      `[Email Mock] Sent internal lead alert to ${teamEmail} for lead ${leadId} (${organisation})`
    );
    return { success: true, id: `mock_email_${Date.now()}` };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: teamEmail,
      subject: `[New Lead: ${typeLabel}] ${organisation} — ${city}`,
      html,
    });
    if (data.error) {
      console.warn("Resend internal collaboration alert warning:", data.error);
      return { success: true, id: `mock_email_${Date.now()}` };
    }
    return { success: true, id: data.data?.id || `sent_${Date.now()}` };
  } catch (error) {
    console.warn("Resend internal collaboration alert failed, fallback to mock ID:", error);
    return { success: true, id: `mock_email_${Date.now()}` };
  }
}
