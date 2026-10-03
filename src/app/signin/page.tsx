// src/app/signin/page.tsx — Server Component wrapper
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInClient } from "./SignInClient";

export const metadata: Metadata = {
  title: "Sign In | KailshiansX",
  description: "Sign in to KailshiansX with Google or a magic link.",
};

interface Props {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await auth();

  // Already signed in — go to callbackUrl or home
  if (session?.user) {
    redirect(params.callbackUrl ?? "/");
  }

  return <SignInClient callbackUrl={params.callbackUrl ?? "/"} />;
}
