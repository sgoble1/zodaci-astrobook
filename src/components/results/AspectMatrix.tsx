import { useMemo, useState } from 'react';
import type { AspectHit, ChartResult } from '@/lib/astro';
import { aspectText, CORE_KEYS } from '@/lib/resultsEngine';

const TONE: Record<string, string> = { Conjunction: 'text-gold', Trine: 'text-primary', Sextile: 'text-primary', Square: 'text-destructive', Opposition: 'text-destructive' };

/** MOD-003: half-matrix of the ten planets (plus Ascendant/Midheaven with a birth time). Click a cell for its meaning. */
export function AspectMatrix({ chart }: { chart: ChartResult }) {
  const points = useMemo(() => {
    const p = chart.bodies.filter(b => CORE_KEYS.includes(b.key)).map(b => ({ name: b.name, glyph: b.glyph }));
    if (chart.asc != null) p.push({ name: 'Ascendant', glyph: 'AC' }, { name: 'Midheaven', glyph: 'MC' });
    return p;
  }, [chart]);
  const find = (a: string, b: string) => chart.aspects.find(x => (x.a === a && x.b === b) || (x.a === b && x.b === a));
  const [sel, setSel] = useState<AspectHit | null>(null);
  const [hover, setHover] = useState<[string, string] | null>(null);
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="border-collapse text-center text-xs" aria-label="Aspect grid">
          <thead><tr><th className="p-1" />{points.slice(0, -1).map(p => <th key={p.name} scope="col" className={`w-11 p-1 font-normal ${hover?.includes(p.name) ? 'text-gold' : 'text-muted-foreground'}`} title={p.name}>{p.glyph}</th>)}</tr></thead>
          <tbody>{points.slice(1).map((row, ri) => (
            <tr key={row.name}><th scope="row" className={`p-1 pr-2 text-right font-normal ${hover?.includes(row.name) ? 'text-gold' : 'text-muted-foreground'}`} title={row.name}>{row.glyph}</th>
              {points.slice(0, -1).map((col, ci) => {
                if (ci > ri) return <td key={col.name} />;
                const hit = find(row.name, col.name);
                return <td key={col.name} className="border border-border/60 p-0">
                  {hit ? <button type="button" onClick={() => setSel(hit)} onMouseEnter={() => setHover([row.name, col.name])} onMouseLeave={() => setHover(null)} onFocus={() => setHover([row.name, col.name])} onBlur={() => setHover(null)}
                    aria-label={`${hit.a} ${hit.type.toLowerCase()} ${hit.b}, ${hit.orb.toFixed(1)} degrees`} aria-pressed={sel === hit}
                    className={`h-11 w-11 transition-colors duration-500 hover:bg-primary/15 focus-visible:outline focus-visible:outline-2 ${sel === hit ? 'bg-primary/20' : ''}`}>
                    <span className={`block text-base leading-none ${TONE[hit.type] ?? ''}`}>{hit.symbol}</span><span className="text-[10px] text-muted-foreground">{hit.orb.toFixed(1)}°</span></button>
                    : <span className="block h-11 w-11" aria-hidden />}
                </td>;
              })}</tr>))}</tbody>
        </table>
      </div>
      <div aria-live="polite" className="min-h-16 rounded-lg border border-border bg-card p-4 text-sm">{sel ? <><p className="font-medium">{sel.a} {sel.symbol} {sel.b} · {sel.type} · {sel.orb.toFixed(2)}° from exact</p><p className="mt-1">{aspectText(sel, chart.bodies)}</p></> : <p className="text-muted-foreground">Select a symbol to read what that aspect means for you. Gold = conjunction, violet = flowing, red = tension.</p>}</div>
    </div>
  );
}
