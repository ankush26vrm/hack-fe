import React, { useMemo } from "react";
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

export default function ResultsPage() {
  const navigate = useNavigate();
  const { resultsTable, fieldMap, loading } = useReportContext();

  const resolved = useMemo(() => {
    if (!resultsTable) return null;
    return resolveFieldKeys(resultsTable.columns, fieldMap ?? DEFAULT_FIELD_MAP);
  }, [resultsTable, fieldMap]);

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
        <FraudBadge levelRaw={row[resolved.fraudLevelKey!]} reason={resolved.fraudReasonKey ? String(row[resolved.fraudReasonKey] ?? "") : undefined} />
      );
    }
    if (resolved.actionKey) {
      renderers[resolved.actionKey] = ({ row }: any) => (
        <HoverReason
          value={String(row[resolved.actionKey!] ?? "")}
          reason={
            resolved.actionReasonKey ? String(row[resolved.actionReasonKey] ?? "") : undefined
          }
        />
      );
    }
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

        <SmartTable
          table={{ ...resultsTable, columns }}
          renderers={renderers}
          emptyStateText="No results"
        />
      </div>
    </div>
  );
}

