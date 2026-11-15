import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
import { computeChart } from '@/lib/astro';
import { dreamSky, FEELINGS } from '@/lib/dreamSky';
import { dreamDeduction } from '@/lib/dreamDeduction';
import { usePageMeta } from '@/hooks/usePageMeta';
import { toast } from 'sonner';

type Entry = {
  id: string;
  dream_date: string;
  body: string;
  feelings: string[];
  recurring: boolean;
  use_in_readings: boolean;
  use_in_book: boolean;
  use_in_comic: boolean;
  ai_reading?: string | null;
};

const MOODS = ['calm', 'dread', 'exhilarated', 'confused', 'grief'] as const;
type Mood = (typeof MOODS)[number];
const today = () => new Date().toISOString().slice(0, 10);

/** Dream ledger: private entries with the calculated sky that night. Optional dream readings use one AI credit each. */
export default function Dreams() {
  usePageMeta('Dream Ledger', 'Write down a dream and see the sky that night against your chart.');
  const birth = useMyBirth();
  const natal = useMemo(() => (birth ? computeChart(toChartInput(birth)) : null), [birth]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [body, setBody] = useState('');
  const [date, setDate] = useState(today());
  const [dreamTime, setDreamTime] = useState('03:00');
  const [feel, setFeel] = useState<string[]>([]);
  const [recurring, setRecurring] = useState(false);
  const [useInBook, setUseInBook] = useState(false);
  const [useInComic, setUseInComic] = useState(false);
  const [mood, setMood] = useState<Mood>('calm');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('dream_entries').select('*').order('dream_date', { ascending: false }).limit(50);
    setEntries((data ?? []) as Entry[]);
  };

  useEffect(() => { void load(); }, []);

  const sky = useMemo(() => (natal ? dreamSky(natal, date, feel) : null), [natal, date, feel]);
  const dossier = useMemo(() => (natal && (body.trim() || feel.length) ? dreamDeduction(natal, date, feel, mood) : null), [natal, date, feel, mood, body]);

  const save = async () => {
    if (!body.trim()) return;
    setBusy(true);
    const { error } = await supabase.from('dream_entries').insert({
      body: body.trim(),
      dream_date: date,
      feelings: feel,
      recurring,
      use_in_book: useInBook,
      use_in_comic: useInComic,
    });
    setBusy(false);
    if (error) {
      toast.error('Your dream could not be saved. Please try again.');
      return;
    }
    setBody('');
    setFeel([]);
    setRecurring(false);
    setUseInBook(false);
    setUseInComic(false);
    setMood('calm');
    toast.success('Saved to your Dream Ledger');
    void load();
  };

  const toggle = async (e: Entry, k: 'use_in_readings' | 'use_in_book' | 'use_in_comic') => {
    const { error } = await supabase.from('dream_entries').update({ [k]: !e[k] } as { use_in_readings?: boolean; use_in_book?: boolean; use_in_comic?: boolean }).eq('id', e.id);
    if (error) toast.error('That change did not save.'); else void load();
  };

  const [reading, setReading] = useState<string | null>(null);
  const readDream = async (e: Entry) => {
    if (!natal) return;
    const s = dreamSky(natal, e.dream_date, e.feelings);
    const skyLines = [...s.contacts.map(c => `${c.moving} ${c.aspect} natal ${c.target} (${c.orb}° orb)`), ...s.houses.map(h => `${h.planets.join(', ')} moving through the ${h.house}th house`)];
    setReading(e.id);
    const { data, error } = await supabase.functions.invoke('dream-reading', { body: { id: e.id, sky: skyLines } });
    setReading(null);
    if (error || data?.error) {
      toast.error(data?.error ?? 'The reading could not be written. If you are out of credits, they refresh on the 1st.');
      return;
    }
    void load();
  };

  const requestFounderReading = async () => {
    if (!body.trim()) return;
    const { data, error } = await supabase.from('dream_entries').insert({
      body: body.trim(),
      dream_date: date,
      feelings: feel,
      recurring,
      use_in_book: useInBook,
      use_in_comic: useInComic,
    }).select().single();

    if (error || !data) {
      toast.error('Your dream needs to be saved before a founder reading can be requested.');
      return;
    }

    await readDream(data as Entry);
    setBody('');
    setFeel([]);
    setRecurring(false);
    setUseInBook(false);
    setUseInComic(false);
    setMood('calm');
    void load();
  };

  const remove = async (e: Entry) => {
    const { error } = await supabase.from('dream_entries').delete().eq('id', e.id);
    if (error) toast.error('Could not delete.'); else void load();
  };

  if (birth === null) return <div className="mx-auto max-w-2xl space-y-3"><h1 className="font-display">Dream Ledger</h1><p>Add your birth details first so we can compare the sky that night with your chart.</p><Button asChild><Link to="/start">Add birth details</Link></Button></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header className="max-w-3xl space-y-3">
        <p className="font-label text-xs tracking-[0.16em] text-primary">Dream Ledger</p>
        <h1 className="font-display">Write it down before it fades.</h1>
        <p className="text-lg text-muted-foreground">Only you can see these. Below each dream is the real sky that night against your chart. Dreams are read as symbols, never as predictions.</p>
      </header>

      <section className="space-y-4 rounded-sm border border-border bg-card/60 p-5" aria-labelledby="new-dream">
        <h2 id="new-dream" className="font-display text-2xl">Dossier entry</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Night of
            <Input type="date" value={date} max={today()} onChange={e => setDate(e.target.value || today())} className="mt-1" />
          </label>
          <label className="text-sm font-medium">
            Time logged
            <Input type="time" value={dreamTime} onChange={e => setDreamTime(e.target.value || '03:00')} className="mt-1" />
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Emotional tone</label>
          <select value={mood} onChange={e => setMood(e.target.value as Mood)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {MOODS.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Motif badges</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="What was in it">
            {FEELINGS.map(f => (
              <button
                key={f}
                type="button"
                aria-pressed={feel.includes(f)}
                onClick={() => setFeel(v => v.includes(f) ? v.filter(item => item !== f) : [...v, f])}
                className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition ${feel.includes(f) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:bg-muted'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <Textarea value={body} onChange={e => setBody(e.target.value.slice(0, 8000))} rows={5} placeholder="What happened, who was there, how it felt…" aria-label="Your dream" />

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} /> recurring</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={useInBook} onChange={e => setUseInBook(e.target.checked)} /> use in book</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={useInComic} onChange={e => setUseInComic(e.target.checked)} /> use in comic</label>
        </div>

        {sky && <SkySlip sky={sky} />}

        {dossier && (
          <div className="rounded-sm border border-[hsl(var(--brass)/0.6)] bg-[hsl(var(--brass)/0.06)] p-4 text-sm">
            <p className="font-label text-xs tracking-[0.18em] text-primary">Observatory Deduction Dossier</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-primary/40 bg-primary/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-primary">Night aspect</span>
              <span className="font-medium">
                {dossier.nightSkyContacts[0]
                  ? `${dossier.nightSkyContacts[0].moving} ${dossier.nightSkyContacts[0].aspect} natal ${dossier.nightSkyContacts[0].target} · orb ${dossier.nightSkyContacts[0].orb.toFixed(1)}°`
                  : `Moon phase: ${dossier.natalResonance.moonPhase}`}
              </span>
            </div>

            <ol className="mt-4 space-y-3">
              {dossier.deductionSteps.map(step => (
                <li key={step.title} className="rounded-sm border border-border bg-card/50 p-3">
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">{step.title}</p>
                  <p className="mt-1 leading-relaxed text-foreground/90">{step.text}</p>
                </li>
              ))}
            </ol>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" onClick={requestFounderReading} disabled={!body.trim() || busy}>Request Founder's Reading (1 Credit)</Button>
              <Button type="button" variant="outline" onClick={save} disabled={busy || !body.trim()}>Save dream</Button>
            </div>
          </div>
        )}

        {!dossier && <Button onClick={save} disabled={busy || !body.trim()}>Save dream</Button>}
      </section>

      <section aria-labelledby="ledger" className="space-y-4">
        <h2 id="ledger" className="font-display text-2xl">Your ledger</h2>
        {!entries.length && <p className="text-muted-foreground">No dreams saved yet.</p>}
        {entries.map(e => (
          <article key={e.id} className="space-y-3 rounded-sm border border-border p-4">
            <p className="font-label text-xs tracking-wider text-primary">{new Date(e.dream_date + 'T12:00').toLocaleDateString(undefined, { dateStyle: 'long' })}{e.recurring ? ' · recurring' : ''}</p>
            <p className="whitespace-pre-wrap">{e.body}</p>
            {natal && <SkySlip sky={dreamSky(natal, e.dream_date, e.feelings)} />}
            {e.ai_reading ? (
              <div className="whitespace-pre-wrap rounded-sm border border-border bg-card/60 p-3 text-sm">
                <p className="font-label text-xs tracking-wider text-primary">Dream reading</p>
                <p className="mt-1">{e.ai_reading}</p>
              </div>
            ) : (
              <Button size="sm" variant="outline" disabled={reading === e.id} onClick={() => readDream(e)}>{reading === e.id ? 'Writing…' : 'Read this dream (1 credit)'}</Button>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-muted-foreground">Allowed in:</span>
              {([['use_in_readings', 'Readings'], ['use_in_book', 'Printed book'], ['use_in_comic', 'Comic']] as const).map(([k, l]) => (
                <label key={k} className="flex items-center gap-1.5">
                  <input type="checkbox" checked={e[k]} onChange={() => toggle(e, k)} />
                  {l}
                </label>
              ))}
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
        {sky.contacts.map((c, i) => <li key={`${c.moving}-${c.aspect}-${c.target}-${i}`}>{c.moving} {c.aspect} your {c.target} · {c.orb}° orb</li>)}
        {sky.houses.map(h => <li key={h.house}>Moving through your {h.house}th house: {h.planets.join(', ')}</li>)}
        {sky.motifs.map(m => <li key={m.feeling} className="text-muted-foreground">“{m.feeling}” is traditionally linked to {m.factors}.</li>)}
      </ul>
    </div>
  );
}
