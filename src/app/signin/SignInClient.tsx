"use client";

import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/auth/GoogleIcon";

interface SignInClientProps {
  callbackUrl?: string;
  errorMessage?: string | null;
  noticeMessage?: string | null;
}

export function SignInClient({
  callbackUrl = "/",
  errorMessage = null,
  noticeMessage = null,
}: SignInClientProps) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(errorMessage);
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
        email: email.trim(),
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
      <div className="w-full max-w-xs space-y-4">
        {/* Notice Message (e.g. verify-request) */}
        {noticeMessage && !emailSent && (
          <div className="border-border bg-muted/50 text-foreground flex items-center gap-2 rounded-lg border p-3 text-xs leading-relaxed">
            <CheckCircle2 className="text-success h-4 w-4 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-xs leading-relaxed">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {emailSent ? (
          <div className="space-y-3 py-2 text-center">
            <p className="text-foreground text-sm font-medium">Check your inbox</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We sent a sign-in link to <strong className="text-foreground">{email}</strong>.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              className="w-full text-xs"
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <>
            {/* Continue with Google (Secondary Button) */}
            <Button
              variant="secondary"
              onClick={handleGoogle}
              disabled={isPending}
              id="btn-signin-google"
              className="w-full gap-2.5 text-xs font-semibold"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="h-4 w-4 shrink-0" />
              )}
              <span>{isPending ? "Redirecting…" : "Continue with Google"}</span>
            </Button>

            {/* Email Magic Link Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3 pt-1">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-lg border px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                id="btn-signin-email"
                disabled={isPending || !email.trim()}
                className="w-full gap-2 text-xs font-semibold"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Send Magic Link</span>
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
