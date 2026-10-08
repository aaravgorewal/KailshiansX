import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  size?: "sm" | "default" | "lg" | "full";
}

/**
 * Section component providing container constraints and vertical padding.
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, as: Component = "section", size = "default", children, ...props }, ref) => {
    const sizeClasses = {
      sm: "max-w-4xl",
      default: "max-w-6xl",
      lg: "max-w-7xl",
      full: "max-w-full",
    }[size];

    return (
      <Component
        ref={ref}
        className={cn(
          "mx-auto w-full px-4 py-12 sm:px-6 sm:py-16 md:py-24 lg:px-8",
          sizeClasses,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Section.displayName = "Section";
