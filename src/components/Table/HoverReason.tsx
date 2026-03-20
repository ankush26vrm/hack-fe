import React from "react";

export default function HoverReason({ value, reason }: { value?: string; reason?: string }) {
  const text = value ?? "";
  if (!reason) return <span>{text}</span>;
  return (
    <span className="tooltipWrap">
      <span>{text}</span>
      <span className="tooltipBubble">{reason}</span>
    </span>
  );
}

