import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PaymentRecoveryClient } from "./PaymentRecoveryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Complete Your Registration Payment | KailshiansX",
};

interface PaymentRecoveryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentRecoveryPage({
  params,
  searchParams,
}: PaymentRecoveryPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const regId = typeof sParams.regId === "string" ? sParams.regId : "";

  if (!regId) {
    redirect(`/events/${slug}/register`);
  }

  const registration = await db.registration.findFirst({
    where: {
      OR: [{ id: regId }, { registrationCode: regId }],
      event: { slug },
      deletedAt: null,
    },
    include: {
      event: true,
      ticketType: true,
      payment: true,
    },
  });

  if (!registration || !registration.payment) {
    notFound();
  }

  // If already confirmed, redirect directly to ticket
  if (registration.status === "CONFIRMED") {
    redirect(`/events/${slug}/ticket/${registration.registrationCode}`);
  }

  const keyId =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_dummy";

  return (
    <div className="bg-surface-950 min-h-screen py-16">
      <div className="container-page mx-auto max-w-xl">
        <PaymentRecoveryClient
          eventSlug={slug}
          eventTitle={registration.event.title}
          registrationId={registration.id}
          registrationCode={registration.registrationCode}
          ticketName={registration.ticketType.name}
          amount={Number(registration.payment.amount)}
          email={registration.email}
          name={registration.name}
          phone={registration.phone}
          razorpayOrderId={registration.payment.razorpayOrderId}
          razorpayKeyId={keyId}
          holdExpiresAt={
            registration.holdExpiresAt
              ? registration.holdExpiresAt.toISOString()
              : new Date(registration.createdAt.getTime() + 10 * 60 * 1000).toISOString()
          }
        />
      </div>
    </div>
  );
}
