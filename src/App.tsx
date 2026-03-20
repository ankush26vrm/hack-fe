import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ReportProvider } from "./state/ReportContext";
import UploadPage from "./pages/UploadPage";
import ReportsPage from "./pages/ReportsPage";
import ResultsPage from "./pages/ResultsPage";
import AppLayout from "./components/layout/AppLayout";

export default function App() {
  return (
    <ReportProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<UploadPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ReportProvider>
  );
}

