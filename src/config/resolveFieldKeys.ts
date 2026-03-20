import type { FieldMap } from "../api/types";
import type { TableColumn } from "../api/types";

function findByIncludes(columns: TableColumn[], ...needles: string[]): string | undefined {
  const lower = columns.map((c) => ({ c, l: c.key.toLowerCase() }));
  const n = needles.map((x) => x.toLowerCase());
  for (const item of lower) {
    const ok = n.every((needle) => item.l.includes(needle));
    if (ok) return item.c.key;
  }
  return undefined;
}

export type ResolvedFieldKeys = {
  id?: string;
  successProbabilityKey?: string;
  returnProbabilityKey?: string;
  fraudLevelKey?: string;
  fraudReasonKey?: string;
  actionKey?: string;
  actionReasonKey?: string;
};

export function resolveFieldKeys(columns: TableColumn[], fieldMap: FieldMap): ResolvedFieldKeys {
  const hasKey = (k?: string) => (k ? columns.some((c) => c.key === k) : false);

  const successProbabilityKey =
    (fieldMap.successProbability && hasKey(fieldMap.successProbability) ? fieldMap.successProbability : undefined) ??
    findByIncludes(columns, "success", "prob");

  const returnProbabilityKey =
    (fieldMap.returnProbability && hasKey(fieldMap.returnProbability) ? fieldMap.returnProbability : undefined) ??
    findByIncludes(columns, "return", "prob") ??
    findByIncludes(columns, "refund", "prob");

  const fraudLevelKey =
    (fieldMap.fraudLevel && hasKey(fieldMap.fraudLevel) ? fieldMap.fraudLevel : undefined) ??
    findByIncludes(columns, "fraud", "level") ??
    findByIncludes(columns, "fraud", "risk") ??
    findByIncludes(columns, "risk", "level");

  const fraudReasonKey =
    (fieldMap.fraudReason && hasKey(fieldMap.fraudReason) ? fieldMap.fraudReason : undefined) ??
    findByIncludes(columns, "fraud", "reason") ??
    findByIncludes(columns, "fraud", "why") ??
    findByIncludes(columns, "risk", "reason");

  const actionKey =
    (fieldMap.action && hasKey(fieldMap.action) ? fieldMap.action : undefined) ??
    findByIncludes(columns, "action") ??
    findByIncludes(columns, "decision");

  const actionReasonKey =
    (fieldMap.actionReason && hasKey(fieldMap.actionReason) ? fieldMap.actionReason : undefined) ??
    findByIncludes(columns, "action", "reason") ??
    findByIncludes(columns, "decision", "reason") ??
    findByIncludes(columns, "reason");

  return {
    id: fieldMap.id && hasKey(fieldMap.id) ? fieldMap.id : undefined,
    successProbabilityKey,
    returnProbabilityKey,
    fraudLevelKey,
    fraudReasonKey,
    actionKey,
    actionReasonKey
  };
}

