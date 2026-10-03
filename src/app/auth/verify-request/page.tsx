// src/app/auth/verify-request/page.tsx
// Shown after magic link email is sent
import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Check your email | KailshiansX",
};

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] px-4">
      <div className="card-glow rounded-2xl p-10 max-w-sm w-full text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-brand-500/10 flex items-center justify-center">
          <Mail className="text-brand-400" size={28} />
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          Check your inbox
        </h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          A sign-in link has been sent to your email address. Click the link to
          complete sign-in — it expires in 10 minutes.
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <Link href="/signin" className="text-brand-400 hover:underline">
            try again
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
