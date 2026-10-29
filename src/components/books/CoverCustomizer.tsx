import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { chartTitle, COVER_FOR_ELEMENT, ELEMENT_OF } from '@/lib/chartTitle';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { computeChart, type ChartInput } from '@/lib/astro';
import { COVER_DESIGNS } from '@/content/coverDesigns';
import { useCoverImage } from '@/hooks/useCoverImage';
import { DEFAULT_CROP } from '@/lib/coverLayout';

const COVERS = COVER_DESIGNS;

const sunAt = (date: string, time: string) => computeChart({ date, time, lat: 0, lon: 0, tz: 'UTC', placeLabel: '', placeSource: 'manual', houseSystem: 'whole' } as ChartInput).bodies.find(b => b.key === 'sun')!;
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
  return { sign: sun.sign, glyph: sun.signGlyph, cusp: earliest.sign !== sun.sign || latest.sign !== sun.sign };
}

/** Live cover preview: type a name and birth date, see your AstroBook cover update instantly. Nothing is saved. */
export function CoverCustomizer() {
  const [name, setName] = useState(''); const [date, setDate] = useState(''); const [cover, setCover] = useState(0);
  const sun = useMemo(() => sunFromDate(date), [date]);
  const rec = sun ? COVER_FOR_ELEMENT[ELEMENT_OF[sun.sign]] : null;
  const match = rec ? { ...rec, index: Math.max(0, COVERS.findIndex(c => c.key === rec.key)) } : null;
  const [touched, setTouched] = useState(false);
  useEffect(() => { if (match && !touched) setCover(match.index); }, [match, touched]);
  const named = sun ? chartTitle({ sun: sun.sign }) : null;
  const pretty = date && sun ? new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '';
  const next = `/auth?mode=signup&next=${encodeURIComponent('/books')}`;
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  const choose = (i: number) => { setTouched(true); setCover(i); };
  // Standard radio-group keys: arrows move and select, focus follows the choice.
  const onRadioKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? COVERS.length - 1 : step ? (i + step + COVERS.length) % COVERS.length : -1;
    if (to < 0) return;
    e.preventDefault(); choose(to); radios.current[to]?.focus();
  };
  const shown = name.trim();
  // Drawn by the same code as the printed cover: name as the title, the subtitle line, AstroBook bottom-right.
  const preview = useCoverImage({ source: { kind: 'design', key: COVERS[cover].key }, crop: DEFAULT_CROP, name: shown, trimPt: [432, 648] }, 56);
  return <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
    <form className="space-y-4" onSubmit={e => e.preventDefault()} aria-label="Preview your AstroBook cover">
      <div><Label htmlFor="cc-name">Name on the cover</Label><Input id="cc-name" maxLength={40} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="given-name" /></div>
      <div><Label htmlFor="cc-date">Birth date</Label><Input id="cc-date" type="date" min="1900-01-01" max="2100-12-31" value={date} onChange={e => setDate(e.target.value)} aria-invalid={!!date && !sun} aria-describedby={date && !sun ? 'cc-date-err' : undefined} />{date && !sun && <p id="cc-date-err" className="mt-1 text-xs text-destructive">Enter a real date between 1900 and 2100.</p>}</div>
      <div role="radiogroup" aria-label="Cover design" className="flex flex-wrap gap-2">{COVERS.map(({ label }, i) => <button key={label} ref={el => { radios.current[i] = el; }} type="button" role="radio" aria-checked={cover === i} tabIndex={cover === i ? 0 : -1} onKeyDown={e => onRadioKey(e, i)} onClick={() => choose(i)} className={`min-h-10 rounded-full border px-3 py-1 text-sm transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${cover === i ? 'border-primary bg-primary/15' : 'border-border hover:border-primary/60'}`}>{label}{match?.index === i && <span className="ml-1 text-xs text-gold">· Recommended</span>}</button>)}</div>
      {match && <p className="text-xs text-muted-foreground">Recommended for your sky: {match.reason} You can choose any design.</p>}
      {sun && <p className="text-sm text-muted-foreground" role="status">Sun in {sun.sign}{sun.cusp ? ' — the Sun changes sign on this day, so your birth time decides which sign is yours. Your real book uses your exact time and place.' : '.'}{named ? ` Your book title draws on your full chart; this preview uses your Sun only.` : ''}</p>}
      {touched && match && cover !== match.index && <button type="button" className="text-xs text-gold underline underline-offset-4" onClick={() => { setTouched(false); setCover(match.index); }}>Use the recommended design</button>}
      <Button asChild><Link to={next}>Create my AstroBook<ArrowRight /></Link></Button>
      <p className="text-xs text-muted-foreground">Preview only. Your name, date and design choice are not saved or carried into signup.</p>
    </form>
    <figure className="mx-auto w-56">
      <div className="relative aspect-[2/3] overflow-hidden rounded bg-muted shadow-2xl">
        {preview && <img src={preview} alt={`${COVERS[cover].label} cover preview${shown ? ` for ${shown}` : ''}`} className="h-full w-full object-cover" />}
      </div>
      <figcaption className="mt-2 space-y-0.5 text-center text-xs text-muted-foreground" aria-live="polite">
        <span className="block">Live cover preview · 6 × 9 in</span>
        {named && <span className="block italic text-gold">{named.title}</span>}
        {pretty && <span className="block">{pretty}{sun ? ` · Sun in ${sun.sign} ${sun.glyph}` : ''}</span>}
      </figcaption>
    </figure>
  </div>;
}
