import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface TextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  external?: boolean;
}

/**
 * TextLink with animated underline interaction.
 * Smoothly expands 1px underline from left to right on hover/focus.
 */
export const TextLink = React.forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ className, href, external, children, ...props }, ref) => {
    const isExternal = external ?? (href.startsWith("http://") || href.startsWith("https://"));

    const content = (
      <span className="text-foreground hover:text-accent-text focus-visible:text-accent-text relative inline-flex items-center gap-1 font-medium transition-colors">
        <span>{children}</span>
        <span
          className="bg-accent-text pointer-events-none absolute -bottom-0.5 left-0 h-[1px] w-0 transition-[width] duration-200 ease-out group-hover:w-full group-focus-visible:w-full"
          aria-hidden="true"
        />
      </span>
    );

    const baseClasses = cn(
      "group relative inline-flex items-center text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm focus-visible:transition-none",
      className
    );

    if (isExternal) {
      return (
        <a
          ref={ref}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses}
          {...props}
        >
          {content}
        </a>
      );
    }

    return (
      <Link ref={ref} href={href} className={baseClasses} {...props}>
        {content}
      </Link>
    );
  }
);

TextLink.displayName = "TextLink";
