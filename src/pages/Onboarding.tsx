import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { computeChart } from '@/lib/astro';
import { saveMyBirth, toChartInput, type MyBirth } from '@/lib/myBirth';

type Geo = { name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone: string };
const STEPS = ['Your name', 'Birth date', 'Birth time', 'Birthplace'];

export default function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [b, setB] = useState<MyBirth>({ name: '', date: '', time: '', placeLabel: '', lat: 0, lon: 0, tz: '', houseSystem: 'placidus' });
  const [unknownTime, setUnknownTime] = useState(false);
  const [q, setQ] = useState('');
  const [geo, setGeo] = useState<Geo[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const search = async () => {
    setErr('');
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&name=${encodeURIComponent(q.split(',')[0].trim())}`).then(r => r.json());
      setGeo(r.results ?? []); if (!r.results?.length) setErr('No places found. Try just the city name.');
    } catch { setErr('Place search is unavailable right now. Please try again.'); }
  };
  const ok = [b.name.trim().length > 0, /^\d{4}-\d{2}-\d{2}$/.test(b.date), unknownTime || /^\d{2}:\d{2}$/.test(b.time ?? ''), !!b.tz][step];

  const finish = async () => {
    setBusy(true);
    const birth = { ...b, time: unknownTime ? null : b.time };
    const chart = computeChart(toChartInput(birth));
    const res = await saveMyBirth(birth, { bodies: chart.bodies, asc: chart.asc, mc: chart.mc });
    nav(res.saved === 'device' ? '/my-chart?device=1' : '/my-chart');
  };

  return (
    <article className="mx-auto max-w-lg space-y-6 py-6">
      <header>
        <p className="font-smallcaps text-xs text-gold">Step {step + 1} of 4 · {STEPS[step]}</p>
        <h1 className="font-display text-3xl">Let's build your AstroBook</h1>
        <div className="mt-3 h-1.5 rounded bg-muted" aria-hidden><div className="h-full rounded bg-primary transition-all" style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      </header>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (!ok) return; step < 3 ? setStep(step + 1) : finish(); }}>
        {step === 0 && <div className="space-y-2"><Label htmlFor="n">What should we call you?</Label><Input id="n" autoFocus value={b.name} onChange={e => setB({ ...b, name: e.target.value })} maxLength={80} /></div>}
        {step === 1 && <div className="space-y-2"><Label htmlFor="d">Date of birth</Label><Input id="d" type="date" autoFocus value={b.date} onChange={e => setB({ ...b, date: e.target.value })} /></div>}
        {step === 2 && <div className="space-y-2">
          <Label htmlFor="t">Time of birth (from your birth certificate if possible)</Label>
          <Input id="t" type="time" autoFocus disabled={unknownTime} value={b.time ?? ''} onChange={e => setB({ ...b, time: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unknownTime} onChange={e => setUnknownTime(e.target.checked)} /> I don't know my birth time</label>
          {unknownTime && <p className="text-sm text-muted-foreground">No problem. Your planets' signs will still be accurate, but your Rising sign and houses depend on the exact time, so they'll be hidden.</p>}
        </div>}
        {step === 3 && <div className="space-y-2">
          <Label htmlFor="p">Town or city of birth</Label>
          <div className="flex gap-2"><Input id="p" autoFocus value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); search(); } }} /><Button type="button" variant="outline" onClick={search}>Search</Button></div>
          {geo.length > 0 && <ul className="rounded border border-border">{geo.map((g, i) => { const label = [g.name, g.admin1, g.country].filter(Boolean).join(', '); return <li key={i}><button type="button" className="w-full px-3 py-2 text-left hover:bg-muted focus-visible:bg-muted" onClick={() => { setB({ ...b, placeLabel: label, lat: g.latitude, lon: g.longitude, tz: g.timezone }); setQ(label); setGeo([]); }}>{label} <span className="text-xs text-muted-foreground">{g.timezone}</span></button></li>; })}</ul>}
          {b.tz && <p className="text-sm text-muted-foreground">Using {b.placeLabel} ({b.lat.toFixed(3)}, {b.lon.toFixed(3)}, time zone {b.tz}).</p>}
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        </div>}
        <div className="flex justify-between">
          <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
          <Button type="submit" disabled={!ok || busy}>{busy ? 'Calculating your chart…' : step < 3 ? 'Next' : 'Create my chart'}</Button>
        </div>
      </form>
    </article>
  );
}
