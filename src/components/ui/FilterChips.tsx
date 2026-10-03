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
              "focus-visible:ring-brand-500 focus-visible:ring-offset-surface-950 inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-2",
              size === "sm" ? "h-7 px-3 text-xs" : "h-8.5 px-3.5 text-xs sm:text-sm",
              active
                ? "border-brand-500/80 bg-brand-500/15 text-brand-300 font-semibold shadow-[0_0_12px_rgba(61,97,252,0.25)]"
                : "border-surface-700/80 bg-surface-900/60 text-surface-300 hover:border-surface-600 hover:bg-surface-800 hover:text-surface-100"
            )}
          >
            {option.icon && <span className="shrink-0 text-current">{option.icon}</span>}
            <span>{option.label}</span>
            {typeof option.count === "number" && (
              <span
                className={cn(
                  "py-0.2 ml-0.5 rounded-full px-1.5 font-mono text-[10px] leading-none tracking-tight",
                  active ? "bg-brand-500/30 text-brand-200" : "bg-surface-800 text-surface-400"
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
