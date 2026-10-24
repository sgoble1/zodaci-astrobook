import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { computeChart, fmtLon } from '@/lib/astro';
import { PlanetOrb } from '@/components/chart/PlanetOrb';
import { useSession } from '@/hooks/useLibrary';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { supabase } from '@/integrations/supabase/client';
import { loadProtectedJson } from '@/lib/protectedContent';
import { officialChartInput, useOfficialEditions } from '@/lib/officialEditions';
import { chartCheckRows, type ChartCheckPoint } from '@/lib/editionCheck';

type Prompt = { id: string; text: string };
type Station = { key: string; orb: string; title: string; subtitle: string; placement: string; source: string; body: string; prompts: Prompt[]; practice: string };
type Month = { id: string; label: string; events: string; expect: string };
type Workbook = { version: number; title: string; intro: string; stations: Station[]; months: Month[]; monthsNote: string; chartCheck: ChartCheckPoint[] };
type Entry = { id?: string; answer: string; done: boolean };
const KIND = 'zac-workbook';

/**
 * Zac's Diamond Workbook. The stations come from his private archive (served by protected-content, never bundled);
 * answers save to his own account (owner-only rows). The admin can open it read-only to review the stations.
 */
export default function ZacWorkbook() {
  usePageMeta('The Diamond Workbook · Zodaci', 'A private, chart-keyed workbook.');
  const session = useSession();
  const uid = session?.user.id ?? '';
  const { rows, error: edErr, retry: retryEditions } = useOfficialEditions();
  const zac = rows?.find(r => r.edition === 'zac');
  const [book, setBook] = useState<Workbook | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [active, setActive] = useState('');
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const canWrite = !!zac?.is_own;

  useEffect(() => {
    if (!zac) return;
    let on = true; setLoadErr(''); setBook(null);
    loadProtectedJson<Workbook>('zac', 'workbook.json')
      .then(b => { if (on) { setBook(b); setActive(a => a || b.stations[0]?.key || ''); } })
      .catch(() => { if (on) setLoadErr('The workbook couldn’t be opened.'); });
    return () => { on = false; };
  }, [zac, attempt]);

  useEffect(() => {
    if (!uid || !canWrite) { setEntries({}); return; }
    let on = true;
    void supabase.from('workbook_entries').select('id,prompt_key,answer,data').eq('owner_id', uid).eq('kind', KIND).then(({ data }) => {
      if (!on) return;
      const next: Record<string, Entry> = {};
      for (const r of data ?? []) next[r.prompt_key] = { id: r.id, answer: r.answer ?? '', done: !!(r.data as { done?: boolean } | null)?.done };
      setEntries(next);
    });
    return () => { on = false; };
  }, [uid, canWrite]);

  const timers = useRef<Record<string, number>>({});
  const ids = useRef<Record<string, string>>({});
  const inflight = useRef<Record<string, Promise<void>>>({});
  useEffect(() => { for (const [k, e] of Object.entries(entries)) if (e.id) ids.current[k] = e.id; }, [entries]);
  // Saves run one at a time per answer, so a slow first save can never create a second row for the same prompt.
  const persist = useCallback((key: string, question: string, module: string, entry: Entry) => {
    if (!uid || !canWrite) return;
    const run = async () => {
      setSaving('saving');
      const id = ids.current[key];
      const res = id
        ? await supabase.from('workbook_entries').update({ answer: entry.answer, data: { done: entry.done }, updated_at: new Date().toISOString() }).eq('id', id).select('id').single()
        : await supabase.from('workbook_entries').insert({ owner_id: uid, kind: KIND, module, prompt_key: key, question, answer: entry.answer, data: { done: entry.done } }).select('id').single();
      if (res.error) { setSaving('error'); return; }
      ids.current[key] = res.data.id;
      setSaving('saved');
    };
    inflight.current[key] = (inflight.current[key] ?? Promise.resolve()).then(run, run);
  }, [uid, canWrite]);
  const edit = (key: string, question: string, module: string, patch: Partial<Entry>, immediate = false) => {
    setEntries(e => {
      const entry = { answer: '', done: false, ...e[key], ...patch };
      window.clearTimeout(timers.current[key]);
      timers.current[key] = window.setTimeout(() => persist(key, question, module, entry), immediate ? 0 : 900);
      return { ...e, [key]: entry };
    });
  };
  useEffect(() => () => Object.values(timers.current).forEach(t => window.clearTimeout(t)), []);

  const chart = useMemo(() => (zac?.birth ? computeChart({ ...officialChartInput(zac.birth), houseSystem: 'whole' }) : null), [zac]);
  const checks = useMemo(() => (book && chart ? chartCheckRows(book.chartCheck, chart) : []), [book, chart]);
  const place = (key: string) => {
    if (!chart) return '';
    if (key === 'asc') return chart.asc == null ? '' : fmtLon(chart.asc).text;
    if (key === 'mc') return chart.mc == null ? '' : fmtLon(chart.mc).text;
    const b = chart.bodies.find(x => x.key === key);
    return b ? `${fmtLon(b.lon).text}${b.retro && !/node/i.test(key) ? ' ℞' : ''}` : '';
  };

  if (edErr) return <div role="alert" className="flex flex-wrap items-center gap-3 text-destructive">{edErr}<Button size="sm" variant="outline" onClick={retryEditions}>Try again</Button></div>;
  if (!rows) return <p role="status" className="text-muted-foreground">Opening the workbook…</p>;
  if (!zac) return <p className="text-muted-foreground">This workbook belongs to a private edition.</p>;
  if (loadErr) return <div role="alert" className="flex flex-wrap items-center gap-3 text-destructive">{loadErr}<Button size="sm" variant="outline" onClick={() => setAttempt(a => a + 1)}>Try again</Button></div>;
  if (!book) return <p role="status" className="text-muted-foreground">Opening the workbook…</p>;

  const station = book.stations.find(s => s.key === active) ?? book.stations[0];
  const stationDone = (s: Station) => !!entries[`${s.key}:done`]?.done;
  const done = book.stations.filter(stationDone).length;
  const pct = Math.round((done / book.stations.length) * 100);
  const i = book.stations.indexOf(station);
  const differs = checks.filter(c => c.status === 'differs');

  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <div className="font-smallcaps text-xs text-gold">{zac.is_own ? 'Your edition' : 'Zac’s edition · admin view'} · Workbook</div>
        <h1 className="text-4xl sm:text-5xl">{book.title}</h1>
        <p className="max-w-2xl text-muted-foreground">{book.intro}</p>
        {!canWrite && <p role="note" className="max-w-2xl rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm">Read-only preview. Answers save only in Zac’s own account, and nobody else can read them.</p>}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="h-2 w-48 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={book.stations.length} aria-valuenow={done} aria-label="Stations complete"><div className="h-full bg-gold transition-all duration-1000" style={{ width: `${pct}%` }} /></div>
          <span className="text-sm text-muted-foreground">{done} of {book.stations.length} stations complete</span>
          {canWrite && <span className="text-xs text-muted-foreground" aria-live="polite">{saving === 'saving' ? 'Saving…' : saving === 'saved' ? 'Saved to your account' : saving === 'error' ? 'Couldn’t save — check your connection' : ''}</span>}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[19rem_1fr]">
        <ol className="space-y-2" aria-label="Workbook stations">
          {book.stations.map(st => (
            <li key={st.key}>
              <button type="button" onClick={() => setActive(st.key)} aria-current={station.key === st.key ? 'step' : undefined} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${station.key === st.key ? 'border-gold bg-gold/10' : 'border-border bg-card/50 hover:border-gold/60'}`}>
                {['asc', 'mc'].includes(st.orb) ? <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold text-xs text-gold">{st.orb === 'asc' ? 'AC' : 'MC'}</span> : <PlanetOrb planet={st.orb} size={36} />}
                <span className="min-w-0"><span className="block text-sm font-medium">{st.title}</span><span className="block truncate text-xs text-muted-foreground">{st.subtitle}</span></span>
                {stationDone(st) && <Check className="ml-auto h-4 w-4 shrink-0 text-gold" aria-label="complete" />}
              </button>
            </li>
          ))}
        </ol>

        <section className="parchment space-y-5 p-6" aria-labelledby="station-h">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-smallcaps text-xs text-gold">{station.subtitle}</span>
            <span className="text-xs text-muted-foreground">{station.source}</span>
          </div>
          <h2 id="station-h" className="text-3xl">{station.title}</h2>
          <p className="text-sm"><span className="text-muted-foreground">From your volumes:</span> {station.placement}{['asc', 'mc', 'mercury', 'moon', 'northNode'].includes(station.key) && place(station.key) ? <span className="text-muted-foreground"> · calculated {place(station.key)}</span> : null}</p>
          <p className="text-muted-foreground">{station.body}</p>
          {station.prompts.map(p => (
            <label key={p.id} className="block space-y-2"><span className="font-medium">{p.text}</span>
              <textarea value={entries[p.id]?.answer ?? ''} readOnly={!canWrite} onChange={e => edit(p.id, p.text, station.key, { answer: e.target.value })} rows={4} className="w-full rounded-md border border-input bg-background p-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring read-only:opacity-70" placeholder={canWrite ? 'Write freely…' : 'Answers are written in Zac’s own account.'} />
            </label>
          ))}
          <p className="text-sm"><span className="font-smallcaps text-gold">Practice</span> · {station.practice}</p>
          <div className="flex flex-wrap gap-3">
            {canWrite && <Button onClick={() => edit(`${station.key}:done`, `Station complete: ${station.title}`, station.key, { done: !stationDone(station) }, true)} variant={stationDone(station) ? 'outline' : 'default'}>{stationDone(station) ? 'Mark as not done' : 'Mark station complete'}</Button>}
            {i < book.stations.length - 1 && <Button variant="ghost" onClick={() => setActive(book.stations[i + 1].key)}>Next station →</Button>}
            <Button asChild variant="ghost"><Link to="/counselors">Talk it through with a counselor</Link></Button>
          </div>
        </section>
      </div>

      <section aria-labelledby="months-h" className="space-y-4">
        <h2 id="months-h" className="text-3xl">The year ahead, month by month</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">From Volume VI, §15. {book.monthsNote}</p>
        <ol className="grid gap-4 md:grid-cols-2">
          {book.months.map(m => {
            const key = `month-${m.id}`;
            return (
              <li key={m.id} className="rounded-xl border border-border bg-card/60 p-4">
                <h3 className="font-display text-xl">{m.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.events}</p>
                <p className="mt-2 text-sm">{m.expect}</p>
                <label className="mt-3 block space-y-1"><span className="text-xs font-medium">My intention for {m.label}</span>
                  <textarea value={entries[key]?.answer ?? ''} readOnly={!canWrite} onChange={e => edit(key, `Intention for ${m.label}`, 'year', { answer: e.target.value })} rows={2} className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring read-only:opacity-70" />
                </label>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="check-h" className="space-y-3">
        <h2 id="check-h" className="text-3xl">Checked against the calculator</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">Each placement quoted in Volume I, beside the position calculated from {zac.birth_source.toLowerCase()}. Differences over one degree are flagged, not corrected in the text.</p>
        {differs.length > 0 && <p role="note" className="max-w-2xl rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm">{differs.map(d => d.label).join(', ')} {differs.length === 1 ? 'differs' : 'differ'} from the calculation. Read {differs.length === 1 ? 'that passage' : 'those passages'} with this in mind.</p>}
        {!chart && <p className="text-sm text-muted-foreground">Birth details are needed to run the check.</p>}
        {chart && (
          <div className="overflow-x-auto"><table className="w-full min-w-[32rem] text-sm">
            <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2 pr-3 font-normal">Point</th><th className="py-2 pr-3 font-normal">Volume I</th><th className="py-2 pr-3 font-normal">Calculated</th><th className="py-2 font-normal">Result</th></tr></thead>
            <tbody>{checks.map(c => (
              <tr key={c.key} className="border-b border-border/50"><td className="py-2 pr-3">{c.label}</td><td className="py-2 pr-3">{c.volume}</td><td className="py-2 pr-3">{c.calculated}</td>
                <td className={`py-2 ${c.status === 'differs' ? 'text-destructive' : c.status === 'close' ? 'text-gold' : 'text-muted-foreground'}`}>{c.status === 'match' ? 'Matches' : c.status === 'close' ? `Within ${c.diffText}` : c.status === 'differs' ? `Differs by ${c.diffText}` : 'Not calculated'}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>

      <p className="text-xs text-muted-foreground">{saving === 'saving' && <Loader2 className="mr-1 inline h-3 w-3 animate-spin" aria-hidden="true" />}Read the full background in <Link to="/zac" className="underline">the Astrological Library</Link>.</p>
    </article>
  );
}
