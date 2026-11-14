import { Link } from 'react-router-dom';
import { HOUSE_SYSTEMS } from '@/lib/astro';

const POINTS: [string, string][] = [
  ['Real astronomy, not lookup tables', 'Every planet, the Moon’s nodes and Chiron are calculated from an astronomical model of the solar system for the exact minute you were born.'],
  ['Checked against the professional standard', 'Our automated tests compare finished charts with the Swiss Ephemeris, the engine professional astrologers use, and fail if any planet, angle or house cusp drifts by more than a tenth of a degree.'],
  ['The clock your parents actually saw', 'Birth times are converted with the historical time-zone record for your birthplace, including old daylight-saving rules, so a 1970s summer birth isn’t off by an hour.'],
  ['Honest about unknown times', 'No birth time? We say which parts of the chart depend on it — Rising sign, houses, sometimes the Moon’s sign — instead of quietly assuming midnight.'],
  [`${HOUSE_SYSTEMS.length} house systems`, `${HOUSE_SYSTEMS.map(h => h.label).join(', ')}. Switch between them and see exactly which placements move.`],
  ['Many traditions, one method', 'Western placements, aspects and timing (profections, transits, solar returns) are read alongside Chinese Four Pillars, Kua and Nine Star Ki, Vedic positions and numerology — all from the same birth facts — and the Zodaci method weighs where they agree.'],
];

/** Plain-language account of how charts are calculated. Every claim mirrors code or tests (astro.ts, astro.accuracy.test.ts). */
export function CalculationTrust({ compact = false }: { compact?: boolean }) {
  const list = compact ? POINTS.slice(0, 3) : POINTS;
  return (
    <section aria-labelledby="calc-trust" className="space-y-4">
      <h2 id="calc-trust" className="text-3xl">How we calculate your sky</h2>
      <p className="max-w-3xl text-muted-foreground">Everything Zodaci writes starts from a calculation you could check yourself. Here is what goes into it.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(([t, d]) => <div key={t} className="vellum p-5"><h3 className="text-xl">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>)}</div>
      <p className="text-sm"><Link to="/accuracy" className="text-primary underline-offset-4 hover:underline">Check our numbers</Link><span className="text-muted-foreground"> — thirteen test charts recalculated live in your browser and compared with the Swiss Ephemeris, point by point.</span></p>
    </section>
  );
}
