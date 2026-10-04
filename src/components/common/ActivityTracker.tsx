import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Usage analytics for the admin activity feed. Logs page time, clicked button/link
// labels and media playback. Never records typed text or private conversation content.
const IDLE_MS = 3 * 60 * 1000; // no input for 3 min = away (screen off, put down, etc.)
const visitId = (() => {
  try {
    const k = 'ab-visit'; const prev = sessionStorage.getItem(k);
    if (prev) return prev;
    const id = crypto.randomUUID(); sessionStorage.setItem(k, id); return id;
  } catch { return Math.random().toString(36).slice(2); }
})();
const device = typeof window === 'undefined' ? '' : `${/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'} ${window.innerWidth}px`;

type Ev = { kind: string; path: string; label?: string; detail?: Record<string, unknown>; duration_seconds?: number | null };
let queue: (Ev & { visit_id: string; device: string; created_at: string })[] = [];
let uid: string | null = null;

async function flush() {
  if (!uid || !queue.length) return;
  const batch = queue; queue = [];
  const { error } = await supabase.from('activity_events').insert(batch.map(e => ({ ...e, user_id: uid!, detail: (e.detail ?? {}) as never })));
  if (error) queue = [...batch, ...queue].slice(-200);
}
export function logActivity(e: Ev) {
  if (!uid) return;
  queue.push({ ...e, label: (e.label ?? '').slice(0, 160), visit_id: visitId, device, created_at: new Date().toISOString() });
  if (queue.length >= 15) void flush();
}

function labelOf(el: HTMLElement) {
  const t = el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || '';
  return t.replace(/\s+/g, ' ').trim().slice(0, 120);
}

export function ActivityTracker() {
  const { pathname, search } = useLocation();
  const path = pathname + search;
  const seg = useRef({ path: '', start: Date.now(), active: 0, lastInput: Date.now(), activeSince: Date.now() as number | null });

  useEffect(() => {
    const set = (s: { user: { id: string } } | null) => { uid = s?.user.id ?? null; };
    supabase.auth.getSession().then(({ data }) => set(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => set(s));
    const t = setInterval(() => void flush(), 10000);
    return () => { data.subscription.unsubscribe(); clearInterval(t); };
  }, []);

  // Page segments with active-time accounting
  useEffect(() => {
    const s = seg.current;
    const pause = () => { if (s.activeSince) { s.active += Date.now() - s.activeSince; s.activeSince = null; } };
    const resume = () => { s.lastInput = Date.now(); if (!s.activeSince && document.visibilityState === 'visible') s.activeSince = Date.now(); };
    const end = (reason: string) => {
      if (!s.path) return;
      pause();
      logActivity({ kind: 'page_leave', path: s.path, label: document.title, duration_seconds: Math.round(s.active / 1000), detail: { reason, wall_seconds: Math.round((Date.now() - s.start) / 1000) } });
    };
    end('navigated');
    s.path = path; s.start = Date.now(); s.active = 0; s.activeSince = Date.now(); s.lastInput = Date.now();
    const tm = setTimeout(() => logActivity({ kind: 'page_view', path, label: document.title }), 300);

    const onVis = () => {
      if (document.visibilityState === 'hidden') { pause(); logActivity({ kind: 'away', path, label: 'Tab hidden / screen off' }); void flush(); }
      else { resume(); logActivity({ kind: 'back', path, label: 'Returned' }); }
    };
    const idle = setInterval(() => { if (s.activeSince && Date.now() - s.lastInput > IDLE_MS) { s.active += s.lastInput - s.activeSince + 15000; s.activeSince = null; logActivity({ kind: 'away', path, label: 'Idle (no touch/keys for 3 min)' }); } }, 15000);
    const onInput = () => { const wasIdle = !s.activeSince; resume(); if (wasIdle && document.visibilityState === 'visible') logActivity({ kind: 'back', path, label: 'Active again' }); };
    const onHide = () => { end('closed'); s.path = ''; void flush(); };
    document.addEventListener('visibilitychange', onVis);
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(e => window.addEventListener(e, onInput, { passive: true }));
    window.addEventListener('pagehide', onHide);
    return () => {
      clearTimeout(tm); clearInterval(idle);
      document.removeEventListener('visibilitychange', onVis);
      ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(e => window.removeEventListener(e, onInput));
      window.removeEventListener('pagehide', onHide);
    };
  }, [path]);

  // Clicks and media
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest('button, a, [role="button"], [role="tab"], [role="menuitem"], summary') as HTMLElement | null;
      if (!el) return;
      const href = el.getAttribute('href');
      logActivity({ kind: 'click', path: location.pathname, label: labelOf(el) || href || el.tagName, detail: href ? { href } : {} });
    };
    const onSubmit = (e: Event) => logActivity({ kind: 'submit', path: location.pathname, label: (e.target as HTMLElement).getAttribute('aria-label') || 'Form sent' });
    const onMedia = (e: Event) => {
      const m = e.target as HTMLMediaElement;
      if (!(m instanceof HTMLMediaElement)) return;
      const title = m.getAttribute('aria-label') || m.title || m.closest('[data-title]')?.getAttribute('data-title') || m.closest('article, li, section')?.querySelector('h2, h3, h4')?.textContent || 'Audio/video';
      logActivity({ kind: `media_${e.type}`, path: location.pathname, label: title.trim(), detail: { position_s: Math.round(m.currentTime), length_s: Number.isFinite(m.duration) ? Math.round(m.duration) : null, rate: m.playbackRate } });
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('submit', onSubmit, true);
    ['play', 'pause', 'ended'].forEach(t => document.addEventListener(t, onMedia, true));
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('submit', onSubmit, true);
      ['play', 'pause', 'ended'].forEach(t => document.removeEventListener(t, onMedia, true));
    };
  }, []);
  return null;
}
