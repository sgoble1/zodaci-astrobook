import { useState } from 'react';
import { z } from 'zod';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Relationship } from '@/hooks/useRelationships';

type Geo = { name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone: string };
export type PersonDraft = Pick<Relationship, 'name' | 'relation' | 'sex' | 'birth_date' | 'birth_time' | 'place_label' | 'lat' | 'lon' | 'tz' | 'notes'>;

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  relation: z.string().trim().max(40),
  sex: z.enum(['male', 'female', 'unspecified']),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date is required'),
  birth_time: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  place_label: z.string().trim().min(1, 'Choose a birth place with Find').max(200),
  lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180),
  tz: z.string().min(1).max(64), notes: z.string().max(20000),
});

export const EMPTY: PersonDraft = { name: '', relation: 'Friend', sex: 'unspecified', birth_date: '', birth_time: null, place_label: '', lat: 0, lon: 0, tz: '', notes: '' };

export function PersonForm({ initial, onSave, submitLabel }: { initial: PersonDraft; onSave: (p: PersonDraft) => Promise<void>; submitLabel: string }) {
  const [f, setF] = useState<PersonDraft>(initial);
  const [q, setQ] = useState(initial.place_label);
  const [geo, setGeo] = useState<Geo[]>([]);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const set = <K extends keyof PersonDraft>(k: K, v: PersonDraft[K]) => setF(x => ({ ...x, [k]: v }));

  const find = async () => {
    setBusy(true); setErr('');
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&name=${encodeURIComponent(q.split(',')[0].trim())}`).then(r => r.json());
      setGeo(r.results ?? []); if (!r.results?.length) setErr('No places found — try just the town name.');
    } catch { setErr('Place search failed. Check your connection.'); } finally { setBusy(false); }
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    const p = schema.safeParse(f);
    if (!p.success) { setErr(p.error.issues[0].message); return; }
    setBusy(true);
    try { await onSave(p.data as PersonDraft); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="parchment p-5 grid md:grid-cols-2 gap-4 text-sm">
      <label>Name<Input value={f.name} maxLength={80} onChange={e => set('name', e.target.value)} placeholder="e.g. Alex" /></label>
      <label>Relationship<Input value={f.relation} maxLength={40} onChange={e => set('relation', e.target.value)} placeholder="Friend, sibling, colleague…" list="rel-kinds" />
        <datalist id="rel-kinds">{['Friend', 'Close friend', 'Sibling', 'Parent', 'Child', 'Colleague', 'Spouse', 'Partner', 'Ex'].map(k => <option key={k} value={k} />)}</datalist></label>
      <label>Birth date<Input type="date" required value={f.birth_date} onChange={e => set('birth_date', e.target.value)} /></label>
      <div>Birth time <span className="text-muted-foreground">(optional)</span>
        <div className="flex gap-3 items-center"><Input type="time" value={f.birth_time ?? ''} onChange={e => set('birth_time', e.target.value || null)} />
          <Button type="button" variant="ghost" size="sm" onClick={() => set('birth_time', null)}>Unknown</Button></div>
      </div>
      <label>Sex<select className="w-full border rounded h-10 px-2 bg-background" value={f.sex} onChange={e => set('sex', e.target.value as PersonDraft['sex'])}><option value="unspecified">Not given</option><option value="female">Female</option><option value="male">Male</option></select></label>
      <div>Birth place
        <div className="flex gap-2"><Input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); find(); } }} placeholder="Town, e.g. Williamsville" />
          <Button type="button" variant="outline" onClick={find} disabled={busy}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}Find</Button></div>
        {geo.length > 0 && <ul className="mt-1 border rounded bg-card">{geo.map((g, i) => { const label = [g.name, g.admin1, g.country].filter(Boolean).join(', '); return <li key={i}><button type="button" className="w-full text-left px-2 py-1 hover:bg-muted" onClick={() => { setF(x => ({ ...x, place_label: label, lat: g.latitude, lon: g.longitude, tz: g.timezone })); setQ(label); setGeo([]); }}>{label} <span className="text-xs text-muted-foreground">{g.timezone}</span></button></li>; })}</ul>}
        {f.place_label && <p className="text-xs text-muted-foreground mt-1">Using {f.place_label} ({f.lat.toFixed(3)}, {f.lon.toFixed(3)}, {f.tz})</p>}
      </div>
      <label className="md:col-span-2">Notes<textarea className="w-full border rounded p-2 bg-background min-h-20" maxLength={20000} value={f.notes} onChange={e => set('notes', e.target.value)} /></label>
      {err && <p className="md:col-span-2 text-oxblood">{err}</p>}
      <div className="md:col-span-2"><Button type="submit" disabled={busy}>{submitLabel}</Button></div>
    </form>
  );
}
