import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);

/* ── Dismiss the initial loader (defined in index.html) ───────────
   We keep it on screen for at least MIN_VISIBLE_MS so it doesn't just
   flash by on fast loads, then fade it out and remove it. */
const MIN_VISIBLE_MS = 1100;
const startedAt = (window as any).__appLoaderStart ?? performance.now();

function dismissAppLoader() {
  const loader = document.getElementById("app-loader");
  if (!loader) return;
  loader.classList.add("app-loader--hidden");
  // Remove after the CSS fade so it doesn't linger / trap focus.
  window.setTimeout(() => loader.remove(), 600);
}

function scheduleDismiss() {
  const elapsed = performance.now() - startedAt;
  const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
  window.setTimeout(dismissAppLoader, wait);
}

// Wait one paint after mount so the first screen is ready behind the
// overlay, then honor the minimum visible time before dismissing.
requestAnimationFrame(() => requestAnimationFrame(scheduleDismiss));
