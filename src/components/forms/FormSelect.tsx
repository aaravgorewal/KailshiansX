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
  ({ className, options, placeholder, error = false, disabled, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            "bg-background text-foreground focus-visible:ring-ring focus-visible:ring-offset-background border-input focus-visible:border-primary disabled:bg-muted disabled:text-muted-foreground flex h-10 w-full cursor-pointer appearance-none rounded-lg border px-3 py-2 pr-10 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
            error
              ? "border-destructive text-destructive focus-visible:ring-destructive focus-visible:border-destructive"
              : "hover:border-muted-foreground",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-muted-foreground bg-background">
              {placeholder}
            </option>
          )}

          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="bg-background text-foreground py-1"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
          <ChevronDown className="size-4" aria-hidden="true" />
        </div>
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
