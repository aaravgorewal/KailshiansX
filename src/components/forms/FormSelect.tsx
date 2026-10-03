"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: FormSelectOption[];
  placeholder?: string;
  error?: boolean;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, options, placeholder, error = false, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "bg-surface-900 text-surface-100 focus-visible:ring-brand-500 focus-visible:ring-offset-surface-950 flex h-10 w-full cursor-pointer appearance-none rounded-lg border px-3 py-2 pr-10 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-rose-500/80 focus-visible:ring-rose-500"
              : "border-surface-700/80 hover:border-surface-600 focus-visible:border-brand-500",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-surface-500 bg-surface-900">
              {placeholder}
            </option>
          )}

          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="bg-surface-900 text-surface-100 py-1"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="text-surface-400 pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
          <ChevronDown className="size-4" aria-hidden="true" />
        </div>
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
