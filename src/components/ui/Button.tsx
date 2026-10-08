import * as React from "react";
import { cn } from "@/lib/utils";

const baseButtonClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[background-color,border-color] duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:transition-none disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<AllowedButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:opacity-90",
  secondary: "border border-border bg-background text-foreground hover:bg-muted active:bg-muted/80",
  ghost: "text-foreground hover:bg-muted active:bg-muted/80",
};

const sizeClasses: Record<string, string> = {
  sm: "h-8 px-3 text-xs rounded-md [&_svg]:size-4",
  md: "h-10 px-4 py-2 text-sm rounded-lg [&_svg]:size-4",
  lg: "h-12 px-6 text-base rounded-xl [&_svg]:size-5",
  default: "h-10 px-4 py-2 text-sm rounded-lg [&_svg]:size-4",
  xs: "h-7 px-2.5 text-xs rounded-md [&_svg]:size-3.5",
  icon: "size-10 rounded-lg p-0 [&_svg]:size-4",
  "icon-sm": "size-8 rounded-md p-0 [&_svg]:size-3.5",
  "icon-lg": "size-12 rounded-xl p-0 [&_svg]:size-5",
};

export type AllowedButtonVariant = "primary" | "secondary" | "ghost";
export type LegacyButtonVariant = "default" | "outline" | "accent" | "destructive" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "default" | "xs" | "icon" | "icon-sm" | "icon-lg";

function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: AllowedButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    baseButtonClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    className
  );
}

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  variant?: AllowedButtonVariant | LegacyButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function resolveVariant(v?: AllowedButtonVariant | LegacyButtonVariant): AllowedButtonVariant {
  if (v === "secondary" || v === "outline") return "secondary";
  if (v === "ghost" || v === "link") return "ghost";
  return "primary";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const effectiveVariant = resolveVariant(variant);

    if (asChild) {
      if (React.isValidElement(children)) {
        const childProps = children.props as { className?: string; [key: string]: unknown };
        return React.cloneElement(children, {
          ref,
          className: cn(
            buttonVariants({ variant: effectiveVariant, size, className }),
            childProps.className
          ),
          "aria-disabled": disabled || isLoading ? true : undefined,
          ...props,
        } as React.HTMLAttributes<HTMLElement>);
      }
      return null;
    }

    return (
      <button
        ref={ref}
        type={props.type || "button"}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? "true" : undefined}
        className={cn(buttonVariants({ variant: effectiveVariant, size, className }))}
        {...props}
      >
        {isLoading ? (
          <svg
            className="size-4 shrink-0 animate-spin text-current"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
