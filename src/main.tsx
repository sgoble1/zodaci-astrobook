import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Recover from stale module chunks (after redeploys or dep re-optimization) with one reload.
const RELOAD_KEY = "zodaci-chunk-reload";
const isChunkError = (msg: unknown) =>
  /Importing a module script failed|Failed to fetch dynamically imported module|error loading dynamically imported module/i.test(String(msg ?? ""));
const reloadOnce = () => {
  const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
  if (Date.now() - last < 10_000) return;
  sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  window.location.reload();
};
window.addEventListener("vite:preloadError", (e) => { e.preventDefault(); reloadOnce(); });
window.addEventListener("unhandledrejection", (e) => {
  if (isChunkError((e.reason as Error)?.message ?? e.reason)) reloadOnce();
});
window.addEventListener("error", (e) => { if (isChunkError(e.message)) reloadOnce(); });

// Set defaults in the head for SEO — real title & description.
document.title = "Zodaci · Your Chart, Readings & Printed AstroBook";
const desc = document.querySelector('meta[name="description"]');
if (desc) desc.setAttribute("content",
  "Explore your own calculated birth chart, personal readings and private library, and create a printed AstroBook with Zodaci."
);

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
