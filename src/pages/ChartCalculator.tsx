import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { computeChart, fmtLon, SIGN_KEYWORDS, BODY_KEYWORDS, type ChartInput } from '@/lib/astro';
import { PLACEMENTS } from '@/content/april';
import { PILLARS } from '@/content/chinese';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { ReasoningPanel } from '@/components/common/ReasoningPanel';
import { Cite } from '@/components/common/Cite';
import { CopyLinkButton } from '@/components/common/CopyLinkButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { SourceRef } from '@/content/compendium';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { aprilSourcesFor } from '@/content/birthChartBook';

export const APRIL: ChartInput = { date: '1990-09-06', time: '15:38', lat: 42.8689, lon: -76.9856, tz: 'America/New_York', placeLabel: 'Geneva, New York, United States', placeSource: 'geocoded', sex: 'female' };
const BC_SRC: SourceRef = { doc: 'Complete Birth Chart Analysis & Feng Shui Guide', section: 'Planetary positions', page: 'pp. 1–10' };
const CALC_SRC: SourceRef = { doc: 'Calculated in the app', section: 'astronomy-engine ephemeris · Porphyry houses' };
type Geo = { name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone: string };

export const fromParams = (sp: URLSearchParams): ChartInput | null => {
  const date = sp.get('d'); if (!date) return null;
  return { date, time: sp.get('t') || null, lat: +(sp.get('lat') ?? 0), lon: +(sp.get('lon') ?? 0), tz: sp.get('tz') ?? 'UTC', placeLabel: sp.get('place') ?? '', placeSource: (sp.get('src') as ChartInput['placeSource']) ?? 'manual', sex: (sp.get('sx') as ChartInput['sex']) || 'unspecified' };
};
export const toParams = (i: ChartInput) => new URLSearchParams({ d: i.date, t: i.time ?? '', lat: String(i.lat), lon: String(i.lon), tz: i.tz, place: i.placeLabel, src: i.placeSource, sx: i.sex ?? 'unspecified' }).toString();

export default function ChartCalculator() {
  const [sp, setSp] = useSearchParams();
  const input = fromParams(sp) ?? APRIL;
  const [form, setForm] = useState({ ...input, time: input.time ?? '', unknown: !input.time });
  const [q, setQ] = useState(input.placeLabel);
  const [geo, setGeo] = useState<Geo[]>([]);
  const [busy, setBusy] = useState(false);
  const [geoErr, setGeoErr] = useState('');

  const result = useMemo(() => { try { return computeChart(input); } catch (e) { return e as Error; } }, [sp.toString()]); // eslint-disable-line react-hooks/exhaustive-deps
  const isApril = input.date === APRIL.date && Math.abs(input.lat - APRIL.lat) < 0.5 && Math.abs(input.lon - APRIL.lon) < 0.5;

  const search = async () => {
    setBusy(true); setGeoErr('');
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&name=${encodeURIComponent(q.split(',')[0])}`).then(r => r.json());
      setGeo(r.results ?? []); if (!r.results?.length) setGeoErr('No places found. Try a nearby city, or enter coordinates by hand.');
    } catch { setGeoErr('Place search is unavailable right now. Enter coordinates by hand.'); }
    setBusy(false);
  };
  const choose = (g: Geo) => { const label = [g.name, g.admin1, g.country].filter(Boolean).join(', '); setForm(f => ({ ...f, lat: g.latitude, lon: g.longitude, tz: g.timezone, placeLabel: label, placeSource: 'geocoded' })); setQ(label); setGeo([]); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: ChartInput = { date: form.date, time: form.unknown || !form.time ? null : form.time, lat: +form.lat, lon: +form.lon, tz: form.tz, placeLabel: form.placeLabel || q, placeSource: form.placeSource, sex: form.sex };
    setSp(toParams(next));
  };

  return (
    <div className="space-y-10">
      <header>
        <div className="font-smallcaps text-xs text-gold">Calculator · natal positions, aspects & Ba Zi</div>
        <h1 className="text-4xl sm:text-5xl mt-2">Birth Chart Calculator</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">Enter a date, time and place. The app calculates planet positions, the Ascendant and Midheaven, the major aspects and the Chinese Four Pillars, and flags anything uncertain. It opens with April’s birth data so you can compare the results with the source documents.</p>
      </header>

      <form onSubmit={submit} className="parchment p-5 grid md:grid-cols-2 gap-4">
        <label className="text-sm">Date<Input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></label>
        <div className="text-sm">Time (local clock)
          <div className="flex gap-3 items-center"><Input type="time" value={form.time} disabled={form.unknown} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            <label className="text-xs flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={form.unknown} onChange={e => setForm(f => ({ ...f, unknown: e.target.checked }))} />Time unknown</label></div>
        </div>
        <label className="text-sm">Sex (for the Feng Shui Kua number)<select className="w-full border rounded h-10 px-2 bg-background" value={form.sex ?? 'unspecified'} onChange={e => setForm(f => ({ ...f, sex: e.target.value as ChartInput['sex'] }))}><option value="unspecified">Not given</option><option value="female">Female</option><option value="male">Male</option></select></label>
        <div className="md:col-span-2 text-sm">Place
          <div className="flex gap-2"><Input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); search(); } }} placeholder="City, e.g. Geneva New York" />
            <Button type="button" variant="outline" onClick={search} disabled={busy}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}Find</Button></div>
          {geoErr && <p className="text-xs text-oxblood mt-1">{geoErr}</p>}
          {geo.length > 0 && <ul className="border border-border rounded mt-1 divide-y divide-border bg-background">{geo.map((g, i) => <li key={i}><button type="button" onClick={() => choose(g)} className="w-full text-left px-3 py-1.5 hover:bg-muted text-sm">{[g.name, g.admin1, g.country].filter(Boolean).join(', ')} <span className="text-[11px] text-muted-foreground">· {g.latitude.toFixed(2)}, {g.longitude.toFixed(2)} · {g.timezone}</span></button></li>)}</ul>}
        </div>
        <label className="text-sm">Latitude<Input type="number" step="0.0001" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: +e.target.value, placeSource: 'manual' }))} /></label>
        <label className="text-sm">Longitude (east +, west −)<Input type="number" step="0.0001" value={form.lon} onChange={e => setForm(f => ({ ...f, lon: +e.target.value, placeSource: 'manual' }))} /></label>
        <label className="text-sm">Time zone<Input value={form.tz} onChange={e => setForm(f => ({ ...f, tz: e.target.value, placeSource: 'manual' }))} placeholder="America/New_York" /></label>
        <div className="flex items-end gap-2"><Button type="submit">Calculate</Button><Button type="button" variant="ghost" onClick={() => { setForm({ ...APRIL, time: APRIL.time!, unknown: false }); setQ(APRIL.placeLabel); setSp(toParams(APRIL)); }}>Reset to April</Button></div>
      </form>

      {result instanceof Error ? <p className="text-oxblood">Couldn’t calculate: {result.message}. Check that the time zone is a valid name like “Europe/London”.</p> : (
        <>
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-2xl">Data quality</h2>
              <div className="flex gap-3 text-sm"><CopyLinkButton path={`/chart-calculator?${sp.toString() || toParams(APRIL)}`} label="Share this chart" /><Link className="underline" to={`/reading?${toParams(input)}`}>Turn into a reading →</Link></div>
            </div>
            <p className="text-sm">{input.placeLabel || 'Manual coordinates'} · {input.lat.toFixed(4)}, {input.lon.toFixed(4)} · {input.tz} · UTC{result.utcOffsetMin >= 0 ? '+' : '−'}{Math.abs(result.utcOffsetMin / 60)} → {result.utc.toISOString().replace('T', ' ').slice(0, 16)} UT</p>
            {result.flags.length === 0 ? <div className="flex items-center gap-2 text-sm"><ConfidenceBadge level="confirmed" />All inputs present. Nothing ambiguous was found.</div>
              : <ul className="space-y-1.5">{result.flags.map((f, i) => <li key={i} className="flex items-start gap-2 text-sm"><ConfidenceBadge level={f.level} compact note={f.note} /><span><b>{f.topic}:</b> {f.note}</span></li>)}</ul>}
          </section>

          <section>
            <h2 className="text-2xl mb-3">The natal wheel</h2>
            <ChartWheel key={sp.toString()} r={result} sourcesFor={isApril ? aprilSourcesFor : undefined} />
          </section>

          <section>
            <h2 className="text-2xl mb-3">Planets & points</h2>
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="text-left font-smallcaps text-[10px] text-muted-foreground border-b border-border"><th className="py-1.5">Point</th><th>Position</th><th>House</th><th>Meaning (in-app gloss)</th>{isApril && <th>Source PDF</th>}<th>Confidence</th></tr></thead>
              <tbody>
                {result.asc != null && [['Ascendant', result.asc], ['Midheaven', result.mc!]].map(([n, l]) => (
                  <tr key={n as string} className="border-b border-border/50"><td className="py-1.5 font-medium">{n as string}</td><td className="font-mono">{fmtLon(l as number).text}</td><td>{n === 'Ascendant' ? 1 : 10}</td><td className="text-xs">{SIGN_KEYWORDS[fmtLon(l as number).sign]}</td>{isApril && <td className="text-xs">{n === 'Ascendant' ? 'Sagittarius 29°28′' : 'Libra 24°59′'}<Cite source={BC_SRC} /></td>}<td><ConfidenceBadge compact level={input.placeSource === 'manual' ? 'approximate' : 'derived'} note="Angles move ~1° every 4 minutes; accuracy depends on the birth time." /></td></tr>
                ))}
                {result.bodies.map(b => {
                  const src = isApril ? PLACEMENTS.find(p => p.key === b.key) : undefined;
                  const delta = src ? Math.abs(((b.lon - ((['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].indexOf(src.sign)) * 30 + src.degree + src.minute / 60) + 540) % 360) - 180) : null;
                  return (
                    <tr key={b.key} className="border-b border-border/50 align-top">
                      <td className="py-1.5 font-medium"><Link to={['northNode', 'southNode'].includes(b.key) || !isApril ? '#' : `/planets/${b.key}`} className={isApril ? 'underline decoration-gold/50' : ''}>{b.glyph} {b.name}</Link></td>
                      <td className="font-mono">{b.signGlyph} {b.sign} {b.deg}°{String(b.min).padStart(2, '0')}′{b.retro && !b.key.includes('Node') ? ' ℞' : ''}</td>
                      <td>{b.house ?? '—'}</td>
                      <td className="text-xs">{BODY_KEYWORDS[b.key]} · {SIGN_KEYWORDS[b.sign]}</td>
                      {isApril && <td className="text-xs">{src ? <>{src.sign} {src.degree}°{String(src.minute).padStart(2, '0')}′ · H{src.house}{delta != null && <span className={delta > 0.1 ? 'text-oxblood' : 'text-muted-foreground'}> (Δ {(delta * 60).toFixed(0)}′)</span>}<Cite source={BC_SRC} /></> : '—'}</td>}
                      <td><ConfidenceBadge compact level={b.confidence} note={b.note ?? 'Calculated from the ephemeris.'} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
            <ReasoningPanel reasoning={{
              inputs: [{ label: 'Local time', value: `${input.date} ${input.time ?? '(noon assumed)'} ${input.tz}` }, { label: 'Universal time', value: result.utc.toISOString() }, { label: 'Location', value: `${input.lat}, ${input.lon}` }],
              steps: [
                { label: 'Time zone', detail: `The browser's historical time-zone database gives UTC offset ${result.utcOffsetMin / 60} h for that moment, including daylight saving.` },
                { label: 'Ephemeris', detail: 'Geocentric apparent ecliptic longitudes (of date) from astronomy-engine, which is accurate to under 1 arc-minute for 1900–2100.' },
                { label: 'Retrograde', detail: 'A planet is marked ℞ when its longitude 12 h later is smaller than 12 h earlier.' },
                { label: 'Angles', detail: 'RAMC = apparent sidereal time × 15° + longitude. MC and Ascendant come from spherical trigonometry with the mean obliquity.' },
                { label: 'Houses', detail: 'Porphyry: each quadrant between the angles is divided into equal thirds. The source PDFs use Placidus, so a planet near a cusp can land in a different house.' },
              ],
              output: 'Positions shown above; the Δ column compares them with the PDF when the input is April’s birth.',
              confidence: input.time ? 'derived' : 'ambiguous',
              caveats: ['Chiron, Lilith, Vertex and the Part of Fortune are not computed. See the Planets pages for their values from the sources.'],
            }} />
            <p className="text-[11px] text-muted-foreground mt-2">Meaning glosses are short keywords written for the app, not quotes from the PDFs.<Cite source={CALC_SRC} /></p>
          </section>

          <section>
            <h2 className="text-2xl mb-3">Major aspects ({result.aspects.length})</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {result.aspects.map((a, i) => <div key={i} className="border border-border rounded px-3 py-2 text-sm flex justify-between gap-2"><span>{a.a} <b className="text-gold">{a.symbol}</b> {a.b}</span><span className="text-xs text-muted-foreground">{a.type} · {a.orb.toFixed(1)}°</span></div>)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Orbs: conjunction/opposition 8°, trine/square 7°, sextile 5°; +2° when the Sun or Moon is involved. {isApril && <Link to="/aspects" className="underline">Compare with the sources’ aspect interpretations</Link>}</p>
          </section>

          <section>
            <h2 className="text-2xl mb-3">Chinese Four Pillars (Ba Zi)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {result.bazi.map(p => {
                const src = isApril ? PILLARS.find(x => x.label.startsWith(p.label)) : undefined;
                const match = src ? src.romanized === p.romanized : null;
                return (
                  <div key={p.label} className="parchment p-3 text-center">
                    <div className="font-smallcaps text-[10px] text-gold">{p.label}</div>
                    <div className="font-display text-4xl mt-1">{p.stem}{p.branch}</div>
                    <div className="text-sm">{p.romanized}</div>
                    <div className="text-[11px] text-muted-foreground">{p.polarity} {p.stemElement} · {p.animal} ({p.branchElement})</div>
                    <div className="mt-2 flex justify-center"><ConfidenceBadge compact level={match === false ? 'ambiguous' : p.confidence} note={p.note} /></div>
                    {src && <div className={`text-[11px] mt-1 ${match ? 'text-muted-foreground' : 'text-oxblood'}`}>Source says {src.romanized}{match ? ' ✓' : ' — differs'}<Cite source={{ doc: 'Chinese Astrology · Four Pillars', section: 'Ba Zi for Sept 6 1990', page: 'Chinese page' }} /></div>}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 mt-3 text-sm">{Object.entries(result.elements).map(([e, n]) => <span key={e} className="border border-border rounded px-2 py-0.5">{e} {n}</span>)}</div>
            {isApril && result.bazi.some(p => { const s = PILLARS.find(x => x.label.startsWith(p.label)); return s && s.romanized !== p.romanized; }) && (
              <p className="text-sm mt-3 border-l-2 border-oxblood pl-3">The calculator’s Day pillar (and so the Hour pillar, which depends on it) differs from the site’s Ba Zi page. The calculator uses the standard sexagenary day count (1 Jan 2000 = 戊午 Wu Wu). Treat the day and hour pillars as unconfirmed until they are checked against a printed Chinese almanac. See <Link to="/data-quality" className="underline">Data Quality</Link>.</p>
            )}
            <ReasoningPanel reasoning={{
              inputs: [{ label: 'Local date', value: input.date }, { label: 'Sun longitude', value: `${result.bodies[0].lon.toFixed(3)}°` }],
              steps: [
                { label: 'Year', detail: 'The solar year starts at Lichun (Sun at 315°, ~Feb 4). Stem = (year − 4) mod 10, branch = (year − 4) mod 12.' },
                { label: 'Month', detail: 'The month branch comes from the Sun’s longitude in 30° steps starting at 315° (Yin month). The month stem follows the “Five Tigers” rule from the year stem.' },
                { label: 'Day', detail: '(Julian Day Number + 49) mod 60 gives the position in the 60-day cycle.' },
                { label: 'Hour', detail: 'Two-hour branches start at 23:00 (Zi). The stem follows the “Five Rats” rule from the day stem.' },
              ],
              output: result.bazi.map(p => `${p.label} ${p.romanized}`).join(' · '),
              confidence: input.time ? 'derived' : 'ambiguous',
              caveats: ['Some schools use true local solar time for the hour pillar; this uses clock time.'],
            }} />
          </section>
        </>
      )}
    </div>
  );
}
