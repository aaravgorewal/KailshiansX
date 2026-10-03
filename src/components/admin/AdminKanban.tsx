// src/components/admin/AdminKanban.tsx
// Universal Kanban board for pipelines (Team Applications, Campus Leads, State Leads, Collaborations)
// Meets PRD §22 pipeline workflow requirements.

"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";

export interface KanbanColumn<T> {
  id: string;
  title: string;
  badgeVariant?: "default" | "success" | "warning" | "error" | "info";
  items: T[];
}

export interface KanbanItemProps {
  id: string;
  title: string;
  subtitle?: string | null;
  tag?: string | null;
  date?: string | null;
  details?: { label: string; value: string | null | undefined }[];
  currentStatus: string;
}

interface AdminKanbanProps<T extends KanbanItemProps> {
  columns: KanbanColumn<T>[];
  statusOptions: { label: string; value: string }[];
  onStatusChange: (itemId: string, newStatus: string) => Promise<void> | void;
  onItemClick?: (item: T) => void;
  isUpdating?: boolean;
}

export function AdminKanban<T extends KanbanItemProps>({
  columns,
  statusOptions,
  onStatusChange,
  onItemClick,
  isUpdating = false,
}: AdminKanbanProps<T>) {
  const [movingItemId, setMovingItemId] = React.useState<string | null>(null);

  const handleStatusSelect = async (itemId: string, newStatus: string) => {
    try {
      setMovingItemId(itemId);
      await onStatusChange(itemId, newStatus);
    } finally {
      setMovingItemId(null);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pt-2 pb-4">
      {columns.map((column) => {
        return (
          <div
            key={column.id}
            className="bg-surface-900/50 border-surface-800 flex w-80 flex-shrink-0 flex-col rounded-xl border"
          >
            {/* Column Header */}
            <div className="border-surface-800/80 bg-surface-900/90 flex items-center justify-between rounded-t-xl border-b p-3.5">
              <div className="flex items-center gap-2">
                <span className="text-surface-200 text-xs font-bold tracking-wider uppercase">
                  {column.title}
                </span>
                <span className="bg-surface-800 text-surface-400 rounded-full px-2 py-0.5 text-xs font-semibold">
                  {column.items.length}
                </span>
              </div>
            </div>

            {/* Column Cards */}
            <div className="max-h-[calc(100vh-280px)] min-h-[300px] flex-1 space-y-2.5 overflow-y-auto p-2.5">
              {column.items.length === 0 ? (
                <div className="border-surface-800/60 flex h-28 items-center justify-center rounded-lg border border-dashed p-4 text-center">
                  <p className="text-surface-500 text-xs">No records in this stage</p>
                </div>
              ) : (
                column.items.map((item) => {
                  const isThisMoving = movingItemId === item.id || isUpdating;

                  return (
                    <div
                      key={item.id}
                      onClick={() => onItemClick && onItemClick(item)}
                      className={`group bg-surface-850/80 hover:bg-surface-800 border-surface-750/60 hover:border-brand-500/40 relative cursor-pointer rounded-lg border p-3.5 shadow-sm transition-all ${
                        isThisMoving ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      {/* Top tag & date */}
                      <div className="mb-2 flex items-center justify-between gap-2">
                        {item.tag && (
                          <Badge variant="outline" size="sm" className="text-[10px] font-semibold">
                            {item.tag}
                          </Badge>
                        )}
                        {item.date && (
                          <span className="text-surface-500 text-[10px]">{item.date}</span>
                        )}
                      </div>

                      {/* Title & subtitle */}
                      <h4 className="text-surface-100 group-hover:text-brand-300 text-sm font-semibold transition-colors">
                        {item.title}
                      </h4>
                      {item.subtitle && (
                        <p className="text-surface-400 mt-0.5 line-clamp-1 text-xs">
                          {item.subtitle}
                        </p>
                      )}

                      {/* Details pills */}
                      {item.details && item.details.length > 0 && (
                        <div className="border-surface-800/60 text-surface-300 mt-2.5 space-y-1 border-t pt-2 text-xs">
                          {item.details.map(
                            (det, i) =>
                              det.value && (
                                <div
                                  key={i}
                                  className="flex items-center gap-1.5 truncate text-[11px]"
                                >
                                  <span className="text-surface-500">{det.label}:</span>
                                  <span className="text-surface-200 truncate">{det.value}</span>
                                </div>
                              )
                          )}
                        </div>
                      )}

                      {/* Quick stage transition dropdown */}
                      <div
                        className="border-surface-800 mt-3 flex items-center justify-between border-t pt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-surface-500 text-[10px] font-medium">Stage:</span>
                        <select
                          value={item.currentStatus}
                          onChange={(e) => handleStatusSelect(item.id, e.target.value)}
                          className="bg-surface-900 border-surface-700 text-surface-200 focus:border-brand-500 rounded border px-2 py-0.5 text-[11px] focus:outline-none"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
