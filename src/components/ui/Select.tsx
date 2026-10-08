import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, id, label, error, hint, options, placeholder, disabled, children, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

    const hasError = Boolean(error);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="text-foreground block text-sm font-medium select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            aria-invalid={hasError ? "true" : undefined}
            aria-describedby={hasError ? errorId : hint ? hintId : undefined}
            className={cn(
              "bg-card text-foreground flex h-10 w-full appearance-none rounded-lg border px-3 py-2 pr-10 text-sm",
              "border-input transition-none",
              "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              hasError && "border-destructive text-foreground focus-visible:ring-destructive",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </div>
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

Select.displayName = "Select";
