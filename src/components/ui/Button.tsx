import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-brand-600 text-white hover:bg-brand-500 shadow-sm shadow-brand-950 hover:shadow-brand-500/20 hover:shadow-md",
        primary:
          "bg-brand-600 text-white hover:bg-brand-500 shadow-sm shadow-brand-950 hover:shadow-brand-500/20 hover:shadow-md",
        secondary:
          "bg-surface-800 text-surface-100 hover:bg-surface-700 border border-surface-700 hover:border-surface-600",
        accent:
          "bg-gradient-to-r from-brand-600 to-accent-600 text-white hover:from-brand-500 hover:to-accent-500 shadow-md shadow-accent-950/40 hover:shadow-accent-500/25",
        outline:
          "border border-surface-700 bg-surface-900/50 text-surface-200 hover:bg-surface-800 hover:text-white hover:border-surface-600",
        ghost: "text-surface-300 hover:bg-surface-800/80 hover:text-white",
        destructive:
          "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 hover:border-red-500/50 focus-visible:ring-red-500",
        link: "text-brand-400 hover:text-brand-300 underline-offset-4 hover:underline p-0 h-auto active:scale-100",
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
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
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
    if (asChild) {
      return (
        <Slot.Root
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
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
        className={cn(buttonVariants({ variant, size, className }))}
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
