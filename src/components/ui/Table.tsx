import React from "react";

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T, index?: number) => React.ReactNode; // <-- index optionnel
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
                    {/* Chevrons pour tri (non fonctionnels, juste visuels) */}
                    {col.sortable && (
                      <span className="text-text-secondary/60">
                        <svg width="14" height="14" viewBox="0 0 14 14">
                          <path d="M7 3L3 7h8L7 3z" />
                        </svg>
                        <svg width="14" height="14" viewBox="0 0 14 14">
                          <path d="M7 11L3 7h8l-4 4z" />
                        </svg>
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
                className={`border-b border-border last:border-b-0 ${
                  onRowClick
                    ? "cursor-pointer hover:bg-gray-50/50 transition-colors"
                    : ""
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-text-primary whitespace-nowrap ${col.className || ""}`}
                  >
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
