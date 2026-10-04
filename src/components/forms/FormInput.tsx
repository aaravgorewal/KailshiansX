"use client";

import * as React from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixAddon?: string;
  suffixAddon?: string;
  clearable?: boolean;
  onClear?: () => void;
  error?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      className,
      type = "text",
      leftIcon,
      rightIcon,
      prefixAddon,
      suffixAddon,
      clearable = false,
      onClear,
      error = false,
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const effectiveType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="relative flex w-full items-center">
        {prefixAddon && (
          <span className="border-input bg-muted text-muted-foreground inline-flex h-10 items-center rounded-l-lg border border-r-0 px-3 font-mono text-xs select-none">
            {prefixAddon}
          </span>
        )}

        <div className="relative flex flex-1 items-center">
          {leftIcon && (
            <div className="text-muted-foreground pointer-events-none absolute left-3 flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={effectiveType}
            value={value}
            disabled={disabled}
            className={cn(
              "bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background border-input focus-visible:border-primary disabled:bg-muted disabled:text-muted-foreground flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
              error
                ? "border-destructive text-destructive focus-visible:ring-destructive focus-visible:border-destructive"
                : "hover:border-muted-foreground",
              prefixAddon && "rounded-l-none",
              suffixAddon && "rounded-r-none",
              leftIcon && "pl-9",
              (rightIcon || isPassword || (clearable && value)) && "pr-10",
              className
            )}
            {...props}
          />

          <div className="text-muted-foreground absolute right-3 flex items-center gap-1.5">
            {clearable && value && !disabled && (
              <button
                type="button"
                onClick={onClear}
                tabIndex={-1}
                aria-label="Clear input"
                className="hover:text-foreground focus-visible:ring-ring rounded p-0.5 focus-visible:ring-1 focus-visible:outline-none"
              >
                <X className="size-3.5" />
              </button>
            )}

            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="hover:text-foreground focus-visible:ring-ring rounded p-0.5 focus-visible:ring-1 focus-visible:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            )}

            {rightIcon && !isPassword && !clearable && (
              <div className="pointer-events-none flex items-center">{rightIcon}</div>
            )}
          </div>
        </div>

        {suffixAddon && (
          <span className="border-input bg-muted text-muted-foreground inline-flex h-10 items-center rounded-r-lg border border-l-0 px-3 font-mono text-xs select-none">
            {suffixAddon}
          </span>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
