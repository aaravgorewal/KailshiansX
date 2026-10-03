import * as React from "react";
import Link from "next/link";
import { FolderSearch } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "secondary" | "outline" | "accent";
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
        "border-surface-800 bg-surface-900/60 mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl border p-8 text-center backdrop-blur-sm sm:p-12",
        className
      )}
    >
      <div className="bg-surface-800/80 border-surface-700/80 text-brand-400 mb-4 flex size-14 items-center justify-center rounded-2xl border shadow-inner sm:size-16">
        {icon || <FolderSearch className="size-7 sm:size-8" aria-hidden="true" />}
      </div>

      <h3 className="text-surface-50 mb-2 text-lg font-semibold sm:text-xl">{title}</h3>

      {description && (
        <p className="text-surface-400 mb-6 max-w-sm text-sm leading-relaxed">{description}</p>
      )}

      {children}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action &&
            (action.href ? (
              <Button asChild variant={action.variant || "default"}>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button variant={action.variant || "default"} onClick={action.onClick}>
                {action.label}
              </Button>
            ))}

          {secondaryAction &&
            (secondaryAction.href ? (
              <Button asChild variant="outline">
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}
