// src/components/admin/AdminDataTable.tsx
// Universal Data Table with Search, Filter, Sort, Pagination, and CSV Export
// Meets PRD §22 admin data table requirements.

"use client";

import * as React from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  // Custom cell renderer
  cell?: (item: T) => React.ReactNode;
  // Custom sort function or sort key
  sortable?: boolean;
  sortAccessor?: (item: T) => string | number | Date | boolean | null | undefined;
  className?: string;
  headerClassName?: string;
  // If true, hide on mobile
  hideOnMobile?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig<T> {
  label: string;
  key: keyof T | ((item: T) => string);
  options: FilterOption[];
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  filters?: FilterConfig<T>[];
  exportFilename?: string;
  defaultSort?: {
    key: keyof T | ((item: T) => string | number | Date | boolean | null | undefined);
    direction: "asc" | "desc";
  };
  pageSize?: number;
  emptyMessage?: string;
  toolbarRight?: React.ReactNode;
}

export function AdminDataTable<T extends { id?: string | number }>({
  data,
  columns,
  searchPlaceholder = "Search records...",
  searchFilter,
  filters = [],
  exportFilename = "export.csv",
  defaultSort,
  pageSize = 10,
  emptyMessage = "No records found.",
  toolbarRight,
}: AdminDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({});
  const [sortKey, setSortKey] = React.useState<string | null>(
    defaultSort ? String(defaultSort.key) : null
  );
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    defaultSort ? defaultSort.direction : "desc"
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(pageSize);

  // 1. Filter data
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (searchFilter) {
          if (!searchFilter(item, q)) return false;
        } else {
          // Default string search across all primitive values
          const values = Object.values(item as Record<string, unknown>)
            .map((v) => (v === null || v === undefined ? "" : String(v).toLowerCase()))
            .join(" ");
          if (!values.includes(q)) return false;
        }
      }

      // Dropdown filters
      for (const f of filters) {
        const selectedValue = activeFilters[f.label];
        if (selectedValue && selectedValue !== "ALL") {
          let itemValue: string;
          if (typeof f.key === "function") {
            itemValue = f.key(item);
          } else {
            const raw = (item as Record<string, unknown>)[f.key as string];
            itemValue = raw === null || raw === undefined ? "" : String(raw);
          }
          if (itemValue !== selectedValue) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchQuery, searchFilter, filters, activeFilters]);

  // 2. Sort data
  const sortedData = React.useMemo(() => {
    if (!sortKey) return filteredData;

    const column = columns.find(
      (c) => String(c.accessorKey) === sortKey || c.header.toLowerCase() === sortKey.toLowerCase()
    );

    return [...filteredData].sort((a, b) => {
      let valA: unknown;
      let valB: unknown;

      if (column?.sortAccessor) {
        valA = column.sortAccessor(a);
        valB = column.sortAccessor(b);
      } else if (column?.accessorKey) {
        valA = a[column.accessorKey];
        valB = b[column.accessorKey];
      } else {
        return 0;
      }

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let result = 0;
      if (valA instanceof Date && valB instanceof Date) {
        result = valA.getTime() - valB.getTime();
      } else if (typeof valA === "number" && typeof valB === "number") {
        result = valA - valB;
      } else {
        result = String(valA).localeCompare(String(valB));
      }

      return sortDirection === "asc" ? result : -result;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // 3. Paginate
  const totalPages = Math.ceil(sortedData.length / rowsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginatedData = React.useMemo(() => {
    const start = (safeCurrentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, safeCurrentPage, rowsPerPage]);

  const handleSort = (col: ColumnDef<T>) => {
    if (!col.sortable && !col.accessorKey) return;
    const key = col.accessorKey ? String(col.accessorKey) : col.header;
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // 4. CSV Export
  const handleExportCsv = () => {
    if (sortedData.length === 0) {
      alert("No data to export");
      return;
    }

    // Prepare headers
    const exportableCols = columns.filter((c) => c.accessorKey || c.header);
    const headers = exportableCols.map((c) => `"${c.header.replace(/"/g, '""')}"`);

    // Prepare rows
    const rows = sortedData.map((item) => {
      return exportableCols
        .map((c) => {
          let val = "";
          if (c.sortAccessor) {
            const raw = c.sortAccessor(item);
            val = raw === null || raw === undefined ? "" : String(raw);
          } else if (c.accessorKey) {
            const raw = item[c.accessorKey];
            val = raw === null || raw === undefined ? "" : String(raw);
          }
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search & Filters */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative max-w-sm min-w-[220px] flex-1">
            <Search className="text-surface-500 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="border-surface-700 bg-surface-900/80 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-lg border py-2 pr-8 pl-9 text-xs transition-colors focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="text-surface-500 hover:text-surface-300 absolute top-1/2 right-2.5 -translate-y-1/2"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          {filters.map((f) => (
            <div key={f.label} className="relative">
              <select
                value={activeFilters[f.label] || "ALL"}
                onChange={(e) => {
                  setActiveFilters((prev) => ({
                    ...prev,
                    [f.label]: e.target.value,
                  }));
                  setCurrentPage(1);
                }}
                className="border-surface-700 bg-surface-900 text-surface-200 focus:border-brand-500 rounded-lg border py-2 pr-8 pl-3 text-xs focus:outline-none"
              >
                <option value="ALL">{f.label}: All</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Clear Filters Button if any active */}
          {(searchQuery || Object.values(activeFilters).some((v) => v !== "ALL")) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveFilters({});
                setCurrentPage(1);
              }}
              className="text-brand-400 hover:text-brand-300 flex items-center gap-1 text-xs font-medium"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Action Buttons & Export */}
        <div className="flex items-center gap-2">
          {toolbarRight}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="border-surface-700 hover:border-surface-600 bg-surface-900 text-surface-200 flex items-center gap-1.5 text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV ({sortedData.length})
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="border-surface-800 bg-surface-900/40 relative overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Header */}
            <thead className="border-surface-800 bg-surface-900/90 text-surface-400 border-b font-semibold tracking-wider uppercase">
              <tr>
                {columns.map((col, idx) => {
                  const isSortable = col.sortable || Boolean(col.accessorKey);
                  const isCurrentSort =
                    sortKey === (col.accessorKey ? String(col.accessorKey) : col.header);

                  return (
                    <th
                      key={idx}
                      onClick={() => isSortable && handleSort(col)}
                      className={`px-4 py-3.5 select-none ${
                        isSortable ? "hover:text-surface-100 cursor-pointer" : ""
                      } ${col.hideOnMobile ? "hidden md:table-cell" : ""} ${
                        col.headerClassName || ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {isSortable && (
                          <span className="text-surface-500">
                            {isCurrentSort ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="text-brand-400 h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="text-brand-400 h-3.5 w-3.5" />
                              )
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-surface-800/60 divide-y">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-surface-400 py-12 text-center text-sm"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Filter className="text-surface-600 h-8 w-8" />
                      <p>{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, rowIdx) => (
                  <tr
                    key={item.id ? String(item.id) : rowIdx}
                    className="hover:bg-surface-800/40 transition-colors"
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={`text-surface-300 px-4 py-3.5 ${
                          col.hideOnMobile ? "hidden md:table-cell" : ""
                        } ${col.className || ""}`}
                      >
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                            ? String(item[col.accessorKey] ?? "—")
                            : "—"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-surface-800 bg-surface-900/60 text-surface-400 flex flex-col items-center justify-between gap-3 border-t px-4 py-3 text-xs sm:flex-row">
          {/* Record summary */}
          <div className="flex items-center gap-3">
            <span>
              Showing{" "}
              <strong className="text-surface-200">
                {sortedData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-surface-200">
                {Math.min(currentPage * rowsPerPage, sortedData.length)}
              </strong>{" "}
              of <strong className="text-surface-200">{sortedData.length}</strong> entries
            </span>

            {/* Page size dropdown */}
            <div className="border-surface-800 flex items-center gap-1.5 border-l pl-3">
              <span>Show:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="border-surface-700 bg-surface-900 text-surface-200 rounded border px-2 py-0.5 text-xs focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="border-surface-800 bg-surface-900 hover:bg-surface-800 text-surface-300 rounded border p-1.5 disabled:cursor-not-allowed disabled:opacity-40"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-surface-300 px-2">
              Page <strong className="text-surface-100">{currentPage}</strong> of{" "}
              <strong className="text-surface-100">{totalPages}</strong>
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="border-surface-800 bg-surface-900 hover:bg-surface-800 text-surface-300 rounded border p-1.5 disabled:cursor-not-allowed disabled:opacity-40"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
