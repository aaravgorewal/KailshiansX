// src/server/auth/audit.ts
// AuditLog write helper — used by all admin mutations.
//
// Usage:
//   await writeAudit({
//     userId: session.user.id,
//     action: "UPDATE",
//     entityType: "Event",
//     entityId: event.id,
//     before: originalEvent,
//     after: updatedEvent,
//   });

import { db } from "@/lib/db";
import type { AuditAction } from "@prisma/client";

export interface AuditParams {
  /** Auth user performing the action (null for system actions) */
  userId?: string | null;
  action: AuditAction;
  /** Model name, e.g. "Event", "Registration", "User" */
  entityType: string;
  /** ID of the record being mutated */
  entityId?: string | null;
  /** Snapshot of the record BEFORE the change (omit for creates) */
  before?: object | null;
  /** Snapshot of the record AFTER the change (omit for deletes) */
  after?: object | null;
  /** Client IP address */
  ipAddress?: string | null;
  /** User-Agent string */
  userAgent?: string | null;
}

/**
 * Write a single audit log entry.
 * Swallows errors (logging must never break business logic).
 */
export async function writeAudit(params: AuditParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        before: params.before ? (params.before as object) : undefined,
        after: params.after ? (params.after as object) : undefined,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (err) {
    // Never let audit logging break the caller
    console.error("[AuditLog] Failed to write audit entry:", err);
  }
}

/**
 * Extract IP and User-Agent from a Request or NextRequest.
 * Pass to writeAudit for full request tracing.
 */
export function extractRequestMeta(request: Request): {
  ipAddress: string | null;
  userAgent: string | null;
} {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null,
    userAgent: request.headers.get("user-agent") ?? null,
  };
}
