import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { scrollIntent, type Place } from '@/lib/scrollIntent';

const KEY = 'zodaci.scroll';
const read = (): Record<string, number> => { try { return JSON.parse(sessionStorage.getItem(KEY) ?? '{}'); } catch { return {}; } };
const write = (all: Record<string, number>) => { try { sessionStorage.setItem(KEY, JSON.stringify(all)); } catch { /* storage unavailable */ } };

/**
 * One place that decides where every page opens (public and member pages alike): new pages at the top, linked
 * sections under the sticky header, Back/Forward where you left off, and query-only changes left alone.
 * Lazy pages may render after navigation, so section and restore targets are retried for a few seconds.
 */
export function ScrollManager() {
  const location = useLocation();
  const nav = useNavigationType();
  const prev = useRef<Place | null>(null);
  const positions = useRef<Record<string, number>>(read());

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    let frame = 0;
    const save = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { positions.current[location.key] = window.scrollY; write(positions.current); });
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => { window.removeEventListener('scroll', save); cancelAnimationFrame(frame); };
  }, [location.key]);

  useLayoutEffect(() => {
    const next = { pathname: location.pathname, search: location.search, hash: location.hash };
    const intent = scrollIntent(prev.current, next, nav);
    prev.current = next;
    let timer = 0, tries = 0;
    const instant = (top: number) => window.scrollTo({ top, left: 0, behavior: 'instant' as ScrollBehavior });
    if (intent.kind === 'top') instant(0);
    if (intent.kind === 'section') {
      if (!intent.smooth) instant(0);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let touched = false, settles = 0;
      const stop = () => { touched = true; };
      const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
      events.forEach(e => window.addEventListener(e, stop, { passive: true, once: true }));
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const go = () => {
        const el = document.getElementById(intent.id);
        if (el) {
          // Images above the section can finish loading after the jump; re-align a few times unless the visitor scrolls.
          const off = el.getBoundingClientRect().top - pad;
          if (settles === 0 || (!touched && Math.abs(off) > 24)) el.scrollIntoView({ block: 'start', behavior: settles === 0 && intent.smooth && !reduce ? 'smooth' : ('instant' as ScrollBehavior) });
          if (++settles < 6 && !touched && !intent.smooth) timer = window.setTimeout(go, 400);
          return;
        }
        if (++tries < 40) timer = window.setTimeout(go, 150);
      };
      go();
      return () => { window.clearTimeout(timer); events.forEach(e => window.removeEventListener(e, stop)); };
    }
    if (intent.kind === 'restore') {
      const target = positions.current[location.key] ?? 0;
      const go = () => {
        // Wait until the page is tall enough to reach the saved position (lazy content may still be loading).
        if (document.documentElement.scrollHeight - window.innerHeight >= target - 2 || ++tries >= 40) { instant(target); return; }
        timer = window.setTimeout(go, 100);
      };
      go();
    }
    return () => window.clearTimeout(timer);
  }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
