import React from "react";
import Brand from "./Brand";

export default function TopBar() {
  return (
    <header className="topbar">
      <Brand />
      <div className="topbarRight">
        <div className="topbarPill">Fraud Monitor</div>
      </div>
    </header>
  );
}

