import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";

type NavItem = {
  to: string;
  label: string;
};

export default function Sidebar() {
  const items: NavItem[] = useMemo(
    () => [
      { to: "/", label: "Upload" },
      { to: "/reports", label: "Complaints Report" },
      { to: "/results", label: "Final Output" }
    ],
    []
  );

  return (
    <aside className="sidebar">
      <div className="sidebarSection">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => (isActive ? "sidebarLink sidebarLink--active" : "sidebarLink")}
          >
            {it.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

