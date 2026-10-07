// src/app/auth/error/page.tsx
// Auth.js error page — handles error=AccessDenied, OAuthAccountNotLinked, etc.
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Authentication Error | KailshiansX",
};

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "You don't have permission to access that page.",
  OAuthAccountNotLinked:
    "This email is already associated with a different sign-in method. Try signing in with your original method.",
  OAuthSignin: "Could not sign in with the provider. Please try again.",
  OAuthCallback: "Error receiving the response from the provider. Please try again.",
  EmailSignin: "Failed to send the sign-in email. Please try again.",
  SessionRequired: "You must be signed in to view this page.",
  Verification: "The sign-in link has expired or already been used. Request a new one.",
  Default: "An authentication error occurred. Please try again.",
};

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthErrorPage({ searchParams }: Props) {
  const params = await searchParams;
  const errorCode = params.error ?? "Default";
  const message = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default;

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm space-y-5 p-8 text-center">
        <div className="bg-destructive/10 text-destructive mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            {errorCode === "AccessDenied" ? "Access Denied" : "Sign-in Error"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button asChild variant="primary" className="flex-1">
            <Link href="/signin">Back to Sign In</Link>
          </Button>
          <Button asChild variant="secondary" className="flex-1">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
