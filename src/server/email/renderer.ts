// src/server/email/renderer.ts
// Renders React Email templates to production-ready HTML strings.

import * as React from "react";
import { render } from "@react-email/render";
import { EmailTemplate } from "@prisma/client";
import {
  RegistrationConfirmationEmail,
  type RegistrationConfirmationEmailProps,
} from "./templates/RegistrationConfirmationEmail";
import { PaymentFailedEmail, type PaymentFailedEmailProps } from "./templates/PaymentFailedEmail";
import {
  RefundProcessedEmail,
  type RefundProcessedEmailProps,
} from "./templates/RefundProcessedEmail";
import {
  ApplicationReceivedEmail,
  type ApplicationReceivedEmailProps,
} from "./templates/ApplicationReceivedEmail";
import { StatusChangeEmail, type StatusChangeEmailProps } from "./templates/StatusChangeEmail";
import {
  CollaborationAckEmail,
  type CollaborationAckEmailProps,
} from "./templates/CollaborationAckEmail";
import { EventReminderEmail, type EventReminderEmailProps } from "./templates/EventReminderEmail";
import {
  CertificateIssuedEmail,
  type CertificateIssuedEmailProps,
} from "./templates/CertificateIssuedEmail";

export type EmailTemplatePayloadMap = {
  REGISTRATION_CONFIRMATION: RegistrationConfirmationEmailProps;
  PAYMENT_FAILED: PaymentFailedEmailProps;
  REFUND_PROCESSED: RefundProcessedEmailProps;
  APPLICATION_RECEIVED: ApplicationReceivedEmailProps;
  STATUS_CHANGE: StatusChangeEmailProps;
  COLLABORATION_ACK: CollaborationAckEmailProps;
  EVENT_REMINDER_24H: EventReminderEmailProps;
  CERTIFICATE_ISSUED: CertificateIssuedEmailProps;
};

export async function renderEmailTemplate<T extends EmailTemplate>(
  template: T,
  payload: EmailTemplatePayloadMap[T]
): Promise<{ html: string; defaultSubject: string }> {
  let element: React.ReactElement;
  let defaultSubject = "KailshiansX Notification";

  switch (template) {
    case EmailTemplate.REGISTRATION_CONFIRMATION: {
      const p = payload as RegistrationConfirmationEmailProps;
      element = React.createElement(RegistrationConfirmationEmail, p);
      defaultSubject = `Confirmed Pass: ${p.eventTitle} (${p.registrationCode})`;
      break;
    }

    case EmailTemplate.PAYMENT_FAILED: {
      const p = payload as PaymentFailedEmailProps;
      element = React.createElement(PaymentFailedEmail, p);
      defaultSubject = `Action Required: Payment Incomplete for ${p.eventTitle}`;
      break;
    }

    case EmailTemplate.REFUND_PROCESSED: {
      const p = payload as RefundProcessedEmailProps;
      element = React.createElement(RefundProcessedEmail, p);
      defaultSubject = `Refund Dispatched: ${p.eventTitle} (ID: ${p.refundId})`;
      break;
    }

    case EmailTemplate.APPLICATION_RECEIVED: {
      const p = payload as ApplicationReceivedEmailProps;
      element = React.createElement(ApplicationReceivedEmail, p);
      const typeLabel =
        p.applicationType === "CAMPUS_LEAD"
          ? "Campus Lead"
          : p.applicationType === "STATE_LEAD"
            ? "State Lead"
            : "Team Opening";
      defaultSubject = `Application Received: ${typeLabel} (${p.referenceId})`;
      break;
    }

    case EmailTemplate.STATUS_CHANGE: {
      const p = payload as StatusChangeEmailProps;
      element = React.createElement(StatusChangeEmail, p);
      defaultSubject = `Application Update: Stage is now ${p.newStatus} (${p.referenceId})`;
      break;
    }

    case EmailTemplate.COLLABORATION_ACK: {
      const p = payload as CollaborationAckEmailProps;
      element = React.createElement(CollaborationAckEmail, p);
      defaultSubject = `Partnership Proposal Received: KailshiansX x ${p.organisation} (${p.referenceCode})`;
      break;
    }

    case EmailTemplate.EVENT_REMINDER_24H: {
      const p = payload as EventReminderEmailProps;
      element = React.createElement(EventReminderEmail, p);
      defaultSubject = `Reminder: ${p.eventTitle} begins tomorrow! Pass: ${p.registrationCode}`;
      break;
    }

    case EmailTemplate.CERTIFICATE_ISSUED: {
      const p = payload as CertificateIssuedEmailProps;
      element = React.createElement(CertificateIssuedEmail, p);
      defaultSubject = `Your Verified Certificate of Achievement: ${p.eventTitle} (${p.uniqueId})`;
      break;
    }

    default:
      throw new Error(`Unknown email template: ${template}`);
  }

  const html = await render(element);
  return { html, defaultSubject };
}
