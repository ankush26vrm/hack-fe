import React, { createContext, useContext, useMemo, useState } from "react";
import type { NormalizedTable, FieldMap, FraudLevel } from "../api/types";
import { normalizeTable } from "../api/normalizeTable";
import { getReport, putUpload, type ReportRequest } from "../api/client";
import { normalizeReportResponse } from "../api/normalizeReport";
import { DEFAULT_FIELD_MAP } from "../config/tableFieldMap";
import { buildDummyResultsTable, getDummyUploadTable, type ProbabilityLevel } from "./dummyData";

type SuccessReturnLevel = "any" | FraudLevel;

type ReportContextValue = {
  uploadTable?: NormalizedTable;
  resultsTable?: NormalizedTable;
  fieldMap: FieldMap;

  selectedIds: Set<string>;
  toggleSelectedId: (id: string) => void;
  clearSelection: () => void;

  successProbability: SuccessReturnLevel;
  returnProbability: SuccessReturnLevel;
  setSuccessProbability: (v: SuccessReturnLevel) => void;
  setReturnProbability: (v: SuccessReturnLevel) => void;

  uploadFile: (file: File) => Promise<void>;
  fetchReport: (scope: "all" | "selected") => Promise<void>;

  loading: boolean;
  error?: string;
};

const Ctx = createContext<ReportContextValue | null>(null);

function toBackendLevel(level: SuccessReturnLevel): string | undefined {
  if (level === "any") return undefined;
  return level;
}

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const useDummyData = (import.meta.env.VITE_USE_DUMMY_DATA ?? "true") !== "false";

  const [uploadTable, setUploadTable] = useState<NormalizedTable | undefined>(
    useDummyData ? getDummyUploadTable() : undefined
  );
  const [resultsTable, setResultsTable] = useState<NormalizedTable | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [successProbability, setSuccessProbability] = useState<SuccessReturnLevel>("any");
  const [returnProbability, setReturnProbability] = useState<SuccessReturnLevel>("any");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const fieldMap = useMemo(() => DEFAULT_FIELD_MAP, []);

  function toggleSelectedId(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function uploadFile(file: File) {
    setError(undefined);
    setLoading(true);
    try {
      if (useDummyData) {
        setUploadTable(getDummyUploadTable());
        setResultsTable(undefined);
        setSelectedIds(new Set());
        return;
      }

      const payload = await putUpload(file);
      const normalized = normalizeTable(payload);
      setUploadTable(normalized);
      setResultsTable(undefined);
      setSelectedIds(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function fetchReport(scope: "all" | "selected") {
    if (!uploadTable) throw new Error("Upload data missing. Please upload a file first.");

    setError(undefined);
    setLoading(true);
    try {
      if (useDummyData) {
        const dummy = buildDummyResultsTable({
          uploadTable,
          scope,
          selectedIds,
          successProbability: successProbability as ProbabilityLevel,
          returnProbability: returnProbability as ProbabilityLevel
        });
        setResultsTable(dummy);
        return;
      }

      const selected = scope === "selected" ? Array.from(selectedIds) : undefined;
      const req: ReportRequest = {
        scope: scope,
        selectedIds: selected && selected.length ? selected : undefined,
        successProbability: toBackendLevel(successProbability),
        returnProbability: toBackendLevel(returnProbability)
      };

      const payload = await getReport(req);
      const normalized = normalizeReportResponse(uploadTable, payload);
      setResultsTable(normalized.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  }

  const value: ReportContextValue = {
    uploadTable,
    resultsTable,
    fieldMap,
    selectedIds,
    toggleSelectedId,
    clearSelection,
    successProbability,
    returnProbability,
    setSuccessProbability,
    setReturnProbability,
    uploadFile,
    fetchReport,
    loading,
    error
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useReportContext() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useReportContext must be used within ReportProvider");
  return v;
}

