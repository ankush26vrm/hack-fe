export type TableRow = Record<string, unknown>;

export type TableColumn = {
  key: string;
  header: string;
};

export type NormalizedTable = {
  /**
   * The keys used to read each row value.
   * The UI uses this to generate columns dynamically.
   */
  columns: TableColumn[];
  /**
   * Raw rows. Each row should contain the `id` key (as configured/inferred).
   */
  rows: TableRow[];
  /**
   * Name of the row id field within each row object.
   * Used for selection and merging data across calls.
   */
  rowIdField: string;
};

export type FraudLevel = "high" | "mid" | "low";

export type FraudMeta = {
  level: FraudLevel;
  reason?: string;
};

export type ActionMeta = {
  value?: string;
  reason?: string;
};

export type FieldMap = {
  id?: string;
  successProbability?: string;
  returnProbability?: string;
  fraudLevel?: string;
  fraudReason?: string;
  action?: string;
  actionReason?: string;
};

export type NormalizedReport = {
  base: NormalizedTable;
  /**
   * Final merged table (base + extra computed attributes).
   */
  results: NormalizedTable;
};

