import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors select-none",
  {
    variants: {
      variant: {
        default: "border-surface-700 bg-surface-800 text-surface-200 hover:bg-surface-700",
        surface: "border-surface-700/60 bg-surface-900 text-surface-300",
        brand: "border-brand-500/30 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20",
        accent: "border-accent-500/30 bg-accent-500/10 text-accent-400 hover:bg-accent-500/20",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        destructive: "border-rose-500/30 bg-rose-500/10 text-rose-400",
        outline: "border-surface-700 bg-transparent text-surface-300",
        gradient:
          "border-brand-500/30 bg-gradient-to-r from-brand-500/15 to-accent-500/15 text-brand-300 shadow-sm",
      },
      size: {
        sm: "text-[11px] px-2 py-0.5 tracking-tight [&_svg]:size-3",
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

const dotColorMap: Record<string, string> = {
  default: "bg-surface-400",
  surface: "bg-surface-400",
  brand: "bg-brand-400",
  accent: "bg-accent-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  destructive: "bg-rose-400",
  outline: "bg-surface-400",
  gradient: "bg-brand-400",
};

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
  const dotColor = dotColorMap[variant || "default"] || "bg-current";

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
          className="-mr-1 ml-0.5 rounded-full p-0.5 hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none"
          aria-label="Remove badge"
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}

export { Badge, badgeVariants };
