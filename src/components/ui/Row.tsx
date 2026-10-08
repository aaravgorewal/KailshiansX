import * as React from "react";
import { cn } from "@/lib/utils";

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  interactive?: boolean;
}

/**
 * List row component with a clean 1px bottom divider.
 */
export const Row = React.forwardRef<HTMLDivElement, RowProps>(
  ({ className, as: Component = "div", interactive = false, children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "border-border flex items-center justify-between gap-4 border-b py-4 transition-colors",
          interactive && "hover:bg-muted/50 cursor-pointer rounded-md px-2",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Row.displayName = "Row";
