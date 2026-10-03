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
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] px-4">
      <div className="card-glow w-full max-w-sm space-y-4 rounded-2xl p-10 text-center">
        <div className="bg-brand-500/10 mx-auto flex h-14 w-14 items-center justify-center rounded-full">
          <Mail className="text-brand-400" size={28} />
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Check your inbox</h1>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          A sign-in link has been sent to your email address. Click the link to complete sign-in —
          it expires in 10 minutes.
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
