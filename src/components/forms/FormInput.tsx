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
          <span className="border-surface-700 bg-surface-800 text-surface-400 inline-flex h-10 items-center rounded-l-lg border border-r-0 px-3 font-mono text-xs select-none">
            {prefixAddon}
          </span>
        )}

        <div className="relative flex flex-1 items-center">
          {leftIcon && (
            <div className="text-surface-400 pointer-events-none absolute left-3 flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={effectiveType}
            value={value}
            disabled={disabled}
            className={cn(
              "bg-surface-900 text-surface-100 placeholder:text-surface-500 focus-visible:ring-brand-500 focus-visible:ring-offset-surface-950 flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-rose-500/80 focus-visible:ring-rose-500"
                : "border-surface-700/80 hover:border-surface-600 focus-visible:border-brand-500",
              prefixAddon && "rounded-l-none",
              suffixAddon && "rounded-r-none",
              leftIcon && "pl-9",
              (rightIcon || isPassword || (clearable && value)) && "pr-10",
              className
            )}
            {...props}
          />

          <div className="text-surface-400 absolute right-3 flex items-center gap-1.5">
            {clearable && value && !disabled && (
              <button
                type="button"
                onClick={onClear}
                tabIndex={-1}
                aria-label="Clear input"
                className="hover:text-surface-200 rounded p-0.5 focus-visible:outline-none"
              >
                <X className="size-3.5" />
              </button>
            )}

            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="hover:text-surface-200 focus-visible:ring-brand-500 rounded p-0.5 focus-visible:ring-1 focus-visible:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            )}

            {!isPassword && rightIcon && (
              <span className="pointer-events-none flex items-center">{rightIcon}</span>
            )}
          </div>
        </div>

        {suffixAddon && (
          <span className="border-surface-700 bg-surface-800 text-surface-400 inline-flex h-10 items-center rounded-r-lg border border-l-0 px-3 font-mono text-xs select-none">
            {suffixAddon}
          </span>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
