"use client";
// src/app/signin/SignInClient.tsx
// Client component: renders the Google button + email magic-link form.
// Uses Auth.js v5 signIn() client-side.

import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { Zap, Mail, Globe, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Props {
  callbackUrl: string;
}

export function SignInClient({ callbackUrl }: Props) {
  const [tab, setTab] = useState<"google" | "email">("google");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGoogle() {
    startTransition(() => {
      signIn("google", { callbackUrl });
    });
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await signIn("resend", {
        email,
        callbackUrl,
        redirect: false,
      });
      if (res?.error) {
        setError("Failed to send magic link. Please try again.");
      } else {
        setEmailSent(true);
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] px-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-brand-500/10 absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl" />
        <div className="bg-accent-500/10 absolute right-1/4 -bottom-40 h-[400px] w-[400px] rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight"
          >
            <span className="bg-brand-500 flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-[var(--shadow-glow)]">
              <Zap size={20} strokeWidth={2.5} />
            </span>
            <span className="text-[var(--text-primary)]">
              Kailshians<span className="text-brand-400">X</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Developer events &amp; community platform
          </p>
        </div>

        {/* Card */}
        <div className="card-glow rounded-2xl p-8">
          <h1 className="mb-1 text-xl font-bold text-[var(--text-primary)]">
            Sign in to KailshiansX
          </h1>
          <p className="mb-6 text-sm text-[var(--text-muted)]">
            Register for events, track your journey, and grow with the community.
          </p>

          {emailSent ? (
            <div className="space-y-3 py-6 text-center">
              <div className="bg-brand-500/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                <Mail className="text-brand-400" size={24} />
              </div>
              <p className="font-semibold text-[var(--text-primary)]">Check your inbox</p>
              <p className="text-sm text-[var(--text-muted)]">
                We sent a magic link to <strong>{email}</strong>. Click it to sign in — it expires
                in 10 minutes.
              </p>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                className="text-brand-400 hover:text-brand-300 text-sm transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              {/* Tab switcher */}
              <div className="mb-6 flex gap-1 rounded-lg bg-[var(--bg-elevated)] p-1">
                {(["google", "email"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t);
                      setError(null);
                    }}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                      tab === t
                        ? "bg-brand-500 text-white shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    {t === "google" ? "Google" : "Magic Link"}
                  </button>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              {tab === "google" ? (
                <button
                  onClick={handleGoogle}
                  disabled={isPending}
                  id="btn-signin-google"
                  className="hover:border-brand-500 hover:bg-brand-500/5 flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 font-medium text-[var(--text-primary)] transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
                  {isPending ? "Redirecting…" : "Continue with Google"}
                </button>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="focus:ring-brand-500 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-transparent focus:ring-2 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    id="btn-signin-email"
                    disabled={isPending || !email.trim()}
                    className="bg-brand-500 hover:bg-brand-600 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Send Magic Link <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-xs text-[var(--text-muted)]">secure &amp; passwordless</span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>

              <p className="text-center text-xs text-[var(--text-muted)]">
                By signing in you agree to our{" "}
                <Link href="/terms" className="text-brand-400 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-brand-400 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
