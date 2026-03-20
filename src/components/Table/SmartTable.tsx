import React, { useState, useEffect } from "react";
import type { NormalizedTable, TableColumn } from "../../api/types";
import { paginationStyles } from "./constants";

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export type SmartTableRenderers = Partial<
  Record<
    string,
    (args: {
      row: Record<string, unknown>;
      column: TableColumn;
      rowId: string;
    }) => React.ReactNode
  >
>;

type Props = {
  table: NormalizedTable;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelected?: (rowId: string) => void;
  renderers?: SmartTableRenderers;
  emptyStateText?: string;
  pageSize?: number;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

export default function SmartTable({
  table,
  selectable = false,
  selectedIds,
  onToggleSelected,
  renderers,
  emptyStateText = "No data",
  pageSize: pageSizeProp,
}: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeProp ?? PAGE_SIZE_OPTIONS[0]);

  // Reset to page 1 whenever the data or page size changes.
  useEffect(() => { setPage(1); }, [table.rows.length, pageSize]);

  const totalRows = table.rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);

  const start = (safePage - 1) * pageSize;
  const visibleRows = table.rows.slice(start, start + pageSize);
  const hasRows = totalRows > 0;

  const rangeStart = hasRows ? start + 1 : 0;
  const rangeEnd = Math.min(start + pageSize, totalRows);

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              {selectable ? <th style={{ width: 48 }}>Select</th> : null}
              {table.columns.map((c) => (
                <th key={c.key}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!hasRows ? (
              <tr>
                <td colSpan={table.columns.length + (selectable ? 1 : 0)}>{emptyStateText}</td>
              </tr>
            ) : (
              visibleRows.map((row) => {
                const rowId = String(row[table.rowIdField] ?? "");
                const isSelected = selectedIds?.has(rowId) ?? false;
                return (
                  <tr key={rowId}>
                    {selectable ? (
                      <td>
                        <input
                          className="checkbox"
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelected?.(rowId)}
                        />
                      </td>
                    ) : null}
                    {table.columns.map((c) => {
                      const renderer = renderers?.[c.key];
                      return (
                        <td key={c.key}>
                          {renderer ? renderer({ row, column: c, rowId }) : formatCellValue(row[c.key])}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {hasRows && (
        <div style={paginationStyles.bar}>
          <div style={paginationStyles.left}>
            <span>Rows per page</span>
            <select
              style={paginationStyles.select}
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>
              {rangeStart}–{rangeEnd} of {totalRows}
            </span>
          </div>

          <div style={paginationStyles.right}>
            <button
              style={paginationStyles.btn(safePage === 1)}
              disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>

            {buildPageNumbers(safePage, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} style={{ padding: "0 4px" }}>…</span>
              ) : (
                <button
                  key={p}
                  style={paginationStyles.btn(false, p === safePage)}
                  onClick={() => setPage(p as number)}
                  aria-label={`Page ${p}`}
                  aria-current={p === safePage ? "page" : undefined}
                >
                  {p}
                </button>
              )
            )}

            <button
              style={paginationStyles.btn(safePage === totalPages)}
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}