import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { computeChart, type ChartInput } from '@/lib/astro';
import { signCover } from '@/content/signCovers';

const sunAt = (date: string, time: string) => computeChart({ date, time, lat: 0, lon: 0, tz: 'UTC', placeLabel: '', placeSource: 'manual', houseSystem: 'whole' } as ChartInput).bodies.find(b => b.key === 'sun');
const shift = (date: string, days: number) => new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);

/** True only for a real calendar day (rejects 2025-02-30 and similar) inside the supported years. */
export function validBirthDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const y = Number(date.slice(0, 4)); if (y < 1900 || y > 2100) return false;
  const t = Date.parse(`${date}T00:00:00Z`);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === date;
}

/**
 * Sun sign from a date alone (noon UTC). Flags the day as a sign change when the Sun is in a different sign at
 * the earliest and latest moments that calendar date exists anywhere on Earth (UTC+14 to UTC−12), so the birth time decides.
 */
export function sunFromDate(date: string) {
  if (!validBirthDate(date)) return null;
  const sun = sunAt(date, '12:00');
  const earliest = sunAt(shift(date, -1), '10:00');
  const latest = sunAt(shift(date, 1), '11:59');
  if (!sun || !earliest || !latest) return null;
  return { sign: sun.sign, glyph: sun.signGlyph, cusp: earliest.sign !== sun.sign || latest.sign !== sun.sign };
}

/** Unsaved artwork preview; sign-change dates await an exact saved chart. */
export function CoverCustomizer() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const sun = useMemo(() => sunFromDate(date), [date]);
  const confirmed = sun && !sun.cusp ? sun : null;
  const artwork = signCover(confirmed?.sign ?? 'Taurus');
  const next = `/auth?mode=signup&next=${encodeURIComponent('/books')}`;
  return <div className="grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
    <form className="min-w-0 space-y-4" onSubmit={e => e.preventDefault()} aria-label="Preview your AstroBook cover">
      <div><Label htmlFor="cc-name">Name on the bookplate</Label><Input id="cc-name" maxLength={40} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="given-name" /></div>
      <div><Label htmlFor="cc-date">Birth date</Label><Input className="min-w-0 max-w-full" id="cc-date" type="date" min="1900-01-01" max="2100-12-31" value={date} onChange={e => setDate(e.target.value)} aria-invalid={!!date && !sun} aria-describedby={date && !sun ? 'cc-date-err' : undefined} />{date && !sun && <p id="cc-date-err" className="mt-1 text-xs text-destructive">Enter a real date between 1900 and 2100.</p>}</div>
      <p className="text-sm text-muted-foreground" role="status">{confirmed ? `Sun in ${confirmed.sign}.` : sun?.cusp ? 'The Sun changes sign around this date. Your exact birth time and place are needed; the Taurus sample stays on display.' : 'Taurus sample artwork. Add your birth date to see your Sun-sign illustration.'}</p>
      <Button asChild className="max-w-full"><Link to={next}>Create my AstroBook<ArrowRight /></Link></Button>
      <p className="text-xs text-muted-foreground">Nothing you enter here is saved or carried into signup. Your order uses your saved chart, with birth details printed only if you choose.</p>
    </form>
    <figure className="mx-auto w-full max-w-64 min-w-0">
      <div className="aspect-[2/3] overflow-hidden bg-muted">
        <img src={artwork} alt={`${confirmed?.sign ?? 'Taurus sample'} AstroBook atomic-age cover artwork`} className="h-full w-full object-contain" loading="lazy" />
      </div>
      <figcaption className="mt-3 space-y-1 text-center" aria-live="polite">
        {name.trim() && <span className="block break-words font-label text-lg text-foreground">Prepared for {name.trim()}</span>}
        <span className="block text-xs text-muted-foreground">{confirmed ? `${confirmed.sign} artwork preview` : 'Taurus · sample artwork'} · 6 × 9 in</span>
        <span className="block text-xs text-muted-foreground">Illustration preview, not a final print proof.</span>
      </figcaption>
    </figure>
  </div>;
}
