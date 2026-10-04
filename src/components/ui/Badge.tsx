import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors select-none",
  {
    variants: {
      variant: {
        // ONE neutral style
        default: "border-border bg-muted text-muted-foreground",
        neutral: "border-border bg-muted text-muted-foreground",
        // Variant "selected" = border-primary text-accent-text
        selected: "border-primary text-accent-text bg-muted",
        // Status badges use text-success / text-destructive only
        success: "border-border bg-muted text-success",
        destructive: "border-border bg-muted text-destructive",
        // Compatibility aliases for existing pages during migration
        surface: "border-border bg-muted text-muted-foreground",
        brand: "border-primary text-accent-text bg-muted",
        accent: "border-primary text-accent-text bg-muted",
        warning: "border-border bg-muted text-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
        gradient: "border-border bg-muted text-foreground",
      },
      size: {
        sm: "text-xs px-2 py-0.5 tracking-tight [&_svg]:size-3",
        default: "text-xs px-2.5 py-0.5 [&_svg]:size-3.5",
        md: "text-xs px-2.5 py-0.5 [&_svg]:size-3.5",
        lg: "text-sm px-3 py-1 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotPulse?: boolean;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

function Badge({
  className,
  variant = "default",
  size = "default",
  dot = false,
  dotPulse = false,
  icon,
  removable = false,
  onRemove,
  children,
  ...props
}: BadgeProps) {
  const dotColor =
    variant === "success"
      ? "bg-success"
      : variant === "destructive"
        ? "bg-destructive"
        : variant === "selected" || variant === "brand" || variant === "accent"
          ? "bg-primary"
          : "bg-muted-foreground";

  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className="relative flex size-2 shrink-0 items-center justify-center">
          {dotPulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                dotColor
              )}
            />
          )}
          <span className={cn("relative inline-flex size-1.5 rounded-full", dotColor)} />
        </span>
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="hover:bg-muted focus-visible:ring-ring -mr-1 ml-0.5 rounded-full p-0.5 focus-visible:ring-1 focus-visible:outline-none"
          aria-label="Remove badge"
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}

export { Badge, badgeVariants };
