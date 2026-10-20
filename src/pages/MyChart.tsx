import { ChartSignatures } from '@/components/chart/ChartSignatures';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { computeChart, fmtLon, HOUSE_SYSTEMS, SIGN_KEYWORDS, type HouseSystem, type BodyPos } from '@/lib/astro';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toChartInput, useMyBirth } from '@/lib/myBirth';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { BoxArt } from '@/components/common/BoxArt';
import { Button } from '@/components/ui/button';
import { HouseRulers } from '@/components/chart/HouseRulers';

const BODY: Record<string, string> = { sun: 'your basic identity and sense of purpose', moon: 'your feelings, instincts and need for safety', mercury: 'how you think, learn and talk', venus: 'how you love and what you value', mars: 'how you act and go after what you want', jupiter: 'where confidence and opportunity grow', saturn: 'where effort, limits and maturity build', uranus: 'where you need freedom', neptune: 'where imagination and sensitivity live', pluto: 'where deep change happens', chiron: 'an old sore spot that can become a gift for helping others', northNode: 'qualities you are learning to grow into', southNode: 'familiar talents to use without getting stuck' };
const HOUSE_AREA = ['', 'self, body and first impressions', 'money, possessions and self-worth', 'thinking, siblings and your neighbourhood', 'home, family life and inner foundations', 'creativity, romance, play and children', 'daily routine, work habits and health', 'partners and one-to-one relationships', 'shared resources, intimacy and deep change', 'beliefs, study and travel', 'career, reputation and public life', 'friends, groups and hopes', 'rest, solitude and the hidden inner life'];
const TOPIC: Record<string, string> = { sun: 'big-three', moon: 'big-three', mercury: 'mind', venus: 'love', mars: 'sex-attraction', jupiter: 'money', saturn: 'obstacles', chiron: 'shadow-work', northNode: 'purpose', southNode: 'past-lives', pluto: 'shadow-work', neptune: 'spiritual-gifts', uranus: 'recurring-themes' };
const ASPECT: Record<string, string> = { Conjunction: 'These two act as one.', Opposition: 'These two pull opposite ways and need balance.', Square: 'Friction that turns into growth with practice.', Trine: 'These support each other easily.', Sextile: 'An opportunity when you choose to use it.' };

/** A member's own chart, calculated live from their saved birth details. */
export default function MyChart() {
  const birth = useMyBirth();
  const [hs, setHs] = useState<HouseSystem | null>(null);
  const [params] = useSearchParams();
  const [sel, setSel] = useState<BodyPos | null>(null);
  const deviceOnly = params.get('device') === '1';
  const chart = useMemo(() => birth ? computeChart({ ...toChartInput(birth), houseSystem: hs ?? birth.houseSystem }) : null, [birth, hs]);
  if (birth === undefined) return <p role="status">Loading your chart…</p>;
  if (!birth || !chart) return (
    <article className="mx-auto max-w-lg space-y-4 py-10 text-center">
      <h1 className="font-display text-3xl">You don't have a chart yet</h1>
      <p className="text-muted-foreground">Enter your birth date, time and place and we'll calculate it right away.</p>
      <Button asChild><Link to="/start">Create my chart</Link></Button>
    </article>
  );
  const big3 = [chart.bodies.find(b => b.key === 'sun'), chart.bodies.find(b => b.key === 'moon')].filter(Boolean);
  const rising = chart.asc != null ? fmtLon(chart.asc) : null;
  return (
    <article className="space-y-10">
      {deviceOnly && (
        <div role="note" className="rounded border border-gold/40 bg-card p-4 text-sm">
          Your chart is saved on this device only. <Link to="/auth" className="text-primary underline underline-offset-2">Create a free account</Link> to keep it safe, sync it everywhere and unlock your personal readings.
        </div>
      )}
      <header>
        <p className="font-smallcaps text-xs text-gold">{birth.name ? `${birth.name}'s chart` : 'Your chart'}</p>
        <h1 className="font-display mt-1 text-4xl">Your birth chart</h1>
        <p className="mt-2 text-muted-foreground">{birth.date}{birth.time ? ` · ${birth.time}` : ' · time unknown'} · {birth.placeLabel}</p>
        <p className="mt-3 text-lg">{big3.map(b => `${b!.name} in ${b!.sign}`).join(', ')}{rising ? `, ${rising.sign} rising` : ''}.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link to="/start">Edit birth details</Link></Button>
          <Button type="button" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden />Print</Button>
          {birth.time && <label className="flex items-center gap-2 text-sm">House system
            <select aria-label="House system" className="rounded border border-border bg-background px-2 py-1" value={hs ?? birth.houseSystem} onChange={e => setHs(e.target.value as HouseSystem)}>{HOUSE_SYSTEMS.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}</select></label>}
        </div>
        {!birth.time && <p className="mt-3 rounded border border-border bg-muted/40 p-3 text-sm">Without a birth time, your Rising sign and houses can't be known, so they're hidden. Planet signs are still accurate (the Moon may be off by a sign if it changed signs that day).</p>}
      </header>
      <ChartWheel r={chart} />
      <HouseRulers chart={chart} />
      <ChartSignatures chart={chart} timeKnown={!!birth.time} />
      <section aria-labelledby="pl"><h2 id="pl" className="font-display text-2xl">Your placements</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{chart.bodies.map(b => (
          <li key={b.key}><button type="button" onClick={() => setSel(b)} aria-label={`More about ${b.name} in ${b.sign}`} className="block h-full w-full overflow-hidden rounded border border-border bg-card text-left transition-all duration-500 hover:-translate-y-0.5 hover:border-primary/60 focus-visible:outline focus-visible:outline-2">
            <BoxArt seed={`${b.key}-${b.sign}`} label={b.name} className="h-16 w-full" />
            <div className="p-4"><h3 className="font-display text-lg">{b.glyph} {b.name} in {b.sign}</h3>
              <p className="text-xs text-muted-foreground">{b.deg}°{String(b.min).padStart(2, '0')}′{b.retro ? ' · retrograde' : ''}{b.house && birth.time ? ` · house ${b.house}` : ''}</p>
              <p className="mt-2 text-sm"><strong>In plain words:</strong> {b.name} shows {BODY[b.key] ?? 'one part of your life'}, expressed in a {b.sign} way.</p><p className="mt-2 text-xs text-primary">Tap for full details →</p></div>
          </button></li>))}</ul>
      </section>
      <section aria-labelledby="as"><h2 id="as" className="font-display text-2xl">Your strongest aspects</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">{[...chart.aspects].sort((a, b) => a.orb - b.orb).slice(0, 10).map((a, i) => (
          <li key={i} className="rounded border border-border bg-card p-4"><h3 className="font-medium"><TooltipProvider><Tooltip><TooltipTrigger className="underline decoration-dotted underline-offset-4">{a.a} {a.symbol} {a.b}</TooltipTrigger><TooltipContent className="max-w-xs">An aspect is an angle between two planets. {a.type}: {ASPECT[a.type] ?? ''} Smaller "from exact" numbers mean a stronger effect.</TooltipContent></Tooltip></TooltipProvider></h3><p className="text-xs text-muted-foreground">{a.type} · {a.orb.toFixed(2)}° from exact</p><p className="mt-1 text-sm">{ASPECT[a.type] ?? ''}</p></li>))}</ul>
      </section>
      <Dialog open={!!sel} onOpenChange={o => !o && setSel(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">{sel && (() => {
          const asp = chart.aspects.filter(a => a.a === sel.name || a.b === sel.name).sort((a, b) => a.orb - b.orb);
          const decan = Math.floor(sel.deg / 10) + 1;
          return <>
            <DialogHeader><DialogTitle className="font-display text-2xl">{sel.glyph} {sel.name} in {sel.sign}</DialogTitle><DialogDescription>{sel.deg}°{String(sel.min).padStart(2, '0')}′ {sel.sign}{sel.house && birth.time ? ` · house ${sel.house}` : ''}{sel.retro ? ' · retrograde' : ''}</DialogDescription></DialogHeader>
            <div className="space-y-4 text-sm">
              <section><h3 className="font-smallcaps text-xs text-gold">The planet</h3><p>{sel.name} represents {BODY[sel.key] ?? 'one part of your life'}.</p></section>
              <section><h3 className="font-smallcaps text-xs text-gold">The sign</h3><p>{sel.sign} colours it as {SIGN_KEYWORDS[sel.sign]}. At {sel.deg}° it sits in the {['first', 'second', 'third'][decan - 1]} third (decan) of the sign{sel.deg >= 29 ? ' — the final degree, often read as a theme of completion' : sel.deg < 1 ? ' — the very start of the sign, fresh and raw' : ''}.</p></section>
              {sel.house && birth.time ? <section><h3 className="font-smallcaps text-xs text-gold">The house</h3><p>House {sel.house} is about {HOUSE_AREA[sel.house]}. This is the area of life where {sel.name.toLowerCase()} energy shows up most.</p></section> : null}
              {sel.retro && <section><h3 className="font-smallcaps text-xs text-gold">Retrograde</h3><p>From Earth it appeared to move backwards when you were born. Traditionally this turns the planet's energy inward: more reflective, reworked and personal.</p></section>}
              <section><h3 className="font-smallcaps text-xs text-gold">Links to other planets ({asp.length})</h3>{asp.length ? <ul className="list-disc pl-5 space-y-1">{asp.map((a, i) => <li key={i}>{a.a} {a.type.toLowerCase()} {a.b} ({a.orb.toFixed(1)}°) — {ASPECT[a.type] ?? ''}</li>)}</ul> : <p>No major aspects within orb.</p>}</section>
              <section><h3 className="font-smallcaps text-xs text-gold">In plain words</h3><p>Your {BODY[sel.key] ?? sel.name} works in a {SIGN_KEYWORDS[sel.sign].split(', ').slice(0, 2).join(' and ')} way{sel.house && birth.time ? `, mostly through ${HOUSE_AREA[sel.house].split(',')[0]}` : ''}.</p></section>
              {TOPIC[sel.key] && <Button asChild size="sm"><Link to={`/my-readings/topic/${TOPIC[sel.key]}`}>Read the full chapter →</Link></Button>}
            </div>
          </>;
        })()}</DialogContent>
      </Dialog>
      <p className="text-xs text-muted-foreground">Positions are calculated from an astronomical ephemeris (astronomy-engine). Astrology meanings are for reflection, not scientific fact.</p>
    </article>
  );
}
