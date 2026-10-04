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

export async function createUserSessionToken(options?: {
  email?: string;
  name?: string;
  role?:
    "SUPER_ADMIN" | "ADMIN" | "EVENT_MANAGER" | "MEMBER" | "CAMPUS_LEAD" | "STATE_LEAD" | "VIEWER";
}): Promise<{ sessionToken: string; email: string; name: string; userId: string }> {
  const email = options?.email || `user-${Date.now()}@example.com`;
  const name = options?.name || "Dev Builder";
  const role = options?.role || "MEMBER";

  const user = await db.user.upsert({
    where: { email },
    update: { role },
    create: {
      email,
      name,
      role,
    },
  });

  const sessionToken = `e2e_user_session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });

  return { sessionToken, email, name, userId: user.id };
}

/**
 * Creates or gets an active Campus Lead with an associated user session.
 */
export async function createCampusLeadSessionToken(): Promise<{
  sessionToken: string;
  leadId: string;
  userId: string;
  collegeName: string;
  cityName: string;
}> {
  const lead = await db.campusLead.findFirst({
    where: { status: "ACTIVE" },
    include: { user: true, college: true, city: true },
  });

  if (!lead) {
    throw new Error("No active campus lead found in database. Please run db:seed first.");
  }

  // Ensure user has CAMPUS_LEAD role
  await db.user.update({
    where: { id: lead.userId },
    data: { role: "CAMPUS_LEAD" },
  });

  const sessionToken = `e2e_campus_session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  await db.session.create({
    data: {
      sessionToken,
      userId: lead.userId,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return {
    sessionToken,
    leadId: lead.id,
    userId: lead.userId,
    collegeName: lead.college?.name || "Campus Chapter",
    cityName: lead.city?.name || "Dehradun",
  };
}

/**
 * Creates or gets an active State Lead with an associated user session.
 */
export async function createStateLeadSessionToken(): Promise<{
  sessionToken: string;
  leadId: string;
  userId: string;
  state: string;
}> {
  const lead = await db.stateLead.findFirst({
    where: { status: "ACTIVE" },
    include: { user: true },
  });

  if (!lead) {
    throw new Error("No active state lead found in database. Please run db:seed first.");
  }

  // Ensure user has STATE_LEAD role
  await db.user.update({
    where: { id: lead.userId },
    data: { role: "STATE_LEAD" },
  });

  const sessionToken = `e2e_state_session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  await db.session.create({
    data: {
      sessionToken,
      userId: lead.userId,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return {
    sessionToken,
    leadId: lead.id,
    userId: lead.userId,
    state: lead.state,
  };
}
