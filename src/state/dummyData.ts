import type { FraudLevel, NormalizedTable, TableColumn, TableRow } from "../api/types";

export type ProbabilityLevel = "any" | FraudLevel;

const UPLOAD_COLUMNS: TableColumn[] = [
  { key: "crmId", header: "CRM ID" },
  { key: "transactionId", header: "unique transaction ID" },
  { key: "complaintAmount", header: "complaint amount" },
  { key: "reasonCode", header: "reason for complaint (fixed codes)" },
  { key: "remitterAccountNumber", header: "remitter account number" },
  { key: "transactionDate", header: "transaction date" }
];

const DUMMY_UPLOAD_ROWS: TableRow[] = [
  {
    crmId: "CRM-1001",
    transactionId: "TX-0001",
    complaintAmount: 1200.5,
    reasonCode: "RC01",
    remitterAccountNumber: "111122223333",
    transactionDate: "2026-03-01"
  },
  {
    crmId: "CRM-1002",
    transactionId: "TX-0002",
    complaintAmount: 250.0,
    reasonCode: "RC07",
    remitterAccountNumber: "444455556666",
    transactionDate: "2026-03-03"
  },
  {
    crmId: "CRM-1003",
    transactionId: "TX-0003",
    complaintAmount: 9900,
    reasonCode: "RC02",
    remitterAccountNumber: "777788889999",
    transactionDate: "2026-03-05"
  },
  {
    crmId: "CRM-1004",
    transactionId: "TX-0004",
    complaintAmount: 640.75,
    reasonCode: "RC11",
    remitterAccountNumber: "121212121212",
    transactionDate: "2026-03-08"
  },
  {
    crmId: "CRM-1005",
    transactionId: "TX-0005",
    complaintAmount: 80,
    reasonCode: "RC03",
    remitterAccountNumber: "343434343434",
    transactionDate: "2026-03-10"
  }
];

export function getDummyUploadTable(): NormalizedTable {
  return {
    columns: UPLOAD_COLUMNS,
    rows: DUMMY_UPLOAD_ROWS,
    rowIdField: "crmId"
  };
}

function levelFromProbability(p: number): FraudLevel {
  // Keep consistent with FraudBadge thresholds.
  if (p >= 0.67) return "high";
  if (p >= 0.34) return "mid";
  return "low";
}

function pickFraudReason(level: FraudLevel, reasonCode: string): string {
  const codePart = reasonCode ? ` (${reasonCode})` : "";
  if (level === "high") return `Inconsistent complaint signal and high risk patterns${codePart}.`;
  if (level === "mid") return `Moderate risk based on historical mismatches${codePart}.`;
  return `Low fraud likelihood; details look consistent${codePart}.`;
}

function pickAction(level: FraudLevel): { actionToBeTaken: string; actionReason: string } {
  if (level === "high") {
    return {
      actionToBeTaken: "Escalate to fraud team",
      actionReason: "High fraud probability. Recommend manual verification and evidence review."
    };
  }
  if (level === "mid") {
    return {
      actionToBeTaken: "Request additional documents",
      actionReason: "Mid fraud probability. Ask for supporting evidence before resolution."
    };
  }
  return {
    actionToBeTaken: "Proceed with standard resolution",
    actionReason: "Low fraud probability. Continue with normal processing."
  };
}

export function buildDummyResultsTable(params: {
  uploadTable: NormalizedTable;
  scope: "all" | "selected";
  selectedIds: Set<string>;
  successProbability: ProbabilityLevel;
  returnProbability: ProbabilityLevel;
}): NormalizedTable {
  const { uploadTable, scope, selectedIds, successProbability, returnProbability } = params;

  const baseRows = uploadTable.rows.filter((r) => {
    if (scope === "all") return true;
    const rowId = String(r[uploadTable.rowIdField] ?? "");
    return selectedIds.has(rowId);
  });

  // Computed columns for page 3.
  const extraColumns: TableColumn[] = [
    { key: "successProbability", header: "successProbability" },
    { key: "returnProbability", header: "returnProbability" },
    { key: "fraudLevel", header: "fraudLevel" },
    { key: "fraudReason", header: "fraudReason" },
    { key: "actionToBeTaken", header: "actionToBeTaken" },
    { key: "actionReason", header: "actionReason" }
  ];

  const columns = [...uploadTable.columns, ...extraColumns];

  const rows: TableRow[] = [];

  for (const r of baseRows) {
    // Deterministic dummy probabilities based on complaint amount + reason code length.
    const amount = typeof r.complaintAmount === "number" ? r.complaintAmount : Number(r.complaintAmount);
    const reasonCode = String(r.reasonCode ?? "");
    const hash = (amount * 997 + reasonCode.length * 31) % 1000;

    // Create values in [0,1)
    const successP = ((hash % 100) + 10) / 110; // ~0.09..0.99
    const returnP = (((hash + 47) % 100) + 5) / 105; // ~0.05..0.95

    const successLevel = levelFromProbability(successP);
    const returnLevel = levelFromProbability(returnP);

    if (successProbability !== "any" && successProbability !== successLevel) continue;
    if (returnProbability !== "any" && returnProbability !== returnLevel) continue;

    const fraudLevel: FraudLevel = (() => {
      // Simple relationship: higher return probability => higher fraud risk.
      const v = returnP;
      return levelFromProbability(v);
    })();

    const fraudReason = pickFraudReason(fraudLevel, reasonCode);
    const { actionToBeTaken, actionReason } = pickAction(fraudLevel);

    rows.push({
      ...r,
      successProbability: successP,
      returnProbability: returnP,
      fraudLevel,
      fraudReason,
      actionToBeTaken,
      actionReason
    });
  }

  return {
    columns,
    rows,
    rowIdField: uploadTable.rowIdField
  };
}

