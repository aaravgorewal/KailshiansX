import * as React from "react";
import { cn } from "@/lib/utils";

const baseBadgeClasses =
  "inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors select-none";

const badgeVariantClasses: Record<string, string> = {
  default: "border-border bg-muted text-muted-foreground",
  neutral: "border-border bg-muted text-muted-foreground",
  selected: "border-primary text-accent-text bg-muted",
  success: "border-border bg-muted text-success",
  destructive: "border-border bg-muted text-destructive",
  surface: "border-border bg-muted text-muted-foreground",
  brand: "border-primary text-accent-text bg-muted",
  accent: "border-primary text-accent-text bg-muted",
  warning: "border-border bg-muted text-foreground",
  outline: "border-border bg-transparent text-muted-foreground",
};

const badgeSizeClasses: Record<string, string> = {
  sm: "text-xs px-2 py-0.5 tracking-tight [&_svg]:size-3",
  default: "text-xs px-2.5 py-0.5 [&_svg]:size-3.5",
  md: "text-xs px-2.5 py-0.5 [&_svg]:size-3.5",
  lg: "text-sm px-3 py-1 [&_svg]:size-4",
};

export type BadgeVariant =
  | "default"
  | "neutral"
  | "selected"
  | "success"
  | "destructive"
  | "surface"
  | "brand"
  | "accent"
  | "warning"
  | "outline";

export type BadgeSize = "sm" | "default" | "md" | "lg";

function badgeVariants({
  variant = "default",
  size = "default",
}: {
  variant?: BadgeVariant;
  size?: BadgeSize;
} = {}) {
  return cn(
    baseBadgeClasses,
    badgeVariantClasses[variant] || badgeVariantClasses.default,
    badgeSizeClasses[size] || badgeSizeClasses.default
  );
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
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
          <svg
            className="size-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

export { Badge, badgeVariants };
