import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SELECTOR = 'main svg[viewBox], main canvas, main img, main .parchment, main .vellum, main table';

/** Fades/draws charts, graphics and cards the first time each scrolls into view, on every page. */
export function FirstViewReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement; el.classList.replace('fv-pending', 'fv-shown'); io.unobserve(el);
      window.setTimeout(() => el.classList.remove('fv-shown'), 1800);
    }), { threshold: 0.12 });
    const seen = new WeakSet<Element>();
    const scan = () => document.querySelectorAll(SELECTOR).forEach(el => {
      if (seen.has(el) || el.closest('nav, [role="dialog"], .fv-pending, .fv-shown') || (el as HTMLElement).offsetWidth < 48) return;
      seen.add(el);
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) return; // already on screen at load: leave it alone
      el.classList.add('fv-pending'); io.observe(el);
    });
    scan();
    const mo = new MutationObserver(() => scan());
    const main = document.querySelector('main'); if (main) mo.observe(main, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); document.querySelectorAll('.fv-pending').forEach(el => el.classList.remove('fv-pending')); };
  }, [pathname]);
  return null;
}
