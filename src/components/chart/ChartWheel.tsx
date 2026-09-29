import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SIGNS, SIGN_GLYPH, SIGN_KEYWORDS, BODY_KEYWORDS, fmtLon, type ChartResult } from '@/lib/astro';
import { FIXED_STARS, type SourceRef } from '@/content/compendium';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { Cite } from '@/components/common/Cite';
import type { ConfidenceLevel } from '@/content/confidence';

const CALC: SourceRef = { doc: 'Calculated in the app', section: 'astronomy-engine ephemeris · Porphyry houses' };
const BAZI_SRC: SourceRef = { doc: 'Calculated in the app', section: 'Four Pillars — solar terms & sexagenary cycle' };

/** Parse "Libra 24°08′" style longitudes from the Compendium into ecliptic degrees. */
const parseLon = (s: string) => {
  const m = s.match(/(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\s*~?(\d+)°(?:(\d+)′)?/);
  return m ? SIGNS.indexOf(m[1] as typeof SIGNS[number]) * 30 + +m[2] + (m[3] ? +m[3] / 60 : 0) : null;
};
const sep = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

/** Fixed stars from the Compendium within `orb` degrees of any computed body or angle. */
export function starContacts(r: ChartResult, orb = 1.5) {
  const pts = [...r.bodies.map(b => ({ name: b.name, lon: b.lon })), ...(r.asc != null ? [{ name: 'Ascendant', lon: r.asc }, { name: 'Midheaven', lon: r.mc! }] : [])];
  const out: { star: typeof FIXED_STARS[number]; point: string; orb: number }[] = [];
  FIXED_STARS.forEach(s => { const l = parseLon(s.degree); if (l == null) return; pts.forEach(p => { const o = sep(l, p.lon); if (o <= orb) out.push({ star: s, point: p.name, orb: o }); }); });
  return out.sort((a, b) => a.orb - b.orb);
}

type Sel = { kind: 'body' | 'angle' | 'aspect' | 'pillar' | 'sign' | 'star'; id: string } | null;
const ASPECT_TONE: Record<string, string> = { Conjunction: 'hsl(var(--gold))', Trine: 'hsl(var(--primary))', Sextile: 'hsl(var(--primary))', Square: 'hsl(var(--oxblood, var(--destructive)))', Opposition: 'hsl(var(--oxblood, var(--destructive)))' };

/**
 * Computed natal wheel: zodiac ring, houses, planets, aspect lines and an outer Ba Zi ring.
 * Every element is clickable and opens a detail panel with its confidence badge and source citation.
 */
export function ChartWheel({ r, sourcesFor }: { r: ChartResult; sourcesFor?: (key: string) => { label: string; href: string }[] }) {
  const [sel, setSel] = useState<Sel>(null);
  const [spun, setSpun] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSpun(true), 50); return () => clearTimeout(t); }, [r]);
  const asc = r.asc ?? 0;
  const S = 440, C = S / 2;
  // Place the Ascendant on the left (9 o'clock), zodiac running counter-clockwise.
  const ang = (lon: number) => (180 + (lon - asc)) * Math.PI / 180;
  const xy = (lon: number, rad: number) => [C + rad * Math.cos(ang(lon)), C - rad * Math.sin(ang(lon))] as const;
  const stars = useMemo(() => starContacts(r), [r]);

  // Spread glyphs that sit close together.
  const placed = useMemo(() => {
    const sorted = [...r.bodies].sort((a, b) => a.lon - b.lon); const out: { b: typeof r.bodies[number]; shown: number }[] = [];
    sorted.forEach(b => { let shown = b.lon; const prev = out[out.length - 1]; if (prev && shown - prev.shown < 6) shown = prev.shown + 6; out.push({ b, shown }); });
    return out;
  }, [r]);

  const detail = (() => {
    if (!sel) return null;
    if (sel.kind === 'body') {
      const b = r.bodies.find(x => x.key === sel.id)!; const extra = sourcesFor?.(b.key) ?? [];
      return { title: `${b.glyph} ${b.name} in ${b.sign}`, sub: `${b.deg}°${String(b.min).padStart(2, '0')}′${b.retro && !b.key.includes('Node') ? ' retrograde' : ''}${b.house ? ` · house ${b.house}` : ''}`, body: `${BODY_KEYWORDS[b.key]} expressed through ${b.sign}: ${SIGN_KEYWORDS[b.sign]}.`, level: b.confidence, note: b.note ?? 'Calculated from the ephemeris.', src: CALC, links: [...extra, ...stars.filter(s => s.point === b.name).map(s => ({ label: `★ ${s.star.name} (${s.orb.toFixed(1)}°)`, href: `/compendium#${s.star.id}` })), ...r.aspects.filter(a => a.a === b.name || a.b === b.name).slice(0, 6).map(a => ({ label: `${a.a} ${a.symbol} ${a.b}`, href: '' }))] };
    }
    if (sel.kind === 'angle') { const l = sel.id === 'Ascendant' ? r.asc! : r.mc!; return { title: sel.id, sub: fmtLon(l).text, body: `${sel.id === 'Ascendant' ? 'How you meet the world' : 'Public direction and vocation'}: ${SIGN_KEYWORDS[fmtLon(l).sign]}.`, level: (r.input.time ? 'derived' : 'ambiguous') as ConfidenceLevel, note: 'Angles move about 1° every 4 minutes of birth time.', src: CALC, links: sourcesFor?.(sel.id === 'Ascendant' ? 'asc' : 'mc') ?? [] }; }
    if (sel.kind === 'aspect') { const a = r.aspects[+sel.id]; return { title: `${a.a} ${a.symbol} ${a.b}`, sub: `${a.type} · ${a.orb.toFixed(2)}° orb · ${a.applying ? 'applying' : 'separating'}`, body: `A ${a.type.toLowerCase()} links ${a.a} and ${a.b}. The smaller the orb, the stronger the link.`, level: 'derived' as ConfidenceLevel, note: 'Angle between two calculated longitudes.', src: CALC, links: [] }; }
    if (sel.kind === 'pillar') { const p = r.bazi.find(x => x.label === sel.id)!; return { title: `${p.label} pillar · ${p.stem}${p.branch}`, sub: `${p.romanized} · ${p.polarity} ${p.stemElement} ${p.animal}`, body: `${p.note} Heavenly stem ${p.stemElement}, earthly branch ${p.branchElement} (${p.animal}).`, level: p.confidence, note: p.note, src: BAZI_SRC, links: [{ label: 'Chinese astrology page', href: '/chinese' }] }; }
    if (sel.kind === 'star') { const s = stars[+sel.id]; return { title: `★ ${s.star.name}`, sub: `${s.star.degree} · conjunct ${s.point} (${s.orb.toFixed(2)}°)`, body: s.star.meaning, level: 'derived' as ConfidenceLevel, note: 'Star degree from the Compendium; contact found by comparing with the calculated position.', src: s.star.source, links: [{ label: 'Open full entry', href: `/compendium#${s.star.id}` }, { label: 'On the star map', href: `/star-map#${s.star.id}` }] }; }
    const i = +sel.id; return { title: `${SIGN_GLYPH[i]} ${SIGNS[i]}`, sub: `${i * 30}°–${i * 30 + 30}° ecliptic`, body: SIGN_KEYWORDS[SIGNS[i]], level: 'confirmed' as ConfidenceLevel, note: 'Tropical zodiac boundaries.', src: CALC, links: [] };
  })();

  const is = (k: Sel) => sel?.kind === k?.kind && sel?.id === k?.id;
  return (
    <div className="grid lg:grid-cols-[minmax(0,460px)_1fr] gap-6 items-start">
      <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[460px] mx-auto" role="img" aria-label="Natal chart wheel">
        <g style={{ transform: `rotate(${spun ? 0 : -120}deg)`, transformOrigin: 'center', transition: 'transform 3.5s cubic-bezier(.2,.7,.2,1)' }}>
          {/* Ba Zi outer ring */}
          {r.bazi.map((p, i) => { const a0 = (i * 90 - 45) * Math.PI / 180; const x = C + 207 * Math.cos(a0 - Math.PI / 2 + Math.PI / 4), y = C + 207 * Math.sin(a0 - Math.PI / 2 + Math.PI / 4);
            return <g key={p.label} className="cursor-pointer" onClick={() => setSel({ kind: 'pillar', id: p.label })}><circle cx={x} cy={y} r={16} fill={is({ kind: 'pillar', id: p.label }) ? 'hsl(var(--gold) / .35)' : 'hsl(var(--card))'} stroke="hsl(var(--gold))" /><text x={x} y={y + 5} textAnchor="middle" fontSize="13" fill="hsl(var(--foreground))">{p.stem}{p.branch}</text><title>{p.label} pillar {p.romanized}</title></g>; })}
          <circle cx={C} cy={C} r={185} fill="none" stroke="hsl(var(--gold))" />
          <circle cx={C} cy={C} r={155} fill="none" stroke="hsl(var(--gold) / .6)" />
          <circle cx={C} cy={C} r={95} fill="none" stroke="hsl(var(--border))" />
          {SIGNS.map((s, i) => { const [x1, y1] = xy(i * 30, 155), [x2, y2] = xy(i * 30, 185), [tx, ty] = xy(i * 30 + 15, 170);
            return <g key={s} className="cursor-pointer" onClick={() => setSel({ kind: 'sign', id: String(i) })}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--gold) / .6)" /><text x={tx} y={ty + 5} textAnchor="middle" fontSize="15" fill={is({ kind: 'sign', id: String(i) }) ? 'hsl(var(--gold))' : 'hsl(var(--foreground))'}>{SIGN_GLYPH[i]}</text></g>; })}
          {r.cusps?.map((c, i) => { const [x1, y1] = xy(c, 95), [x2, y2] = xy(c, 155), [tx, ty] = xy(c + 4, 102); const angle = i % 3 === 0;
            return <g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={angle ? 'hsl(var(--gold))' : 'hsl(var(--border))'} strokeWidth={angle ? 1.6 : 0.8} /><text x={tx} y={ty + 3} fontSize="8" textAnchor="middle" fill="hsl(var(--muted-foreground))">{i + 1}</text></g>; })}
          {r.aspects.map((a, i) => { const A = r.bodies.find(b => b.name === a.a), B = r.bodies.find(b => b.name === a.b); if (!A || !B) return null; const [x1, y1] = xy(A.lon, 92), [x2, y2] = xy(B.lon, 92); const on = is({ kind: 'aspect', id: String(i) });
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ASPECT_TONE[a.type] ?? 'hsl(var(--muted-foreground))'} strokeOpacity={on ? 1 : 0.45} strokeWidth={on ? 3 : 1.2} className="cursor-pointer" onClick={() => setSel({ kind: 'aspect', id: String(i) })}><title>{a.a} {a.type} {a.b}</title></line>; })}
          {placed.map(({ b, shown }) => { const [x, y] = xy(shown, 130), [dx, dy] = xy(b.lon, 155); const on = is({ kind: 'body', id: b.key });
            return <g key={b.key} className="cursor-pointer" onClick={() => setSel({ kind: 'body', id: b.key })}><line x1={dx} y1={dy} x2={x} y2={y} stroke="hsl(var(--muted-foreground) / .5)" strokeWidth={0.6} /><circle cx={x} cy={y} r={11} fill={on ? 'hsl(var(--gold) / .35)' : 'hsl(var(--background))'} stroke={b.confidence === 'confirmed' || b.confidence === 'derived' ? 'hsl(var(--gold) / .7)' : 'hsl(var(--destructive))'} /><text x={x} y={y + 5} textAnchor="middle" fontSize="14" fill="hsl(var(--foreground))">{b.glyph}</text><title>{b.name} {b.sign} {b.deg}°</title></g>; })}
          {stars.map((s, i) => { const l = parseLon(s.star.degree)!; const [x, y] = xy(l, 190);
            return <text key={i} x={x} y={y + 4} textAnchor="middle" fontSize="11" fill="hsl(var(--gold))" className="cursor-pointer" onClick={() => setSel({ kind: 'star', id: String(i) })}>★<title>{s.star.name}</title></text>; })}
          {r.asc != null && [['Ascendant', r.asc, 'AC'], ['Midheaven', r.mc!, 'MC']].map(([n, l, t]) => { const [x, y] = xy(l as number, 70);
            return <text key={n as string} x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight={700} fill="hsl(var(--gold))" className="cursor-pointer" onClick={() => setSel({ kind: 'angle', id: n as string })}>{t as string}</text>; })}
        </g>
      </svg>

      <aside className="parchment p-4 min-h-[220px]" aria-live="polite">
        {!detail ? (
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-display text-lg text-foreground">Tap anything on the wheel</p>
            <p>Planets, signs, house lines, aspect lines, the AC/MC angles, gold ★ fixed-star contacts and the four Ba Zi pillars on the outer ring all open their details here, with a confidence badge and a source.</p>
            <p className="text-xs">Red-ringed planets have a lower-confidence position (usually because the birth time is unknown).</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2"><h3 className="font-display text-xl">{detail.title}</h3><ConfidenceBadge level={detail.level} note={detail.note} /></div>
            <div className="text-xs font-mono text-muted-foreground">{detail.sub}</div>
            <p className="text-sm">{detail.body}<Cite source={detail.src} /></p>
            {detail.links.length > 0 && <div className="flex flex-wrap gap-1.5 pt-1">{detail.links.map((l, i) => l.href ? <Link key={i} to={l.href} className="text-xs border border-gold/50 rounded px-2 py-0.5 hover:bg-gold/10">{l.label}</Link> : <span key={i} className="text-xs border border-border rounded px-2 py-0.5">{l.label}</span>)}</div>}
            <button onClick={() => setSel(null)} className="text-xs underline text-muted-foreground">Clear</button>
          </div>
        )}
      </aside>
    </div>
  );
}
