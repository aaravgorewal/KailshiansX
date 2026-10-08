import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: React.ReactNode;
  hint?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", id, label, error, hint, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const hasError = Boolean(error);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-foreground block text-sm font-medium select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            aria-invalid={hasError ? "true" : undefined}
            aria-describedby={hasError ? errorId : hint ? hintId : undefined}
            className={cn(
              "bg-card text-foreground flex h-10 w-full rounded-lg border px-3 py-2 text-sm",
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

Input.displayName = "Input";
