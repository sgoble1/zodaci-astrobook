import { useState } from 'react';
import { Link } from 'react-router-dom';
import { STAR_INFO, flyStars, annualCenter, DIR_NAME, KUA_DIRECTIONS, type Dir } from '@/content/fengshui';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';

// Compass order clockwise from South at the top (traditional Feng Shui orientation).
const RING: Exclude<Dir, 'C'>[] = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];

/** Circular annual flying-star chart that rotates as the year changes. */
export function FlyingStarWheel({ initialYear = new Date().getFullYear() }: { initialYear?: number }) {
  const [year, setYear] = useState(initialYear);
  const [sel, setSel] = useState<Dir>('C');
  const stars = flyStars(annualCenter(year));
  const spin = (year - 2024) * 40; // one sector's turn per year
  const info = STAR_INFO[stars[sel]];
  const kua = KUA_DIRECTIONS.find(k => k.dir === sel);
  const R = 150, cx = 170, cy = 170;
  const tone = (n: number) => STAR_INFO[n].nature === 'Auspicious' ? 'hsl(var(--gold))' : STAR_INFO[n].nature === 'Mixed' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--oxblood, 0 50% 35%))';

  return (
    <div className="grid md:grid-cols-[340px_1fr] gap-6 items-start">
      <div>
        <svg viewBox="0 0 340 340" className="w-full max-w-[340px]" role="img" aria-label={`Flying stars wheel for ${year}`}>
          <circle cx={cx} cy={cy} r={R + 12} fill="none" stroke="hsl(var(--gold))" strokeOpacity=".5" />
          <g style={{ transform: `rotate(${spin}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 2.4s cubic-bezier(.2,.7,.2,1)' }}>
            {RING.map((_, i) => { const a = (i * 45 - 90) * Math.PI / 180; return <line key={i} x1={cx} y1={cy} x2={cx + R * Math.cos(a + Math.PI / 8)} y2={cy + R * Math.sin(a + Math.PI / 8)} stroke="hsl(var(--border))" />; })}
          </g>
          {RING.map((d, i) => {
            const a = (i * 45 - 90) * Math.PI / 180; const x = cx + 105 * Math.cos(a), y = cy + 105 * Math.sin(a);
            const lx = cx + (R + 4) * Math.cos(a), ly = cy + (R + 4) * Math.sin(a);
            return (
              <g key={d} className="cursor-pointer" onClick={() => setSel(d)}>
                <circle cx={x} cy={y} r={sel === d ? 26 : 22} fill="hsl(var(--card))" stroke={tone(stars[d])} strokeWidth={sel === d ? 3 : 1.5} style={{ transition: 'all .6s' }} />
                <text x={x} y={y + 7} textAnchor="middle" className="font-display" fontSize="22" fill="hsl(var(--foreground))">{stars[d]}</text>
                <text x={lx} y={ly + 4} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">{d}</text>
              </g>
            );
          })}
          <g className="cursor-pointer" onClick={() => setSel('C')}>
            <circle cx={cx} cy={cy} r={sel === 'C' ? 34 : 30} fill="hsl(var(--card))" stroke={tone(stars.C)} strokeWidth={sel === 'C' ? 3 : 1.5} />
            <text x={cx} y={cy + 9} textAnchor="middle" fontSize="28" className="font-display" fill="hsl(var(--foreground))">{stars.C}</text>
          </g>
        </svg>
        <div className="flex items-center gap-2 mt-3 text-sm">
          <button className="border border-border rounded px-2" onClick={() => setYear(y => Math.max(2024, y - 1))} aria-label="Previous year">←</button>
          <input type="range" min={2024} max={2043} value={year} onChange={e => setYear(+e.target.value)} className="flex-1" aria-label="Year" />
          <button className="border border-border rounded px-2" onClick={() => setYear(y => Math.min(2043, y + 1))} aria-label="Next year">→</button>
          <span className="font-display text-lg w-12 text-right">{year}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">South at the top, as in classical charts. Years change at Lichun (~4 February).</p>
      </div>
      <div className="parchment p-4 space-y-2">
        <div className="font-smallcaps text-xs text-gold">{DIR_NAME[sel]} · {year}</div>
        <h3 className="font-display text-2xl">Star {info.n} — {info.name}</h3>
        <ConfidenceBadge level="derived" note="Calculated with the classical Lo Shu flight; the source PDFs don't include flying stars." />
        <p className="text-sm"><b>{info.nature}</b> · {info.element}. {info.theme}</p>
        <p className="text-sm"><b>Remedy:</b> {info.remedy}</p>
        {kua && <p className="text-sm"><b>April’s Kua 1:</b> {kua.name} — {kua.meaning}</p>}
        <div className="flex flex-wrap gap-3 text-xs pt-2">
          <Link className="underline" to={`/feng-shui/flying-stars?year=${year}&sector=${sel}`}>Full Flying Stars page</Link>
          <Link className="underline" to="/reading#fengshui">In the reading</Link>
          <Link className="underline" to="/masterbook/c-ff306540-17">Feng Shui guide · Section 18</Link>
        </div>
      </div>
    </div>
  );
}
