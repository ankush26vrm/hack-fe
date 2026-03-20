// Update these to match your backend.
export const API = {
  /**
   * PUT multipart/form-data:
   * - file: csv/xls/xlsx
   */
  upload: "/api/upload",
  /**
   * GET final report table.
   * Query params are optional and will be ignored by the backend if unsupported.
   */
  report: "/api/report"
};

