import React from "react";
import type { NormalizedTable, TableColumn } from "../../api/types";

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
};

export default function SmartTable({
  table,
  selectable = false,
  selectedIds,
  onToggleSelected,
  renderers,
  emptyStateText = "No data"
}: Props) {
  const hasRows = table.rows.length > 0;

  return (
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
            table.rows.map((row) => {
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
  );
}

