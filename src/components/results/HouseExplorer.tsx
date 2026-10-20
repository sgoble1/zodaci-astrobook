import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SIGN_GLYPH, SIGNS, type ChartResult } from '@/lib/astro';
import { houseAnalysis, ordinal } from '@/lib/resultsEngine';

/** MOD-004: twelve-house accordion with cusp sign, planets inside, ruler and a plain-language reading. */
export function HouseExplorer({ chart }: { chart: ChartResult }) {
  const houses = useMemo(() => houseAnalysis(chart), [chart]);
  const [open, setOpen] = useState<number | null>(1);
  if (!houses.length) return <p className="rounded border border-border bg-muted/40 p-4 text-sm">Houses need an exact birth time. Add it in your birth details to unlock the House Explorer.</p>;
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
      {houses.map(h => (
        <li key={h.n} id={`house-${h.n}`}>
          <button type="button" aria-expanded={open === h.n} aria-controls={`house-${h.n}-panel`} onClick={() => setOpen(open === h.n ? null : h.n)}
            className="flex w-full items-center gap-3 p-4 text-left transition-colors duration-500 hover:bg-primary/5 focus-visible:outline focus-visible:outline-2">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-display ${[1, 4, 7, 10].includes(h.n) ? 'border-gold text-gold' : 'border-border'}`}>{h.n}</span>
            <span className="flex-1"><span className="font-medium">{ordinal(h.n)} house · {SIGN_GLYPH[SIGNS.indexOf(h.sign as typeof SIGNS[number])]} {h.sign}</span>
              <span className="block text-xs text-muted-foreground">{h.occupants.length ? h.occupants.map(o => `${o.glyph} ${o.name}`).join('  ') : 'No planets'} · ruled by {h.ruler}</span></span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-500 ${open === h.n ? 'rotate-180' : ''}`} aria-hidden />
          </button>
          {open === h.n && <div id={`house-${h.n}-panel`} className="px-4 pb-4 pl-16 text-sm leading-relaxed">
            <p>{h.text}</p>
            {h.rulerHouse && <button type="button" className="mt-2 text-primary underline underline-offset-4" onClick={() => { setOpen(h.rulerHouse); document.getElementById(`house-${h.rulerHouse}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>Follow the ruler to the {ordinal(h.rulerHouse)} house →</button>}
          </div>}
        </li>
      ))}
    </ul>
  );
}
