import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[background-color,border-color] duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:opacity-90",
        secondary:
          "border border-border bg-background text-foreground hover:bg-muted active:bg-muted/80",
        ghost: "text-foreground hover:bg-muted active:bg-muted/80",
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-md [&_svg]:size-3.5",
        sm: "h-8 px-3 text-xs rounded-md [&_svg]:size-4",
        default: "h-10 px-4 py-2 text-sm rounded-lg [&_svg]:size-4",
        md: "h-10 px-4 py-2 text-sm rounded-lg [&_svg]:size-4",
        lg: "h-12 px-6 text-base rounded-xl [&_svg]:size-5",
        icon: "size-10 rounded-lg p-0 [&_svg]:size-4",
        "icon-sm": "size-8 rounded-md p-0 [&_svg]:size-3.5",
        "icon-lg": "size-12 rounded-xl p-0 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export type AllowedButtonVariant = "primary" | "secondary" | "ghost";
export type LegacyButtonVariant = "default" | "outline" | "accent" | "destructive" | "link";

export interface ButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    Omit<VariantProps<typeof buttonVariants>, "variant"> {
  variant?: AllowedButtonVariant | LegacyButtonVariant;
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
      size,
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
      return (
        <Slot.Root
          ref={ref}
          className={cn(buttonVariants({ variant: effectiveVariant, size, className }))}
          aria-disabled={disabled || isLoading ? true : undefined}
          {...props}
        >
          {children}
        </Slot.Root>
      );
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
          <Loader2 className="shrink-0 animate-spin text-current" aria-hidden="true" />
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
