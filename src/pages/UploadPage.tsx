import React, { useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SmartTable from "../components/Table/SmartTable";
import Button from "../components/ui/Button";
import { useReportContext } from "../state/ReportContext";

export default function UploadPage() {
  const navigate = useNavigate();
  const { uploadTable, uploadFile, loading, error } = useReportContext();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const productName = useMemo(() => import.meta.env.VITE_PRODUCT_NAME ?? "Product", []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  return (
    <div className="container">
      <div className="panel">
        {/* Header */}
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{productName}</div>
            <div className="hint" style={{ marginTop: 6 }}>
              Upload an <code>xls/csv</code> file. The backend will parse, calculate, store, and return the
              parsed input for review.
            </div>
          </div>
        </div>

        <div className="spacer" />

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: `2px dashed ${dragging ? "#5749e8" : "#93c5fd"}`,
            borderRadius: 20,
            backgroundColor: dragging ? "#eff6ff" : "#f8faff",
            padding: "56px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
            transition: "border-color 0.2s, background-color 0.2s",
            minWidth: 340,
          }}
          onClick={() => inputRef.current?.click()}
        >
          {/* Upload Icon */}
          <svg
            width="52"
            height="52"
            viewBox="0 0 52 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M26 6L26 34M26 6L18 14M26 6L34 14"
              stroke="#5749e8"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 38C10 38 10 44 26 44C42 44 42 38 42 38"
              stroke="#5749e8"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>

          {/* Text */}
          <div style={{ fontWeight: 700, fontSize: 17, color: "#1e293b", textAlign: "center" }}>
            {file ? file.name : "Drag and Drop files to upload"}
          </div>
          <div style={{ color: "#94a3b8", fontSize: 14 }}>or</div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            style={{
              backgroundColor: "#5749e8",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "12px 40px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: 0.2,
            }}
          >
            Browse
          </button>

          <div style={{ color: "#94a3b8", fontSize: 13 }}>
            Supported files: CSV, XLS, XLSX
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="spacer" />

        <div className="row">
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

        {uploadTable ? <div className="spacer" /> : null}
      </div>
    </div>
  );
}