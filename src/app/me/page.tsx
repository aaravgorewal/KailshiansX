// src/app/me/page.tsx
// Member Profile & Developer Passport Hub (/me)
// Displays My Events, Tickets (QR), Certificates, Workshops, Hackathons, Applications, and Community Role.

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getMemberDashboardData } from "@/server/users/profile";
import { MemberDashboardClient } from "@/components/profile/MemberDashboardClient";

export const metadata: Metadata = {
  title: "My Profile & Developer Passport | KailshiansX",
  description:
    "Manage your registered events, live QR tickets, verified certificates, and Developer Passport credentials.",
  robots: {
    index: false, // Member hub is authenticated/private
    follow: false,
  },
};

export default async function MemberProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/me");
  }

  const dashboardData = await getMemberDashboardData(session.user.id);

  if (!dashboardData) {
    redirect("/signin");
  }

  return (
    <main className="bg-surface-950 min-h-screen px-4 pt-24 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <MemberDashboardClient initialData={dashboardData} />
      </div>
    </main>
  );
}
