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
  ({ className, label, description, error = false, checked, disabled, id, ...props }, ref) => {
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
            disabled={disabled}
            aria-invalid={error}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={cn(
              "border-input bg-background peer-focus-visible:ring-ring peer-focus-visible:ring-offset-background flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors select-none peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
              error ? "border-destructive text-destructive" : "hover:border-muted-foreground",
              checked && "border-primary bg-primary text-primary-foreground",
              disabled && "bg-muted cursor-not-allowed opacity-60",
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
                className={cn(
                  "text-foreground cursor-pointer text-sm leading-tight font-medium select-none",
                  disabled && "cursor-not-allowed opacity-60"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-muted-foreground text-xs leading-normal">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";
