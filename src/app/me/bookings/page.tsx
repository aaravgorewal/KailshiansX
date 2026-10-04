// src/app/me/bookings/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserBookings } from "@/server/speakers/service";
import { UserBookingsClient } from "@/components/network/UserBookingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Booked Sessions | KailshiansX",
  description: "View status of your requested mentorship and speaking sessions.",
};

export default async function UserBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/me/bookings");
  }

  const bookings = await getUserBookings(session.user.id);

  return (
    <UserBookingsClient
      initialBookings={bookings.map((b) => ({
        ...b,
        preferredDate: b.preferredDate.toISOString(),
        createdAt: b.createdAt.toISOString(),
      }))}
    />
  );
}
