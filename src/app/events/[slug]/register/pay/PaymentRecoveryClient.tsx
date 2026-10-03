"use client";

import * as React from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Clock, CreditCard, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { verifyPaymentAndComplete } from "@/server/events/actions";

interface RazorpayCheckoutHandlerArgs {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayCheckoutHandlerArgs) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export interface PaymentRecoveryClientProps {
  eventSlug: string;
  eventTitle: string;
  registrationId: string;
  registrationCode: string;
  ticketName: string;
  amount: number;
  email: string;
  name: string;
  phone?: string | null;
  razorpayOrderId: string;
  razorpayKeyId: string;
  holdExpiresAt: string;
}

export function PaymentRecoveryClient({
  eventSlug,
  eventTitle,
  registrationId,
  registrationCode,
  ticketName,
  amount,
  email,
  name,
  phone,
  razorpayOrderId,
  razorpayKeyId,
  holdExpiresAt,
}: PaymentRecoveryClientProps) {
  const router = useRouter();
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [timeLeft, setTimeLeft] = React.useState<string>("");
  const [isExpired, setIsExpired] = React.useState(false);

  // Countdown timer for 10-min hold
  React.useEffect(() => {
    const expiry = new Date(holdExpiresAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft("00:00");
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const handlePayNow = () => {
    if (isExpired) {
      setErrorMsg("Your seat hold has expired. Please re-select your pass.");
      return;
    }

    if (!window.Razorpay) {
      setErrorMsg("Razorpay checkout is still initializing. Please try in a few seconds.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    const rzp = new window.Razorpay({
      key: razorpayKeyId,
      amount: Math.round(amount * 100),
      currency: "INR",
      name: "KailshiansX",
      description: `${ticketName} — ${eventTitle}`,
      order_id: razorpayOrderId,
      prefill: {
        name,
        email,
        contact: phone || "",
      },
      theme: {
        color: "#3d61fc",
      },
      handler: async (response) => {
        try {
          const verifyRes = await verifyPaymentAndComplete({
            registrationId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (verifyRes.success && verifyRes.redirectUrl) {
            router.push(verifyRes.redirectUrl);
          } else {
            setErrorMsg(verifyRes.error || "Payment verification failed.");
            setLoading(false);
          }
        } catch {
          setErrorMsg("Error verifying payment with server.");
          setLoading(false);
        }
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
        },
      },
    });

    rzp.open();
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="border-surface-800 bg-surface-900/80 space-y-6 rounded-2xl border p-7 shadow-2xl backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant={isExpired ? "destructive" : "warning"} size="sm" dot>
              {isExpired ? "Seat Hold Expired" : "Payment Pending"}
            </Badge>
            <h2 className="text-surface-50 mt-2 text-2xl font-bold">Resume Your Registration</h2>
            <p className="text-surface-400 mt-1 text-xs">
              Reference Code: <span className="text-surface-200 font-mono">{registrationCode}</span>
            </p>
          </div>

          {!isExpired && (
            <div className="text-right">
              <div className="text-surface-400 flex items-center justify-end gap-1 font-mono text-[11px]">
                <Clock className="size-3 text-amber-400" />
                <span>Seat Held For:</span>
              </div>
              <div className="mt-0.5 font-mono text-2xl font-black text-amber-400">{timeLeft}</div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Order Details Card */}
        <div className="border-surface-800 bg-surface-950/70 space-y-3 rounded-xl border p-5">
          <div className="text-surface-300 border-surface-800 flex items-center justify-between border-b pb-2 text-xs">
            <span>Event:</span>
            <span className="text-surface-100 font-semibold">{eventTitle}</span>
          </div>
          <div className="text-surface-300 border-surface-800 flex items-center justify-between border-b pb-2 text-xs">
            <span>Pass Tier:</span>
            <span className="text-brand-400 font-semibold">{ticketName}</span>
          </div>
          <div className="text-surface-300 border-surface-800 flex items-center justify-between border-b pb-2 text-xs">
            <span>Attendee:</span>
            <span className="text-surface-200 font-medium">
              {name} ({email})
            </span>
          </div>
          <div className="text-surface-100 flex items-center justify-between pt-1 text-sm">
            <span className="font-bold">Total Amount Due:</span>
            <span className="text-surface-50 text-xl font-black">₹{amount}</span>
          </div>
        </div>

        {/* Action Button */}
        {isExpired ? (
          <div className="space-y-3">
            <p className="text-xs text-rose-300">
              The 10-minute hold window for this registration has lapsed. Please restart
              registration to claim any newly available seats.
            </p>
            <Button asChild className="w-full" variant="default">
              <Link href={`/events/${eventSlug}/register`}>Select Ticket Again</Link>
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            onClick={handlePayNow}
            disabled={loading || !scriptLoaded}
            size="lg"
            className="shadow-brand-500/25 w-full shadow-lg"
            leftIcon={
              loading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <CreditCard className="size-4" />
              )
            }
            rightIcon={!loading ? <ArrowRight className="size-4" /> : undefined}
          >
            {loading ? "Processing Payment..." : `Pay ₹${amount} via Razorpay (UPI / Cards)`}
          </Button>
        )}

        <div className="text-center">
          <Link
            href={`/events/${eventSlug}`}
            className="text-surface-400 hover:text-surface-200 text-xs transition-colors"
          >
            ← Return to Event Overview
          </Link>
        </div>
      </div>
    </>
  );
}
