// src/app/auth/verify-request/page.tsx
// Shown after magic link email is sent
import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Check your email | KailshiansX",
};

export default function VerifyRequestPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm space-y-5 p-8 text-center">
        <div className="bg-muted text-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          <Mail className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-foreground text-xl font-semibold">Check your inbox</h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            A sign-in link has been sent to your email address. Click the link to complete sign-in —
            it expires in 10 minutes.
          </p>
        </div>
        <p className="text-muted-foreground text-xs">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <Link href="/signin" className="text-foreground underline underline-offset-2">
            try again
          </Link>
          .
        </p>
        <div className="pt-2">
          <Button asChild variant="secondary" className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
