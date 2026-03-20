import type { FieldMap } from "../api/types";

/**
 * Adjust these keys to match your backend payload.
 * The UI is written to be resilient: if keys differ, you only update this map.
 */
export const DEFAULT_FIELD_MAP: FieldMap = {
  // Row id field is inferred on normalization, but you can override if backend is special.
  id: "id",

  // Final computed columns (page 3)
  successProbability: "successProbability",
  returnProbability: "returnProbability",

  // Fraud risk banner level and reason
  fraudLevel: "fraudLevel", // expected "high" | "mid" | "low" (case-insensitive) or number-like
  fraudReason: "fraudReason",

  // Action column and hover reason
  action: "actionToBeTaken",
  actionReason: "actionReason"
};

