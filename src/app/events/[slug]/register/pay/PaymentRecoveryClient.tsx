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
      setErrorMsg("Payment checkout is still initializing. Please try again in a few seconds.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    const primaryColor =
      typeof window !== "undefined"
        ? getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()
        : "";

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
        color: primaryColor,
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

      <div className="border-border bg-card space-y-6 rounded-lg border p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant={isExpired ? "destructive" : "neutral"} size="sm">
              {isExpired ? "Hold expired" : "Payment pending"}
            </Badge>
            <h2 className="text-foreground mt-2 text-xl font-bold">Complete Your Payment</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Registration ID:{" "}
              <span className="text-foreground font-mono font-semibold">#{registrationCode}</span>
            </p>
          </div>

          {!isExpired && (
            <div className="text-right">
              <div className="text-muted-foreground flex items-center justify-end gap-1 font-mono text-xs">
                <Clock className="text-muted-foreground size-3" aria-hidden="true" />
                <span>Hold expires in:</span>
              </div>
              <div className="text-foreground mt-0.5 font-mono text-xl font-bold">{timeLeft}</div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border p-3 text-xs">
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Order Details Card */}
        <div className="border-border bg-muted/40 text-muted-foreground space-y-2.5 rounded-lg border p-4 text-xs">
          <div className="border-border flex items-center justify-between border-b pb-2">
            <span>Event:</span>
            <span className="text-foreground font-semibold">{eventTitle}</span>
          </div>
          <div className="border-border flex items-center justify-between border-b pb-2">
            <span>Pass Tier:</span>
            <span className="text-foreground font-semibold">{ticketName}</span>
          </div>
          <div className="border-border flex items-center justify-between border-b pb-2">
            <span>Attendee:</span>
            <span className="text-foreground font-medium">
              {name} ({email})
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-foreground text-sm font-bold">Total Amount:</span>
            <span className="text-foreground text-xl font-bold">₹{amount}</span>
          </div>
        </div>

        {/* Next Steps / Action Button */}
        {isExpired ? (
          <div className="space-y-3">
            <p className="text-destructive text-xs">
              The 10-minute hold window for this registration has lapsed. Please select your pass
              again to check current availability.
            </p>
            <Button asChild className="w-full" variant="secondary">
              <Link href={`/events/${eventSlug}/register`}>Select Ticket Again</Link>
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            onClick={handlePayNow}
            disabled={loading || !scriptLoaded}
            variant="primary"
            size="lg"
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <CreditCard className="size-4" aria-hidden="true" />
                <span>Pay ₹{amount} to complete registration</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        )}

        <div className="text-center">
          <Link
            href={`/events/${eventSlug}`}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            ← Return to event details
          </Link>
        </div>
      </div>
    </>
  );
}
