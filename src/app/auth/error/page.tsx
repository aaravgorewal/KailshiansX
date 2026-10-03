// src/app/auth/error/page.tsx
// Auth.js error page — handles error=AccessDenied, OAuthAccountNotLinked, etc.
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] px-4">
      <div className="card-glow w-full max-w-sm space-y-4 rounded-2xl p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="text-red-400" size={28} />
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          {errorCode === "AccessDenied" ? "Access Denied" : "Sign-in Error"}
        </h1>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">{message}</p>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Link
            href="/signin"
            className="bg-brand-500 hover:bg-brand-600 flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-medium text-white transition-colors"
          >
            Back to Sign In
          </Link>
          <Link
            href="/"
            className="hover:border-brand-500 flex-1 rounded-lg border border-[var(--border)] px-4 py-2.5 text-center text-sm font-medium text-[var(--text-secondary)] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
