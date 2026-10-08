import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: React.ReactNode;
  hint?: React.ReactNode;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, label, error, hint, disabled, rows = 4, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;

    const hasError = Boolean(error);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-foreground block text-sm font-medium select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            id={textareaId}
            ref={ref}
            rows={rows}
            disabled={disabled}
            aria-invalid={hasError ? "true" : undefined}
            aria-describedby={hasError ? errorId : hint ? hintId : undefined}
            className={cn(
              "bg-card text-foreground flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm",
              "placeholder:text-muted-foreground",
              "border-input transition-none",
              "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              hasError && "border-destructive text-foreground focus-visible:ring-destructive",
              className
            )}
            {...props}
          />
        </div>
        {hasError && (
          <p id={errorId} className="text-destructive text-xs font-medium" role="alert">
            {error}
          </p>
        )}
        {!hasError && hint && (
          <p id={hintId} className="text-muted-foreground text-xs">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
