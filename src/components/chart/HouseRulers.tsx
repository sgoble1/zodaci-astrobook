import { fmtLon, houseOf, type ChartResult } from '@/lib/astro';

const RULER: Record<string, string> = { Aries: 'mars', Taurus: 'venus', Gemini: 'mercury', Cancer: 'moon', Leo: 'sun', Virgo: 'mercury', Libra: 'venus', Scorpio: 'mars', Sagittarius: 'jupiter', Capricorn: 'saturn', Aquarius: 'saturn', Pisces: 'jupiter' };
const MODERN: Record<string, string> = { Scorpio: 'pluto', Aquarius: 'uranus', Pisces: 'neptune' };
const AREA = ['', 'self & first impressions', 'money & self-worth', 'thinking & communication', 'home & roots', 'creativity & romance', 'daily work & health', 'partners', 'shared resources & intimacy', 'beliefs & travel', 'career & reputation', 'friends & hopes', 'rest & the inner life'];

/** House rulers: the sign on each cusp, its ruling planet and where that ruler sits — calculated from the member's exact birth time. */
export function HouseRulers({ chart }: { chart: ChartResult }) {
  if (!chart.cusps) return null;
  const cusps = chart.cusps;
  const rows = cusps.slice(0, 12).map((c, i) => {
    const sign = fmtLon(c).sign;
    const key = RULER[sign]; const ruler = chart.bodies.find(b => b.key === key);
    const modern = MODERN[sign] ? chart.bodies.find(b => b.key === MODERN[sign]) : undefined;
    return { h: i + 1, sign, deg: Math.floor(c % 30), ruler, modern, lands: ruler ? houseOf(ruler.lon, cusps) : null };
  });
  return (
    <section className="space-y-3" aria-labelledby="house-rulers">
      <h2 id="house-rulers" className="font-display text-2xl">Your house rulers</h2>
      <p className="max-w-2xl text-sm text-muted-foreground">Each house begins in a sign, and that sign's ruling planet "runs" the house. Where the ruler sits shows where that life area tends to play out. In plain words: "my 10th house ruler is in the 4th" means career and home are tied together.</p>
      <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm">
        <thead><tr className="text-left text-muted-foreground"><th className="py-2 pr-3">House</th><th className="pr-3">Begins in</th><th className="pr-3">Ruler</th><th>Ruler sits in · plain meaning</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r.h} className="border-t border-border">
          <td className="py-2 pr-3"><b>{r.h}</b> <span className="text-muted-foreground">{AREA[r.h]}</span></td>
          <td className="pr-3">{r.sign} {r.deg}°</td>
          <td className="pr-3">{r.ruler ? `${r.ruler.glyph} ${r.ruler.name}` : '—'}{r.modern && <span className="text-muted-foreground"> (modern: {r.modern.name})</span>}</td>
          <td>{r.ruler && r.lands ? <>{r.ruler.sign} · house {r.lands} — your {AREA[r.h]} is channelled through {AREA[r.lands]}.</> : '—'}</td>
        </tr>)}</tbody>
      </table></div>
    </section>
  );
}
