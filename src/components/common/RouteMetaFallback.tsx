import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { memberDestinations } from '@/content/memberNav';

/** Title for a member path from the shared navigation registry; null when the registry doesn't know it. */
export function fallbackMeta(path: string): { title: string; description: string } | null {
  const all = memberDestinations({ shane: true, shared: true });
  const hit = all.find(d => d.to === path) ?? all.filter(d => d.to !== '/' && path.startsWith(`${d.to}/`)).sort((a, b) => b.to.length - a.to.length)[0];
  if (!hit) return null;
  return { title: `${hit.label} · Zodaci`, description: hit.description };
}

/**
 * Pages without their own usePageMeta get a title from the navigation registry. Child effects run first, so a page
 * that sets its own title (which marks data-meta-path) is never overwritten.
 */
export function RouteMetaFallback() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (document.documentElement.dataset.metaPath === pathname) return;
    const meta = fallbackMeta(pathname);
    document.title = meta?.title ?? 'Zodaci';
    const d = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (d && meta) d.setAttribute('content', meta.description);
    const r = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (r && !/^april\./i.test(window.location.hostname)) r.setAttribute('content', 'noindex, follow');
    document.documentElement.dataset.metaPath = pathname;
  }, [pathname]);
  return null;
}
