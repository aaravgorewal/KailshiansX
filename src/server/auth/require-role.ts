// src/server/auth/require-role.ts
// Server-side authorization helpers for server actions and API routes.
//
// Usage in a server action:
//   const session = await requireRole(["ADMIN", "SUPER_ADMIN"]);
//   // session.user is now typed and role-verified
//
// Usage in a route handler:
//   const session = await requireRole(["EVENT_MANAGER"], request);
//   if (session instanceof Response) return session;

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

export type AuthorizedSession = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
  };
};

const ADMIN_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"];

/**
 * Use in Server Components / Server Actions.
 * Throws redirect to /signin if unauthenticated.
 * Throws redirect to / with an error if role is insufficient.
 */
export async function requireRole(
  allowedRoles: UserRole[],
  options?: { redirectTo?: string }
): Promise<AuthorizedSession> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=${options?.redirectTo ?? "/"}`);
  }

  if (!allowedRoles.includes(session.user.role as UserRole)) {
    redirect("/?error=Unauthorized");
  }

  return session as AuthorizedSession;
}

/**
 * Convenience wrapper — admin only (SUPER_ADMIN | ADMIN | EVENT_MANAGER)
 */
export async function requireAdmin(): Promise<AuthorizedSession> {
  return requireRole(ADMIN_ROLES);
}

/**
 * Use in Route Handlers (returns Response instead of redirecting).
 * Returns the session on success, or a 401/403 Response.
 */
export async function requireRoleForRoute(
  allowedRoles: UserRole[]
): Promise<AuthorizedSession | Response> {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthenticated" }, { status: 401 });
  }

  if (!allowedRoles.includes(session.user.role as UserRole)) {
    return Response.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  return session as AuthorizedSession;
}

/**
 * Convenience wrapper — admin only, for route handlers
 */
export async function requireAdminForRoute(): Promise<AuthorizedSession | Response> {
  return requireRoleForRoute(ADMIN_ROLES);
}
