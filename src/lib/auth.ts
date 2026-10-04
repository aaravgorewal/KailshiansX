// src/lib/auth.ts
// Central Auth.js v5 configuration — export { handlers, auth, signIn, signOut }
// Used by: API route, proxy.ts, server components, server actions

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.RESEND_FROM_EMAIL ?? "hello@kailshiansx.com",
      name: "KailshiansX",
    }),
  ],

  session: {
    strategy: "database",
  },

  pages: {
    signIn: "/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },

  callbacks: {
    // Attach role + id to session
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        // Fetch role fresh from DB on every session refresh
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        session.user.role = dbUser?.role ?? "VIEWER";
      }
      return session;
    },
  },

  events: {
    // Write audit log and auto-link past records on sign-in
    async signIn({ user }) {
      if (user?.id) {
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN",
            entityType: "User",
            entityId: user.id,
          },
        });

        // Auto-link past registrations and certificates matching verified email
        if (user.email) {
          try {
            const { autoLinkUserRecords } = await import("@/server/users/autolink");
            await autoLinkUserRecords(user.id, user.email);
          } catch (err) {
            console.error("Failed to auto-link user records on sign in:", err);
          }
        }
      }
    },
    async signOut(message) {
      // message.session exists when using database sessions
      const sessionObj = "session" in message ? message.session : null;
      const userId = (sessionObj as { userId?: string } | null)?.userId ?? null;
      if (userId) {
        await db.auditLog.create({
          data: {
            userId,
            action: "LOGOUT",
            entityType: "User",
            entityId: userId,
          },
        });
      }
    },
  },
});
