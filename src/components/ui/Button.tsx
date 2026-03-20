import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export default function Button({ variant = "primary", className, ...rest }: Props) {
  const mergedClassName = (`btn ${variant === "ghost" ? "btn--ghost" : ""} ${className ?? ""}`).trim();

  return <button className={mergedClassName} {...rest} />;
}

