import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ALL_READINGS, FLAGSHIP_READINGS, FREE_READINGS, canWriteAllReadings, loadMyTopicReadings, writeTopicReading } from '@/lib/topicReadings';
import { onAccountChange } from '@/lib/authEvents';

const MIN_KEY = 'zodaci-gen-minimized';
const STARTED_KEY = 'zodaci-gen-started';

/** Site-wide writing progress: full-screen while pages are being written, minimizable to a corner badge. */
export function GenerationProgress() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [done, setDone] = useState<Set<string> | null>(null);
  const [eligible, setEligible] = useState(false);
  const [targets, setTargets] = useState<typeof ALL_READINGS>([]);
  const [minimized, setMinimized] = useState(true);
  const [error, setError] = useState('');
  const [cancelled, setCancelled] = useState(false);
  const [runId, setRunId] = useState(0);
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const timer = useRef<number>();
  const startedKey = useRef(STARTED_KEY);
  const revision = useRef(0);
  useEffect(() => {
    const reset = () => { revision.current++; setEligible(false); setDone(null); setError(''); setRequested(new Set()); setRunId(n => n + 1); };
    const stop = onAccountChange(reset);
    window.addEventListener('astrobook-birth-saved', reset);
    return () => { stop(); window.removeEventListener('astrobook-birth-saved', reset); };
  }, []);

  const refresh = async () => {
    const version = revision.current;
    const rows = await loadMyTopicReadings().catch(() => null);
    if (version !== revision.current) return null;
    if (rows?.some(r => r.status === 'failed')) setError('A reading could not finish. Open it to retry.');
    if (rows) setDone(new Set(rows.filter(r => ['ready', 'preview'].includes(r.status)).map(r => r.page_key)));
    return rows;
  };

  // Re-check after navigation so a fresh birth-details save starts writing right away.
  useEffect(() => {
    let alive = true;
    const version = revision.current;
    const current = () => alive && version === revision.current;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { if (current()) setEligible(false); return; }
      const uid = data.session.user.id;
      const { data: p } = await supabase.from('profiles').select('birth_date,chart,generation_cancelled,onboarded_at').eq('id', uid).maybeSingle();
      if (!current()) return;
      const ok = !!(p?.birth_date && p.chart);
      setEligible(ok);
      if (!ok) { if (current()) setCancelled(false); return; }
      setCancelled(!!p?.generation_cancelled);
      const all = await canWriteAllReadings().catch(() => false);
      if (!current()) return;
      // Only the headline readings are written upfront; everything else is written when first opened.
      startedKey.current = `${STARTED_KEY}:${uid}:${p?.onboarded_at}:${all}`;
      const list = ALL_READINGS.filter(t => (all ? FLAGSHIP_READINGS : FREE_READINGS).includes(t.slug));
      setTargets(list);
      if (p?.generation_cancelled) { await refresh(); return; }
      const rows = await refresh();
      if (!rows || !current()) return;
      const missing = list.filter(t => !rows.some(r => r.page_key === `topic-${t.slug}` && ['ready','preview','writing'].includes(r.status)));
      // A stop may land after a lane was already started; that is a quiet stop, not an error.
      const note = (e: Error) => { if (!current()) return; if (/stopped/i.test(e.message)) { sessionStorage.removeItem(startedKey.current); setCancelled(true); } else setError(e.message); };
      if (missing.length && !sessionStorage.getItem(startedKey.current)) {
        sessionStorage.setItem(startedKey.current, '1');
        for (const t of missing) { if (!current()) break; try { await writeTopicReading(t.slug); if (current()) setRequested(old => new Set([...old, t.slug])); } catch (e) { note(e as Error); break; } }
      }
    })();
    return () => { alive = false; };
  }, [(pathname === '/my-readings' || pathname === '/start'), runId]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    await supabase.from('profiles').update({ generation_cancelled: true }).eq('id', data.session.user.id);
    sessionStorage.removeItem(startedKey.current);
    setError('');
    setCancelled(true);
  };
  const resume = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    await supabase.from('profiles').update({ generation_cancelled: false }).eq('id', data.session.user.id);
    sessionStorage.removeItem(startedKey.current);
    setCancelled(false);
    setRunId(n => n + 1);
  };

  const total = targets.length;
  const count = done ? targets.filter(t => done.has(`topic-${t.slug}`)).length : 0;
  const active = eligible && !cancelled && done !== null && count < total;
  useEffect(() => {
    if (!active) return;
    const started = Date.now();
    timer.current = window.setInterval(() => { if (Date.now() - started > 240000) { setError('Writing is taking longer than expected. Open the reading to check or retry.'); clearInterval(timer.current); return; } void refresh(); }, 20000);
    return () => clearInterval(timer.current);
  }, [active]);

  const current = targets.find(t => requested.has(t.slug) && !done?.has(`topic-${t.slug}`));
  const minimize = () => { sessionStorage.setItem(MIN_KEY, '1'); setMinimized(true); if (pathname === '/start') navigate('/dashboard'); };
  const expand = () => { sessionStorage.removeItem(MIN_KEY); setMinimized(false); };
  // Lets the welcome tour wait until this full-screen view is out of the way.
  useEffect(() => { const on = active && !minimized; if (on) document.body.dataset.genOverlay = '1'; else delete document.body.dataset.genOverlay; window.dispatchEvent(new Event('zodaci-tour')); return () => { delete document.body.dataset.genOverlay; }; }, [active, minimized]);
  if (cancelled && eligible) {
    return createPortal(
      <motion.div data-generation-notice key="stopped" role="status" className="float-above-tabbar fixed bottom-4 left-4 right-4 z-[45] border-b border-border bg-card/95 backdrop-blur shadow-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2 text-sm">
          <span className="min-w-0 flex-1 truncate">Writing was stopped for this chart. {done !== null && targets.length > 0 && `${targets.filter(t => done.has(`topic-${t.slug}`)).length} of ${targets.length} pages are ready.`}</span>
          <Button variant="outline" onClick={resume} className="shrink-0 rounded-md border border-border px-3 py-1 text-xs hover:bg-muted focus-visible:outline focus-visible:outline-2">Resume</Button>
        </div>
      </motion.div>,
      document.body
    );
  }
  if (!active) return null;
  const pct = Math.round((count / total) * 100);

  const pathFor = (slug: string) => (ALL_READINGS.find(t => t.slug === slug) as { route?: string } | undefined)?.route ?? `/my-readings/topic/${slug}`;
  const paused = error ? (/credit/i.test(error) ? 'Paused: AI writing credits are unavailable. Retry when credits are available.' : /limit/i.test(error) ? 'Paused: the daily writing limit was reached. Retry tomorrow.' : /stopped/i.test(error) ? 'Writing was stopped for this chart. Press Resume to continue.' : `Paused: ${error}`) : '';
  return createPortal(
    <AnimatePresence>
      {!minimized ? (
        <motion.div key="full" className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-background/95 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div layoutId="gen-card" role="status" aria-live="polite" className="my-auto w-full max-w-lg space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-2xl">
            <motion.div className="mx-auto h-14 w-14 rounded-full border-4 border-primary/30 border-t-primary" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }} aria-hidden="true" />
            <h2 className="font-display text-3xl">Writing your pages</h2>
            <p className="text-sm text-muted-foreground">Your starting readings are written from your own chart. Other readings are created when you open them. You can keep exploring and check back here.</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted"><motion.div className="h-full bg-primary" animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} /></div>
            <p className="text-sm font-medium">{count} of {total} pages ready{current ? ` · now writing “${current.title}”` : ''}</p>
            {paused && <div role="alert" className="space-y-2 text-sm text-destructive"><p>{paused}</p><Button variant="outline" onClick={resume}>Retry</Button></div>}
            <ul className="max-h-56 overflow-y-auto rounded-lg border border-border text-left text-sm divide-y divide-border">
              {targets.map(t => { const ok = done?.has(`topic-${t.slug}`); const now = current?.slug === t.slug; return (
                <li key={t.slug} className="flex items-center justify-between gap-3 px-3 py-2">
                  {ok ? <Link to={pathFor(t.slug)} onClick={minimize} className="text-foreground underline-offset-2 hover:underline">{t.title}</Link> : <span className="text-muted-foreground">{t.title}</span>}
                  <span className={`shrink-0 text-xs ${ok ? 'text-primary' : 'text-muted-foreground'}`}>{ok ? 'Ready' : now ? 'Requested' : 'Not yet ready'}</span>
                </li>); })}
            </ul>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" onClick={minimize} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted focus-visible:outline focus-visible:outline-2">Keep exploring</Button>
              <Button variant="outline" onClick={stop} className="rounded-md border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 focus-visible:outline focus-visible:outline-2">Stop writing</Button>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div data-generation-notice key="mini" layoutId="gen-card" role="status" aria-live="polite" className="float-above-tabbar fixed bottom-4 left-4 right-4 z-[45] border-b border-border bg-card/95 backdrop-blur shadow-md">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2 text-sm">
            <motion.span className="h-4 w-4 shrink-0 rounded-full border-2 border-primary/30 border-t-primary" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{paused ? paused : <>Writing your pages: <strong>{count} of {total}</strong> ready{current ? ` · ${current.title}` : ''}</>}</span>
            <div className="hidden sm:block h-1.5 w-28 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
            <Button variant="outline" onClick={expand} className="shrink-0 rounded-md border border-border px-3 py-1 text-xs hover:bg-muted focus-visible:outline focus-visible:outline-2">Open</Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
