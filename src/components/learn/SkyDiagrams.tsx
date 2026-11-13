/** Hand-drawn style teaching diagrams rendered as SVG from fixed astronomy facts (no generated imagery). */
const C = 'currentColor', P = 'hsl(var(--primary))', A = 'hsl(var(--accent))', M = 'currentColor';
const pt = (r: number, deg: number) => [100 + r * Math.cos((deg - 90) * Math.PI / 180), 100 + r * Math.sin((deg - 90) * Math.PI / 180)];

const HOUSES = ['Self', 'Money', 'Talk', 'Home', 'Play', 'Work', 'Partners', 'Shared', 'Travel', 'Career', 'Friends', 'Retreat'];
function Houses() {
  return <svg viewBox="0 0 200 200" role="img" aria-label="The twelve houses arranged counter-clockwise from the Ascendant">
    <circle cx="100" cy="100" r="92" fill="none" stroke={C} strokeWidth="1.5" /><circle cx="100" cy="100" r="34" fill="none" stroke={M} />
    {HOUSES.map((h, i) => { const a = 270 - i * 30; const [x1, y1] = pt(34, a); const [x2, y2] = pt(92, a); const [tx, ty] = pt(64, a - 15); const [nx, ny] = pt(44, a - 15);
      return <g key={h}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 3 === 0 ? P : M} strokeWidth={i % 3 === 0 ? 1.6 : 0.8} /><text x={nx} y={ny} fontSize="8" fill={A} textAnchor="middle" dominantBaseline="middle">{i + 1}</text><text x={tx} y={ty} fontSize="7" fill={C} textAnchor="middle" dominantBaseline="middle">{h}</text></g>; })}
    <text x="4" y="104" fontSize="7" fill={P}>ASC</text>
  </svg>;
}
const ASPECTS = [{ n: 'Conjunction', d: 0, c: A }, { n: 'Sextile', d: 60, c: P }, { n: 'Square', d: 90, c: 'hsl(var(--destructive))' }, { n: 'Trine', d: 120, c: P }, { n: 'Opposition', d: 180, c: 'hsl(var(--destructive))' }];
function Aspects() {
  const [sx, sy] = pt(80, 0);
  return <svg viewBox="-20 0 250 200" role="img" aria-label="Major aspects measured from one planet: 0, 60, 90, 120 and 180 degrees">
    <circle cx="100" cy="100" r="80" fill="none" stroke={C} strokeWidth="1.5" />
    {ASPECTS.slice(1).map(a => { const [x, y] = pt(80, a.d); return <g key={a.n}><line x1={sx} y1={sy} x2={x} y2={y} stroke={a.c} strokeWidth="1.3" strokeDasharray={a.d === 60 ? '3 3' : undefined} /><circle cx={x} cy={y} r="4" fill={a.c} /><text x={x + (a.d === 180 ? 0 : 6)} y={y + (a.d === 180 ? 14 : 3)} fontSize="8" fill={C} textAnchor={a.d === 180 ? 'middle' : 'start'}>{a.n} {a.d}°</text></g>; })}
    <circle cx={sx} cy={sy} r="5" fill={A} /><text x={sx} y={sy - 9} fontSize="8" fill={C} textAnchor="middle">Planet</text>
  </svg>;
}
const ELEMENTS = [['Fire', 'Aries · Leo · Sagittarius'], ['Earth', 'Taurus · Virgo · Capricorn'], ['Air', 'Gemini · Libra · Aquarius'], ['Water', 'Cancer · Scorpio · Pisces']];
function Elements() {
  return <svg viewBox="0 0 200 200" role="img" aria-label="The four elements and their signs">
    {ELEMENTS.map(([e, s], i) => { const x = (i % 2) * 100, y = Math.floor(i / 2) * 100; return <g key={e}><rect x={x + 4} y={y + 4} width="92" height="92" rx="4" fill="none" stroke={i % 2 ? P : A} strokeWidth="1.4" /><text x={x + 50} y={y + 44} fontSize="14" fill={C} textAnchor="middle">{e}</text>{s.split(' · ').map((g, j) => <text key={g} x={x + 50} y={y + 60 + j * 9} fontSize="7" fill={M} textAnchor="middle">{g}</text>)}</g>; })}
  </svg>;
}
const PHASES = ['New', 'Crescent', 'First quarter', 'Gibbous', 'Full', 'Gibbous', 'Last quarter', 'Crescent'];
function Moon() {
  return <svg viewBox="0 0 200 200" role="img" aria-label="Eight phases of the lunar cycle around a 29.5-day clock">
    <circle cx="100" cy="100" r="70" fill="none" stroke={M} strokeDasharray="2 4" /><text x="100" y="98" fontSize="9" fill={C} textAnchor="middle">29.5 days</text><text x="100" y="110" fontSize="7" fill={M} textAnchor="middle">one cycle</text>
    {PHASES.map((p, i) => { const [x, y] = pt(70, i * 45); const lit = i / 8; const k = Math.cos(lit * 2 * Math.PI);
      return <g key={i}><circle cx={x} cy={y} r="10" fill="none" stroke={C} /><path d={`M ${x} ${y - 10} A 10 10 0 0 ${i < 4 ? 1 : 0} ${x} ${y + 10} A ${Math.abs(k) * 10} 10 0 0 ${(i < 4) === (k > 0) ? 0 : 1} ${x} ${y - 10}`} fill={i === 0 ? 'none' : A} /><text x={x} y={y + (y > 100 ? 20 : -14)} fontSize="6.5" fill={C} textAnchor="middle">{p}</text></g>; })}
  </svg>;
}

const ITEMS = [
  { t: 'The twelve houses', d: 'Houses run counter-clockwise from the Ascendant. Each covers one area of life.', V: Houses },
  { t: 'Major aspects', d: 'Aspects are angles between planets. Trines and sextiles flow; squares and oppositions press.', V: Aspects },
  { t: 'The four elements', d: 'Every sign belongs to one element, three signs each.', V: Elements },
  { t: 'The lunar cycle', d: 'The Moon passes through eight named phases in about 29.5 days.', V: Moon },
];
export function SkyDiagrams() {
  return <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{ITEMS.map(({ t, d, V }) => <li key={t} className="obs-paper flex flex-col gap-3 p-4"><div className="mx-auto w-full max-w-[220px] text-[hsl(var(--paper-ink))]"><V /></div><h3 className="font-display text-lg">{t}</h3><p className="text-sm leading-relaxed text-muted-foreground">{d}</p></li>)}</ul>;
}
