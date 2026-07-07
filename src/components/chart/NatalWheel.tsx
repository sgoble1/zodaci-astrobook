import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PLACEMENTS, ZODIAC, ANGLES, ASPECTS, longitudeOf, signIndex, type Placement } from '@/content/april';

interface Props {
  size?: number;
  showAspects?: boolean;
  interactive?: boolean;
}

/**
 * A hand-drawn feeling SVG natal wheel plotting April's real placements.
 * Zodiac ring, twelve houses (equal-house from her 29°28' Sagittarius ASC),
 * planet glyphs at their true longitudes, and aspect lines through the center.
 */
export function NatalWheel({ size = 640, showAspects = true, interactive = true }: Props) {
  const cx = size / 2, cy = size / 2;
  const rOuter = size * 0.48;
  const rZodiac = size * 0.42;
  const rHouse = size * 0.30;
  const rPlanets = size * 0.36;
  const rInner = size * 0.16;

  // Rotate wheel so 29°28' Sagittarius sits at the traditional 9 o'clock ASC position.
  const ascLong = signIndex('Sagittarius') * 30 + 29 + 28 / 60;
  // In astrological wheels the Ascendant is at the 3 o'clock left (180° screen).
  // We flip because the zodiac goes counter-clockwise while SVG goes clockwise.
  const toXY = (long: number, r: number) => {
    const rel = long - ascLong;
    const angle = (180 - rel) * (Math.PI / 180);
    return { x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle) };
  };

  const [hover, setHover] = useState<Placement | null>(null);

  // House cusps — equal-house from the ASC
  const houseCusps = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ascLong + i * 30);
  }, [ascLong]);

  const gold = 'hsl(var(--gold))';
  const ink = 'hsl(var(--ink))';
  const muted = 'hsl(var(--muted-foreground))';

  return (
    <div className="relative w-full max-w-[720px] mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
        {/* Vellum background circle */}
        <defs>
          <radialGradient id="parchment" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="hsl(var(--vellum))" />
            <stop offset="100%" stopColor="hsl(var(--muted))" />
          </radialGradient>
          <radialGradient id="nightsky" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--midnight))" />
            <stop offset="100%" stopColor="hsl(230 40% 5%)" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r={rOuter} fill="url(#parchment)" stroke={gold} strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={rZodiac} fill="none" stroke={ink} strokeWidth={0.5} opacity={0.5} />
        <circle cx={cx} cy={cy} r={rHouse} fill="url(#nightsky)" stroke={gold} strokeWidth={0.8} />
        <circle cx={cx} cy={cy} r={rInner} fill="none" stroke={gold} strokeWidth={0.4} opacity={0.6} />

        {/* Zodiac ring — 12 signs */}
        {ZODIAC.map((z, i) => {
          const startLong = i * 30;
          const midLong = i * 30 + 15;
          const start = toXY(startLong, rOuter);
          const inner = toXY(startLong, rZodiac);
          const mid = toXY(midLong, (rOuter + rZodiac) / 2);
          return (
            <g key={z.name}>
              <line x1={start.x} y1={start.y} x2={inner.x} y2={inner.y} stroke={gold} strokeWidth={0.6} opacity={0.7} />
              <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central"
                    fontSize={size * 0.032} fill={gold} className="font-display">
                {z.glyph}
              </text>
            </g>
          );
        })}

        {/* House cusps */}
        {houseCusps.map((cusp, i) => {
          const outer = toXY(cusp, rHouse);
          const inner = toXY(cusp, rInner);
          const isAngle = i === 0 || i === 3 || i === 6 || i === 9;
          const labelPos = toXY(cusp + 15, (rHouse + rInner) / 2);
          return (
            <g key={i}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                    stroke={isAngle ? gold : 'hsl(var(--starlight))'}
                    strokeWidth={isAngle ? 1.2 : 0.4}
                    opacity={isAngle ? 0.9 : 0.5}
                    strokeDasharray={isAngle ? undefined : '2 3'} />
              <Link to={`/houses/${i + 1}`}>
                <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="central"
                      fontSize={size * 0.022} fill="hsl(var(--starlight))" opacity={0.75}
                      className="font-smallcaps cursor-pointer hover:fill-current"
                      style={{ letterSpacing: 0 }}>
                  {i + 1}
                </text>
              </Link>
            </g>
          );
        })}

        {/* Aspect lines */}
        {showAspects && ASPECTS.map((asp, idx) => {
          const A = PLACEMENTS.find(p => p.key === asp.a);
          const B = PLACEMENTS.find(p => p.key === asp.b);
          if (!A || !B) return null;
          const pa = toXY(longitudeOf(A), rInner);
          const pb = toXY(longitudeOf(B), rInner);
          const color =
            asp.type === 'Trine' ? 'hsl(140 40% 50%)' :
            asp.type === 'Sextile' ? 'hsl(200 45% 55%)' :
            asp.type === 'Square' ? 'hsl(0 55% 55%)' :
            asp.type === 'Opposition' ? 'hsl(20 65% 55%)' :
            'hsl(var(--gold))';
          return (
            <line key={idx} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                  stroke={color} strokeWidth={0.7} opacity={0.55} />
          );
        })}

        {/* Planet glyphs */}
        {PLACEMENTS.filter(p => !['vertex', 'lilith', 'fortune'].includes(p.key)).map((p) => {
          const pos = toXY(longitudeOf(p), rPlanets);
          const isHover = hover?.key === p.key;
          return (
            <g key={p.key}
               onMouseEnter={() => interactive && setHover(p)}
               onMouseLeave={() => interactive && setHover(null)}
               style={{ cursor: interactive ? 'pointer' : 'default' }}>
              <Link to={`/planets/${p.key}`}>
                <circle cx={pos.x} cy={pos.y} r={size * 0.024}
                        fill="hsl(var(--vellum))"
                        stroke={isHover ? gold : ink}
                        strokeWidth={isHover ? 1.5 : 0.8} />
                <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                      fontSize={size * 0.028} fill={ink} className="font-display select-none">
                  {p.glyph}
                </text>
              </Link>
            </g>
          );
        })}

        {/* Center — ASC/MC marker */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={size * 0.028} fill={gold} className="font-smallcaps">April</text>
        <text x={cx} y={cy + size * 0.028} textAnchor="middle" fontSize={size * 0.02} fill={muted}>Sept 6 · 1990</text>
      </svg>

      {/* Hover legend */}
      <div className="mt-4 min-h-[64px] px-4 py-3 rounded border border-border bg-card/60 text-sm">
        {hover ? (
          <div>
            <div className="font-display text-lg leading-tight">
              {hover.glyph} {hover.name} in {hover.sign} {hover.signGlyph}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {hover.degree}°{String(hover.minute).padStart(2, '0')}′ · House {hover.house} · {hover.motion} · {hover.dignity}
            </div>
            <div className="text-xs mt-1 text-foreground/80">{hover.notes}</div>
          </div>
        ) : (
          <div className="text-muted-foreground">
            Hover any planet for its placement · click for the full interpretation. Click a house number for that house's page.
          </div>
        )}
      </div>

      {/* Ascendant note */}
      <div className="mt-3 text-xs text-muted-foreground font-smallcaps text-center">
        Ascendant {ANGLES.ascendant.signGlyph} {ANGLES.ascendant.degree}°{String(ANGLES.ascendant.minute).padStart(2, '0')}′ {ANGLES.ascendant.sign} · Anaretic
      </div>
    </div>
  );
}
