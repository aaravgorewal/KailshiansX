// src/components/admin/AdminKanban.tsx
// Universal Kanban board for pipelines using design tokens

"use client";

import * as React from "react";

export interface KanbanColumn<T> {
  id: string;
  title: string;
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
            className="border-border bg-card flex w-80 shrink-0 flex-col rounded-lg border"
          >
            {/* Column Header */}
            <div className="border-border bg-card flex items-center justify-between rounded-t-lg border-b p-3.5">
              <div className="flex items-center gap-2">
                <span className="text-foreground text-xs font-semibold tracking-wider uppercase">
                  {column.title}
                </span>
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                  {column.items.length}
                </span>
              </div>
            </div>

            {/* Column Cards */}
            <div className="max-h-[calc(100vh-280px)] min-h-[300px] flex-1 space-y-2.5 overflow-y-auto p-2.5">
              {column.items.length === 0 ? (
                <div className="border-border flex h-28 items-center justify-center rounded-md border border-dashed p-4 text-center">
                  <p className="text-muted-foreground text-xs">No records in this stage</p>
                </div>
              ) : (
                column.items.map((item) => {
                  const isThisMoving = movingItemId === item.id || isUpdating;

                  return (
                    <div
                      key={item.id}
                      onClick={() => onItemClick && onItemClick(item)}
                      className={`border-border bg-background hover:bg-muted relative cursor-pointer rounded-md border p-3.5 transition-colors ${
                        isThisMoving ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      {/* Top tag & date */}
                      <div className="mb-2 flex items-center justify-between gap-2">
                        {item.tag && (
                          <span className="border-border bg-muted text-muted-foreground inline-block rounded border px-1.5 py-0.5 text-xs font-medium">
                            {item.tag}
                          </span>
                        )}
                        {item.date && (
                          <span className="text-muted-foreground text-xs">{item.date}</span>
                        )}
                      </div>

                      {/* Title & subtitle */}
                      <h4 className="text-foreground text-xs font-semibold">{item.title}</h4>
                      {item.subtitle && (
                        <p className="text-muted-foreground mt-0.5 text-xs">{item.subtitle}</p>
                      )}

                      {/* Detail metrics */}
                      {item.details && item.details.length > 0 && (
                        <div className="border-border mt-2.5 space-y-1 border-t pt-2">
                          {item.details.map((d, dIdx) => (
                            <div key={dIdx} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{d.label}</span>
                              <span className="text-foreground max-w-[140px] truncate text-right font-medium">
                                {d.value ?? "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Stage Mover Selector */}
                      <div
                        className="mt-3 flex items-center justify-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-muted-foreground text-xs">Move:</span>
                        <select
                          value={item.currentStatus}
                          disabled={isThisMoving}
                          onChange={(e) => handleStatusSelect(item.id, e.target.value)}
                          className="border-input bg-background text-foreground focus:border-primary rounded border px-2 py-0.5 text-xs focus:outline-none"
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
