import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ACCURACY_CASES, ACCURACY_TOLERANCE, checkCase, fmtDiff, type AccuracyResult } from '@/lib/accuracySet';
import { DEFAULT_PRE_MONEY, INVESTMENT_AMOUNTS, INVESTMENT_SCENARIOS, investmentOutcome, tierFor } from '@/lib/investmentScenarios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n < 100 ? 2 : 0 });
const pct = (n: number) => `${(n * 100).toLocaleString('en-US', { maximumSignificantDigits: 3 })}%`;

export function ZeroCostThesis() {
  return <section aria-labelledby="inv-thesis" className="vellum space-y-4 p-6 sm:p-10">
    <h2 id="inv-thesis" className="text-3xl sm:text-4xl">Calculations cost nothing to run</h2>
    <p className="max-w-3xl text-muted-foreground">Chart positions, houses, the ephemeris, BaZi pillars and the placement reading library all run as ordinary code in the browser. Serving one more member a chart, a daily sky or a planet chapter adds no AI bill. AI is used only where it earns its cost: personal counselors, written readings and podcasts, all paid from members’ monthly credits.</p>
    <ul className="grid gap-3 sm:grid-cols-3 text-sm">
      <li className="rounded-md border border-border p-4"><span className="block font-label">In code, no AI</span>Charts, ephemeris 1800–2100, retrogrades, BaZi, placement chapters</li>
      <li className="rounded-md border border-border p-4"><span className="block font-label">AI, credit-metered</span>Counselors, long readings, podcasts, artwork</li>
      <li className="rounded-md border border-border p-4"><span className="block font-label">Why it matters</span>Free users and demos never spend AI money</li>
    </ul>
  </section>;
}

export function LiveInspector() {
  const [run, setRun] = useState<{ results: AccuracyResult[]; ms: number } | null>(null);
  const go = () => { const t = performance.now(); const results = ACCURACY_CASES.map(checkCase); setRun({ results, ms: performance.now() - t }); };
  const points = run?.results.reduce((s, r) => s + r.rows.length, 0) ?? 0;
  const passed = run?.results.reduce((s, r) => s + r.passed, 0) ?? 0;
  return <section aria-labelledby="inv-inspector" className="space-y-4">
    <h2 id="inv-inspector" className="text-3xl">Check the calculations yourself</h2>
    <p className="max-w-3xl text-muted-foreground">This recalculates {ACCURACY_CASES.length} benchmark births right now, in your browser, and compares every point with Swiss Ephemeris reference values (tolerance {ACCURACY_TOLERANCE}°).</p>
    <Button onClick={go}>{run ? 'Run again' : 'Run the benchmark'}</Button>
    {run && <div className="ledger-paper space-y-2 rounded-md border border-border p-4 font-mono text-xs">
      <p className="text-sm">{passed} of {points} points within tolerance · measured time on this device: {run.ms.toFixed(0)} ms</p>
      <ul className="grid gap-1 sm:grid-cols-2">{run.results.map(r => <li key={r.c.id}>{r.c.date} · {r.c.place}: worst difference {fmtDiff(r.worst)}</li>)}</ul>
    </div>}
  </section>;
}

const AREA: Record<string, string> = { masterbook: 'April’s Masterbook', library: 'April’s source library', shane: 'Shane’s edition (corrected)', zac: 'Zac’s library (six volumes)' };
export function AssetRegister() {
  const [rows, setRows] = useState<{ area: string; chapters: number; words: number; checked_at: string }[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { supabase.rpc('investor_asset_counts').then(({ data, error }) => { if (error) setFailed(true); else setRows(data ?? []); }); }, []);
  return <section aria-labelledby="inv-assets" className="space-y-4">
    <h2 id="inv-assets" className="text-3xl">Founder content and artwork</h2>
    <p className="max-w-3xl text-muted-foreground">Counts come from the last founder audit, not typed in by hand. The text itself stays private.</p>
    {failed ? <p className="text-sm text-muted-foreground">Counts couldn’t be loaded for this account. <button className="underline" onClick={() => location.reload()}>Try again</button></p>
      : !rows ? <p className="text-sm text-muted-foreground">Loading counts…</p>
      : <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{rows.map(r => <li key={r.area} className="rounded-md border border-border p-4"><span className="block font-label">{AREA[r.area] ?? r.area}</span><span className="block font-display text-2xl">{r.chapters.toLocaleString()} chapters</span><span className="text-sm text-muted-foreground">{r.words.toLocaleString()} words</span></li>)}
        <li className="rounded-md border border-border p-4"><span className="block font-label">Atomic Zodiac comics</span><span className="text-sm text-muted-foreground">Original cover and interior artwork, owned by Zodaci</span></li></ul>}
    {rows?.[0] && <p className="text-xs text-muted-foreground">Audit dated {new Date(rows[0].checked_at).toLocaleDateString()}.</p>}
  </section>;
}

export function InvestmentCalculator() {
  const [amount, setAmount] = useState(500);
  const [pre, setPre] = useState(DEFAULT_PRE_MONEY);
  const valid = amount > 0 && pre > 0;
  const outcomes = useMemo(() => valid ? INVESTMENT_SCENARIOS.map(s => ({ s, o: investmentOutcome(amount, pre, s) })) : [], [amount, pre, valid]);
  return <section aria-labelledby="inv-calc" className="space-y-5">
    <div className="max-w-3xl"><p className="font-label text-xs tracking-[0.16em] text-primary">Illustration · not an offer</p><h2 id="inv-calc" className="mt-1 text-3xl sm:text-4xl">What a stake could look like</h2>
      <p className="mt-3 text-muted-foreground">From a $100 community stake to $50,000 and up. Every amount buys the same percentage per dollar, so the return multiple is the same at every size; only the dollar figures change.</p></div>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Investment amount">{INVESTMENT_AMOUNTS.map(a => <Button key={a} size="sm" variant={amount === a ? 'default' : 'outline'} onClick={() => setAmount(a)}>{usd(a)}{a === 50000 ? '+' : ''}</Button>)}</div>
    <div className="grid max-w-xl gap-4 sm:grid-cols-2">
      <div className="space-y-1"><Label htmlFor="inv-amt">Amount (USD)</Label><Input id="inv-amt" type="number" min={1} value={amount} onChange={e => setAmount(Number(e.target.value))} aria-invalid={amount <= 0} />{amount <= 0 && <p className="text-xs text-destructive">Enter an amount above $0.</p>}</div>
      <div className="space-y-1"><Label htmlFor="inv-pre">Valuation before investment (USD)</Label><p className="text-xs text-muted-foreground">Zodaci hasn’t launched or raised money, so there is no set valuation. $1,000,000 is a placeholder; change it to test other terms.</p><Input id="inv-pre" type="number" min={1} step={50000} value={pre} onChange={e => setPre(Number(e.target.value))} aria-invalid={pre <= 0} />{pre <= 0 && <p className="text-xs text-destructive">Enter a valuation above $0.</p>}</div>
    </div>
    {valid && <>
      <p className="text-sm">{tierFor(amount)} tier · {usd(amount)} buys {pct(outcomes[0].o.ownership)} of the company today.</p>
      <div className="grid gap-4 md:grid-cols-3">{outcomes.map(({ s, o }) => <article key={s.id} className="rounded-md border border-border p-5">
        <h3 className="font-label text-lg">{s.label}</h3>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between"><dt>Stake after later rounds</dt><dd>{pct(o.ownershipAtExit)}</dd></div>
          <div className="flex justify-between"><dt>Company sold for</dt><dd>{usd(o.exitValue)}</dd></div>
          <div className="flex justify-between font-medium"><dt>Your share</dt><dd>{usd(o.payout)}</dd></div>
          <div className="flex justify-between"><dt>Multiple</dt><dd>{o.multiple.toFixed(2)}×</dd></div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">{s.reasoning}</p>
      </article>)}</div>
    </>}
    <p className="text-xs text-muted-foreground">Hypothetical figures from the assumptions shown. Early-stage investments are illiquid, can take many years to pay out and often lose everything. Zodaci is not currently offering securities; any future offering would follow the applicable rules, including limits for non-accredited investors.</p>
  </section>;
}
