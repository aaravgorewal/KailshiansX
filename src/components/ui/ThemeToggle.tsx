"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
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
            type="button"
            role="menuitem"
            onClick={() => selectTheme("light")}
            className={`hover:bg-muted focus-visible:bg-muted flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none ${
              theme === "light" ? "text-primary font-semibold" : "text-foreground"
            }`}
          >
            Light
            {theme === "light" && <span className="text-[12px]">✓</span>}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => selectTheme("dark")}
            className={`hover:bg-muted focus-visible:bg-muted flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none ${
              theme === "dark" ? "text-primary font-semibold" : "text-foreground"
            }`}
          >
            Dark
            {theme === "dark" && <span className="text-[12px]">✓</span>}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => selectTheme("system")}
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
