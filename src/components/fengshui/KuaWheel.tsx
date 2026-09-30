import { useEffect, useState } from 'react';
import { DIR_NAME, type Dir } from '@/content/fengshui';
import { KUA_TABLE, KUA_ELEMENT, MANSION_INFO, groupOf, type Mansion } from '@/lib/kua';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';

const RING: Exclude<Dir, 'C'>[] = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];

/** Bagua wheel for any Kua number, using the standard Eight Mansions table. */
export function KuaWheel({ kua, label }: { kua: number; label?: string }) {
  const [sel, setSel] = useState<Exclude<Dir, 'C'>>(KUA_TABLE[kua]['Sheng Chi']);
  const [spun, setSpun] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSpun(true), 50); return () => clearTimeout(t); }, []);
  const byDir = Object.fromEntries((Object.entries(KUA_TABLE[kua]) as [Mansion, string][]).map(([m, d]) => [d, m])) as Record<string, Mansion>;
  const cx = 170, cy = 170, R = 150, r0 = 42;
  const pt = (a: number, r: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const m = byDir[sel]; const info = MANSION_INFO[m];
  return (
    <div className="grid md:grid-cols-[340px_1fr] gap-6 items-start">
      <svg viewBox="0 0 340 340" className="w-full max-w-[340px]" role="img" aria-label={`Bagua wheel for Kua ${kua}`}>
        <g style={{ transform: `rotate(${spun ? 0 : -270}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 3s cubic-bezier(.2,.7,.2,1)' }}>
          {RING.map((d, i) => {
            const a1 = (i * 45 - 90 - 22.5) * Math.PI / 180, a2 = a1 + Math.PI / 4, am = a1 + Math.PI / 8;
            const [x1, y1] = pt(a1, R), [x2, y2] = pt(a2, R), [x3, y3] = pt(a2, r0), [x4, y4] = pt(a1, r0);
            const mm = byDir[d]; const good = MANSION_INFO[mm].good;
            const [tx, ty] = pt(am, 112), [nx, ny] = pt(am, 80);
            return (
              <g key={d} className="cursor-pointer" onClick={() => setSel(d)}>
                <path d={`M${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} L${x3},${y3} A${r0},${r0} 0 0 0 ${x4},${y4}Z`}
                  fill={good ? 'hsl(var(--gold) / .18)' : 'hsl(var(--muted))'}
                  stroke={sel === d ? 'hsl(var(--gold))' : 'hsl(var(--border))'} strokeWidth={sel === d ? 3 : 1} />
                <text x={tx} y={ty + 4} textAnchor="middle" fontSize="13" className="font-display" fill="hsl(var(--foreground))">{d}</text>
                <text x={nx} y={ny + 3} textAnchor="middle" fontSize="8.5" fill="hsl(var(--muted-foreground))">{mm}</text>
              </g>
            );
          })}
        </g>
        <circle cx={cx} cy={cy} r={r0 - 4} fill="hsl(var(--card))" stroke="hsl(var(--border))" />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="12" className="font-display" fill="hsl(var(--foreground))">Kua {kua}</text>
      </svg>
      <div className="parchment p-4 space-y-2">
        <div className="font-smallcaps text-xs text-gold">{label ? `${label} · ` : ''}Kua {kua} · {KUA_ELEMENT[kua]} · {groupOf(kua)} group</div>
        <h3 className="font-display text-2xl">{DIR_NAME[sel]} — {m}</h3>
        <p className="font-display">{info.meaning} {info.good ? '(auspicious)' : '(inauspicious)'}</p>
        <p className="text-sm">{info.use}</p>
        <ConfidenceBadge level="derived" note="Standard Eight Mansions table; not quoted from the source PDFs." />
      </div>
    </div>
  );
}
