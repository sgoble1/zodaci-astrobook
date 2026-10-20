import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Loader2, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Faq, type QA } from '@/components/brand/Faq';
import { computeChart, SIGNS, SIGN_GLYPH, type ChartInput } from '@/lib/astro';
import { BAND_LABEL, compatibility, PLANET_WEIGHTS, scoreBand, signsFromChart, type CompatKey, type CompatSigns, type ScoreBand } from '@/lib/compatibility';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
import { useSession } from '@/hooks/useLibrary';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useJsonLd } from '@/hooks/useJsonLd';

type Geo = { name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone: string };
type Person = { name: string; mode: 'birth' | 'signs'; date: string; time: string; place: string; lat: number | null; lon: number | null; tz: string; signs: CompatSigns };
const blank = (name: string): Person => ({ name, mode: 'birth', date: '', time: '', place: '', lat: null, lon: null, tz: '', signs: {} });
const KEYS = Object.keys(PLANET_WEIGHTS) as CompatKey[];
const glyph = (sign: string) => SIGN_GLYPH[(SIGNS as readonly string[]).indexOf(sign)] ?? '';
const KEY_LABEL: Record<CompatKey, string> = { sun: 'Sun', moon: 'Moon', venus: 'Venus', mars: 'Mars', rising: 'Rising' };
const BAND_CLASS: Record<ScoreBand, { text: string; bar: string; ring: string }> = {
  caution: { text: 'text-oxblood', bar: 'bg-oxblood', ring: 'hsl(var(--oxblood))' },
  moderate: { text: 'text-gold', bar: 'bg-gold', ring: 'hsl(var(--gold))' },
  harmonious: { text: 'text-primary', bar: 'bg-primary', ring: 'hsl(var(--primary))' },
};

export const COMPAT_FAQ: QA[] = [
  { q: 'How is the compatibility score calculated?', a: 'Each of five placements — Sun, Moon, Venus, Mars and Rising — is compared by element (fire, earth, air, water) and by modality (cardinal, fixed, mutable). Element harmony counts for three times its table value and modality for two and a half times, capped at 100 per placement. The five results are then averaged with weights: Sun and Moon 1.0, Venus 0.9, Mars 0.8, Rising 0.7.' },
  { q: 'Do we need birth times?', a: 'No. Without a birth time the Moon can shift sign during the day and the Rising sign can’t be known, so both are left out rather than guessed. The score is then based on Sun, Venus and Mars.' },
  { q: 'Is a low score bad news?', a: 'No. The score describes how alike two people’s chart styles are, not whether a relationship will work. Contrasting elements often describe the most interesting partnerships — they simply need more explaining out loud.' },
  { q: 'Is anything saved?', a: 'Nothing you type here is stored. Members can save a partner’s chart privately in People & charts for a full chart-to-chart comparison.' },
];

function signsOf(p: Person): { signs: CompatSigns; note: string } | null {
  if (p.mode === 'signs') return p.signs.sun ? { signs: p.signs, note: '' } : null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) return null;
  const input: ChartInput = { date: p.date, time: p.time || null, lat: p.lat ?? 0, lon: p.lon ?? 0, tz: p.tz || 'UTC', placeLabel: p.place, placeSource: p.lat == null ? 'manual' : 'geocoded' };
  try {
    const c = computeChart(input);
    const s = signsFromChart(c);
    // Rising needs a real place as well as a time.
    if (p.lat == null) s.rising = null;
    return { signs: s, note: !p.time ? 'No birth time — Moon and Rising left out.' : p.lat == null ? 'No birth place — Rising left out.' : '' };
  } catch { return null; }
}

/** Public compatibility score (Master Build formula). Calculated in the browser; nothing is stored. */
export default function Compatibility() {
  usePageMeta('Astrology compatibility score — Sun, Moon, Venus, Mars & Rising | Zodaci', 'Compare two birth charts by element and modality across five placements. Free, calculated in your browser, with the method shown.');
  useJsonLd('compat-app', { '@type': 'WebApplication', name: 'Zodaci compatibility score', applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, url: 'https://zodaci.com/compatibility' });
  const session = useSession();
  const birth = useMyBirth();
  const [a, setA] = useState<Person>(blank('You'));
  const [b, setB] = useState<Person>(blank('Them'));
  const [shown, setShown] = useState(false);
  // Signed-in members start from their own saved chart.
  useEffect(() => {
    if (!birth) return;
    const i = toChartInput(birth);
    setA(p => p.date ? p : { ...p, name: birth.name || 'You', date: i.date, time: i.time ?? '', place: i.placeLabel, lat: i.lat, lon: i.lon, tz: i.tz });
  }, [birth]);
  const sa = useMemo(() => signsOf(a), [a]);
  const sb = useMemo(() => signsOf(b), [b]);
  const result = useMemo(() => sa && sb ? compatibility(sa.signs, sb.signs) : null, [sa, sb]);
  const ready = !!result && result.rows.length > 0;
  return (
    <article className="space-y-16">
      <header className="max-w-3xl"><p className="font-smallcaps text-xs text-gold">Compatibility</p><h1 className="mt-3 font-display text-5xl leading-[0.95]">Two charts, side by side.</h1><p className="mt-4 text-lg text-muted-foreground">Compare Sun, Moon, Venus, Mars and Rising by element and modality. Use birth details for the most complete picture, or just the signs you know.</p></header>
      <section className="grid gap-8 lg:grid-cols-[1fr_1fr_1.1fr]" aria-label="Compatibility calculator">
        <PersonCard person={a} onChange={setA} id="a" derived={sa} />
        <PersonCard person={b} onChange={setB} id="b" derived={sb} />
        <div className="lg:sticky lg:top-6 lg:self-start">
          {!shown || !ready ? (
            <div className="vellum flex min-h-72 flex-col items-center justify-center gap-4 p-6 text-center">
              <Heart aria-hidden className="h-8 w-8 text-gold" />
              <p className="text-muted-foreground">{ready ? 'Both charts are ready.' : 'Add a birth date or Sun sign for each person.'}</p>
              <Button size="lg" disabled={!ready} onClick={() => setShown(true)}>Reveal compatibility</Button>
            </div>
          ) : <ResultCard nameA={a.name || 'You'} nameB={b.name || 'Them'} result={result!} />}
        </div>
      </section>
      {shown && ready && <section className="vellum flex flex-wrap items-center justify-between gap-4 p-6"><div><h2 className="font-display text-2xl">Go deeper than signs</h2><p className="mt-1 text-sm text-muted-foreground">Pro members compare the full charts — every planet-to-planet aspect, house overlays and a written reading — and keep partners’ charts private to their account.</p></div><Button asChild><Link to={session ? '/relationships' : `/auth?mode=signup&next=${encodeURIComponent('/relationships')}`}>{session ? 'Open People & charts' : 'Create your free account'}<ArrowRight /></Link></Button></section>}
      <section className="max-w-3xl" aria-labelledby="compat-faq"><h2 id="compat-faq" className="mb-6 font-display text-3xl">How it works</h2><Faq items={COMPAT_FAQ} id="compatibility-faq" /></section>
      <p className="text-xs text-muted-foreground">Astrology is a tool for reflection, not prediction. A score can start a conversation; it can’t decide one. <Link to="/academy/aspects" className="underline">Learn how charts are compared</Link>.</p>
    </article>
  );
}

function PersonCard({ person: p, onChange, id, derived }: { person: Person; onChange: (p: Person) => void; id: string; derived: ReturnType<typeof signsOf> }) {
  const [q, setQ] = useState(p.place);
  const [geo, setGeo] = useState<Geo[]>([]);
  const [busy, setBusy] = useState(false);
  const [geoErr, setGeoErr] = useState('');
  useEffect(() => setQ(p.place), [p.place]);
  const set = (patch: Partial<Person>) => onChange({ ...p, ...patch });
  const search = async () => {
    if (q.trim().length < 2) return;
    setBusy(true); setGeoErr('');
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&name=${encodeURIComponent(q.split(',')[0].trim())}`).then(x => x.json());
      setGeo(r.results ?? []); if (!r.results?.length) setGeoErr('No places found — try the nearest city.');
    } catch { setGeoErr('Place search is unavailable right now. Rising will be left out.'); }
    setBusy(false);
  };
  return (
    <fieldset className="vellum space-y-4 p-5">
      <legend className="sr-only">Person {id.toUpperCase()}</legend>
      <div><Label htmlFor={`${id}-name`}>Name</Label><Input id={`${id}-name`} value={p.name} maxLength={40} onChange={e => set({ name: e.target.value })} /></div>
      <div role="radiogroup" aria-label="How to enter this chart" className="grid grid-cols-2 gap-1 rounded-md border border-border p-1 text-sm">
        {(['birth', 'signs'] as const).map(m => <button key={m} type="button" role="radio" aria-checked={p.mode === m} onClick={() => set({ mode: m })} className={`rounded px-2 py-1.5 transition-colors duration-500 ${p.mode === m ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{m === 'birth' ? 'Birth details' : 'Signs I know'}</button>)}
      </div>
      {p.mode === 'birth' ? <>
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor={`${id}-date`}>Birth date</Label><Input id={`${id}-date`} type="date" min="1900-01-01" max="2100-12-31" value={p.date} onChange={e => set({ date: e.target.value })} /></div>
          <div><Label htmlFor={`${id}-time`}>Time (optional)</Label><Input id={`${id}-time`} type="time" value={p.time} onChange={e => set({ time: e.target.value })} /></div>
        </div>
        <div>
          <Label htmlFor={`${id}-place`}>Birth place (optional)</Label>
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); void search(); }}><Input id={`${id}-place`} value={q} placeholder="City" onChange={e => { setQ(e.target.value); if (p.lat != null) set({ lat: null, lon: null, tz: '', place: '' }); }} /><Button type="submit" variant="outline" size="icon" aria-label="Search places" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}</Button></form>
          {geo.length > 0 && <ul className="mt-1 divide-y divide-border rounded border border-border bg-background">{geo.map((g, i) => { const label = [g.name, g.admin1, g.country].filter(Boolean).join(', '); return <li key={i}><button type="button" className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted" onClick={() => { set({ place: label, lat: g.latitude, lon: g.longitude, tz: g.timezone }); setGeo([]); }}>{label}</button></li>; })}</ul>}
          {p.lat != null && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin aria-hidden className="h-3 w-3" />{p.place}</p>}
          {geoErr && <p className="mt-1 text-xs text-muted-foreground">{geoErr}</p>}
        </div>
      </> : (
        <div className="grid grid-cols-2 gap-3">{KEYS.map(k => <div key={k}><Label htmlFor={`${id}-${k}`}>{KEY_LABEL[k]}{k === 'sun' ? '' : ' (optional)'}</Label><select id={`${id}-${k}`} value={p.signs[k] ?? ''} onChange={e => set({ signs: { ...p.signs, [k]: e.target.value || null } })} className="h-10 w-full rounded border border-border bg-input px-2 text-sm"><option value="">{k === 'sun' ? 'Choose' : 'Unknown'}</option>{SIGNS.map(s => <option key={s} value={s}>{glyph(s)} {s}</option>)}</select></div>)}</div>
      )}
      {derived && <dl className="grid grid-cols-5 gap-1 border-t border-border pt-3 text-center text-xs">{KEYS.map(k => <div key={k}><dt className="text-muted-foreground">{KEY_LABEL[k]}</dt><dd className="mt-0.5">{derived.signs[k] ? `${glyph(derived.signs[k]!)} ${derived.signs[k]!.slice(0, 3)}` : '—'}</dd></div>)}</dl>}
      {derived?.note && <p className="text-xs text-muted-foreground">{derived.note}</p>}
    </fieldset>
  );
}

function ResultCard({ nameA, nameB, result }: { nameA: string; nameB: string; result: ReturnType<typeof compatibility> }) {
  const band = scoreBand(result.score);
  const c = BAND_CLASS[band];
  return (
    <section aria-live="polite" aria-labelledby="score-h" className="vellum space-y-6 p-6">
      <div className="flex items-center gap-5">
        <div role="img" aria-label={`Score ${result.score} out of 100`} className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${c.ring} ${result.score * 3.6}deg, hsl(var(--muted)) 0deg)` }}>
          <div className="grid h-[104px] w-[104px] place-items-center rounded-full bg-card"><span className="font-display text-4xl">{result.score}</span></div>
        </div>
        <div><h2 id="score-h" className="font-display text-2xl">{nameA} & {nameB}</h2><p className={`mt-1 font-medium ${c.text}`}>{BAND_LABEL[band]}</p><p className="mt-1 text-xs text-muted-foreground">Weighted across {result.rows.length} placement{result.rows.length === 1 ? '' : 's'}</p></div>
      </div>
      <ul className="space-y-4">{result.rows.map(r => { const rb = BAND_CLASS[scoreBand(r.score)]; return (
        <li key={r.key}>
          <div className="flex items-baseline justify-between gap-2 text-sm"><span className="font-medium">{r.label}</span><span className="text-muted-foreground">{glyph(r.a)} {r.a} · {glyph(r.b)} {r.b}</span><span className="tabular-nums">{r.score}</span></div>
          <div className="mt-1.5 h-1.5 rounded-full bg-muted"><div className={`h-1.5 rounded-full ${rb.bar} transition-[width] duration-1000`} style={{ width: `${r.score}%` }} /></div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{r.elements} · {r.modalities}. {r.note}</p>
        </li>
      ); })}</ul>
      {result.omitted.length > 0 && <p className="text-xs text-muted-foreground">Not scored: {result.omitted.map(k => KEY_LABEL[k]).join(', ')} — not known for both people.</p>}
    </section>
  );
}
