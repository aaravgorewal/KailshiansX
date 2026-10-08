// src/app/auth/verify-request/page.tsx
// Shown after magic link email is sent — centered narrow column with verify notice and sign-in
import type { Metadata } from "next";
import { SignInClient } from "@/app/signin/SignInClient";

export const metadata: Metadata = {
  title: "Check your email | KailshiansX",
};

export default function VerifyRequestPage() {
  return (
    <SignInClient
      callbackUrl="/"
      noticeMessage="A sign-in link has been sent to your email address. Click the link to complete sign-in — it expires in 10 minutes."
    />
  );
}
