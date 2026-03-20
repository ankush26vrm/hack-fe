import React from "react";
import { useNavigate } from "react-router-dom";
import SmartTable from "../components/Table/SmartTable";
import Button from "../components/ui/Button";
import { useReportContext } from "../state/ReportContext";

const LEVELS: Array<{ id: "any" | "high" | "mid" | "low"; label: string }> = [
  { id: "any", label: "Any" },
  { id: "high", label: "High" },
  { id: "mid", label: "Mid" },
  { id: "low", label: "Low" }
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const {
    uploadTable,
    selectedIds,
    toggleSelectedId,
    successProbability,
    returnProbability,
    setSuccessProbability,
    setReturnProbability,
    fetchReport,
    loading,
    error,
    clearSelection
  } = useReportContext();

  if (!uploadTable) {
    return (
      <div className="container">
        <div className="panel">Upload a file first.</div>
      </div>
    );
  }

  async function run(scope: "all" | "selected") {
    await fetchReport(scope);
    navigate("/results");
  }

  return (
    <div className="container">
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>Build Report</div>
            <div className="hint" style={{ marginTop: 6 }}>
              Select rows you want included, then choose probability filters and fetch the report.
            </div>
          </div>

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <Button disabled={loading} onClick={() => run("all")}>
              Get All Complaints Report
            </Button>
            <Button
              disabled={loading || selectedIds.size === 0}
              variant="ghost"
              onClick={() => run("selected")}
              title={selectedIds.size === 0 ? "Select at least one complaint row" : undefined}
            >
              Get Report For Selected ({selectedIds.size})
            </Button>
            <Button disabled={loading || selectedIds.size === 0} variant="ghost" onClick={clearSelection}>
              Clear Selection
            </Button>
          </div>
        </div>

        {error ? <div style={{ marginTop: 14, color: "#ffb3b3", fontWeight: 700 }}>{error}</div> : null}

        <div className="spacer" />

        <SmartTable
          table={uploadTable}
          selectable
          selectedIds={selectedIds}
          onToggleSelected={toggleSelectedId}
          emptyStateText="No uploaded rows found"
        />
      </div>
    </div>
  );
}

