import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ChartResult } from '@/lib/astro';
import type { Tone } from '@/lib/perception';
import { transitsTo } from '@/lib/transitOverlay';

export default function DemoTiming({ chart, tone }: { chart: ChartResult; tone: Tone }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selected, setSelected] = useState(0);
  const result = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const instant = new Date(`${date}T12:00:00Z`);
    if (!Number.isFinite(instant.getTime())) return null;
    try { return transitsTo(chart, instant); } catch { return null; }
  }, [chart, date]);
  const hit = result?.[selected] ?? result?.[0];
  const body = hit ? chart.bodies.find(b => b.key === hit.natalKey) : null;
  return <section className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><h2 className="text-2xl">Daily transits · Rosalind</h2><label className="space-y-1 text-sm">Date · 12:00 UTC<Input aria-label="Transit date" type="date" value={date} min="1900-01-01" max="2100-12-31" onChange={e => { setDate(e.target.value); setSelected(0); }} /></label></div>
    <p className="text-sm text-muted-foreground">Calculated sky-to-natal contacts for the selected day. The birth chart stays the same.</p>
    {!result ? <p role="alert">Choose a valid date to calculate transits. No sample positions are substituted.</p> : !result.length ? <p>No major contacts within the transit orbs on this date. Choose another day.</p> : <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <ul className="space-y-2">{result.map((h, i) => <li key={`${h.transit.key}-${h.natalKey}-${h.type}`}><Button variant={hit === h ? 'default' : 'outline'} aria-pressed={hit === h} onClick={() => setSelected(i)} className="h-auto min-h-11 w-full justify-start whitespace-normal py-3 text-left">{h.transit.name} {h.symbol} natal {h.natalName} · {h.orb.toFixed(2)}°</Button></li>)}</ul>
      {hit && <article aria-live="polite" className="space-y-4 border-t border-border pt-4"><h3 className="text-xl">{hit.transit.name} {hit.type.toLowerCase()} natal {hit.natalName}</h3><p className="text-sm text-primary">{hit.transit.sign} {hit.transit.deg}° · {hit.applying ? 'Applying' : 'Separating'}{hit.transit.retro ? ' · Transit retrograde' : ''}</p><p className="leading-relaxed">{tone === 'professional' ? `Contact: ${hit.transit.name}–${hit.natalName}; ${hit.type.toLowerCase()}, orb ${hit.orb.toFixed(2)}°. ${body ? `Natal target: ${body.sign}, house ${body.house}. ` : ''}Interpretive theme: ${hit.text.replace(/\byour\b/g, 'the native’s')}` : tone === 'educational' ? `${hit.text} ${body ? `The target is not just a planet label: Rosalind’s ${body.name} is in ${body.sign}, house ${body.house}. ` : ''}Applying means the orb is smaller tomorrow; separating means it is widening. This is geometry, not a forecast of events.` : `${hit.text} ${body ? `For you, that contact reaches ${body.name} in ${body.sign}, in house ${body.house}—so read it alongside the natal chapter, not as a stand-alone prediction. ` : ''}What needs your attention today, and what can wait?`}</p><p className="text-xs text-muted-foreground">Interpretation, not certainty about an event or feeling.</p></article>}
    </div>}
  </section>;
}