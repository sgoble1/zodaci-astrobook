import { useCallback, useState } from 'react';
import { PaintedPlate } from '@/components/art/PaintedPlate';
import { PAINTED } from '@/content/paintedArt';
import { Link } from 'react-router-dom';
import { computeChart, fmtLon, type ChartResult } from '@/lib/astro';
import { useMyBirthState, toChartInput } from '@/lib/myBirth';
import { usePreparedPreview } from '@/hooks/usePreparedPreview';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PreviewFeedback } from '@/components/books/PreviewFeedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProfectionWheel } from '@/components/chart/ProfectionWheel';
import { BaZiGrid } from '@/components/eastern/BaZiGrid';
import { LoShuMatrix } from '@/components/eastern/LoShuMatrix';
import { SolarReturnOverlay } from '@/components/chart/SolarReturnOverlay';
import { PlanetarySpeedsTable } from '@/components/chart/PlanetarySpeedsTable';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { solarReturn } from '@/lib/solarReturn';
import { jonesShape } from '@/lib/jonesShapes';
import type { NodeMode } from '@/lib/lunarNodes';

export type WorkbenchMode = 'profection' | 'eastern' | 'solar' | 'dynamics';
const TITLES: Record<WorkbenchMode, string> = { profection: 'Annual Profections', eastern: 'Four Pillars & Lo Shu', solar: 'Solar Return', dynamics: 'Chart Shapes & Motion' };
export default function CalculationWorkbench({ mode }: { mode: WorkbenchMode }) {
  const { birth, error, retry } = useMyBirthState();
  const [nodeMode, setNodeMode] = useState<NodeMode>('mean');
  const build = useCallback(() => birth ? computeChart({ ...toChartInput(birth), nodeMode }) : null, [birth, nodeMode]);
  const prepared = usePreparedPreview(birth === undefined ? null : build);
  usePageMeta(`${TITLES[mode]} · Zodaci`, 'Calculated from your saved chart, with transparent methods and no AI credit use.');
  return <article className="voyager-instrument mx-auto max-w-5xl space-y-10"><PaintedPlate {...(mode === 'eastern' ? PAINTED.dualOrbit : PAINTED.transit)} shape="panorama" priority /><header className="voyager-instrument-heading space-y-3"><p className="font-label text-accent">Calculation field log</p><h1 className="font-display text-4xl">{TITLES[mode]}</h1><p className="text-muted-foreground">Calculated from your saved birth details. No AI credits used.</p></header>
    {error ? <PreviewFeedback error onRetry={retry} details /> : prepared.status === 'error' ? <PreviewFeedback error onRetry={prepared.retry} details /> : prepared.status === 'loading' ? <PreviewFeedback loadingMessage="Calculating your chart…" /> : !prepared.value ? <section className="space-y-4"><p>Add your birth details to see your own calculations.</p><Button asChild><Link to="/start">Add birth details</Link></Button></section> : <>
      {mode === 'profection' && <ProfectionWheel key={prepared.value.utc.toISOString()} chart={prepared.value} />}
      {mode === 'eastern' && <><BaZiGrid chart={prepared.value} /><LoShuMatrix date={prepared.value.input.date} /></>}
      {mode === 'solar' && <ReturnCalculator key={prepared.value.utc.toISOString()} natal={prepared.value} />}
      {mode === 'dynamics' && <><div role="radiogroup" aria-label="Lunar node calculation" className="flex flex-wrap gap-3">{(['mean', 'true'] as const).map(value => <Button key={value} role="radio" aria-checked={nodeMode === value} variant={nodeMode === value ? 'default' : 'outline'} onClick={() => setNodeMode(value)}>{value === 'mean' ? 'Mean Node' : 'True Node'}</Button>)}</div><ShapeView chart={prepared.value} /><ChartWheel r={prepared.value} /><PlanetarySpeedsTable /></>}
    </>}
    <nav className="flex flex-wrap gap-3 border-t border-border pt-6 text-sm"><Link className="underline underline-offset-4" to="/my-chart">My chart</Link><Link className="underline underline-offset-4" to="/solar-return">Solar Return</Link><Link className="underline underline-offset-4" to="/profection">Profections</Link><Link className="underline underline-offset-4" to="/bazi">Four Pillars & Lo Shu</Link><Link className="underline underline-offset-4" to="/chart-dynamics">Shapes & motion</Link></nav>
  </article>;
}
function ShapeView({ chart }: { chart: ChartResult }) {
  const shape = jonesShape(chart);
  return <section className="space-y-3"><h2 className="font-display text-3xl">{shape ? `${shape.shape} distribution` : 'Chart distribution · time needed'}</h2><p>{shape?.note ?? 'The provisional Moon can change a borderline shape; save a birth time before assigning a Jones pattern.'}</p>{shape && <p className="text-sm text-muted-foreground">Ten-planet span: {shape.span.toFixed(2)}°{shape.handle !== undefined ? ` · handle at ${fmtLon(shape.handle).text}` : ''}. Jones patterns describe distribution, not personality rank. Borderline charts may admit a different reading.</p>}<p className="text-sm text-muted-foreground">North Node: {fmtLon(chart.bodies.find(b => b.key === 'northNode')?.lon ?? 0).text}. Changing the node method here is local; it never rewrites your saved chart.</p></section>;
}
function ReturnCalculator({ natal }: { natal: ChartResult }) {
  const [form, setForm] = useState({ year: String(new Date().getUTCFullYear()), lat: String(natal.input.lat), lon: String(natal.input.lon), tz: natal.input.tz });
  const [submitted, setSubmitted] = useState(form);
  const build = useCallback(() => solarReturn(natal, Number(submitted.year), { lat: Number(submitted.lat), lon: Number(submitted.lon), tz: submitted.tz.trim(), placeLabel: 'Selected return location' }), [natal, submitted]);
  const prepared = usePreparedPreview(build);
  return <section className="space-y-6"><form onSubmit={e => { e.preventDefault(); setSubmitted({ ...form }); }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{([{ key: 'year', label: 'Return year', min: 1800, max: 2100, step: 1 }, { key: 'lat', label: 'Latitude', min: -89.99, max: 89.99, step: 'any' }, { key: 'lon', label: 'Longitude', min: -180, max: 180, step: 'any' }, { key: 'tz', label: 'IANA time zone' }] as const).map(f => <label key={f.key} className="space-y-2 text-sm"><span>{f.label}</span><Input required type={f.key === 'tz' ? 'text' : 'number'} {...('min' in f ? { min: f.min, max: f.max, step: f.step } : {})} value={form[f.key]} onChange={e => setForm(old => ({ ...old, [f.key]: e.target.value }))} /></label>)}<Button type="submit" className="sm:col-span-2 lg:col-span-4 justify-self-start">Calculate at this location</Button></form><p className="text-sm text-muted-foreground">Coordinates start at your birthplace. Enter where you expect to be for the return; location changes the angles and houses, not the instant of solar longitude alignment.</p>
    {prepared.status === 'loading' ? <PreviewFeedback loadingMessage="Finding your exact solar return…" /> : prepared.status === 'error' ? <div role="alert" className="space-y-3"><p className="text-destructive">The return could not be calculated. Check the year, coordinates and time zone, then try again.</p><Button variant="outline" onClick={prepared.retry}>Try again</Button></div> : <><p className="text-lg" aria-live="polite">{prepared.value.instant.toISOString().replace('T', ' ').replace('Z', ' UTC')}</p><p className="text-sm text-muted-foreground">Local: {prepared.value.instant.toLocaleString(undefined, { timeZone: submitted.tz })} ({submitted.tz}).{prepared.value.provisional ? ' Birth time unknown: provisional natal Sun; no return angles or houses are claimed.' : ` Return Ascendant: ${prepared.value.chart.asc == null ? 'unavailable' : fmtLon(prepared.value.chart.asc).text}.`}</p><SolarReturnOverlay natal={natal} returned={prepared.value.chart} /><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Point</th><th className="p-2">Natal</th><th className="p-2">Return</th></tr></thead><tbody>{prepared.value.chart.bodies.filter(b => ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(b.key)).map(b => <tr key={b.key} className="border-t border-border"><th className="p-2 font-normal">{b.name}</th><td className="p-2">{fmtLon(natal.bodies.find(n => n.key === b.key)?.lon ?? 0).text}</td><td className="p-2">{fmtLon(b.lon).text}{b.house ? ` · H${b.house}` : ''}</td></tr>)}</tbody></table></div>{prepared.value.chart.flags.filter(f => f.topic === 'Houses').map(f => <p key={f.topic} className="text-sm text-muted-foreground">{f.note}</p>)}</>}
  </section>;
}