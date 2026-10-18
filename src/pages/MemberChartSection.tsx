import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { computeChart, fmtLon, SIGN_KEYWORDS } from '@/lib/astro';
import { toChartInput, type MyBirth } from '@/lib/myBirth';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { BoxArt } from '@/components/common/BoxArt';
import { Button } from '@/components/ui/button';

export type ChartFocus = 'planets' | 'houses' | 'aspects' | 'elements' | 'calculator';
const HOUSE_AREA = ['', 'self, body and first impressions', 'money, possessions and self-worth', 'thinking, siblings and your neighbourhood', 'home, family life and inner foundations', 'creativity, romance, play and children', 'daily routine, work habits and health', 'partners and one-to-one relationships', 'shared resources, intimacy and deep change', 'beliefs, study and travel', 'career, reputation and public life', 'friends, groups and hopes', 'rest, solitude and the hidden inner life'];
const ASPECT: Record<string, string> = { Conjunction: 'These two act as one — their energies blend.', Opposition: 'These two pull opposite ways; balance is the skill.', Square: 'Friction that turns into growth with practice.', Trine: 'These support each other easily — a natural talent.', Sextile: 'An opportunity that opens when you choose to use it.' };
const TITLES: Record<ChartFocus, [string, string]> = {
  planets: ['Your planets', 'Each planet is one part of you; its sign shows the style and its house shows the life area.'],
  houses: ['Your houses', 'The twelve houses are life areas. The sign on each house shows how you approach that area, and planets inside it make it busier.'],
  aspects: ['Your aspects', 'Aspects are angles between planets. They show which parts of you cooperate and which ones need negotiating. Smaller orb = stronger.'],
  elements: ['Your elements & balance', 'How your planets spread across fire, earth, air and water — what comes naturally and what you may need to borrow.'],
  calculator: ['Your calculation details', 'The exact numbers behind your chart, worked out from your saved birth details.'],
};
// Use a stable SIGN keyword lookup even if some signs are missing.
const kw = (s: string) => (SIGN_KEYWORDS as Record<string, string | string[]>)[s];
const kwText = (s: string) => { const k = kw(s); return Array.isArray(k) ? k.join(', ') : k ?? ''; };

/** Dedicated chart breakdown pages for members, calculated from their own saved birth details. */
export default function MemberChartSection({ birth, focus }: { birth: MyBirth; focus: ChartFocus }) {
  const chart = useMemo(() => computeChart({ ...toChartInput(birth), houseSystem: birth.houseSystem }), [birth]);
  const [title, intro] = TITLES[focus];
  const hasTime = !!birth.time && chart.cusps;
  return (
    <article className="space-y-8">
      <header>
        <p className="font-smallcaps text-xs text-gold">{birth.date}{birth.time ? ` · ${birth.time}` : ' · time unknown'} · {birth.placeLabel}</p>
        <h1 className="font-display mt-1 text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{intro}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">{(Object.keys(TITLES) as ChartFocus[]).map(k => <Link key={k} to={k === 'calculator' ? '/chart-calculator' : k === 'elements' ? '/chart-elements' : `/${k}`} className={`rounded-full border px-3 py-1 ${k === focus ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}`}>{TITLES[k][0].replace('Your ', '')}</Link>)}<Link to="/my-chart" className="rounded-full border border-border px-3 py-1 hover:bg-muted">Full chart</Link></div>
      </header>

      {focus === 'planets' && <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{chart.bodies.map(b => (
        <li key={b.key} className="overflow-hidden rounded border border-border bg-card">
          <BoxArt seed={`${b.key}-${b.sign}-${b.deg}`} label={b.name} className="h-16 w-full" />
          <div className="space-y-1 p-4 text-sm"><h2 className="font-display text-lg">{b.glyph} {b.name} in {b.sign}</h2>
            <p className="text-muted-foreground">{b.deg}°{String(b.min).padStart(2, '0')}′{hasTime && b.house ? ` · house ${b.house}` : ''}{b.retro ? ' · retrograde' : ''}</p>
            <p>Style: {kwText(b.sign)}.</p>
            {hasTime && b.house && <p>Life area: {HOUSE_AREA[b.house]}.</p>}
            {b.retro && <p className="text-muted-foreground">Retrograde: this energy tends to work inwardly first — reflect before acting.</p>}
          </div></li>))}</ul>}

      {focus === 'houses' && (hasTime ? <ol className="grid gap-3 sm:grid-cols-2">{chart.cusps!.map((c, i) => { const s = fmtLon(c); const inside = chart.bodies.filter(b => b.house === i + 1); return (
        <li key={i} className="rounded border border-border bg-card p-4 text-sm"><h2 className="font-display text-lg">House {i + 1} · {s.sign} {s.deg}°</h2>
          <p className="text-muted-foreground">{HOUSE_AREA[i + 1]}</p>
          <p className="mt-1">You approach this area with {s.sign} style: {kwText(s.sign)}.</p>
          <p className="mt-1">{inside.length ? `Planets here: ${inside.map(b => b.name).join(', ')} — this area is a focus in your life.` : 'No planets here — this area runs mostly through its ruling sign.'}</p></li>); })}</ol>
        : <p className="rounded border border-border bg-muted/40 p-4 text-sm">Houses need a birth time. <Link className="underline" to="/start">Add your birth time</Link> to see them.</p>)}

      {focus === 'aspects' && <ul className="space-y-3">{[...chart.aspects].sort((x, y) => x.orb - y.orb).map((a, i) => (
        <li key={i} className="rounded border border-border bg-card p-4 text-sm"><h2 className="font-display text-lg">{a.a} {a.symbol} {a.b} <span className="text-sm text-muted-foreground">· {a.type}, orb {a.orb.toFixed(1)}°{a.applying ? ', applying' : ''}</span></h2>
          <p className="mt-1">{ASPECT[a.type] ?? 'A minor link between these two parts of you.'}</p></li>))}
        {!chart.aspects.length && <li className="text-sm text-muted-foreground">No major aspects found.</li>}</ul>}

      {focus === 'elements' && <><ul className="grid gap-3 sm:grid-cols-4">{Object.entries(chart.elements).map(([el, n]) => (
        <li key={el} className="vellum flex flex-col items-center p-4 text-center"><ThemeArt label={el} badge={n} /><div className="mt-3 font-smallcaps text-xs text-gold">{el}</div></li>))}</ul>
        <p className="text-sm text-muted-foreground">The highest count is what comes naturally; an element with 0–1 is something you may consciously build through habits, people or places.</p><ChartWheel r={chart} /></>}

      {focus === 'calculator' && <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left"><th className="p-2">Point</th><th className="p-2">Position</th><th className="p-2">Longitude</th>{hasTime && <th className="p-2">House</th>}</tr></thead>
        <tbody>{chart.bodies.map(b => <tr key={b.key} className="border-t border-border"><td className="p-2">{b.glyph} {b.name}</td><td className="p-2">{b.sign} {b.deg}°{String(b.min).padStart(2, '0')}′{b.retro ? ' ℞' : ''}</td><td className="p-2">{b.lon.toFixed(2)}°</td>{hasTime && <td className="p-2">{b.house ?? '—'}</td>}</tr>)}
          {chart.asc != null && <tr className="border-t border-border"><td className="p-2">Ascendant</td><td className="p-2">{fmtLon(chart.asc).text}</td><td className="p-2">{chart.asc.toFixed(2)}°</td>{hasTime && <td className="p-2">1</td>}</tr>}
          {chart.mc != null && <tr className="border-t border-border"><td className="p-2">Midheaven</td><td className="p-2">{fmtLon(chart.mc).text}</td><td className="p-2">{chart.mc.toFixed(2)}°</td>{hasTime && <td className="p-2">10</td>}</tr>}</tbody></table>
        <p className="mt-3 text-xs text-muted-foreground">UTC {chart.utc.toISOString().replace('T', ' ').slice(0, 16)} · offset {chart.utcOffsetMin / 60}h · house system {birth.houseSystem}. Calculated with astronomical data.</p></div>}

      <Button asChild variant="outline"><Link to="/my-readings">Read your full readings</Link></Button>
    </article>
  );
}
