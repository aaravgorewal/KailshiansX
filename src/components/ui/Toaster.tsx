"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles } from "lucide-react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/Toast";
import { useToast, type ToastVariant } from "@/components/ui/useToast";

const iconMap: Record<ToastVariant, React.ReactNode> = {
  default: <Sparkles className="text-surface-300 mt-0.5 size-4 shrink-0" aria-hidden="true" />,
  success: <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden="true" />,
  destructive: <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-400" aria-hidden="true" />,
  warning: <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden="true" />,
  info: <Info className="text-brand-400 mt-0.5 size-4 shrink-0" aria-hidden="true" />,
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(function ({ id, title, description, action, variant = "default", ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex w-full items-start gap-3">
              {iconMap[variant]}
              <div className="grid flex-1 gap-1 pr-4">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
