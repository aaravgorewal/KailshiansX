import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      id,
      label,
      description,
      error,
      disabled,
      checked,
      defaultChecked,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;
    const errorId = `${checkboxId}-error`;
    const descId = `${checkboxId}-desc`;

    const hasError = Boolean(error);
    const [isChecked, setIsChecked] = React.useState<boolean>(
      checked !== undefined ? checked : Boolean(defaultChecked)
    );

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (checked === undefined) {
        setIsChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <div className="w-full space-y-1 text-left">
        <div className="flex items-start gap-3">
          <div className="relative flex items-center pt-0.5">
            <input
              id={checkboxId}
              type="checkbox"
              ref={ref}
              disabled={disabled}
              checked={checked !== undefined ? checked : isChecked}
              onChange={handleChange}
              aria-invalid={hasError ? "true" : undefined}
              aria-describedby={hasError ? errorId : description ? descId : undefined}
              className={cn(
                "peer bg-card text-primary size-4 shrink-0 rounded border",
                "border-input transition-none",
                "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "checked:bg-primary checked:border-primary",
                hasError && "border-destructive",
                className
              )}
              {...props}
            />
            <Check
              className="text-primary-foreground pointer-events-none absolute top-1 left-0.5 size-3 opacity-0 transition-none peer-checked:opacity-100"
              aria-hidden="true"
              strokeWidth={3}
            />
          </div>
          {(label || description) && (
            <label
              htmlFor={checkboxId}
              className={cn(
                "cursor-pointer text-sm select-none",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {label && <span className="text-foreground block font-medium">{label}</span>}
              {description && (
                <span id={descId} className="text-muted-foreground mt-0.5 block text-xs">
                  {description}
                </span>
              )}
            </label>
          )}
        </div>
        {hasError && (
          <p id={errorId} className="text-destructive pl-7 text-xs font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
