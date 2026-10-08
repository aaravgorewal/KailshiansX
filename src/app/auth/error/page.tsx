// src/app/auth/error/page.tsx
// Auth.js error page — centered narrow column with error message and sign-in
import type { Metadata } from "next";
import { SignInClient } from "@/app/signin/SignInClient";

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

  return <SignInClient callbackUrl="/" errorMessage={message} />;
}
