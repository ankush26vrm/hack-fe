export const paginationStyles = {
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    gap: 12,
    paddingTop: 14,
    fontSize: 13,
    color: "var(--color-text-secondary, #6b7280)",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  select: {
    padding: "3px 6px",
    borderRadius: 5,
    border: "1px solid var(--color-border, #d1d5db)",
    background: "var(--color-surface, #fff)",
    color: "var(--color-text, #111827)",
    fontSize: 13,
    cursor: "pointer",
  },
  btn: (disabled: boolean, active = false) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 30,
    height: 28,
    padding: "0 8px",
    borderRadius: 5,
    border: `1px solid ${active ? "var(--color-primary, #6d5efc)" : "var(--color-border, #d1d5db)"}`,
    background: active
      ? "var(--color-primary, #a49af8ff)"
      : "var(--color-surface, #fff)",
    color: active
      ? "#fff"
      : disabled
      ? "var(--color-text-disabled, #9ca3af)"
      : "var(--color-text, #111827)",
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    userSelect: "none" as const,
  }),
};