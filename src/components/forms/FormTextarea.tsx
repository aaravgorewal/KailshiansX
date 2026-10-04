"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCount?: boolean;
  error?: boolean;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, showCount = false, maxLength, error = false, value, disabled, ...props }, ref) => {
    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            "bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background border-input focus-visible:border-primary disabled:bg-muted disabled:text-muted-foreground flex min-h-[90px] w-full resize-y rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
            error
              ? "border-destructive text-destructive focus-visible:ring-destructive focus-visible:border-destructive"
              : "hover:border-muted-foreground",
            className
          )}
          {...props}
        />
        {showCount && maxLength && (
          <div className="flex justify-end pt-1">
            <span className="text-muted-foreground font-mono text-xs">
              {currentLength}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
