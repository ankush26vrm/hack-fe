import type { NormalizedTable, TableColumn, TableRow } from "./types";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function extractRowsAndColumns(payload: unknown): {
  columns?: TableColumn[];
  rows?: TableRow[];
} {
  if (Array.isArray(payload)) {
    return { rows: payload as TableRow[] };
  }

  if (isPlainObject(payload)) {
    const p = payload as Record<string, unknown>;

    // Common shape: { columns: [{key, header}], rows: [{...}] }
    if (Array.isArray(p.columns) && Array.isArray(p.rows)) {
      const columns = (p.columns as unknown[]).map((c): TableColumn | null => {
        if (!isPlainObject(c)) return null;
        const key = c.key ?? c.id ?? c.field;
        const header = c.header ?? c.label ?? key;
        if (typeof key !== "string") return null;
        return { key, header: String(header ?? key) };
      }).filter(Boolean) as TableColumn[];
      return { columns, rows: p.rows as TableRow[] };
    }

    // Common shape: { data: [...] } or { data: { columns, rows } }
    if (p.data !== undefined) {
      return extractRowsAndColumns(p.data);
    }

    // Sometimes backend returns { rows: [...] } only
    if (Array.isArray(p.rows)) {
      return { rows: p.rows as TableRow[] };
    }
    if (Array.isArray(p.tableRows)) {
      return { rows: p.tableRows as TableRow[] };
    }
  }

  return {};
}

function inferRowIdField(rows: TableRow[]): string {
  const candidateFields = [
    "id",
    "complaintId",
    "complaint_id",
    "caseId",
    "case_id",
    "uuid"
  ];

  for (const field of candidateFields) {
    const hasAll = rows.every((r) => r[field] !== undefined && r[field] !== null);
    if (hasAll) return field;
  }

  // Fallback: use first stringish key from first row
  const first = rows[0];
  const keys = first ? Object.keys(first) : [];
  return keys[0] ?? "id";
}

function inferColumnsFromRows(rows: TableRow[]): TableColumn[] {
  const keySet = new Set<string>();
  for (const row of rows) {
    Object.keys(row).forEach((k) => keySet.add(k));
  }
  const keys = Array.from(keySet);

  return keys.map((key) => ({
    key,
    header: key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase())
  }));
}

export function normalizeTable(payload: unknown): NormalizedTable {
  const extracted = extractRowsAndColumns(payload);
  const rows = extracted.rows ?? [];
  const columns = extracted.columns ?? inferColumnsFromRows(rows);

  const rowIdField = inferRowIdField(rows);

  // Ensure each row has a stable id string if possible
  const safeRows = rows.map((r, idx) => {
    const idVal = r[rowIdField];
    if (idVal === undefined || idVal === null) {
      return { ...r, [rowIdField]: String(idx) };
    }
    return { ...r, [rowIdField]: String(idVal) };
  });

  return { columns, rows: safeRows, rowIdField };
}

