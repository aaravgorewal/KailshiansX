"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FilterChipOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export type FilterChipsProps =
  | {
      options: FilterChipOption[];
      selected: string;
      onChange: (selected: string) => void;
      multiple?: false;
      allOption?: { id: string; label: string };
      size?: "sm" | "default";
      className?: string;
      label?: string;
    }
  | {
      options: FilterChipOption[];
      selected: string[];
      onChange: (selected: string[]) => void;
      multiple: true;
      allOption?: { id: string; label: string };
      size?: "sm" | "default";
      className?: string;
      label?: string;
    };

export function FilterChips({
  options,
  selected,
  onChange,
  multiple = false,
  allOption = { id: "ALL", label: "All" },
  size = "default",
  className,
  label = "Filter options",
}: FilterChipsProps) {
  const isSelected = (id: string): boolean => {
    if (multiple && Array.isArray(selected)) {
      if (id === allOption.id) {
        return selected.length === 0;
      }
      return selected.includes(id);
    }
    return selected === id;
  };

  const handleSelect = (id: string) => {
    if (multiple && Array.isArray(selected)) {
      const multiChange = onChange as (selected: string[]) => void;
      if (id === allOption.id) {
        multiChange([]);
        return;
      }
      if (selected.includes(id)) {
        multiChange(selected.filter((item) => item !== id));
      } else {
        multiChange([...selected, id]);
      }
    } else {
      const singleChange = onChange as (selected: string) => void;
      singleChange(id);
    }
  };

  const allItems: FilterChipOption[] = allOption
    ? [{ id: allOption.id, label: allOption.label }, ...options]
    : options;

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex touch-pan-x scrollbar-none items-center gap-2 overflow-x-auto scroll-smooth py-1",
        className
      )}
    >
      {allItems.map((option) => {
        const active = isSelected(option.id);

        return (
          <button
            key={option.id}
            type="button"
            role="button"
            aria-pressed={active}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "focus-visible:ring-ring focus-visible:ring-offset-background inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-2 active:opacity-80",
              size === "sm" ? "h-7 px-3 text-xs" : "h-8.5 px-3.5 text-xs sm:text-sm",
              active
                ? "border-primary bg-muted text-accent-text font-semibold"
                : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground"
            )}
          >
            {option.icon && <span className="shrink-0 text-current">{option.icon}</span>}
            <span>{option.label}</span>
            {typeof option.count === "number" && (
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1.5 font-mono text-xs leading-none tracking-tight",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
