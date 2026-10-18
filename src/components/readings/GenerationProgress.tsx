import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { ALL_READINGS, FREE_READINGS, canWriteAllReadings, loadMyTopicReadings, writeTopicReading } from '@/lib/topicReadings';

const MIN_KEY = 'zodaci-gen-minimized';
const STARTED_KEY = 'zodaci-gen-started';

/** Site-wide writing progress: full-screen while pages are being written, minimizable to a corner badge. */
export function GenerationProgress() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [done, setDone] = useState<Set<string> | null>(null);
  const [eligible, setEligible] = useState(false);
  const [targets, setTargets] = useState<typeof ALL_READINGS>([]);
  const [minimized, setMinimized] = useState(() => sessionStorage.getItem(MIN_KEY) === '1');
  const [error, setError] = useState('');
  const [cancelled, setCancelled] = useState(false);
  const [runId, setRunId] = useState(0);
  const timer = useRef<number>();

  const refresh = async () => {
    const rows = await loadMyTopicReadings().catch(() => null);
    if (rows) setDone(new Set(rows.map(r => r.page_key)));
    return rows;
  };

  // Re-check after navigation so a fresh birth-details save starts writing right away.
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { if (alive) setEligible(false); return; }
      const uid = data.session.user.id;
      const { data: p } = await supabase.from('profiles').select('birth_date,chart,generation_cancelled').eq('id', uid).maybeSingle();
      if (!alive) return;
      const ok = !!(p?.birth_date && p.chart);
      setEligible(ok);
      if (!ok) { if (alive) setCancelled(false); return; }
      setCancelled(!!p?.generation_cancelled);
      if (p?.generation_cancelled) return;
      const all = await canWriteAllReadings().catch(() => false);
      if (!alive) return;
      const list = all ? ALL_READINGS : ALL_READINGS.filter(t => FREE_READINGS.includes(t.slug));
      setTargets(list);
      const rows = await refresh();
      if (!rows || !alive) return;
      const missing = list.filter(t => !rows.some(r => r.page_key === `topic-${t.slug}`));
      if (missing.length && !sessionStorage.getItem(STARTED_KEY)) {
        sessionStorage.setItem(STARTED_KEY, '1');
        if (!all) { missing.forEach(t => writeTopicReading(t.slug).catch(e => setError((e as Error).message))); return; }
        // Three parallel lanes; each lane writes its own share of topics in order.
        const LANES = 3;
        const order = ALL_READINGS.map(t => t.slug);
        for (let lane = 0; lane < LANES; lane++) {
          const first = missing.find(t => order.indexOf(t.slug) % LANES === lane);
          if (first) writeTopicReading(first.slug, { chain: true, lane, lanes: LANES }).catch(e => setError((e as Error).message));
        }
      }
    })();
    return () => { alive = false; };
  }, [(pathname === '/my-readings' || pathname === '/start'), runId]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    await supabase.from('profiles').update({ generation_cancelled: true }).eq('id', data.session.user.id);
    sessionStorage.removeItem(STARTED_KEY);
    setError('');
    setCancelled(true);
  };
  const resume = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    await supabase.from('profiles').update({ generation_cancelled: false }).eq('id', data.session.user.id);
    sessionStorage.removeItem(STARTED_KEY);
    setCancelled(false);
    setRunId(n => n + 1);
  };

  const total = targets.length;
  const count = done ? targets.filter(t => done.has(`topic-${t.slug}`)).length : 0;
  const active = eligible && !cancelled && done !== null && count < total;
  useEffect(() => {
    if (!active) return;
    timer.current = window.setInterval(refresh, 20000);
    return () => clearInterval(timer.current);
  }, [active]);

  const current = targets.find(t => !done?.has(`topic-${t.slug}`));
  const minimize = () => { sessionStorage.setItem(MIN_KEY, '1'); setMinimized(true); if (pathname === '/start') navigate('/dashboard'); };
  const expand = () => { sessionStorage.removeItem(MIN_KEY); setMinimized(false); };
  // Lets the welcome tour wait until this full-screen view is out of the way.
  useEffect(() => { const on = active && !minimized; if (on) document.body.dataset.genOverlay = '1'; else delete document.body.dataset.genOverlay; window.dispatchEvent(new Event('zodaci-tour')); return () => { delete document.body.dataset.genOverlay; }; }, [active, minimized]);
  if (cancelled && eligible) {
    return createPortal(
      <motion.div key="stopped" role="status" className="fixed inset-x-0 top-[64px] lg:top-0 z-[45] border-b border-border bg-card/95 backdrop-blur shadow-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2 text-sm">
          <span className="min-w-0 flex-1 truncate">Writing was stopped for this chart. {done !== null && targets.length > 0 && `${targets.filter(t => done.has(`topic-${t.slug}`)).length} of ${targets.length} pages are ready.`}</span>
          <button onClick={resume} className="shrink-0 rounded-md border border-border px-3 py-1 text-xs hover:bg-muted focus-visible:outline focus-visible:outline-2">Resume</button>
        </div>
      </motion.div>,
      document.body
    );
  }
  if (!active) return null;
  const pct = Math.round((count / total) * 100);

  const pathFor = (slug: string) => (ALL_READINGS.find(t => t.slug === slug) as { route?: string } | undefined)?.route ?? `/my-readings/topic/${slug}`;
  const paused = error ? (/credit/i.test(error) ? 'Paused: AI writing credits have run out. Your pages continue automatically once credits are added.' : /limit/i.test(error) ? 'Paused for today: the daily writing limit was reached. Writing continues tomorrow.' : `Paused: ${error}`) : '';
  return createPortal(
    <AnimatePresence>
      {!minimized ? (
        <motion.div key="full" className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-background/95 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div layoutId="gen-card" role="status" aria-live="polite" className="my-auto w-full max-w-lg space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-2xl">
            <motion.div className="mx-auto h-14 w-14 rounded-full border-4 border-primary/30 border-t-primary" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }} aria-hidden="true" />
            <h2 className="font-display text-3xl">Writing your pages</h2>
            <p className="text-sm text-muted-foreground">Each page is written from your own chart and takes about a minute. You can keep exploring: progress stays in the bar at the top of every page, and writing continues even if you close the site.</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted"><motion.div className="h-full bg-primary" animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} /></div>
            <p className="text-sm font-medium">{count} of {total} pages ready{current ? ` · now writing “${current.title}”` : ''}</p>
            {paused && <p role="alert" className="text-sm text-destructive">{paused}</p>}
            <ul className="max-h-56 overflow-y-auto rounded-lg border border-border text-left text-sm divide-y divide-border">
              {targets.map(t => { const ok = done?.has(`topic-${t.slug}`); const now = current?.slug === t.slug; return (
                <li key={t.slug} className="flex items-center justify-between gap-3 px-3 py-2">
                  {ok ? <Link to={pathFor(t.slug)} onClick={minimize} className="text-foreground underline-offset-2 hover:underline">{t.title}</Link> : <span className="text-muted-foreground">{t.title}</span>}
                  <span className={`shrink-0 text-xs ${ok ? 'text-primary' : 'text-muted-foreground'}`}>{ok ? 'Ready' : now ? 'Writing…' : 'Waiting'}</span>
                </li>); })}
            </ul>
            <button onClick={minimize} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted focus-visible:outline focus-visible:outline-2">Keep exploring</button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div key="mini" layoutId="gen-card" role="status" aria-live="polite" className="fixed inset-x-0 top-[64px] lg:top-0 z-[45] border-b border-border bg-card/95 backdrop-blur shadow-md">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2 text-sm">
            <motion.span className="h-4 w-4 shrink-0 rounded-full border-2 border-primary/30 border-t-primary" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{paused ? paused : <>Writing your pages: <strong>{count} of {total}</strong> ready{current ? ` · ${current.title}` : ''}</>}</span>
            <div className="hidden sm:block h-1.5 w-28 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
            <button onClick={expand} className="shrink-0 rounded-md border border-border px-3 py-1 text-xs hover:bg-muted focus-visible:outline focus-visible:outline-2">Open</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
