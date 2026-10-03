"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FAQItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
  category?: string;
}

export interface FAQAccordionProps {
  items: FAQItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export function FAQAccordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className,
}: FAQAccordionProps) {
  const [openIds, setOpenIds] = React.useState<string[]>(defaultOpen);
  const headerRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const total = items.length;
    let targetIndex: number | null = null;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      targetIndex = (index + 1) % total;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      targetIndex = (index - 1 + total) % total;
    } else if (e.key === "Home") {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      targetIndex = total - 1;
    }

    if (targetIndex !== null) {
      headerRefs.current[targetIndex]?.focus();
    }
  };

  return (
    <div className={cn("mx-auto w-full max-w-3xl space-y-3", className)}>
      {items.map((item, index) => {
        const isOpen = openIds.includes(item.id);
        const headerId = `faq-header-${item.id}`;
        const panelId = `faq-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className={cn(
              "overflow-hidden rounded-xl border transition-all duration-200",
              isOpen
                ? "border-brand-500/50 bg-surface-900/90 shadow-[0_0_20px_rgba(61,97,252,0.12)]"
                : "border-surface-800 bg-surface-900/50 hover:border-surface-700 hover:bg-surface-900/80"
            )}
          >
            <h3>
              <button
                ref={(el) => {
                  headerRefs.current[index] = el;
                }}
                id={headerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="text-surface-100 focus-visible:ring-brand-500 flex w-full items-center justify-between p-5 text-left text-base font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none sm:text-lg"
              >
                <span className="pr-4">{item.question}</span>
                <ChevronDown
                  className={cn(
                    "text-surface-400 size-5 shrink-0 transition-transform duration-300",
                    isOpen && "text-brand-400 rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="text-surface-300 border-surface-800/60 mt-1 border-t p-5 pt-0 text-sm leading-relaxed sm:text-base">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
