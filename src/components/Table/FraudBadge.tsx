import React from "react";
import type { FraudLevel } from "../../api/types";

function parseLevel(levelRaw: unknown): FraudLevel {
  if (levelRaw === undefined || levelRaw === null) return "mid";

  if (typeof levelRaw === "number") {
    if (levelRaw >= 0.67) return "high";
    if (levelRaw >= 0.34) return "mid";
    return "low";
  }

  if (typeof levelRaw === "string") {
    const v = levelRaw.trim().toLowerCase();
    if (v === "high") return "high";
    if (v === "mid" || v === "medium") return "mid";
    if (v === "low") return "low";

    const asNum = Number(v);
    if (!Number.isNaN(asNum)) {
      if (asNum >= 0.67) return "high";
      if (asNum >= 0.34) return "mid";
      return "low";
    }
  }

  return "mid";
}

export default function FraudBadge({
  levelRaw,
  reason
}: {
  levelRaw: unknown;
  reason?: string;
}) {
  const level = parseLevel(levelRaw);
  const label = level === "high" ? "High" : level === "mid" ? "Mid" : "Low";
  const className =
    level === "high" ? "badge--high" : level === "mid" ? "badge--mid" : "badge--low";

  if (reason) {
    return (
      <span className="tooltipWrap">
        <span className={`badge ${className}`}>{label}</span>
        <span className="tooltipBubble">{reason}</span>
      </span>
    );
  }

  return <span className={`badge ${className}`}>{label}</span>;
}

