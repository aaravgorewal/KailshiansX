// src/components/admin/AdminModal.tsx
// Universal modal for create/edit forms, details inspection, and confirmations.

"use client";

import * as React from "react";
import { X } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "lg",
}: AdminModalProps) {
  // ESC key handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock scroll
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidthClass} bg-surface-900 border-surface-800 z-10 flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border shadow-2xl`}
      >
        {/* Header */}
        <div className="border-surface-800 bg-surface-900/90 flex items-center justify-between border-b p-5">
          <div>
            <h3 className="text-surface-100 text-base font-bold">{title}</h3>
            {description && <p className="text-surface-400 mt-0.5 text-xs">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg p-1.5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
