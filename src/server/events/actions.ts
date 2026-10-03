"use server";

import { db } from "@/lib/db";
import { registrationFormSchema, type RegistrationFormData } from "@/lib/validations/registration";
import { reserveTicketSeat, RegistrationError } from "./quota";
import { generateRegistrationCode, signQrPayload, generateQrCodeDataUrl } from "./registration";
import { createRazorpayOrder, verifyRazorpayPaymentSignature } from "../payments/razorpay";
import { sendRegistrationConfirmationEmail } from "../email/confirmation";
import { queueEventReminderEmail } from "../email";

export interface InitiateRegistrationResult {
  success: boolean;
  isFree?: boolean;
  registrationId?: string;
  registrationCode?: string;
  redirectUrl?: string;
  error?: string;
  razorpayOrder?: {
    id: string;
    amount: number;
    currency: string;
    keyId: string;
    name: string;
    description: string;
    prefill: {
      name: string;
      email: string;
      contact: string;
    };
  };
  holdExpiresAt?: string;
}

/**
 * Server action to initiate registration for an event.
 * Handles free registration immediately or creates Razorpay order with atomic seat holding.
 */
export async function initiateRegistration(
  eventId: string,
  formData: RegistrationFormData
): Promise<InitiateRegistrationResult> {
  try {
    // 1. Validate Form Input
    const validated = registrationFormSchema.parse(formData);

    // Spam honeypot check
    if (validated.website_url_hp && validated.website_url_hp.length > 0) {
      return { success: false, error: "Submission rejected." };
    }

    const event = await db.event.findUnique({
      where: { id: eventId },
      include: { city: true },
    });

    if (!event || event.status === "DRAFT" || event.deletedAt) {
      return { success: false, error: "Event is no longer active." };
    }

    // 2. Execute Atomic Reservation inside a Database Transaction
    const result = await db.$transaction(async (tx) => {
      // Reserve seat with 10-minute hold and verify no duplicate email registration
      const { ticketType, holdExpiresAt } = await reserveTicketSeat(
        tx,
        eventId,
        validated.ticketTypeId,
        validated.email
      );

      const isFree = Number(ticketType.price) === 0;

      // Count registrations to generate sequential code
      const regCount =
        (await tx.registration.count({
          where: { eventId },
        })) + 1;

      const registrationCode = generateRegistrationCode(event.slug, regCount);

      // Create base registration
      const registration = await tx.registration.create({
        data: {
          registrationCode,
          eventId,
          ticketTypeId: ticketType.id,
          name: validated.name.trim(),
          email: validated.email.trim().toLowerCase(),
          phone: validated.phone.trim(),
          college: validated.college?.trim(),
          city: validated.city?.trim(),
          tshirtSize: validated.tshirtSize,
          dietaryPref: validated.dietaryPref,
          customFields: {
            github: validated.github,
            linkedin: validated.linkedin,
            teamName: validated.teamName,
            projectIdea: validated.projectIdea,
          },
          status: isFree ? "CONFIRMED" : "PENDING",
          holdExpiresAt: isFree ? null : holdExpiresAt,
        },
      });

      // Free Ticket Flow: Immediately finalize
      if (isFree) {
        const qrPayload = signQrPayload({
          registrationCode,
          eventId,
          ticketTypeId: ticketType.id,
          email: registration.email,
          issuedAt: Date.now(),
        });

        const qrDataUrl = await generateQrCodeDataUrl(qrPayload);

        await tx.registration.update({
          where: { id: registration.id },
          data: {
            qrPayload,
            qrCodeUrl: qrDataUrl,
          },
        });

        // Send confirmation email asynchronously
        sendRegistrationConfirmationEmail({
          email: registration.email,
          name: registration.name,
          eventTitle: event.title,
          eventSlug: event.slug,
          eventDate: event.startDate,
          venue: event.venue,
          cityName: event.city?.name,
          ticketTierName: ticketType.name,
          registrationCode,
          qrCodeDataUrl: qrDataUrl,
        }).catch((err) => console.error("Email send failed:", err));

        // Schedule 24h event reminder if event starts in the future
        const reminderTime = new Date(new Date(event.startDate).getTime() - 24 * 60 * 60 * 1000);
        if (reminderTime.getTime() > Date.now()) {
          queueEventReminderEmail(
            registration.email,
            {
              name: registration.name,
              eventTitle: event.title,
              eventSlug: event.slug,
              eventDate: event.startDate,
              venue: event.venue,
              cityName: event.city?.name,
              registrationCode,
            },
            { scheduledFor: reminderTime, immediate: false }
          ).catch((err) => console.error("Reminder queue error:", err));
        }

        return {
          success: true,
          isFree: true,
          registrationId: registration.id,
          registrationCode,
          redirectUrl: `/events/${event.slug}/ticket/${registrationCode}`,
        };
      }

      // Paid Ticket Flow: Create Razorpay Order
      const rzpOrder = await createRazorpayOrder({
        amount: Number(ticketType.price),
        receipt: registrationCode,
        notes: {
          eventId,
          registrationId: registration.id,
          registrationCode,
          email: registration.email,
        },
      });

      await tx.payment.create({
        data: {
          registrationId: registration.id,
          razorpayOrderId: rzpOrder.id,
          amount: ticketType.price,
          currency: rzpOrder.currency,
          status: "PENDING",
        },
      });

      const keyId =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_dummy";

      return {
        success: true,
        isFree: false,
        registrationId: registration.id,
        registrationCode,
        holdExpiresAt: holdExpiresAt.toISOString(),
        razorpayOrder: {
          id: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          keyId,
          name: "KailshiansX",
          description: `${ticketType.name} — ${event.title}`,
          prefill: {
            name: registration.name,
            email: registration.email,
            contact: registration.phone || "",
          },
        },
      };
    });

    return result;
  } catch (error) {
    if (error instanceof RegistrationError) {
      return { success: false, error: error.message };
    }
    console.error("Registration initiation failed:", error);
    return {
      success: false,
      error: "Unable to process registration at this moment. Please try again.",
    };
  }
}

/**
 * Server action to verify Razorpay checkout signature and complete registration
 */
export async function verifyPaymentAndComplete({
  registrationId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  registrationId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ success: boolean; registrationCode?: string; redirectUrl?: string; error?: string }> {
  try {
    // 1. Verify Razorpay cryptographic signature
    const isValid = verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return { success: false, error: "Payment verification signature mismatch." };
    }

    // 2. Update Registration and Payment atomically
    const finalized = await db.$transaction(async (tx) => {
      const registration = await tx.registration.findUnique({
        where: { id: registrationId },
        include: {
          event: { include: { city: true } },
          ticketType: true,
          payment: true,
        },
      });

      if (!registration) {
        throw new Error("Registration record not found.");
      }

      // Idempotency: if already confirmed, return success without duplicate work
      if (registration.status === "CONFIRMED") {
        return registration;
      }

      // Generate signed QR payload
      const qrPayload = signQrPayload({
        registrationCode: registration.registrationCode,
        eventId: registration.eventId,
        ticketTypeId: registration.ticketTypeId,
        email: registration.email,
        issuedAt: Date.now(),
      });

      const qrDataUrl = await generateQrCodeDataUrl(qrPayload);

      // Update payment record
      await tx.payment.updateMany({
        where: { registrationId },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: "CAPTURED",
        },
      });

      // Update registration record to CONFIRMED and clear seat hold
      const updatedReg = await tx.registration.update({
        where: { id: registrationId },
        data: {
          status: "CONFIRMED",
          holdExpiresAt: null,
          qrPayload,
          qrCodeUrl: qrDataUrl,
        },
        include: {
          event: { include: { city: true } },
          ticketType: true,
        },
      });

      // Send confirmation email
      sendRegistrationConfirmationEmail({
        email: updatedReg.email,
        name: updatedReg.name,
        eventTitle: updatedReg.event.title,
        eventSlug: updatedReg.event.slug,
        eventDate: updatedReg.event.startDate,
        venue: updatedReg.event.venue,
        cityName: updatedReg.event.city?.name,
        ticketTierName: updatedReg.ticketType.name,
        registrationCode: updatedReg.registrationCode,
        qrCodeDataUrl: qrDataUrl,
      }).catch((err) => console.error("Email send failed:", err));

      // Schedule 24h event reminder if event starts in the future
      const eventStartDate = updatedReg.event.startDate;
      const reminderTime = new Date(new Date(eventStartDate).getTime() - 24 * 60 * 60 * 1000);
      if (reminderTime.getTime() > Date.now()) {
        queueEventReminderEmail(
          updatedReg.email,
          {
            name: updatedReg.name,
            eventTitle: updatedReg.event.title,
            eventSlug: updatedReg.event.slug,
            eventDate: eventStartDate,
            venue: updatedReg.event.venue,
            cityName: updatedReg.event.city?.name,
            registrationCode: updatedReg.registrationCode,
          },
          { scheduledFor: reminderTime, immediate: false }
        ).catch((err) => console.error("Reminder queue error:", err));
      }

      return updatedReg;
    });

    return {
      success: true,
      registrationCode: finalized.registrationCode,
      redirectUrl: `/events/${finalized.event.slug}/ticket/${finalized.registrationCode}`,
    };
  } catch (error) {
    console.error("Payment verification failed:", error);
    return { success: false, error: "Payment confirmation encountered an error." };
  }
}
