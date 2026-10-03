"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormCheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: boolean;
}

export const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ className, label, description, error = false, checked, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center pt-0.5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            aria-invalid={error}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={cn(
              "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all select-none",
              error
                ? "bg-surface-900 border-rose-500"
                : "border-surface-700 bg-surface-900 hover:border-surface-600 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-surface-950 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
              checked && "border-brand-500 bg-brand-600 shadow-brand-500/30 text-white shadow-sm",
              className
            )}
          >
            {checked && <Check className="size-3.5 stroke-[2.5]" aria-hidden="true" />}
          </label>
        </div>

        {(label || description) && (
          <div className="grid gap-0.5">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-surface-200 cursor-pointer text-sm leading-tight font-medium select-none"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-surface-400 text-xs leading-normal">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";
