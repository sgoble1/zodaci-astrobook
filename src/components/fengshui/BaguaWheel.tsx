import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { KUA_DIRECTIONS, ROOMS, CRYSTALS, DIR_NAME, KUA_FOUNDATION, type Dir } from '@/content/fengshui';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';

const RING: Exclude<Dir, 'C'>[] = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];

/** Eight-direction Bagua wheel for April's Kua 1; spins in on load, each sector opens its meaning. */
export function BaguaWheel() {
  const [sel, setSel] = useState<Dir>('SE');
  const [spun, setSpun] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSpun(true), 50); return () => clearTimeout(t); }, []);
  const cx = 170, cy = 170, R = 150, r0 = 42;
  const kua = KUA_DIRECTIONS.find(k => k.dir === sel);
  const rooms = ROOMS.filter(r => r.dirs.includes(sel));
  const crystals = CRYSTALS.filter(c => c.dirs.includes(sel));
  const pt = (a: number, r: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

  return (
    <div className="grid md:grid-cols-[340px_1fr] gap-6 items-start">
      <svg viewBox="0 0 340 340" className="w-full max-w-[340px]" role="img" aria-label="Bagua wheel for Kua 1">
        <g style={{ transform: `rotate(${spun ? 0 : -270}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 3s cubic-bezier(.2,.7,.2,1)' }}>
          {RING.map((d, i) => {
            const a1 = (i * 45 - 90 - 22.5) * Math.PI / 180, a2 = a1 + Math.PI / 4, am = a1 + Math.PI / 8;
            const [x1, y1] = pt(a1, R), [x2, y2] = pt(a2, R), [x3, y3] = pt(a2, r0), [x4, y4] = pt(a1, r0);
            const k = KUA_DIRECTIONS.find(x => x.dir === d)!;
            const [tx, ty] = pt(am, 112), [nx, ny] = pt(am, 80);
            return (
              <g key={d} className="cursor-pointer" onClick={() => setSel(d)}>
                <path d={`M${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} L${x3},${y3} A${r0},${r0} 0 0 0 ${x4},${y4}Z`}
                  fill={k.auspicious ? 'hsl(var(--gold) / .18)' : 'hsl(var(--muted))'}
                  stroke={sel === d ? 'hsl(var(--gold))' : 'hsl(var(--border))'} strokeWidth={sel === d ? 3 : 1} />
                <text x={tx} y={ty + 4} textAnchor="middle" fontSize="13" className="font-display" fill="hsl(var(--foreground))">{d}</text>
                <text x={nx} y={ny + 3} textAnchor="middle" fontSize="8.5" fill="hsl(var(--muted-foreground))">{k.name}</text>
              </g>
            );
          })}
        </g>
        <g className="cursor-pointer" onClick={() => setSel('C')}>
          <circle cx={cx} cy={cy} r={r0 - 4} fill="hsl(var(--card))" stroke={sel === 'C' ? 'hsl(var(--gold))' : 'hsl(var(--border))'} strokeWidth={sel === 'C' ? 3 : 1} />
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize="12" className="font-display" fill="hsl(var(--foreground))">Kua 1</text>
        </g>
      </svg>
      <div className="parchment p-4 space-y-2">
        <div className="font-smallcaps text-xs text-gold">{DIR_NAME[sel]}</div>
        {kua ? <>
          <h3 className="font-display text-2xl">{kua.name} — {kua.meaning}</h3>
          <ConfidenceBadge level={kua.standardNote ? 'ambiguous' : 'high'} note={kua.standardNote ?? 'Quoted from the 18A direction table.'} />
          <p className="text-sm">{kua.activation}</p>
        </> : <>
          <h3 className="font-display text-2xl">Center · Kua 1 (Water)</h3>
          <p className="text-sm">{typeof KUA_FOUNDATION === 'object' ? Object.values(KUA_FOUNDATION).filter(v => typeof v === 'string').slice(0, 2).join(' ') : ''}</p>
        </>}
        {rooms.length > 0 && <div className="text-sm"><b>Rooms:</b> {rooms.map(r => r.name).join(', ')}</div>}
        {crystals.length > 0 && <div className="text-sm"><b>Crystals:</b> {crystals.map(c => c.name).join(', ')}</div>}
        <p className="text-[11px] text-muted-foreground">Source: Complete Birth Chart Analysis & Feng Shui Guide · Section 18A, pp. 115–116</p>
        <div className="flex flex-wrap gap-3 text-xs pt-2">
          <Link className="underline" to={`/feng-shui/bagua#${sel}`}>Full Bagua & Home page</Link>
          <Link className="underline" to="/reading#fengshui">In the reading</Link>
          <Link className="underline" to="/masterbook/pdf/d-ff306540?page=115">PDF page 115</Link>
        </div>
      </div>
    </div>
  );
}
