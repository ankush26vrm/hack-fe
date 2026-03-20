import { API } from "./endpoints";

type Json = unknown;

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: init.headers
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function putUpload(file: File): Promise<Json> {
  const form = new FormData();
  form.append("file", file);
  return requestJson<Json>(API.upload, {
    method: "PUT",
    body: form
  });
}

export type ReportScope = "all" | "selected";

export type ReportRequest = {
  scope: ReportScope;
  selectedIds?: string[];
  /**
   * Prob filters are passed as-is to backend. If your backend uses different keys,
   * adapt this object in the UI or normalization layer.
   */
  successProbability?: string;
  returnProbability?: string;
};

export async function getReport(req: ReportRequest): Promise<Json> {
  const params = new URLSearchParams();
  params.set("scope", req.scope);
  if (req.selectedIds && req.selectedIds.length) {
    params.set("ids", req.selectedIds.join(","));
  }
  if (req.successProbability) params.set("successProbability", req.successProbability);
  if (req.returnProbability) params.set("returnProbability", req.returnProbability);

  return requestJson<Json>(`${API.report}?${params.toString()}`, {
    method: "GET"
  });
}

