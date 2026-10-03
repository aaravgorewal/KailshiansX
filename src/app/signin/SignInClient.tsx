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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] px-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-2xl tracking-tight"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-[var(--shadow-glow)]">
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
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            Sign in to KailshiansX
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Register for events, track your journey, and grow with the community.
          </p>

          {emailSent ? (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center">
                <Mail className="text-brand-400" size={24} />
              </div>
              <p className="font-semibold text-[var(--text-primary)]">Check your inbox</p>
              <p className="text-sm text-[var(--text-muted)]">
                We sent a magic link to <strong>{email}</strong>. Click it to sign in —
                it expires in 10 minutes.
              </p>
              <button
                onClick={() => { setEmailSent(false); setEmail(""); }}
                className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              {/* Tab switcher */}
              <div className="flex rounded-lg bg-[var(--bg-elevated)] p-1 mb-6 gap-1">
                {(["google", "email"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(null); }}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
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
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              {tab === "google" ? (
                <button
                  onClick={handleGoogle}
                  disabled={isPending}
                  id="btn-signin-google"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium hover:border-brand-500 hover:bg-brand-500/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Globe size={18} />
                  )}
                  {isPending ? "Redirecting…" : "Continue with Google"}
                </button>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-[var(--text-muted)] mb-1.5"
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
                      className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    id="btn-signin-email"
                    disabled={isPending || !email.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs text-[var(--text-muted)]">secure &amp; passwordless</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              <p className="text-xs text-center text-[var(--text-muted)]">
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
