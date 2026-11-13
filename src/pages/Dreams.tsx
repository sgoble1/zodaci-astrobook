import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
import { computeChart } from '@/lib/astro';
import { dreamSky, FEELINGS } from '@/lib/dreamSky';
import { usePageMeta } from '@/hooks/usePageMeta';
import { toast } from 'sonner';

type Entry = { id: string; dream_date: string; body: string; feelings: string[]; recurring: boolean; use_in_readings: boolean; use_in_book: boolean; use_in_comic: boolean };
const today = () => new Date().toISOString().slice(0, 10);

/** Dream ledger: private entries with the calculated sky that night. No AI is used here. */
export default function Dreams() {
  usePageMeta('Dream Ledger', 'Write down a dream and see the sky that night against your chart.');
  const birth = useMyBirth();
  const natal = useMemo(() => (birth ? computeChart(toChartInput(birth)) : null), [birth]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [body, setBody] = useState(''); const [date, setDate] = useState(today()); const [feel, setFeel] = useState<string[]>([]); const [recurring, setRecurring] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = async () => { const { data } = await supabase.from('dream_entries').select('*').order('dream_date', { ascending: false }).limit(50); setEntries((data ?? []) as Entry[]); };
  useEffect(() => { void load(); }, []);
  const sky = useMemo(() => (natal ? dreamSky(natal, date, feel) : null), [natal, date, feel]);

  const save = async () => {
    if (!body.trim()) return;
    setBusy(true);
    const { error } = await supabase.from('dream_entries').insert({ body: body.trim(), dream_date: date, feelings: feel, recurring });
    setBusy(false);
    if (error) { toast.error('Your dream could not be saved. Please try again.'); return; }
    setBody(''); setFeel([]); setRecurring(false); toast.success('Saved to your Dream Ledger'); void load();
  };
  const toggle = async (e: Entry, k: 'use_in_readings' | 'use_in_book' | 'use_in_comic') => {
    const { error } = await supabase.from('dream_entries').update({ [k]: !e[k] } as { use_in_readings?: boolean; use_in_book?: boolean; use_in_comic?: boolean }).eq('id', e.id);
    if (error) toast.error('That change did not save.'); else void load();
  };
  const remove = async (e: Entry) => { const { error } = await supabase.from('dream_entries').delete().eq('id', e.id); if (error) toast.error('Could not delete.'); else void load(); };

  if (birth === null) return <div className="mx-auto max-w-2xl space-y-3"><h1 className="font-display">Dream Ledger</h1><p>Add your birth details first so we can compare the sky that night with your chart.</p><Button asChild><Link to="/start">Add birth details</Link></Button></div>;
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header className="max-w-3xl space-y-3">
        <p className="font-label text-xs tracking-[0.16em] text-primary">Dream Ledger</p>
        <h1 className="font-display">Write it down before it fades.</h1>
        <p className="text-lg text-muted-foreground">Only you can see these. Below each dream is the real sky that night against your chart. Dreams are read as symbols, never as predictions.</p>
      </header>

      <section className="space-y-4 rounded-sm border border-border bg-card/60 p-5" aria-labelledby="new-dream">
        <h2 id="new-dream" className="font-display text-2xl">Last night’s dream</h2>
        <Textarea value={body} onChange={e => setBody(e.target.value.slice(0, 8000))} rows={5} placeholder="What happened, who was there, how it felt…" aria-label="Your dream" />
        <div className="flex flex-wrap items-center gap-3"><label className="text-sm">Night of <Input type="date" value={date} max={today()} onChange={e => setDate(e.target.value || today())} className="inline-block w-auto" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} /> I’ve had this before</label></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="What was in it">{FEELINGS.map(f => <button key={f} type="button" aria-pressed={feel.includes(f)} onClick={() => setFeel(v => v.includes(f) ? v.filter(x => x !== f) : [...v, f])} className={`min-h-9 rounded-sm border px-3 text-sm ${feel.includes(f) ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{f}</button>)}</div>
        {sky && <SkySlip sky={sky} />}
        <Button onClick={save} disabled={busy || !body.trim()}>Save dream</Button>
      </section>

      <section aria-labelledby="ledger" className="space-y-4">
        <h2 id="ledger" className="font-display text-2xl">Your ledger</h2>
        {!entries.length && <p className="text-muted-foreground">No dreams saved yet.</p>}
        {entries.map(e => (
          <article key={e.id} className="space-y-3 rounded-sm border border-border p-4">
            <p className="font-label text-xs tracking-wider text-primary">{new Date(e.dream_date + 'T12:00').toLocaleDateString(undefined, { dateStyle: 'long' })}{e.recurring ? ' · recurring' : ''}</p>
            <p className="whitespace-pre-wrap">{e.body}</p>
            {natal && <SkySlip sky={dreamSky(natal, e.dream_date, e.feelings)} />}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-muted-foreground">Allowed in:</span>
              {([['use_in_readings', 'Readings'], ['use_in_book', 'Printed book'], ['use_in_comic', 'Comic']] as const).map(([k, l]) => <label key={k} className="flex items-center gap-1.5"><input type="checkbox" checked={e[k]} onChange={() => toggle(e, k)} />{l}</label>)}
              <Button size="sm" variant="ghost" onClick={() => remove(e)}>Delete</Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function SkySlip({ sky }: { sky: ReturnType<typeof dreamSky> }) {
  const empty = !sky.contacts.length && !sky.houses.length && !sky.motifs.length;
  return (
    <div className="rounded-sm border border-[hsl(var(--brass)/0.5)] bg-[hsl(var(--brass)/0.06)] p-3 text-sm">
      <p className="font-label text-xs tracking-wider">Sky that night</p>
      {empty && <p className="mt-1 text-muted-foreground">No close contacts to your Moon, Neptune, Pluto or South Node that night.</p>}
      <ul className="mt-1 space-y-0.5">
        {sky.contacts.map((c, i) => <li key={i}>{c.moving} {c.aspect} your {c.target} · {c.orb}° orb</li>)}
        {sky.houses.map(h => <li key={h.house}>Moving through your {h.house}th house: {h.planets.join(', ')}</li>)}
        {sky.motifs.map(m => <li key={m.feeling} className="text-muted-foreground">“{m.feeling}” is traditionally linked to {m.factors}.</li>)}
      </ul>
    </div>
  );
}
