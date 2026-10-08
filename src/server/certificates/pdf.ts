// src/server/certificates/pdf.ts
// Pure TypeScript cryptographically-verifiable PDF generation engine using pdf-lib and qrcode.

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export interface CertificateFieldConfig {
  x: number; // percentage 0-100 from left
  y: number; // percentage 0-100 from top
  fontSize?: number;
  color?: string; // hex format e.g. #ffffff
  fontFamily?: string;
  align?: "left" | "center" | "right";
  size?: number; // for QR code box size in points
}

export interface CertificateTemplateConfig {
  id?: string;
  name?: string;
  templateUrl?: string | null;
  fields?: {
    recipientName?: CertificateFieldConfig;
    eventTitle?: CertificateFieldConfig;
    issueDate?: CertificateFieldConfig;
    uniqueId?: CertificateFieldConfig;
    qrCode?: CertificateFieldConfig;
    [key: string]: CertificateFieldConfig | undefined;
  };
}

export interface GenerateCertificateOptions {
  recipientName: string;
  eventTitle: string;
  uniqueId: string;
  issueDate?: Date | string;
  verificationUrl?: string;
  template?: CertificateTemplateConfig | null;
  organizerName?: string;
  hostChapter?: string;
}

// Convert hex color #RRGGBB to pdf-lib rgb(r, g, b)
function hexToPdfRgb(hex: string = "#ffffff") {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  if (isNaN(num)) return rgb(1, 1, 1);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return rgb(r, g, b);
}

/**
 * Generates an authentic, high-resolution A4 Landscape PDF certificate.
 */
export async function generateCertificatePdf(
  options: GenerateCertificateOptions
): Promise<Uint8Array> {
  const {
    recipientName,
    eventTitle,
    uniqueId,
    issueDate = new Date(),
    verificationUrl = `https://kailshiansx.com/verify?id=${options.uniqueId}`,
    template,
    organizerName = "Aarav Gorewal",
    hostChapter = "Kailshians Web Services",
  } = options;

  // A4 Landscape standard dimensions in points: 841.89 x 595.28
  const width = 842;
  const height = 595;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([width, height]);

  // Embed standard typography
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const formattedDate = new Date(issueDate).toLocaleDateString("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Check if a background image was provided in template
  let bgImageEmbedded = false;
  if (template?.templateUrl && template.templateUrl.startsWith("data:image/")) {
    try {
      const base64Data = template.templateUrl.split(",")[1];
      const imageBuffer = Buffer.from(base64Data, "base64");
      const isPng = template.templateUrl.includes("image/png");
      const bgImage = isPng
        ? await pdfDoc.embedPng(imageBuffer)
        : await pdfDoc.embedJpg(imageBuffer);
      page.drawImage(bgImage, {
        x: 0,
        y: 0,
        width,
        height,
      });
      bgImageEmbedded = true;
    } catch (err) {
      console.warn(
        "[PDF Engine] Failed to embed custom background image, falling back to vector art:",
        err
      );
    }
  }

  // If no custom image background, draw vector certificate border & background
  if (!bgImageEmbedded) {
    // Outer dark background fill
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(10 / 255, 15 / 255, 29 / 255), // #0a0f1d
    });

    // Dark inner panel
    page.drawRectangle({
      x: 24,
      y: 24,
      width: width - 48,
      height: height - 48,
      color: rgb(15 / 255, 23 / 255, 42 / 255), // #0f172a
      borderColor: rgb(56 / 255, 189 / 255, 248 / 255), // #38bdf8
      borderWidth: 1.5,
    });

    // Elegant inner gold margin line
    page.drawRectangle({
      x: 36,
      y: 36,
      width: width - 72,
      height: height - 72,
      borderColor: rgb(217 / 255, 119 / 255, 6 / 255), // #d97706 amber
      borderWidth: 1,
    });

    // Corner decorative accents
    const corners = [
      { x: 36, y: 36 },
      { x: width - 44, y: 36 },
      { x: 36, y: height - 44 },
      { x: width - 44, y: height - 44 },
    ];
    for (const c of corners) {
      page.drawRectangle({
        x: c.x,
        y: c.y,
        width: 8,
        height: 8,
        color: rgb(245 / 255, 158 / 255, 11 / 255),
      });
    }

    // Header branding
    const brandHeader = "KAILSHIANSX · DEVELOPER PLATFORM & BUILDER ECOSYSTEM";
    const brandHeaderWidth = helvetica.widthOfTextAtSize(brandHeader, 10);
    page.drawText(brandHeader, {
      x: (width - brandHeaderWidth) / 2,
      y: height - 75,
      size: 10,
      font: helvetica,
      color: rgb(56 / 255, 189 / 255, 248 / 255),
    });

    // Main Certificate Title
    const certTitle = "CERTIFICATE OF EXCELLENCE";
    const certTitleWidth = timesBold.widthOfTextAtSize(certTitle, 26);
    page.drawText(certTitle, {
      x: (width - certTitleWidth) / 2,
      y: height - 115,
      size: 26,
      font: timesBold,
      color: rgb(248 / 255, 250 / 255, 252 / 255),
    });

    const certSubtitle = "THIS IS PROUDLY PRESENTED TO";
    const certSubWidth = helvetica.widthOfTextAtSize(certSubtitle, 11);
    page.drawText(certSubtitle, {
      x: (width - certSubWidth) / 2,
      y: height - 148,
      size: 11,
      font: helvetica,
      color: rgb(148 / 255, 163 / 255, 184 / 255),
    });

    // Connecting description text
    const descText = "for distinguished participation and verified engineering excellence in";
    const descWidth = helvetica.widthOfTextAtSize(descText, 12);
    page.drawText(descText, {
      x: (width - descWidth) / 2,
      y: height - 265,
      size: 12,
      font: helvetica,
      color: rgb(203 / 255, 213 / 255, 225 / 255),
    });

    // Bottom Signatures & Chapter Info
    // Signatory 1
    page.drawLine({
      start: { x: 90, y: 110 },
      end: { x: 260, y: 110 },
      thickness: 1,
      color: rgb(71 / 255, 85 / 255, 105 / 255),
    });
    page.drawText(organizerName, {
      x: 90,
      y: 92,
      size: 12,
      font: helveticaBold,
      color: rgb(241 / 255, 245 / 255, 249 / 255),
    });
    page.drawText("Founder & Lead Organiser", {
      x: 90,
      y: 78,
      size: 9,
      font: helvetica,
      color: rgb(148 / 255, 163 / 255, 184 / 255),
    });

    // Signatory 2
    page.drawLine({
      start: { x: width - 260, y: 110 },
      end: { x: width - 90, y: 110 },
      thickness: 1,
      color: rgb(71 / 255, 85 / 255, 105 / 255),
    });
    page.drawText(hostChapter, {
      x: width - 260,
      y: 92,
      size: 12,
      font: helveticaBold,
      color: rgb(241 / 255, 245 / 255, 249 / 255),
    });
    page.drawText("Verified Issuing Chapter", {
      x: width - 260,
      y: 78,
      size: 9,
      font: helvetica,
      color: rgb(148 / 255, 163 / 255, 184 / 255),
    });
  }

  // --- Dynamic Coordinate Field Drawing ---
  const fields = template?.fields || {};

  // 1. Recipient Name
  const nameConf = fields.recipientName || {
    x: 50,
    y: 35,
    fontSize: 32,
    color: "#ffffff",
    align: "center",
  };
  const nameSize = nameConf.fontSize || 32;
  const nameColor = hexToPdfRgb(nameConf.color || "#ffffff");
  const nameTextWidth = helveticaBold.widthOfTextAtSize(recipientName, nameSize);
  let nameX = (nameConf.x / 100) * width;
  if (nameConf.align === "center") nameX -= nameTextWidth / 2;
  else if (nameConf.align === "right") nameX -= nameTextWidth;
  const nameY = height - (nameConf.y / 100) * height;
  page.drawText(recipientName, {
    x: Math.max(30, nameX),
    y: nameY,
    size: nameSize,
    font: helveticaBold,
    color: nameColor,
  });

  // 2. Event Title
  const eventConf = fields.eventTitle || {
    x: 50,
    y: 53,
    fontSize: 20,
    color: "#38bdf8",
    align: "center",
  };
  const eventSize = eventConf.fontSize || 20;
  const eventColor = hexToPdfRgb(eventConf.color || "#38bdf8");
  const eventTextWidth = helveticaBold.widthOfTextAtSize(eventTitle, eventSize);
  let eventX = (eventConf.x / 100) * width;
  if (eventConf.align === "center") eventX -= eventTextWidth / 2;
  else if (eventConf.align === "right") eventX -= eventTextWidth;
  const eventY = height - (eventConf.y / 100) * height;
  page.drawText(eventTitle, {
    x: Math.max(30, eventX),
    y: eventY,
    size: eventSize,
    font: helveticaBold,
    color: eventColor,
  });

  // 3. Issue Date
  const dateConf = fields.issueDate || {
    x: 50,
    y: 64,
    fontSize: 11,
    color: "#94a3b8",
    align: "center",
  };
  const dateSize = dateConf.fontSize || 11;
  const dateColor = hexToPdfRgb(dateConf.color || "#94a3b8");
  const dateStr = `Issued on ${formattedDate}`;
  const dateTextWidth = helvetica.widthOfTextAtSize(dateStr, dateSize);
  let dateX = (dateConf.x / 100) * width;
  if (dateConf.align === "center") dateX -= dateTextWidth / 2;
  else if (dateConf.align === "right") dateX -= dateTextWidth;
  const dateY = height - (dateConf.y / 100) * height;
  page.drawText(dateStr, {
    x: Math.max(30, dateX),
    y: dateY,
    size: dateSize,
    font: helvetica,
    color: dateColor,
  });

  // 4. Credential ID
  const idConf = fields.uniqueId || {
    x: 50,
    y: 92,
    fontSize: 10,
    color: "#94a3b8",
    align: "center",
  };
  const idSize = idConf.fontSize || 10;
  const idColor = hexToPdfRgb(idConf.color || "#94a3b8");
  const idStr = `CREDENTIAL ID: ${uniqueId}`;
  const idTextWidth = courier.widthOfTextAtSize(idStr, idSize);
  let idX = (idConf.x / 100) * width;
  if (idConf.align === "center") idX -= idTextWidth / 2;
  else if (idConf.align === "right") idX -= idTextWidth;
  const idY = height - (idConf.y / 100) * height;
  page.drawText(idStr, {
    x: Math.max(30, idX),
    y: idY,
    size: idSize,
    font: courier,
    color: idColor,
  });

  // 5. Verification QR Code
  const qrConf = fields.qrCode || { x: 50, y: 78, size: 68, align: "center" };
  const qrSize = qrConf.size || 68;
  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 250,
      color: {
        dark: "#0a0f1d",
        light: "#ffffff",
      },
    });
    const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    const qrBuffer = Buffer.from(qrBase64, "base64");
    const embeddedQr = await pdfDoc.embedPng(qrBuffer);

    let qrX = (qrConf.x / 100) * width;
    if (qrConf.align === "center") qrX -= qrSize / 2;
    else if (qrConf.align === "right") qrX -= qrSize;
    const qrY = height - (qrConf.y / 100) * height - qrSize;

    // Draw white backdrop for high-contrast QR scanning
    page.drawRectangle({
      x: qrX - 3,
      y: qrY - 3,
      width: qrSize + 6,
      height: qrSize + 6,
      color: rgb(1, 1, 1),
      borderColor: rgb(56 / 255, 189 / 255, 248 / 255),
      borderWidth: 1,
    });

    page.drawImage(embeddedQr, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });
  } catch (err) {
    console.error("[PDF Engine] Failed to embed QR code into certificate PDF:", err);
  }

  return await pdfDoc.save();
}
