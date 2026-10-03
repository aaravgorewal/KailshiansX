import crypto from "crypto";
import QRCode from "qrcode";

export interface QrTicketPayload {
  registrationCode: string;
  eventId: string;
  ticketTypeId: string;
  email: string;
  issuedAt: number;
}

const QR_SECRET =
  process.env.KX_TICKET_SECRET ||
  process.env.AUTH_SECRET ||
  "kws_kailshiansx_ticket_signing_secret_2026";

/**
 * Generate human-readable registration code: KX-<EVENTCODE>-<NNNN>
 * e.g. "padharox-01" -> "KX-PX01-0042"
 */
export function generateRegistrationCode(eventSlug: string, sequence: number): string {
  // Extract alphanumeric abbreviation from slug
  const parts = eventSlug.split("-");
  let prefix = "";
  if (parts.length >= 2) {
    prefix = (parts[0].slice(0, 2) + parts[1].slice(0, 2)).toUpperCase();
  } else {
    prefix = eventSlug.slice(0, 4).toUpperCase();
  }

  const paddedSeq = String(sequence).padStart(4, "0");
  return `KX-${prefix}-${paddedSeq}`;
}

/**
 * Sign QR code payload with HMAC-SHA256
 * Returns compact token format: <base64url(payload)>.<signature>
 */
export function signQrPayload(payload: QrTicketPayload): string {
  const jsonStr = JSON.stringify(payload);
  const dataB64 = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto.createHmac("sha256", QR_SECRET).update(dataB64).digest("hex");

  return `${dataB64}.${signature}`;
}

/**
 * Verify signed QR code token
 */
export function verifyQrPayload(token: string): {
  valid: boolean;
  payload?: QrTicketPayload;
  error?: string;
} {
  if (!token || !token.includes(".")) {
    return { valid: false, error: "Malformed QR token structure" };
  }

  const [dataB64, signature] = token.split(".");
  if (!dataB64 || !signature) {
    return { valid: false, error: "Missing data or signature in QR token" };
  }

  const expectedSignature = crypto.createHmac("sha256", QR_SECRET).update(dataB64).digest("hex");

  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return { valid: false, error: "Invalid ticket signature or tampered QR code" };
  }

  try {
    const jsonStr = Buffer.from(dataB64, "base64url").toString("utf-8");
    const payload = JSON.parse(jsonStr) as QrTicketPayload;
    return { valid: true, payload };
  } catch {
    return { valid: false, error: "Failed to parse ticket payload JSON" };
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQrCodeSvg(payloadString: string): Promise<string> {
  return QRCode.toString(payloadString, {
    type: "svg",
    margin: 1,
    color: {
      dark: "#ffffff",
      light: "#07090e",
    },
  });
}

/**
 * Generate QR code as base64 Data URL (PNG)
 */
export async function generateQrCodeDataUrl(payloadString: string): Promise<string> {
  return QRCode.toDataURL(payloadString, {
    margin: 1,
    width: 320,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}
