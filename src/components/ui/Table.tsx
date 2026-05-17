import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
  emptyMessage = "Aucune donnée",
  className = "",
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div
        className={`bg-surface rounded-xl border border-border overflow-hidden ${className}`}
      >
        <div className="p-8 text-center text-text-secondary animate-pulse">
          Chargement...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className={`bg-surface rounded-xl border border-border overflow-hidden ${className}`}
      >
        <div className="p-8 text-center text-text-secondary">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-surface rounded-xl border border-border overflow-hidden ${className}`}
    >
      {/* Conteneur avec scroll horizontal sur mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-medium text-text-secondary whitespace-nowrap ${
                    col.sortable
                      ? "cursor-pointer select-none hover:text-text-primary transition-colors"
                      : ""
                  } ${col.className || ""}`}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="text-text-secondary/60">
                        <ChevronUp size={14} />
                        <ChevronDown size={14} className="-mt-1" />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`...`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`...`}>
                    {col.render
                      ? col.render(item, rowIndex)
                      : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
