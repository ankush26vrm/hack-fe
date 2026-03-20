import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout() {
  return (
    <div className="appLayout">
      <Sidebar />
      <div className="appMain">
        <TopBar />
        <main className="appContent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

