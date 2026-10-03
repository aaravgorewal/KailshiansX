import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border text-surface-100 transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-surface-900/90 border-surface-700/80 backdrop-blur-sm",
        elevated: "bg-surface-800/90 border-surface-700 shadow-xl shadow-black/50 backdrop-blur-sm",
        outline: "bg-surface-950/40 border-surface-700/80",
        glow: "bg-surface-900/90 border-surface-700/80 hover:border-brand-500/50 hover:shadow-[0_0_24px_rgba(61,97,252,0.18)]",
        accentGlow:
          "bg-surface-900/90 border-surface-700/80 hover:border-accent-500/50 hover:shadow-[0_0_24px_rgba(139,61,255,0.18)]",
        glass: "bg-surface-900/60 border-surface-700/60 backdrop-blur-md",
      },
      interactive: {
        true: "hover:-translate-y-1 hover:shadow-lg cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  as?: React.ElementType;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, as: Component = "div", ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(cardVariants({ variant, interactive, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-5 sm:p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" }
>(({ className, as: Component = "h3", ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      "text-surface-50 text-lg leading-snug font-semibold tracking-tight sm:text-xl",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-surface-400 text-sm leading-relaxed", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 pt-0 sm:p-6", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "border-surface-800/80 mt-auto flex items-center border-t p-5 pt-0 pt-4 sm:p-6",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
