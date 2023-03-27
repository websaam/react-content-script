import React from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import App from "./App";

const docuquest = Object.assign(document.createElement("div"), {
  id: "docuquest",
});
document.body.appendChild(docuquest);

const app = Object.assign(document.createElement("div"), {
  id: "root",
});

docuquest.appendChild(app);

const root = createRoot(app!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
