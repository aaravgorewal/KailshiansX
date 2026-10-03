"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCount?: boolean;
  error?: boolean;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, showCount = false, maxLength, error = false, value, ...props }, ref) => {
    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            "bg-surface-900 text-surface-100 placeholder:text-surface-500 focus-visible:ring-brand-500 focus-visible:ring-offset-surface-950 flex min-h-[90px] w-full resize-y rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-rose-500/80 focus-visible:ring-rose-500"
              : "border-surface-700/80 hover:border-surface-600 focus-visible:border-brand-500",
            className
          )}
          {...props}
        />
        {showCount && maxLength && (
          <div className="flex justify-end pt-1">
            <span className="text-surface-400 font-mono text-[11px]">
              {currentLength}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
