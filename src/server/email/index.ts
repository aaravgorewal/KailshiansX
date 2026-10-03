// src/server/email/index.ts
// Centralized email gateway for KailshiansX.
// Uses React Email templates and a DB-backed persistent queue with retries.

import { EmailTemplate } from "@prisma/client";
import { enqueueEmail, type EnqueueEmailOptions } from "./queue";
import type { RegistrationConfirmationEmailProps } from "./templates/RegistrationConfirmationEmail";
import type { PaymentFailedEmailProps } from "./templates/PaymentFailedEmail";
import type { RefundProcessedEmailProps } from "./templates/RefundProcessedEmail";
import type { ApplicationReceivedEmailProps } from "./templates/ApplicationReceivedEmail";
import type { StatusChangeEmailProps } from "./templates/StatusChangeEmail";
import type { CollaborationAckEmailProps } from "./templates/CollaborationAckEmail";
import type { EventReminderEmailProps } from "./templates/EventReminderEmail";

export * from "./queue";
export * from "./renderer";
export * from "./client";

// ─────────────────────────────────────────────────────────────────────────────
// HIGH-LEVEL CONVENIENCE QUEUE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Queues a registration confirmation with digital ticket pass & QR code.
 */
export async function queueRegistrationConfirmationEmail(
  recipient: string,
  payload: RegistrationConfirmationEmailProps,
  options?: Partial<EnqueueEmailOptions<typeof EmailTemplate.REGISTRATION_CONFIRMATION>>
) {
  return enqueueEmail({
    template: EmailTemplate.REGISTRATION_CONFIRMATION,
    recipient,
    payload,
    ...options,
  });
}

/**
 * Queues a payment failed alert with recovery & retry instructions.
 */
export async function queuePaymentFailedEmail(
  recipient: string,
  payload: PaymentFailedEmailProps,
  options?: Partial<EnqueueEmailOptions<typeof EmailTemplate.PAYMENT_FAILED>>
) {
  return enqueueEmail({
    template: EmailTemplate.PAYMENT_FAILED,
    recipient,
    payload,
    ...options,
  });
}

/**
 * Queues a refund processed confirmation with reference ID & banking timeline.
 */
export async function queueRefundProcessedEmail(
  recipient: string,
  payload: RefundProcessedEmailProps,
  options?: Partial<EnqueueEmailOptions<typeof EmailTemplate.REFUND_PROCESSED>>
) {
  return enqueueEmail({
    template: EmailTemplate.REFUND_PROCESSED,
    recipient,
    payload,
    ...options,
  });
}

/**
 * Queues an application received acknowledgement (Campus Lead, State Lead, Core Team).
 */
export async function queueApplicationReceivedEmail(
  recipient: string,
  payload: ApplicationReceivedEmailProps,
  options?: Partial<EnqueueEmailOptions<typeof EmailTemplate.APPLICATION_RECEIVED>>
) {
  return enqueueEmail({
    template: EmailTemplate.APPLICATION_RECEIVED,
    recipient,
    payload,
    ...options,
  });
}

/**
 * Queues an application status-change notification (Screening, Interview, Selected, Rejected).
 */
export async function queueStatusChangeEmail(
  recipient: string,
  payload: StatusChangeEmailProps,
  options?: Partial<EnqueueEmailOptions<typeof EmailTemplate.STATUS_CHANGE>>
) {
  return enqueueEmail({
    template: EmailTemplate.STATUS_CHANGE,
    recipient,
    payload,
    ...options,
  });
}

/**
 * Queues a partnership / collaboration auto-acknowledgement.
 */
export async function queueCollaborationAckEmail(
  recipient: string,
  payload: CollaborationAckEmailProps,
  options?: Partial<EnqueueEmailOptions<typeof EmailTemplate.COLLABORATION_ACK>>
) {
  return enqueueEmail({
    template: EmailTemplate.COLLABORATION_ACK,
    recipient,
    payload,
    ...options,
  });
}

/**
 * Queues a 24-hour event reminder with venue details, check-in pass, and arrival checklist.
 */
export async function queueEventReminderEmail(
  recipient: string,
  payload: EventReminderEmailProps,
  options?: Partial<EnqueueEmailOptions<typeof EmailTemplate.EVENT_REMINDER_24H>>
) {
  return enqueueEmail({
    template: EmailTemplate.EVENT_REMINDER_24H,
    recipient,
    payload,
    ...options,
  });
}
