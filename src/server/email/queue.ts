// src/server/email/queue.ts
// DB-backed persistent email job queue with exponential backoff retries and forensic audit logging.

import { db } from "@/lib/db";
import { EmailJobStatus, EmailTemplate, type EmailLog, type Prisma } from "@prisma/client";
import { renderEmailTemplate, type EmailTemplatePayloadMap } from "./renderer";
import { sendRawEmail } from "./client";

export interface EnqueueEmailOptions<T extends EmailTemplate> {
  template: T;
  recipient: string;
  subject?: string;
  payload: EmailTemplatePayloadMap[T];
  scheduledFor?: Date;
  maxAttempts?: number;
  immediate?: boolean;
}

/**
 * Enqueues an email into the database queue. If immediate=true and scheduledFor is now/past,
 * dispatches the send right away.
 */
export async function enqueueEmail<T extends EmailTemplate>(
  options: EnqueueEmailOptions<T>
): Promise<EmailLog> {
  const {
    template,
    recipient,
    subject,
    payload,
    scheduledFor = new Date(),
    maxAttempts = 3,
    immediate = true,
  } = options;

  // Pre-render to resolve default subject and validate template payload before saving
  let resolvedSubject = subject;
  let precomputedHtml: string | null = null;

  try {
    const rendered = await renderEmailTemplate(template, payload);
    if (!resolvedSubject) {
      resolvedSubject = rendered.defaultSubject;
    }
    precomputedHtml = rendered.html;
  } catch (err: unknown) {
    console.error(`[Queue Pre-render Failed for ${template}]:`, err);
    if (!resolvedSubject) {
      resolvedSubject = `KailshiansX Notification: ${template}`;
    }
  }

  const log = await db.emailLog.create({
    data: {
      template,
      recipient: recipient.toLowerCase().trim(),
      subject: resolvedSubject,
      payload: payload as unknown as Prisma.InputJsonValue,
      html: precomputedHtml,
      status: EmailJobStatus.PENDING,
      attempts: 0,
      maxAttempts,
      scheduledFor,
    },
  });

  const shouldDispatchNow = immediate && scheduledFor.getTime() <= Date.now() + 5000;

  if (shouldDispatchNow) {
    // Dispatch in-process
    try {
      return await dispatchEmailJob(log.id);
    } catch (err) {
      console.warn(`[Immediate Dispatch Warning] Job ${log.id} queued for retry:`, err);
      return log;
    }
  }

  return log;
}

/**
 * Dispatches an individual email job by ID.
 * Handles rendering, Resend API send, state transitions, and exponential retry backoff.
 */
export async function dispatchEmailJob(id: string): Promise<EmailLog> {
  const job = await db.emailLog.findUnique({ where: { id } });
  if (!job) {
    throw new Error(`Email job ${id} not found`);
  }

  // Mark as PROCESSING
  await db.emailLog.update({
    where: { id },
    data: { status: EmailJobStatus.PROCESSING },
  });

  let html = job.html;
  let subject = job.subject;

  // If HTML is not yet generated, render it now
  if (!html) {
    try {
      const rendered = await renderEmailTemplate(
        job.template,
        job.payload as unknown as EmailTemplatePayloadMap[typeof job.template]
      );
      html = rendered.html;
      if (!subject) {
        subject = rendered.defaultSubject;
      }
    } catch (err: unknown) {
      const renderError = err instanceof Error ? err.message : String(err);
      return await db.emailLog.update({
        where: { id },
        data: {
          status: EmailJobStatus.FAILED,
          failedAt: new Date(),
          error: `Render Error: ${renderError}`,
          attempts: job.attempts + 1,
        },
      });
    }
  }

  // Attempt send via provider
  const sendResult = await sendRawEmail({
    to: job.recipient,
    subject,
    html,
  });

  const nextAttemptCount = job.attempts + 1;

  if (sendResult.success) {
    return await db.emailLog.update({
      where: { id },
      data: {
        status: EmailJobStatus.SENT,
        sentAt: new Date(),
        messageId: sendResult.messageId || null,
        error: null,
        html,
        subject,
        attempts: nextAttemptCount,
      },
    });
  }

  // Send failed — compute exponential retry backoff
  const isFinalFailure = nextAttemptCount >= job.maxAttempts;

  if (isFinalFailure) {
    return await db.emailLog.update({
      where: { id },
      data: {
        status: EmailJobStatus.FAILED,
        failedAt: new Date(),
        error: sendResult.error || "Delivery failed after maximum attempts",
        attempts: nextAttemptCount,
        html,
      },
    });
  }

  // Backoff: 2^attempt minutes (e.g. attempt 1 -> 2m, attempt 2 -> 4m)
  const backoffMinutes = Math.pow(2, nextAttemptCount);
  const nextScheduled = new Date(Date.now() + backoffMinutes * 60 * 1000);

  return await db.emailLog.update({
    where: { id },
    data: {
      status: EmailJobStatus.PENDING,
      scheduledFor: nextScheduled,
      error: sendResult.error || "Transient delivery error",
      attempts: nextAttemptCount,
      html,
    },
  });
}

/**
 * Worker sweep: fetches all PENDING jobs whose scheduledFor <= now and processes them.
 */
export async function processEmailQueue(options?: { batchSize?: number }) {
  const batchSize = options?.batchSize || 25;

  const pendingJobs = await db.emailLog.findMany({
    where: {
      status: EmailJobStatus.PENDING,
      scheduledFor: { lte: new Date() },
    },
    orderBy: { scheduledFor: "asc" },
    take: batchSize,
  });

  let succeeded = 0;
  let failed = 0;

  for (const job of pendingJobs) {
    try {
      const res = await dispatchEmailJob(job.id);
      if (res.status === EmailJobStatus.SENT) {
        succeeded++;
      } else {
        failed++;
      }
    } catch (err) {
      console.error(`Failed processing queue job ${job.id}:`, err);
      failed++;
    }
  }

  return {
    processed: pendingJobs.length,
    succeeded,
    failed,
  };
}

/**
 * Manually retries an email job from the admin interface.
 */
export async function retryEmailJob(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const job = await db.emailLog.findUnique({ where: { id } });
    if (!job) {
      return { success: false, error: "Email log not found" };
    }

    // Reset status and schedule immediately
    await db.emailLog.update({
      where: { id },
      data: {
        status: EmailJobStatus.PENDING,
        scheduledFor: new Date(),
        error: null,
      },
    });

    const result = await dispatchEmailJob(id);
    if (result.status === EmailJobStatus.SENT) {
      return { success: true };
    }

    return {
      success: false,
      error: result.error || "Retry attempt failed",
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Returns telemetry metrics for the admin email logs dashboard.
 */
export async function getEmailLogStats() {
  const [total, sent, failed, pending, processing] = await Promise.all([
    db.emailLog.count(),
    db.emailLog.count({ where: { status: EmailJobStatus.SENT } }),
    db.emailLog.count({ where: { status: EmailJobStatus.FAILED } }),
    db.emailLog.count({ where: { status: EmailJobStatus.PENDING } }),
    db.emailLog.count({ where: { status: EmailJobStatus.PROCESSING } }),
  ]);

  const deliveryRate = total > 0 ? Math.round((sent / total) * 100) : 100;

  return {
    total,
    sent,
    failed,
    pending,
    processing,
    deliveryRate,
  };
}
