import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ACCURACY_TOLERANCE, fmtDiff, fmtPoint, runAccuracySet, type AccuracyResult, type AccuracySummary } from '@/lib/accuracySet';

const localWhen = (date: string, time: string) => {
  const [y, m, d] = date.split('-').map(Number); const [hh, mm] = time.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm)).toLocaleString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};
const utcWhen = (iso: string) => new Date(iso).toLocaleString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) + ' UTC';

/** Public, reproducible accuracy check: every chart is recalculated in the visitor's browser and compared with stored Swiss Ephemeris values. */
export default function AccuracyCheck() {
  usePageMeta('Check our numbers · Zodaci', 'Thirteen public test moments, recalculated live in your browser and compared point by point with the Swiss Ephemeris: planets, nodes, Chiron, angles and all twelve house cusps.');
  const [state, setState] = useState<{ status: 'loading' } | { status: 'ready'; s: AccuracySummary; ms: number } | { status: 'error'; message: string }>({ status: 'loading' });
  const run = useCallback(() => {
    setState({ status: 'loading' });
    // Let the page paint first; the check itself takes a fraction of a second.
    const id = window.setTimeout(() => {
      try { const t0 = performance.now(); const s = runAccuracySet(); setState({ status: 'ready', s, ms: performance.now() - t0 }); }
      catch (e) { setState({ status: 'error', message: e instanceof Error ? e.message : 'The calculation stopped unexpectedly.' }); }
    }, 60);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => run(), [run]);

  return (
    <article className="min-w-0 space-y-12">
      <Link to="/learn" className="text-sm text-primary">Back to Learn</Link>
      <header className="max-w-3xl">
        <p className="font-label text-sm text-primary">Zodaci · Astral Research Authority</p>
        <h1 className="mt-3 font-display text-4xl uppercase leading-tight sm:text-5xl">Check our numbers</h1>
        <p className="mt-3 font-script text-3xl text-primary">Worked out in front of you.</p>
        <p className="mt-5 text-lg text-muted-foreground">When this page opened, your browser calculated thirteen charts with the same code that draws every Zodaci chart. Each result is compared with the Swiss Ephemeris, the engine behind Astrodienst (astro.com). None of these moments is a person’s birth, so you can type any of them into astro.com and compare for yourself.</p>
      </header>

      <section aria-labelledby="acc-summary" aria-live="polite">
        <h2 id="acc-summary" className="sr-only">Result</h2>
        {state.status === 'loading' && <div role="status" aria-label="Calculating thirteen charts" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="obs-paper h-28 animate-pulse" />)}</div>}
        {state.status === 'error' && (
          <div role="alert" className="obs-paper space-y-3 p-6">
            <h3 className="font-display text-xl">The check couldn’t finish</h3>
            <p className="text-sm text-muted-foreground">{state.message} Nothing is shown in place of a real result. Try again, or reload the page.</p>
            <Button variant="outline" onClick={run}>Run the check again</Button>
          </div>
        )}
        {state.status === 'ready' && <Summary s={state.s} ms={state.ms} onRerun={run} />}
      </section>

      {state.status === 'ready' && (
        <section aria-labelledby="acc-cases" className="space-y-5">
          <div><h2 id="acc-cases" className="font-display text-3xl">The thirteen moments</h2><p className="mt-2 max-w-2xl text-muted-foreground">Each one was chosen to catch a specific mistake. Open a moment to see every point side by side.</p></div>
          <ol className="grid grid-cols-1 gap-4 lg:grid-cols-2">{state.s.results.map(r => <CaseCard key={r.c.id} r={r} />)}</ol>
        </section>
      )}

      <section aria-labelledby="acc-repeat" className="grid gap-4 md:grid-cols-3">
        <h2 id="acc-repeat" className="sr-only">How to repeat the check</h2>
        <div className="obs-paper p-5"><h3 className="font-display text-xl">Repeat it on astro.com</h3><p className="mt-3 text-sm text-muted-foreground">Open Extended Chart Selection, enter the date, local time and place shown on a card, and choose Placidus houses and the mean node. Positions there are given to the minute of arc; ours are shown the same way.</p></div>
        <div className="obs-paper p-5"><h3 className="font-display text-xl">What “pass” means</h3><p className="mt-3 text-sm text-muted-foreground">A point passes when it lands within {ACCURACY_TOLERANCE}° (six minutes of arc) of the reference and, for planets, moves in the same direction. The published standard for this work is one degree for planets and half a degree for house cusps.</p></div>
        <div className="obs-paper p-5"><h3 className="font-display text-xl">What isn’t checked here</h3><p className="mt-3 text-sm text-muted-foreground">Ceres, Pallas, Juno and Vesta are not yet calculated for member charts, so they aren’t listed. Black Moon Lilith, the Vertex and Vedic positions use other conventions and are tested separately. Founder charts are checked privately in the same way.</p></div>
      </section>

      <p className="text-sm text-muted-foreground">Calculations are explained on <Link to="/pricing" className="text-primary underline-offset-4 hover:underline">Plans</Link> and in <Link to="/learn" className="text-primary underline-offset-4 hover:underline">Learn</Link>. Astrological insights are provided for entertainment and self-reflection purposes only.</p>
    </article>
  );
}

function Summary({ s, ms, onRerun }: { s: AccuracySummary; ms: number; onRerun: () => void }) {
  const all = s.passed === s.points;
  const stats: [string, string, string][] = [
    ['Charts calculated', String(s.charts), `in ${Math.max(1, Math.round(ms))} ms on this device`],
    ['Points compared', String(s.points), 'planets, node, Chiron, angles, 12 cusps each'],
    ['Within 0.1°', `${s.passed} of ${s.points}`, all ? 'every point passed' : `${s.points - s.passed} outside the limit`],
    ['Largest difference', fmtDiff(s.worst), `about ${(s.worst).toFixed(3)}°`],
  ];
  return (
    <div className="space-y-4">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([k, v, note]) => <div key={k} className="obs-paper p-5"><dt className="font-label text-sm text-muted-foreground">{k}</dt><dd className="mt-2 font-display text-3xl">{v}</dd><dd className="mt-1 text-xs text-muted-foreground">{note}</dd></div>)}</dl>
      <div className="flex flex-wrap items-center gap-4">
        <p className={all ? 'text-sm' : 'text-sm text-destructive'}>{all ? `All ${s.charts} local clock times were converted to UTC with the historical offset for that place and date (${s.utcOk} of ${s.charts}).` : 'Some points fell outside the limit. They are marked below; nothing has been adjusted to hide them.'}</p>
        <Button variant="outline" size="sm" onClick={onRerun}>Run it again</Button>
      </div>
    </div>
  );
}

function CaseCard({ r }: { r: AccuracyResult }) {
  const { c } = r; const ok = r.passed === r.rows.length && r.utcOk && r.houseNoteOk;
  const note = r.chart.flags.find(f => f.topic === 'Houses');
  return (
    <li className="obs-paper min-w-0 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl">{c.place}</h3>
        <span className={ok ? 'font-label text-sm text-primary' : 'font-label text-sm text-destructive'}>{r.passed}/{r.rows.length} {ok ? 'passed' : 'check'}</span>
      </div>
      <p className="mt-1 text-sm">{localWhen(c.date, c.time)} local · <span className="text-muted-foreground">{utcWhen(r.chart.utc.toISOString())}</span></p>
      <p className="mt-1 text-xs text-muted-foreground">{c.lat.toFixed(4)}°, {c.lon.toFixed(4)}° · {c.tz.replace(/_/g, ' ')}</p>
      <p className="mt-3 text-sm text-muted-foreground">{c.why}</p>
      {note && <p className="mt-2 text-xs">Notice shown on this chart: {note.note}</p>}
      <details className="mt-3 group">
        <summary className="cursor-pointer text-sm text-primary">Every point, side by side</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left text-xs">
            <caption className="sr-only">{c.place}: Zodaci positions compared with the Swiss Ephemeris</caption>
            <thead><tr className="border-b border-border font-label text-muted-foreground"><th scope="col" className="py-1.5 pr-2">Point</th><th scope="col" className="pr-2">Zodaci</th><th scope="col" className="pr-2">Swiss Ephemeris</th><th scope="col" className="pr-2">Difference</th><th scope="col">Result</th></tr></thead>
            <tbody>{r.rows.map(row => (
              <tr key={row.point} className="border-b border-border/50">
                <th scope="row" className="py-1.5 pr-2 font-normal">{row.point}</th>
                <td className="pr-2 tabular-nums">{fmtPoint(row.ours)}</td>
                <td className="pr-2 tabular-nums">{fmtPoint(row.ref)}</td>
                <td className="pr-2 tabular-nums">{fmtDiff(row.diff)}</td>
                <td className={row.pass ? '' : 'text-destructive'}>{row.pass ? 'Pass' : row.retroOk === false ? 'Direction differs' : 'Outside limit'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </details>
    </li>
  );
}
