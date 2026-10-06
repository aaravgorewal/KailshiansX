import * as React from "react";

export interface StatusCellProps {
  status: string;
  label?: string;
  variant?: "success" | "destructive" | "muted";
}

export function StatusCell({ status, label, variant }: StatusCellProps) {
  let resolvedVariant = variant;
  if (!resolvedVariant) {
    const s = status.toUpperCase();
    if (
      [
        "CONFIRMED",
        "ACTIVE",
        "PAID",
        "ACCEPTED",
        "DELIVERED",
        "WON",
        "VERIFIED",
        "PUBLISHED",
        "COMPLETED",
        "APPROVED",
      ].includes(s)
    ) {
      resolvedVariant = "success";
    } else if (
      [
        "FAILED",
        "REJECTED",
        "CANCELLED",
        "DROPPED",
        "SUSPENDED",
        "REVOKED",
        "LOST",
        "INACTIVE",
      ].includes(s)
    ) {
      resolvedVariant = "destructive";
    } else {
      resolvedVariant = "muted";
    }
  }

  const textColor =
    resolvedVariant === "success"
      ? "text-success"
      : resolvedVariant === "destructive"
        ? "text-destructive"
        : "text-muted-foreground";

  const displayLabel =
    label ??
    status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${textColor}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
}
