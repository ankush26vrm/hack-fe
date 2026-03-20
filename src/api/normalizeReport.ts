import type { NormalizedReport, NormalizedTable, TableRow } from "./types";
import { normalizeTable } from "./normalizeTable";

function mergeTablesById(base: NormalizedTable, extra: NormalizedTable): NormalizedTable {
  const extraById = new Map<string, TableRow>();
  for (const r of extra.rows) {
    const id = r[extra.rowIdField];
    if (id !== undefined && id !== null) {
      extraById.set(String(id), r);
    }
  }

  const columns = [...base.columns];
  const columnKeys = new Set(columns.map((c) => c.key));

  for (const c of extra.columns) {
    if (!columnKeys.has(c.key)) {
      columnKeys.add(c.key);
      columns.push(c);
    }
  }

  const mergedRows = base.rows.map((baseRow) => {
    const baseId = baseRow[base.rowIdField];
    const extraRow = baseId !== undefined && baseId !== null ? extraById.get(String(baseId)) : undefined;
    return extraRow ? { ...baseRow, ...extraRow } : baseRow;
  });

  return { columns, rows: mergedRows, rowIdField: base.rowIdField };
}

/**
 * Normalizes backend response into { base, results }.
 * - Base comes from the already-normalized upload table.
 * - Results comes from GET /api/report response (merged by row id).
 */
export function normalizeReportResponse(base: NormalizedTable, payload: unknown): NormalizedReport {
  const extra = normalizeTable(payload);
  const merged = mergeTablesById(base, extra);
  return { base, results: merged };
}

