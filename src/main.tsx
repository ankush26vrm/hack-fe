import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";
import faviconUrl from "../assets/favicon.ico?url";

function ensureFavicon() {
  const existing = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (existing) {
    existing.href = faviconUrl;
    return;
  }
  const link = document.createElement("link");
  link.rel = "icon";
  link.href = faviconUrl;
  document.head.appendChild(link);
}

ensureFavicon();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

