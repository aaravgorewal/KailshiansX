import * as React from "react";
import Link from "next/link";
import { FolderSearch } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "default" | "outline" | "accent";
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "border-border bg-card mx-auto flex max-w-lg flex-col items-center justify-center rounded-lg border p-8 text-center sm:p-12",
        className
      )}
    >
      <div className="bg-muted border-border text-foreground mb-4 flex size-14 items-center justify-center rounded-lg border sm:size-16">
        {icon || <FolderSearch className="size-7 sm:size-8" aria-hidden="true" />}
      </div>

      <h3 className="text-foreground mb-2 text-lg font-semibold sm:text-xl">{title}</h3>

      {description && (
        <p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">{description}</p>
      )}

      {children}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action &&
            (action.href ? (
              <Button asChild variant={action.variant || "primary"}>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button onClick={action.onClick} variant={action.variant || "primary"}>
                {action.label}
              </Button>
            ))}

          {secondaryAction &&
            (secondaryAction.href ? (
              <Button asChild variant={secondaryAction.variant || "secondary"}>
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || "secondary"}
              >
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}
