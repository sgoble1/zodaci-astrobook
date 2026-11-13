import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SELECTOR = 'main svg[viewBox], main canvas, main img, main .parchment, main .vellum, main table';

/** Fades/draws charts, graphics and cards the first time each scrolls into view, on every page. */
export function FirstViewReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      const el = e.target as HTMLElement;
      // Size comes from the observer entry, so scanning never forces a synchronous layout.
      if (e.boundingClientRect.width < 48) { io.unobserve(el); el.classList.remove('fv-pending'); return; }
      if (!e.isIntersecting) return; el.classList.replace('fv-pending', 'fv-shown'); io.unobserve(el);
      window.setTimeout(() => el.classList.remove('fv-shown'), 1800);
    }), { threshold: 0.12 });
    const seen = new WeakSet<Element>();
    const scan = () => document.querySelectorAll(SELECTOR).forEach(el => {
      if (seen.has(el) || el.closest('nav, [role="dialog"], .fv-pending, .fv-shown')) return;
      seen.add(el);
      el.classList.add('fv-pending'); io.observe(el);
    });
    scan();
    let queued = 0;
    // Batch mutation bursts (a page mounting) into one scan per frame.
    const mo = new MutationObserver(() => { if (!queued) queued = requestAnimationFrame(() => { queued = 0; scan(); }); });
    const main = document.querySelector('main'); if (main) mo.observe(main, { childList: true, subtree: true });
    return () => { cancelAnimationFrame(queued); io.disconnect(); mo.disconnect(); document.querySelectorAll('.fv-pending').forEach(el => el.classList.remove('fv-pending')); };
  }, [pathname]);
  return null;
}
