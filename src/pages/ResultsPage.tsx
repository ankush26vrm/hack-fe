import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartTable from "../components/Table/SmartTable";
import FraudBadge from "../components/Table/FraudBadge";
import HoverReason from "../components/Table/HoverReason";
import Button from "../components/ui/Button";
import { useReportContext } from "../state/ReportContext";
import { resolveFieldKeys } from "../config/resolveFieldKeys";
import { DEFAULT_FIELD_MAP } from "../config/tableFieldMap";

function formatProbability(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") {
    const n = v;
    if (n >= 0 && n <= 1) return `${Math.round(n * 100)}%`;
    return `${n}`;
  }
  if (typeof v === "string") {
    const s = v.trim();
    const n = Number(s);
    if (!Number.isNaN(n)) {
      if (n >= 0 && n <= 1) return `${Math.round(n * 100)}%`;
      return `${n}`;
    }
    return s;
  }
  return String(v);
}

// ── Types ──────────────────────────────────────────────────────────────────

type ProbabilityFilter = "gt50" | "lt30" | "30to50";
type FilterField = "fraudLevel" | "action" | "returnProbability" | "successProbability";

interface Filters {
  fraudLevel: "any" | "high" | "mid" | "low";
  action: "any" | "escalate" | "proceed" | "request";
  returnProbability: "any" | ProbabilityFilter;
  successProbability: "any" | ProbabilityFilter;
}

interface ActiveFilter {
  field: FilterField;
  label: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: Filters = {
  fraudLevel: "any",
  action: "any",
  returnProbability: "any",
  successProbability: "any",
};

const ACTION_FILTER_MAP: Record<string, Filters["action"]> = {
  "Escalate to fraud team": "escalate",
  "Proceed with standard resolution": "proceed",
  "Request additional documents": "request",
};

const FIELD_OPTIONS: { value: FilterField; label: string }[] = [
  { value: "fraudLevel", label: "Fraud Level" },
  { value: "action", label: "Action To Be Taken" },
  { value: "returnProbability", label: "Return Probability" },
  { value: "successProbability", label: "Success Probability" },
];

const VALUE_OPTIONS: Record<FilterField, { value: string; label: string }[]> = {
  fraudLevel: [
    { value: "high", label: "High" },
    { value: "mid", label: "Mid" },
    { value: "low", label: "Low" },
  ],
  action: [
    { value: "escalate", label: "Escalate to fraud team" },
    { value: "proceed", label: "Proceed with standard resolution" },
    { value: "request", label: "Request additional documents" },
  ],
  returnProbability: [
    { value: "gt50", label: "> 50%" },
    { value: "lt30", label: "< 30%" },
    { value: "30to50", label: "30% – 50%" },
  ],
  successProbability: [
    { value: "gt50", label: "> 50%" },
    { value: "lt30", label: "< 30%" },
    { value: "30to50", label: "30% – 50%" },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────

function matchesProbabilityFilter(value: unknown, filter: ProbabilityFilter): boolean {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return false;
  if (filter === "gt50") return n > 0.5;
  if (filter === "lt30") return n < 0.3;
  if (filter === "30to50") return n >= 0.3 && n <= 0.5;
  return true;
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = {
  filterRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 8,
    padding: "10px 0",
  },
  select: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid var(--color-border, #d1d5db)",
    background: "var(--color-surface, #fff)",
    color: "var(--color-text, #111827)",
    fontSize: 14,
    cursor: "pointer",
    height: 34,
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 10px",
    borderRadius: 999,
    background: "var(--color-primary-subtle, #eff6ff)",
    border: "1px solid var(--color-primary-muted, #bfdbfe)",
    color: "var(--color-primary, #1d4ed8)",
    fontSize: 13,
    fontWeight: 500 as const,
  },
  pillX: {
    cursor: "pointer",
    fontWeight: 700 as const,
    lineHeight: 1,
    opacity: 0.6,
    fontSize: 15,
  },
  sep: {
    color: "var(--color-text-secondary, #9ca3af)",
    fontSize: 18,
    userSelect: "none" as const,
    margin: "0 2px",
  },
  divider: {
    borderTop: "1px solid var(--color-border, #e5e7eb)",
    margin: "4px 0 12px",
  },
};

export default function ResultsPage() {
  const navigate = useNavigate();
  const { resultsTable, fieldMap, loading } = useReportContext();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [pickerField, setPickerField] = useState<FilterField | "">("");

  const resolved = useMemo(() => {
    if (!resultsTable) return null;
    return resolveFieldKeys(resultsTable.columns, fieldMap ?? DEFAULT_FIELD_MAP);
  }, [resultsTable, fieldMap]);

  const filteredTable = useMemo(() => {
    if (!resultsTable) return null;
    const rows = resultsTable.rows.filter((row) => {
      if (filters.fraudLevel !== "any" && resolved?.fraudLevelKey) {
        if (String(row[resolved.fraudLevelKey] ?? "").toLowerCase() !== filters.fraudLevel) return false;
      }
      if (filters.action !== "any" && resolved?.actionKey) {
        const mapped = ACTION_FILTER_MAP[String(row[resolved.actionKey] ?? "")];
        if (mapped !== filters.action) return false;
      }
      if (filters.returnProbability !== "any" && resolved?.returnProbabilityKey) {
        if (!matchesProbabilityFilter(row[resolved.returnProbabilityKey], filters.returnProbability as ProbabilityFilter)) return false;
      }
      if (filters.successProbability !== "any" && resolved?.successProbabilityKey) {
        if (!matchesProbabilityFilter(row[resolved.successProbabilityKey], filters.successProbability as ProbabilityFilter)) return false;
      }
      return true;
    });
    return { ...resultsTable, rows };
  }, [resultsTable, resolved, filters]);

  if (!resultsTable) {
    return (
      <div className="container">
        <div className="panel">
          <div style={{ marginBottom: 12 }}>No results yet.</div>
          <Button onClick={() => navigate("/reports")}>Go to Reports</Button>
        </div>
      </div>
    );
  }

  const visibleColumns = resolved
    ? resultsTable.columns.filter(
        (c) => c.key !== resolved.fraudReasonKey && c.key !== resolved.actionReasonKey
      )
    : resultsTable.columns;

  const columns = visibleColumns.map((c) => {
    if (!resolved) return c;
    if (resolved.successProbabilityKey === c.key) return { ...c, header: "Success Probability" };
    if (resolved.returnProbabilityKey === c.key) return { ...c, header: "Return Probability" };
    if (resolved.fraudLevelKey === c.key) return { ...c, header: "Fraud Probability" };
    if (resolved.actionKey === c.key) return { ...c, header: "Action To Be Taken" };
    return c;
  });

  const renderers: any = {};
  if (resolved) {
    if (resolved.successProbabilityKey) {
      renderers[resolved.successProbabilityKey] = ({ row }: any) => (
        <span>{formatProbability(row[resolved.successProbabilityKey!])}</span>
      );
    }
    if (resolved.returnProbabilityKey) {
      renderers[resolved.returnProbabilityKey] = ({ row }: any) => (
        <span>{formatProbability(row[resolved.returnProbabilityKey!])}</span>
      );
    }
    if (resolved.fraudLevelKey) {
      renderers[resolved.fraudLevelKey] = ({ row }: any) => (
        <FraudBadge
          levelRaw={row[resolved.fraudLevelKey!]}
          reason={resolved.fraudReasonKey ? String(row[resolved.fraudReasonKey] ?? "") : undefined}
        />
      );
    }
    if (resolved.actionKey) {
      renderers[resolved.actionKey] = ({ row }: any) => (
        <HoverReason
          value={String(row[resolved.actionKey!] ?? "")}
          reason={resolved.actionReasonKey ? String(row[resolved.actionReasonKey] ?? "") : undefined}
        />
      );
    }
  }

  const activeFilters: ActiveFilter[] = (Object.keys(filters) as FilterField[])
    .filter((k) => filters[k] !== "any")
    .map((k) => {
      const fieldLabel = FIELD_OPTIONS.find((f) => f.value === k)?.label ?? k;
      const valueLabel = VALUE_OPTIONS[k].find((v) => v.value === filters[k])?.label ?? String(filters[k]);
      return { field: k, label: `${fieldLabel}: ${valueLabel}` };
    });

  const availableFields = FIELD_OPTIONS.filter((f) => filters[f.value] === "any");

  function applyFilter(field: FilterField, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value as any }));
    setPickerField(""); 
  }

  function removeFilter(field: FilterField) {
    setFilters((prev) => ({ ...prev, [field]: "any" as any }));
    if (pickerField === field) setPickerField("");
  }

  return (
    <div className="container">
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>Results</div>
            <div className="hint" style={{ marginTop: 6 }}>
              The table includes success/return probability plus fraud/action metadata (with hover reasons).
            </div>
          </div>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <Button disabled={loading} variant="ghost" onClick={() => navigate("/reports")}>
              Back
            </Button>
          </div>
        </div>

        <div className="spacer" />

        <div style={styles.filterRow}>

          {availableFields.length > 0 && (
            <select
              style={styles.select}
              value={pickerField}
              onChange={(e) => setPickerField(e.target.value as FilterField | "")}
            >
              <option value="">+ Add filter…</option>
              {availableFields.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          )}

          {pickerField !== "" && (
            <>
              <span style={styles.sep}>›</span>
              <select
                style={styles.select}
                value=""
                onChange={(e) => { if (e.target.value) applyFilter(pickerField as FilterField, e.target.value); }}
              >
                <option value="">Select value…</option>
                {VALUE_OPTIONS[pickerField as FilterField].map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </>
          )}

          {activeFilters.map((af) => (
            <span key={af.field} style={styles.pill}>
              {af.label}
              <span
                style={styles.pillX}
                role="button"
                aria-label={`Remove filter ${af.label}`}
                onClick={() => removeFilter(af.field)}
              >
                ×
              </span>
            </span>
          ))}
          {activeFilters.length > 1 && (
            <Button
              variant="ghost"
              onClick={() => { setFilters(DEFAULT_FILTERS); setPickerField(""); }}
            >
              Clear all
            </Button>
          )}
        </div>

        <div style={styles.divider} />

        <SmartTable
          table={{ ...(filteredTable ?? resultsTable), columns }}
          renderers={renderers}
          emptyStateText="No results match the selected filters."
        />
      </div>
    </div>
  );
}