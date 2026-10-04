"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface FormRadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  error?: boolean;
  className?: string;
}

export const FormRadioGroup = React.forwardRef<HTMLDivElement, FormRadioGroupProps>(
  ({ name, options, value, onChange, orientation = "vertical", error = false, className }, ref) => {
    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn(
          "gap-3",
          orientation === "horizontal" ? "flex flex-wrap items-center gap-4" : "flex flex-col",
          className
        )}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          const optionId = `${name}-${option.value}`;

          return (
            <div
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors select-none",
                isSelected
                  ? "border-primary bg-muted"
                  : "border-border bg-card hover:border-muted-foreground",
                option.disabled && "cursor-not-allowed opacity-50",
                error && !isSelected && "border-destructive"
              )}
              onClick={() => {
                if (!option.disabled && onChange) {
                  onChange(option.value);
                }
              }}
            >
              <div className="relative flex items-center pt-0.5">
                <input
                  type="radio"
                  id={optionId}
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  disabled={option.disabled}
                  onChange={() => onChange?.(option.value)}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    "border-input bg-background peer-focus-visible:ring-ring peer-focus-visible:ring-offset-background flex size-4 items-center justify-center rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
                    isSelected && "border-primary",
                    option.disabled && "cursor-not-allowed opacity-60"
                  )}
                >
                  {isSelected && <span className="bg-primary size-2 rounded-full" />}
                </div>
              </div>

              <div className="grid gap-0.5">
                <label
                  htmlFor={optionId}
                  className={cn(
                    "text-foreground cursor-pointer text-sm leading-tight font-medium",
                    option.disabled && "cursor-not-allowed opacity-60"
                  )}
                >
                  {option.label}
                </label>
                {option.description && (
                  <p className="text-muted-foreground text-xs leading-normal">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

FormRadioGroup.displayName = "FormRadioGroup";
