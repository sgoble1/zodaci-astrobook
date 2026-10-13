import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { computeChart, fmtLon } from '@/lib/astro';
import { toChartInput, type MyBirth } from '@/lib/myBirth';

// Tropical ecliptic longitudes at J2000; precession (~50.3″/yr) is applied for the birth year.
const STARS: [string, number, string][] = [
  ['Algol', 56.17, 'intensity, facing fear, raw power'], ['Alcyone (Pleiades)', 60.0, 'vision, sorrow turned to insight'], ['Aldebaran', 69.78, 'integrity, success through honesty'],
  ['Rigel', 76.83, 'teaching, skill, rising through learning'], ['Betelgeuse', 88.75, 'lasting achievement, distinction'], ['Sirius', 104.08, 'brilliance, devotion, being seen'],
  ['Castor', 110.23, 'intellect, storytelling'], ['Pollux', 113.22, 'courage, sharp wit'], ['Procyon', 115.78, 'quick rise, act before it fades'],
  ['Regulus', 149.83, 'leadership, honour — beware revenge'], ['Spica', 203.83, 'gifts, talent, protection'], ['Arcturus', 204.23, 'new paths, pathfinding'],
  ['Antares', 249.77, 'intensity, all-or-nothing courage'], ['Vega', 285.32, 'charisma, artistry, magic'], ['Altair', 301.78, 'boldness, ambition'],
  ['Fomalhaut', 333.87, 'idealism, a dream kept pure'], ['Scheat', 359.37, 'free thinking, unusual minds'], ['Achernar', 345.30, 'success after the long road'],
];

export default function MemberStarMap({ birth }: { birth: MyBirth }) {
  const chart = useMemo(() => computeChart(toChartInput(birth)), [birth]);
  // Precess to the exact birth moment (years since J2000.0, from the birth UTC instant).
  const years = (chart.utc.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * 864e5);
  const yr = Number(birth.date.slice(0, 4));
  const stars = STARS.map(([n, lon, m]) => ({ n, m, lon: (lon + years * 50.29 / 3600 + 360) % 360 }));
  const points = [...chart.bodies, ...(chart.asc != null ? [{ key: 'asc', name: 'Ascendant', glyph: 'AC', lon: chart.asc }] : []), ...(chart.mc != null ? [{ key: 'mc', name: 'Midheaven', glyph: 'MC', lon: chart.mc }] : [])];
  const contacts = stars.flatMap(s => points.filter(b => { const d = Math.abs(((b.lon - s.lon + 540) % 360) - 180); return d <= 1.5; }).map(b => ({ s, b, orb: Math.abs(((b.lon - s.lon + 540) % 360) - 180) })));
  const [active, setActive] = useState<string | null>(contacts[0]?.s.n ?? null);
  const xy = (lon: number, r: number) => { const a = (180 - lon) * Math.PI / 180; return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]; };
  const sel = stars.find(s => s.n === active);
  return (
    <article className="space-y-8">
      <header><p className="font-smallcaps text-xs text-gold">Your sky</p><h1 className="font-display text-4xl">The fixed stars at your birth</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Bright, slow-moving stars sit along the zodiac like landmarks. When one of your planets lands within 1.5° of one, astrologers say that star "touches" your chart. Watch the sky align to your birth moment, then tap a star.</p></header>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
        <svg viewBox="0 0 100 100" className="w-full aspect-square rounded-full bg-card/40" role="img" aria-label="Sky map of fixed stars and your planets">
          <motion.circle cx="50" cy="50" r="47" fill="none" stroke="hsl(var(--gold) / 0.5)" strokeWidth="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3 }} />
          {Array.from({ length: 12 }).map((_, i) => { const [x, y] = xy(i * 30, 47); return <line key={i} x1="50" y1="50" x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth="0.1" />; })}
          {Array.from({ length: 80 }).map((_, i) => <motion.circle key={i} r="0.18" fill="hsl(var(--muted-foreground) / 0.6)" initial={{ cx: 50, cy: 50, opacity: 0 }} animate={{ cx: 50 + ((i * 37) % 90) - 45 * Math.cos(i), cy: 50 + ((i * 53) % 90) - 45 * Math.sin(i * 1.3), opacity: [0, 1, 0.5] }} transition={{ duration: 4, delay: i * 0.02 }} />)}
          {stars.map((s, i) => { const [x, y] = xy(s.lon, 40); const on = contacts.some(c => c.s.n === s.n); return (
            <motion.g key={s.n} initial={{ x: (i % 5 - 2) * 20, y: (i % 3 - 1) * 25, opacity: 0, rotate: 90 }} animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }} transition={{ duration: 3.5, delay: 0.5 + i * 0.08, ease: [0.22, 1, 0.36, 1] }} style={{ cursor: 'pointer' }} onClick={() => setActive(s.n)}>
              <circle cx={x} cy={y} r={on ? 1.6 : 0.9} fill={on ? 'hsl(var(--gold))' : 'hsl(var(--foreground) / 0.8)'} className={active === s.n ? 'animate-pulse' : ''} />
              <text x={x} y={y - 2} fontSize="2" textAnchor="middle" fill="hsl(var(--muted-foreground))">{s.n.split(' ')[0]}</text>
            </motion.g>); })}
          {chart.bodies.map((b, i) => { const [x, y] = xy(b.lon, 30); return <motion.text key={b.key} x={x} y={y} fontSize="3" textAnchor="middle" dominantBaseline="middle" fill="hsl(var(--primary))" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 3 + i * 0.1, duration: 0.8 }}>{b.glyph}</motion.text>; })}
        </svg>
        <div className="space-y-4">
          {sel && <div className="rounded-lg border border-gold/40 bg-card p-5"><h2 className="font-display text-2xl">{sel.n}</h2><p className="text-xs text-muted-foreground">{fmtLon(sel.lon).sign} {Math.floor(sel.lon % 30)}° (precessed to your exact birth moment)</p><p className="mt-2">Traditional meaning: {sel.m}.</p>
            {contacts.filter(c => c.s.n === sel.n).map(c => <p key={c.b.key} className="mt-2 text-sm"><strong>Touches your {c.b.name}</strong> ({c.orb.toFixed(2)}° away): {c.b.name}'s themes take on this star's flavour.</p>)}</div>}
          <h2 className="font-display text-xl">Your star contacts ({contacts.length})</h2>
          {contacts.length ? <ul className="space-y-2">{contacts.map(c => <li key={c.s.n + c.b.key}><button className="w-full rounded border border-border p-3 text-left hover:bg-muted" onClick={() => setActive(c.s.n)}>{c.b.glyph} {c.b.name} · {c.s.n} · {c.orb.toFixed(2)}°</button></li>)}</ul> : <p className="text-sm text-muted-foreground">None of your planets is within 1.5° of these major stars — your chart is read through its planets and houses alone.</p>}
          <p className="text-xs text-muted-foreground">Star positions are approximate (±0.1°). Fixed-star meanings are traditional lore, offered for reflection.</p>
        </div>
      </div>
    </article>
  );
}
