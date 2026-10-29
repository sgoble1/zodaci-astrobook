import { usePageMeta } from '@/hooks/usePageMeta';
import { confirmAction } from '@/components/common/ConfirmHost';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { computeChart } from '@/lib/astro';
import { saveMyBirth, toChartInput, type MyBirth } from '@/lib/myBirth';

type Geo = { name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone: string };
const STEPS = ['Your name', 'Birth date', 'Birth time', 'Birthplace', 'Review'];

export default function Onboarding() {
  usePageMeta('Enter your birth details · Zodaci', 'Add your birth date, time and place so Zodaci can calculate your chart.');
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [b, setB] = useState<MyBirth>({ name: '', date: '', time: '', placeLabel: '', lat: 0, lon: 0, tz: '', houseSystem: 'placidus' });
  const [unknownTime, setUnknownTime] = useState(false);
  const [q, setQ] = useState('');
  const [geo, setGeo] = useState<Geo[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [stage, setStage] = useState('');
  const [editing, setEditing] = useState(false);
  const [sex, setSex] = useState('');
  const [description, setDescription] = useState('');
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: u }) => {
      if (!u.user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).from('profiles').select('*').eq('id', u.user.id).maybeSingle();
      if (!data?.birth_date) return;
      setSex(data.sex?.startsWith('Self-described: ') ? 'Prefer to self-describe' : data.sex ?? ''); setDescription(data.sex?.startsWith('Self-described: ') ? data.sex.slice(16) : ''); setEditing(true); setUnknownTime(!data.birth_time); setQ(data.place_label ?? '');
      setB({ name: data.display_name ?? '', date: data.birth_date, time: data.birth_time ?? '', placeLabel: data.place_label, lat: data.lat, lon: data.lon, tz: data.tz, houseSystem: data.house_system });
    });
  }, []);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session)); const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s)); return () => data.subscription.unsubscribe(); }, []);

  const search = async () => {
    setErr('');
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&name=${encodeURIComponent(q.split(',')[0].trim())}`).then(r => r.json());
      setGeo(r.results ?? []); if (!r.results?.length) setErr('No places found. Try just the city name.');
    } catch { setErr('Place search is unavailable right now. Please try again.'); }
  };
  const ok = [b.name.trim().length > 0, /^\d{4}-\d{2}-\d{2}$/.test(b.date), unknownTime || /^\d{2}:\d{2}$/.test(b.time ?? ''), !!b.tz, !!b.tz && !!b.name && !!b.date][step];

  const finish = async () => {
    if (editing && !await confirmAction('Save these changed birth details? Your chart is recalculated. Open each reading afterwards and use “Rewrite this reading” to update it.')) return;
    setBusy(true);
    setErr('');
    try {
      setStage('Calculating planet positions…');
      const birth = { ...b, time: unknownTime ? null : b.time };
      const chart = computeChart(toChartInput(birth));
      setStage('Saving to your account…');
      const res = await saveMyBirth(birth, savedChart(chart, !unknownTime));
      if (res.error) { setErr('Your chart is saved on this device, but your account could not save it. Please try again.'); return; }
      const { data: u } = await supabase.auth.getUser();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (u.user) await (supabase as any).from('profiles').update({ sex: (sex === 'Prefer to self-describe' ? `Self-described: ${description.trim()}` : sex).slice(0, 60) }).eq('id', u.user.id);
      setStage('Starting your readings…');
      nav(res.saved === 'device' ? '/my-chart?device=1' : '/dashboard');
    } catch { setErr('Your birth details could not be calculated. Check the date, time and selected place.'); }
    finally { setBusy(false); setStage(''); }
  };

  if (signedIn === null) return <p role="status" className="p-8 text-muted-foreground">Getting things ready…</p>;
  // Account first, so birth details save once and nothing asks to sign in again later.
  if (!signedIn) return <Navigate to="/auth?next=%2Fstart" replace />;
  return (
    <article className="mx-auto max-w-lg space-y-6 py-6">
      <header>
        <p className="font-smallcaps text-xs text-gold">Step {step + 1} of 5 · {STEPS[step]}</p>
        <h1 className="font-display text-3xl">{editing ? 'Edit your birth details' : "Let's create your chart"}</h1>
        <div className="mt-3 h-1.5 rounded bg-muted" aria-hidden><div className="h-full rounded bg-primary transition-all" style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
      </header>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (!ok) return; if (step < 4) setStep(step + 1); else void finish(); }}>
        {step === 0 && <div className="space-y-2"><Label htmlFor="n">What should we call you?</Label><Input id="n" autoFocus value={b.name} onChange={e => setB({ ...b, name: e.target.value })} maxLength={80} />
          <fieldset className="space-y-2 pt-3"><legend className="text-sm font-medium">Your sex or gender <span className="text-muted-foreground">(optional — shapes wording in love, body and attraction readings)</span></legend>
            <div className="flex flex-wrap gap-2">{['Female', 'Male', 'Non-binary', 'Intersex', 'Transgender woman', 'Transgender man', 'Prefer to self-describe', 'Prefer not to say'].map(o => <button type="button" key={o} aria-pressed={sex === o} onClick={() => setSex(o)} className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${sex === o ? 'border-primary bg-primary/15 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}>{o}</button>)}</div>
            {sex === 'Prefer to self-describe' && <Input aria-label="Describe your gender" maxLength={40} value={description} onChange={e => setDescription(e.target.value)} />}
          </fieldset></div>}
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
        {step === 4 && <dl className="divide-y divide-border">{[['Name', b.name], ['Birth date', b.date], ['Birth time', unknownTime ? 'Unknown — Rising sign and houses hidden' : b.time], ['Birthplace', b.placeLabel], ['Time zone', b.tz]].map(([label, value]) => <div key={label} className="py-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1">{value}</dd></div>)}</dl>}
        {err && step !== 3 && <p role="alert" className="text-destructive">{err}</p>}
        {stage && <p role="status" className="text-sm text-primary">{stage}</p>}
        <div className="flex justify-between">
          <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
          <Button type="submit" disabled={!ok || busy}>{busy ? 'Calculating your chart…' : step < 4 ? 'Next' : (editing ? 'Save changes' : 'Create my chart')}</Button>
        </div>
      </form>
    </article>
  );
}
