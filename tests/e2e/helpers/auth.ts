import { db } from "@/lib/db";

export const E2E_ADMIN_EMAIL = "aaravgorewal1@gmail.com";

/**
 * Creates or refreshes a database session for the super admin user
 * and returns the session token to set in the browser cookie.
 */
export async function createAdminSessionToken(): Promise<string> {
  // Ensure admin user exists with SUPER_ADMIN role
  const user = await db.user.upsert({
    where: { email: E2E_ADMIN_EMAIL },
    update: { role: "SUPER_ADMIN" },
    create: {
      email: E2E_ADMIN_EMAIL,
      name: "Aarav Gorewal",
      role: "SUPER_ADMIN",
    },
  });

  const sessionToken = `e2e_admin_session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });

  return sessionToken;
}
