import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { computeChart, type ChartInput } from '@/lib/astro';
import coverMidnightStars from '@/assets/cover-design-midnight-stars.jpg';
import coverBlueCosmos from '@/assets/cover-design-blue-cosmos.jpg';
import coverGoldAurora from '@/assets/cover-design-gold-aurora.jpg';

const COVERS = [['Midnight Stars', coverMidnightStars], ['Blue Cosmos', coverBlueCosmos], ['Gold Aurora', coverGoldAurora]] as const;

/** Sun sign from a date alone (noon UTC). Flags days when the Sun changes sign, since the birth time decides. */
export function sunFromDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const y = Number(date.slice(0, 4)); if (y < 1900 || y > 2100) return null;
  const c = computeChart({ date, time: '12:00', lat: 0, lon: 0, tz: 'UTC', placeLabel: '', placeSource: 'manual', houseSystem: 'whole' } as ChartInput);
  const sun = c.bodies.find(b => b.key === 'sun')!;
  return { sign: sun.sign, glyph: sun.signGlyph, cusp: sun.deg === 0 || sun.deg === 29 };
}

/** Live cover preview: type a name and birth date, see your AstroBook cover update instantly. Nothing is saved. */
export function CoverCustomizer() {
  const [name, setName] = useState(''); const [date, setDate] = useState(''); const [cover, setCover] = useState(0);
  const sun = useMemo(() => sunFromDate(date), [date]);
  const pretty = date && sun ? new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '';
  const next = `/auth?mode=signup&next=${encodeURIComponent('/books')}`;
  return <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
    <form className="space-y-4" onSubmit={e => e.preventDefault()} aria-label="Preview your AstroBook cover">
      <div><Label htmlFor="cc-name">Name on the cover</Label><Input id="cc-name" maxLength={40} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="given-name" /></div>
      <div><Label htmlFor="cc-date">Birth date</Label><Input id="cc-date" type="date" min="1900-01-01" max="2100-12-31" value={date} onChange={e => setDate(e.target.value)} /></div>
      <div role="radiogroup" aria-label="Cover design" className="flex flex-wrap gap-2">{COVERS.map(([label], i) => <button key={label} type="button" role="radio" aria-checked={cover === i} onClick={() => setCover(i)} className={`rounded-full border px-3 py-1 text-sm transition-colors duration-500 ${cover === i ? 'border-primary bg-primary/15' : 'border-border hover:border-primary/60'}`}>{label}</button>)}</div>
      {sun && <p className="text-sm text-muted-foreground" role="status">Sun in {sun.sign}{sun.cusp ? ' — the Sun changed sign around this day, so your birth time decides. Your real book uses your exact time.' : '.'}</p>}
      <Button asChild><Link to={next}>Make this my AstroBook<ArrowRight /></Link></Button>
      <p className="text-xs text-muted-foreground">Preview only. Nothing you type here is saved.</p>
    </form>
    <figure className="mx-auto w-56" aria-live="polite">
      <div className="relative aspect-[2/3] overflow-hidden rounded shadow-2xl">
        <img src={COVERS[cover][1]} alt={`${COVERS[cover][0]} cover preview`} className="h-full w-full object-cover" />
        <div className="absolute inset-x-3 top-6 space-y-1 bg-background/70 p-3 text-center">
          <p className="font-display text-xl leading-tight">{name.trim() ? `${name.trim()}’s` : 'Your'} AstroBook</p>
          {pretty && <p className="text-xs text-muted-foreground">{pretty}</p>}
        </div>
        {sun && <span className="absolute bottom-6 inset-x-0 text-center font-display text-5xl text-gold" aria-hidden>{sun.glyph}</span>}
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">Live cover preview</figcaption>
    </figure>
  </div>;
}
