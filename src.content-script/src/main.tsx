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

// app.id = "root";

// // Make sure the element that you want to mount the app to has loaded. You can
// // also use `append` or insert the app using another method:
// // https://developer.mozilla.org/en-US/docs/Web/API/Element#methods
// //
// // Also control when the content script is injected from the manifest.json:
// // https://developer.chrome.com/docs/extensions/mv3/content_scripts/#run_time
// if (body) {
//   body.prepend(app);
// }

// const container = document.getElementById("root");
const root = createRoot(app!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
