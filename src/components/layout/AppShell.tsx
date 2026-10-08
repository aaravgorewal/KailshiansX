"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useToast } from "@/components/ui/useToast";

const Toaster = dynamic(() => import("@/components/ui/Toaster").then((m) => m.Toaster), {
  ssr: false,
});
const GoogleAnalytics = dynamic(
  () => import("@/components/analytics/GoogleAnalytics").then((m) => m.GoogleAnalytics),
  { ssr: false }
);

const hasGa = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

interface AppShellProps {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ navbar, footer, children }: AppShellProps) {
  const pathname = usePathname();
  const { toasts } = useToast();
  const hasToasts = toasts.length > 0;

  const isMinimalRoute =
    pathname.startsWith("/admin") || pathname === "/signin" || pathname.startsWith("/auth/");

  if (isMinimalRoute) {
    return (
      <>
        <main className="flex-1">{children}</main>
        {hasToasts && <Toaster />}
      </>
    );
  }

  return (
    <>
      {navbar}
      <main className="flex-1 pt-16">{children}</main>
      {footer}
      {hasToasts && <Toaster />}
      {hasGa && <GoogleAnalytics />}
    </>
  );
}
