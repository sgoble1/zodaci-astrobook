import { createRoot } from "react-dom/client";
import { lazy, Suspense } from 'react';
import { PageErrorBoundary } from '@/components/common/PageErrorBoundary';
import { ConfirmHost } from '@/components/common/ConfirmHost';
import { recoverChunkLoad } from '@/lib/chunkRecovery';
import "./index.css";

// Recover from stale module chunks (after redeploys or dep re-optimization) with one reload.
window.addEventListener("vite:preloadError", (e) => {
  if (recoverChunkLoad((e as Event & { payload?: unknown }).payload)) e.preventDefault();
});
window.addEventListener("unhandledrejection", (e) => { recoverChunkLoad(e.reason); });
window.addEventListener("error", (e) => { recoverChunkLoad(e.error ?? e.message); });
const App = lazy(() => import('./App.tsx'));

// Set defaults in the head for SEO — real title & description.
document.title = "Zodaci · Your Chart, Readings & Printed AstroBook";
const desc = document.querySelector('meta[name="description"]');
if (desc) desc.setAttribute("content",
  "Explore your own calculated birth chart, personal readings and private library, and create a printed AstroBook with Zodaci."
);

const root = document.getElementById('root');
if (root) createRoot(root).render(
  <PageErrorBoundary>
    <Suspense fallback={<div role="status" className="p-6 text-muted-foreground">Opening Zodaci…</div>}><App /></Suspense>
    <ConfirmHost />
  </PageErrorBoundary>
);
