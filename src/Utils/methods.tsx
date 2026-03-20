import { ProbabilityFilter } from "./constants";

export function matchesProbabilityFilter(value: unknown, filter: ProbabilityFilter): boolean {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return false;
  if (filter === "gt50") return n > 0.5;
  if (filter === "lt30") return n < 0.3;
  if (filter === "30to50") return n >= 0.3 && n <= 0.5;
  return true;
}