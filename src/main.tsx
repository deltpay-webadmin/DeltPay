import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);

/* ── Dismiss the initial loader (defined in index.html) ───────────
   We wait one paint after mount so the first screen is ready behind
   the overlay, then fade it out and remove it from the DOM. */
function dismissAppLoader() {
  const loader = document.getElementById("app-loader");
  if (!loader) return;
  loader.classList.add("app-loader--hidden");
  // Remove after the CSS fade so it doesn't linger / trap focus.
  window.setTimeout(() => loader.remove(), 600);
}

requestAnimationFrame(() => requestAnimationFrame(dismissAppLoader));
