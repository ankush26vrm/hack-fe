import React from "react";
import logoUrl from "../../../assets/osfin_logo.png?url";

export default function Brand() {
  return (
    <div className="brand">
      <img className="brandLogo" src={logoUrl} alt="OSFIN" />
      <div className="brandText">
        OSFIN
        <span className="brandSub">Disputes</span>
      </div>
    </div>
  );
}

