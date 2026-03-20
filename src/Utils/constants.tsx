export type ProbabilityFilter = "gt50" | "lt30" | "30to50";
export type FilterField = "fraudLevel" | "action" | "returnProbability" | "successProbability";

export interface Filters {
  fraudLevel: "any" | "high" | "mid" | "low";
  action: "any" | "escalate" | "proceed" | "request";
  returnProbability: "any" | ProbabilityFilter;
  successProbability: "any" | ProbabilityFilter;
}

export interface ActiveFilter {
  field: FilterField;
  label: string;
}

export const DEFAULT_FILTERS: Filters = {
  fraudLevel: "any",
  action: "any",
  returnProbability: "any",
  successProbability: "any",
};

export const ACTION_FILTER_MAP: Record<string, Filters["action"]> = {
  "Escalate to fraud team": "escalate",
  "Proceed with standard resolution": "proceed",
  "Request additional documents": "request",
};

export const FIELD_OPTIONS: { value: FilterField; label: string }[] = [
  { value: "fraudLevel", label: "Fraud Level" },
  { value: "action", label: "Action To Be Taken" },
  { value: "returnProbability", label: "Return Probability" },
  { value: "successProbability", label: "Success Probability" },
];

export const VALUE_OPTIONS: Record<FilterField, { value: string; label: string }[]> = {
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

export const styles = {
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