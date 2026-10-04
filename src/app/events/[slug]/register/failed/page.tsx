import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Unsuccessful | KailshiansX",
};

interface FailedPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RegisterFailedPage({ params, searchParams }: FailedPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const regId = typeof sParams.regId === "string" ? sParams.regId : undefined;
  const reason = typeof sParams.reason === "string" ? sParams.reason : undefined;

  return (
    <div className="bg-background min-h-screen px-4 py-16">
      <div className="mx-auto max-w-lg space-y-6 text-center">
        {/* Simple Centered Card */}
        <div className="border-border bg-card space-y-6 rounded-lg border p-6 text-left sm:p-8">
          <div className="border-border flex items-center justify-between border-b pb-4">
            <Badge variant="destructive" size="sm">
              Payment Unsuccessful
            </Badge>
            {regId && (
              <span className="text-muted-foreground font-mono text-xs">
                ID: <strong className="text-foreground">#{regId}</strong>
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="border-destructive/20 bg-destructive/10 text-destructive inline-flex size-10 items-center justify-center rounded-md border">
              <AlertCircle className="size-5" aria-hidden="true" />
            </div>
            <h1 className="text-foreground text-xl font-bold">Payment Could Not Be Completed</h1>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {reason ||
                "Your payment transaction was not completed or was cancelled by the payment gateway. If any amount was deducted, it will be automatically refunded by your bank within 3–5 working days."}
            </p>
          </div>

          {/* Next Steps */}
          <div className="border-border bg-muted/30 text-muted-foreground space-y-2 rounded-md border p-4 text-xs">
            <div className="text-foreground font-semibold">Next Steps:</div>
            <ul className="list-disc space-y-1.5 pl-4">
              <li>Check your bank account or payment app to confirm transaction status.</li>
              <li>Try paying again with another UPI app, card, or net banking option.</li>
              <li>Contact support if amount was debited but registration was not confirmed.</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            {regId ? (
              <Button asChild variant="primary" className="flex-1 gap-1.5">
                <Link href={`/events/${slug}/register/pay?regId=${regId}`}>
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  <span>Retry Payment</span>
                </Link>
              </Button>
            ) : (
              <Button asChild variant="primary" className="flex-1">
                <Link href={`/events/${slug}/register`}>Try Registering Again</Link>
              </Button>
            )}

            <Button asChild variant="secondary" className="flex-1 gap-1.5">
              <Link href={`/events/${slug}`}>
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                <span>Return to Event</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
