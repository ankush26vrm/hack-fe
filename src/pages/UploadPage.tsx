import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartTable from "../components/Table/SmartTable";
import Button from "../components/ui/Button";
import { useReportContext } from "../state/ReportContext";

export default function UploadPage() {
  const navigate = useNavigate();
  const { uploadTable, uploadFile, loading, error } = useReportContext();
  const [file, setFile] = useState<File | null>(null);

  const productName = useMemo(() => import.meta.env.VITE_PRODUCT_NAME ?? "Product", []);

  return (
    <div className="container">
      <div className="panel">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{productName}</div>
            <div className="hint" style={{ marginTop: 6 }}>
              Upload an `xls/csv` file. The backend will parse, calculate, store, and return the parsed input
              for review.
            </div>
          </div>
        </div>

        <div className="spacer" />

        <div className="row">
          <input
            className="input"
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button
            disabled={!file || loading}
            onClick={async () => {
              if (!file) return;
              await uploadFile(file);
            }}
          >
            {loading ? "Uploading..." : "Upload File"}
          </Button>
          <Button
            disabled={!uploadTable || loading}
            variant="ghost"
            onClick={() => navigate("/reports")}
          >
            Next
          </Button>
        </div>

        {error ? (
          <div style={{ marginTop: 14, color: "#ffb3b3", fontWeight: 700 }}>{error}</div>
        ) : null}

        {uploadTable ? (
          <>
            <div className="spacer" />
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Uploaded Data (JSON)</div>
            <SmartTable table={uploadTable} />
          </>
        ) : null}
      </div>
    </div>
  );
}

