"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

const THEMES = ["light", "dark", "system"] as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus currently selected item or first item
      const idx = theme === "light" ? 0 : theme === "dark" ? 1 : 2;
      requestAnimationFrame(() => {
        itemRefs.current[idx]?.focus();
      });
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, theme]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleItemKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectTheme(THEMES[index]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = (index + 1) % 3;
      itemRefs.current[nextIdx]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIdx = (index - 1 + 3) % 3;
      itemRefs.current[prevIdx]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  const selectTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const isDark = mounted ? (resolvedTheme ?? theme) === "dark" : false;

  return (
    <div ref={menuRef} className="relative inline-block text-left" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className="border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        {/* Reserve exact icon size to prevent layout shift before mount */}
        <span className="flex h-4 w-4 items-center justify-center">
          {mounted ? (
            isDark ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )
          ) : (
            <span className="h-4 w-4" aria-hidden="true" />
          )}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-label="Theme selection"
          className="border-border bg-card absolute right-0 z-50 mt-1.5 w-32 origin-top-right rounded-lg border p-1 shadow-none focus:outline-none"
        >
          <button
            ref={(el) => {
              itemRefs.current[0] = el;
            }}
            type="button"
            role="menuitem"
            onClick={() => selectTheme("light")}
            onKeyDown={(e) => handleItemKeyDown(0, e)}
            className={`hover:bg-muted focus-visible:bg-muted flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none ${
              theme === "light" ? "text-primary font-semibold" : "text-foreground"
            }`}
          >
            Light
            {theme === "light" && <span className="text-[12px]">✓</span>}
          </button>
          <button
            ref={(el) => {
              itemRefs.current[1] = el;
            }}
            type="button"
            role="menuitem"
            onClick={() => selectTheme("dark")}
            onKeyDown={(e) => handleItemKeyDown(1, e)}
            className={`hover:bg-muted focus-visible:bg-muted flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none ${
              theme === "dark" ? "text-primary font-semibold" : "text-foreground"
            }`}
          >
            Dark
            {theme === "dark" && <span className="text-[12px]">✓</span>}
          </button>
          <button
            ref={(el) => {
              itemRefs.current[2] = el;
            }}
            type="button"
            role="menuitem"
            onClick={() => selectTheme("system")}
            onKeyDown={(e) => handleItemKeyDown(2, e)}
            className={`hover:bg-muted focus-visible:bg-muted flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none ${
              theme === "system" ? "text-primary font-semibold" : "text-foreground"
            }`}
          >
            System
            {theme === "system" && <span className="text-[12px]">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}
