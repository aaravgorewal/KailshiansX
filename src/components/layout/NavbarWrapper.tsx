// src/components/layout/NavbarWrapper.tsx
// Server component — reads auth session and injects it into the Navbar.
// This keeps the Navbar itself a Client Component while getting session
// via a Server Component wrapper (standard Auth.js v5 + RSC pattern).

import { auth } from "@/lib/auth";
import { Navbar } from "./Navbar";
import type { UserRole } from "@prisma/client";

export async function NavbarWrapper() {
  const session = await auth();

  const user = session?.user
    ? {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
        role: session.user.role as UserRole,
      }
    : null;

  return <Navbar user={user} />;
}
