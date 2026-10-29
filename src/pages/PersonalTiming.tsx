import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as Astronomy from 'astronomy-engine';
import { computeChart, eclLon, houseOf, SIGNS, BODY_KEYWORDS, type ChartResult } from '@/lib/astro';
import { toChartInput, type MyBirth } from '@/lib/myBirth';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SIGN_RULER } from '@/lib/signRulers';

type Focus = 'transits' | 'retrogrades' | 'timeline' | 'profection';
const SLOW: [string, Astronomy.Body][] = [['Jupiter', Astronomy.Body.Jupiter], ['Saturn', Astronomy.Body.Saturn], ['Uranus', Astronomy.Body.Uranus], ['Neptune', Astronomy.Body.Neptune], ['Pluto', Astronomy.Body.Pluto]];
const RETRO: [string, Astronomy.Body][] = [['Mercury', Astronomy.Body.Mercury], ['Venus', Astronomy.Body.Venus], ['Mars', Astronomy.Body.Mars], ['Jupiter', Astronomy.Body.Jupiter], ['Saturn', Astronomy.Body.Saturn]];
const ASPECTS = [{ a: 0, n: 'conjunct', p: 'merges with and intensifies' }, { a: 60, n: 'sextile', p: 'opens easy chances around' }, { a: 90, n: 'square', p: 'puts pressure on, pushing change in' }, { a: 120, n: 'trine', p: 'supports and flows with' }, { a: 180, n: 'opposite', p: 'asks you to balance, through other people,' }];
const TRANSIT_MEANING: Record<string, string> = { Jupiter: 'growth, luck and widening horizons', Saturn: 'tests, structure and earned maturity', Uranus: 'sudden change, freedom and surprises', Neptune: 'dreams, sensitivity and fog', Pluto: 'deep transformation and power shifts' };
const ord = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
const sep = (a: number, b: number) => { const d = Math.abs(((a - b) % 360 + 360) % 360); return d > 180 ? 360 - d : d; };
const day = 86400000;
const fmtD = (d: Date) => d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const signOf = (lon: number) => SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30)];

function natalPoints(c: ChartResult) {
  const pts = c.bodies.filter(b => !/Fortune|Vertex|Lilith|South/.test(b.name)).map(b => ({ name: b.name, lon: b.lon, key: b.key }));
  if (c.asc != null) pts.push({ name: 'Ascendant', lon: c.asc, key: 'asc' });
  if (c.mc != null) pts.push({ name: 'Midheaven', lon: c.mc, key: 'mc' });
  return pts;
}

/** Real transits, retrogrades and life milestones calculated from the member's own chart. */
export default function PersonalTiming({ birth, focus }: { birth: MyBirth; focus: Focus }) {
  const data = useMemo(() => {
    const chart = computeChart(toChartInput(birth));
    const pts = natalPoints(chart);
    const now = new Date();
    const house = (lon: number) => chart.cusps ? houseOf(lon, chart.cusps) : null;
    // Current transits
    const current = SLOW.flatMap(([n, b]) => { const lon = eclLon(b, now); return pts.flatMap(p => ASPECTS.filter(x => Math.abs(sep(lon, p.lon) - x.a) <= 2).map(x => ({ t: n, lon, p, x, orb: Math.abs(sep(lon, p.lon) - x.a) }))); }).sort((a, b) => a.orb - b.orb);
    // Next 12 months of exact hits (within 1°), grouped into windows
    const windows: { t: string; p: string; x: typeof ASPECTS[number]; start: Date; end: Date }[] = [];
    for (const [n, b] of SLOW) for (const p of pts) for (const x of ASPECTS) {
      let open: Date | null = null;
      for (let i = 0; i <= 365; i += 2) {
        const d = new Date(now.getTime() + i * day); const hit = Math.abs(sep(eclLon(b, d), p.lon) - x.a) <= 1;
        if (hit && !open) open = d;
        if ((!hit || i >= 364) && open) { windows.push({ t: n, p: p.name, x, start: open, end: d }); open = null; }
      }
    }
    windows.sort((a, b) => a.start.getTime() - b.start.getTime());
    // Retrograde stations in the next 12 months
    const retro: { n: string; start: Date; end: Date | null; lon: number }[] = [];
    for (const [n, b] of RETRO) {
      let prev = eclLon(b, now); let r: { n: string; start: Date; end: Date | null; lon: number } | null = null;
      const startRetro = (() => { const a = eclLon(b, new Date(now.getTime() - day)); return ((prev - a + 540) % 360) - 180 < 0; })();
      if (startRetro) r = { n, start: now, end: null, lon: prev };
      for (let i = 1; i <= 400; i++) {
        const d = new Date(now.getTime() + i * day); const l = eclLon(b, d); const mv = ((l - prev + 540) % 360) - 180; prev = l;
        if (mv < 0 && !r) r = { n, start: d, end: null, lon: l };
        if (mv >= 0 && r) { r.end = d; retro.push(r); r = null; }
      }
      if (r) retro.push(r);
    }
    retro.sort((a, b) => a.start.getTime() - b.start.getTime());
    // Life milestones
    const born = chart.utc; const miles: { label: string; date: Date; plain: string }[] = [];
    const natal = (k: string) => chart.bodies.find(b => b.key === k)?.lon;
    const scan = (b: Astronomy.Body, target: number, ang: number, fromYrs: number, toYrs: number, label: string, plain: string) => {
      let prevOk = false;
      for (let t = born.getTime() + fromYrs * 365.25 * day; t < born.getTime() + toYrs * 365.25 * day; t += 3 * day) {
        const ok = Math.abs(sep(eclLon(b, new Date(t)), target) - ang) < 0.5;
        if (ok && !prevOk) { miles.push({ label, date: new Date(t), plain }); return; }
        prevOk = ok;
      }
    };
    const sat = natal('saturn'), jup = natal('jupiter'), ura = natal('uranus');
    if (sat != null) { scan(Astronomy.Body.Saturn, sat, 0, 27, 31, 'First Saturn return', 'A coming-of-age checkpoint: what you build now tends to last.'); scan(Astronomy.Body.Saturn, sat, 0, 56, 60, 'Second Saturn return', 'A review of your life’s structures and what you want to master next.'); scan(Astronomy.Body.Saturn, sat, 180, 13, 16, 'Saturn opposition (teen years)', 'An early test of independence.'); scan(Astronomy.Body.Saturn, sat, 180, 43, 46, 'Saturn opposition (mid-life)', 'A mid-point check on long-term goals.'); }
    if (jup != null) for (let k = 1; k <= 7; k++) scan(Astronomy.Body.Jupiter, jup, 0, k * 11.86 - 0.6, k * 11.86 + 0.6, `Jupiter return #${k}`, 'A roughly 12-year cycle of fresh growth and opportunity begins.');
    if (ura != null) { scan(Astronomy.Body.Uranus, ura, 180, 38, 44, 'Uranus opposition', 'The classic “mid-life awakening”: a push to live more authentically.'); scan(Astronomy.Body.Uranus, ura, 90, 19, 23, 'Uranus square', 'A restless urge to break away and find your own path.'); }
    miles.sort((a, b) => a.date.getTime() - b.date.getTime());
    // Profection
    const age = Math.floor((now.getTime() - born.getTime()) / (365.25 * day));
    const profHouse = (age % 12) + 1;
    const profSign = chart.asc != null ? SIGNS[(Math.floor(chart.asc / 30) + age) % 12] : null;
    return { chart, current, windows, retro, miles, age, profHouse, profSign, house, now };
  }, [birth]);
  const { current, windows, retro, miles, age, profHouse, profSign, house, now, chart } = data;
  const titles: Record<Focus, string> = { transits: 'Your Transits', retrogrades: 'Your Retrogrades', timeline: 'Your Personal Timeline', profection: 'Your Year Ahead (Profection)' };
  usePageMeta(`${titles[focus]} · Zodaci`, 'Transits, retrogrades, life milestones and this year’s focus, calculated from your own birth chart.');
  const lord = profSign ? chart.bodies.find(b => b.key === SIGN_RULER[profSign].traditional) : undefined;
  const lordTransits = lord ? windows.filter(w => w.p === lord.name) : [];
  const order: Focus[] = [focus, ...(['transits', 'retrogrades', 'timeline', 'profection'] as Focus[]).filter(f => f !== focus)];
  const sections: Record<Focus, JSX.Element> = {
    transits: (
      <section key="t" className="space-y-3">
        <h2 className="font-display text-2xl">What the sky is doing to your chart now</h2>
        <p className="text-sm text-muted-foreground">A transit is a planet moving through the sky today making an angle to a planet in your birth chart. Slow planets (Jupiter to Pluto) mark the big themes, lasting months.</p>
        {current.length ? <ul className="space-y-2">{current.map((c, i) => <li key={i} className="rounded-lg border border-border bg-card p-3 text-sm"><strong>{c.t} {c.x.n} your {c.p.name}</strong> <span className="text-muted-foreground">(orb {c.orb.toFixed(1)}°, transiting {signOf(c.lon)}{house(c.lon) ? `, your ${ord(house(c.lon)!)} house` : ''})</span><br />In plain words: {c.t}’s {TRANSIT_MEANING[c.t]} {c.x.p} your {BODY_KEYWORDS[c.p.key] ?? c.p.name.toLowerCase()}.</li>)}</ul> : <p className="text-sm">No slow planet is within 2° of your natal points today — a quieter background period.</p>}
        <h3 className="font-display text-xl pt-2">Exact hits in the next 12 months</h3>
        {windows.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th className="p-2">Dates</th><th className="p-2">Transit</th><th className="p-2">Meaning</th></tr></thead><tbody>{windows.map((w, i) => <tr key={i} className="border-t border-border"><td className="p-2 whitespace-nowrap">{fmtD(w.start)} – {fmtD(w.end)}</td><td className="p-2">{w.t} {w.x.n} {w.p}</td><td className="p-2">{TRANSIT_MEANING[w.t]} {w.x.p} your {w.p}</td></tr>)}</tbody></table></div> : <p className="text-sm">No exact slow-planet hits in the next year.</p>}
      </section>
    ),
    retrogrades: (
      <section key="r" className="space-y-3">
        <h2 className="font-display text-2xl">Retrogrades in the next year</h2>
        <p className="text-sm text-muted-foreground">“Retrograde” means a planet looks like it’s moving backwards from Earth. Traditionally it’s a time to review, redo and reflect on that planet’s area — and the house it falls in shows where in your life.</p>
        <ul className="space-y-2">{retro.map((r, i) => { const h = house(r.lon); return <li key={i} className="rounded-lg border border-border bg-card p-3 text-sm"><strong>{r.n} retrograde</strong> · {fmtD(r.start)} – {r.end ? fmtD(r.end) : 'beyond next year'} · in {signOf(r.lon)}{h ? `, your ${ord(h)} house` : ''}<br />In plain words: a time to revisit {BODY_KEYWORDS[r.n.toLowerCase()]}{h ? ` in your ${ord(h)}-house matters` : ''}.</li>; })}</ul>
        <p className="text-xs text-muted-foreground">Born with retrograde planets: {chart.bodies.filter(b => b.retro && !/Node/.test(b.name)).map(b => b.name).join(', ') || 'none'}.</p>
      </section>
    ),
    timeline: (
      <section key="l" className="space-y-3">
        <h2 className="font-display text-2xl">Your life milestones</h2>
        <p className="text-sm text-muted-foreground">Calculated dates when slow planets return to, or oppose, where they were at your birth. These are the classic turning points of a life.</p>
        <ol className="space-y-2 border-l border-border pl-4">{miles.map((m, i) => <li key={i} className={`text-sm ${m.date < now ? 'text-muted-foreground' : ''}`}><strong>{fmtD(m.date)}</strong> · {m.label} (age {Math.floor((m.date.getTime() - chart.utc.getTime()) / (365.25 * day))})<br />{m.plain}</li>)}</ol>
      </section>
    ),
    profection: (
      <section key="p" className="space-y-3">
        <h2 className="font-display text-2xl">This year’s focus</h2>
        <p className="text-sm text-muted-foreground">Annual profection is an old timing method: each birthday moves your focus one house forward around the chart.</p>
        <p className="rounded-lg border border-border bg-card p-4 text-sm">At age {age}, this is your <strong>{ord(profHouse)}-house year</strong>{profSign ? <> ({profSign}). The ruler of {profSign} is your “lord of the year” — watch its transits closely.</> : '. Add a birth time to see the sign and ruler.'}</p>
        {lord && <p className="text-sm">Your lord of the year is <Link to={`/planets/${lord.key}`} className="underline">{lord.name}</Link>, born in {lord.sign}{lord.house ? ` in your ${ord(lord.house)} house` : ''}. {lordTransits.length ? `Exact hits to it this year: ${lordTransits.map(w => `${w.t} ${w.x.n} (${fmtD(w.start)})`).join('; ')}.` : 'No slow planet makes an exact hit to it in the next 12 months.'}</p>}
      </section>
    ),
  };
  return (
    <article className="print-chart mx-auto max-w-4xl space-y-8">
      <header className="space-y-2"><div className="flex flex-wrap items-start justify-between gap-3"><h1 className="font-display text-4xl">{titles[focus]}</h1><Button type="button" variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-1.5 h-4 w-4" aria-hidden="true" />Print or save PDF</Button></div><p className="hidden text-sm print:block">{birth.displayName ? `${birth.displayName} · ` : ''}{birth.date}{birth.time ? ` ${birth.time}` : ''} · printed {fmtD(now)}</p><p className="text-muted-foreground">Calculated live from your birth chart ({birth.placeLabel}). <Link to="/my-readings/topic/timing" className="underline">Read your Key Years reading</Link>.</p>{!birth.time && <p className="text-sm text-destructive">No birth time saved, so houses are left out.</p>}</header>
      {order.map(f => sections[f])}
    </article>
  );
}
