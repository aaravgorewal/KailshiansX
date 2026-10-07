"use client";

import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/forms/FormInput";
import { GoogleIcon } from "@/components/auth/GoogleIcon";

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
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header / Brand */}
        <div className="text-center">
          <Link
            href="/"
            className="text-foreground focus-visible:ring-ring inline-flex items-center gap-2 rounded-md text-2xl font-bold tracking-tight transition-opacity focus-visible:ring-2 focus-visible:outline-none active:opacity-80"
          >
            KailshiansX
          </Link>
          <p className="text-muted-foreground mt-2 text-sm">
            Developer events &amp; community platform
          </p>
        </div>

        {/* Centered Card */}
        <Card className="p-6 sm:p-8">
          <h1 className="text-foreground text-xl font-semibold">Sign in to KailshiansX</h1>
          <p className="text-muted-foreground mt-1 mb-6 text-sm">
            Register for events, track your journey, and grow with the community.
          </p>

          {emailSent ? (
            <div className="space-y-4 py-4 text-center">
              <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                <Mail className="text-foreground h-6 w-6" />
              </div>
              <h2 className="text-foreground text-base font-semibold">Check your inbox</h2>
              <p className="text-muted-foreground text-sm">
                We sent a magic link to <strong className="text-foreground">{email}</strong>. Click
                it to sign in — it expires in 10 minutes.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <>
              {/* Tab Switcher */}
              <div className="bg-muted mb-6 flex rounded-lg p-1">
                {(["google", "email"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTab(t);
                      setError(null);
                    }}
                    className={`focus-visible:ring-ring flex-1 rounded-md py-1.5 text-xs font-medium transition-[background-color,color,opacity] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80 ${
                      tab === t
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "google" ? "Google" : "Magic Link"}
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="border-destructive/30 bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {tab === "google" ? (
                <div className="space-y-4">
                  <Button
                    variant="secondary"
                    onClick={handleGoogle}
                    disabled={isPending}
                    id="btn-signin-google"
                    className="w-full gap-2.5"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <GoogleIcon className="h-4 w-4 shrink-0" />
                    )}
                    <span>{isPending ? "Redirecting…" : "Continue with Google"}</span>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-foreground block text-xs font-medium">
                      Email address
                    </label>
                    <FormInput
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    id="btn-signin-email"
                    disabled={isPending || !email.trim()}
                    className="w-full gap-2"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>Send Magic Link</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="bg-border h-px flex-1" />
                <span className="text-muted-foreground text-xs">secure &amp; passwordless</span>
                <div className="bg-border h-px flex-1" />
              </div>

              {/* Legal Note */}
              <p className="text-muted-foreground text-center text-xs">
                By signing in you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-foreground focus-visible:ring-ring rounded underline-offset-2 hover:underline focus-visible:ring-1 focus-visible:outline-none"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-foreground focus-visible:ring-ring rounded underline-offset-2 hover:underline focus-visible:ring-1 focus-visible:outline-none"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
