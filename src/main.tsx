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
// Pause decorative CSS loops while the tab is hidden.
document.addEventListener('visibilitychange', () => { document.documentElement.toggleAttribute('data-tab-hidden', document.hidden); });
// Start loading the app right away, and the home page in parallel when that is where the visitor landed,
// so the two downloads don't wait on each other.
const appModule = import('./App.tsx');
if (/^\/(welcome)?\/?$/.test(location.pathname)) void import('./pages/BrandLanding');

// Set defaults in the head for SEO — real title & description.
document.title = "Zodaci · Your sky, your story";
const desc = document.querySelector('meta[name="description"]');
if (desc) desc.setAttribute("content",
  "Explore your own calculated birth chart, personal readings and private library, and create a printed AstroBook with Zodaci."
);

// Public pages ship a readable static version inside #root; keep it on screen until the app code has arrived,
// then let React replace it, so visitors never see a blank or placeholder screen in between.
const root = document.getElementById('root');
const hasSnapshot = !!root?.firstElementChild;
const App = lazy(() => appModule);
const render = () => root && createRoot(root).render(
  <PageErrorBoundary>
    <Suspense fallback={<div role="status" className="p-6 text-muted-foreground">Opening Zodaci…</div>}><App /></Suspense>
    <ConfirmHost />
  </PageErrorBoundary>
);
if (hasSnapshot) appModule.then(render, render); else render();
