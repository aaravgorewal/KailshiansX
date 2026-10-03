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
                  ? "border-brand-500/80 bg-brand-500/10 shadow-sm"
                  : "border-surface-800 bg-surface-900/40 hover:border-surface-700 hover:bg-surface-900/80",
                option.disabled && "cursor-not-allowed opacity-50",
                error && !isSelected && "border-rose-500/40"
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
                  onChange={(e) => onChange?.(e.target.value)}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    "flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-all",
                    isSelected
                      ? "border-brand-500 bg-brand-500"
                      : "border-surface-600 bg-surface-900 hover:border-surface-500",
                    "peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-surface-950 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2"
                  )}
                >
                  {isSelected && <div className="size-2 rounded-full bg-white shadow-sm" />}
                </div>
              </div>

              <div className="grid gap-0.5">
                <label
                  htmlFor={optionId}
                  className="text-surface-200 cursor-pointer text-sm leading-tight font-medium"
                >
                  {option.label}
                </label>
                {option.description && (
                  <p className="text-surface-400 text-xs leading-normal">{option.description}</p>
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
