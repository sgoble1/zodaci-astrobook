import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Telescope, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { PageHead } from '@/components/observatory/PageHead';
import { localInputToIso, observationPatterns, parseTags, skyAt, type Observation } from '@/lib/observationLog';

/** "2026-11-06T21:30" for the current local minute, for the date-time field's default. */
const nowLocal = () => { const d = new Date(); d.setSeconds(0, 0); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
/** The table is missing until its migration runs; say so instead of failing. */
const missingTable = (msg: string) => /observation_log|schema cache|does not exist/i.test(msg);

export default function ObservationLog() {
  const session = useSession(); const uid = session?.user.id;
  const [rows, setRows] = useState<Observation[] | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [at, setAt] = useState(nowLocal); const [location, setLocation] = useState(''); const [notes, setNotes] = useState(''); const [tags, setTags] = useState('');
  const [busy, setBusy] = useState(false); const [fieldError, setFieldError] = useState('');

  const load = useCallback(async () => {
    if (!uid) { setRows([]); return; }
    const r = await supabase.from('observation_log').select('id, observed_at, location, notes, tags, created_at').order('observed_at', { ascending: false }).limit(200);
    if (r.error) { if (missingTable(r.error.message)) setSetupNeeded(true); else setError('Your log could not be loaded. Check your connection and refresh the page.'); setRows([]); return; }
    setRows((r.data ?? []) as Observation[]);
  }, [uid]);
  // Never show one account's log to another after sign-out or a switch.
  useEffect(() => { setRows(null); setOpen(null); setError(''); void load(); }, [load]);

  const patterns = useMemo(() => observationPatterns(rows ?? []), [rows]);
  const preview = useMemo(() => { const iso = localInputToIso(at); return iso ? skyAt(iso) : null; }, [at]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setFieldError('');
    const iso = localInputToIso(at);
    if (!iso) return setFieldError('Enter the date and time you were looking up, for example 6 Nov 2026, 9:30 PM.');
    if (!notes.trim()) return setFieldError('Write a line about what you saw, even if it was only clouds.');
    setBusy(true);
    const r = await supabase.from('observation_log').insert({ owner_id: uid!, observed_at: iso, location: location.trim().slice(0, 160), notes: notes.trim().slice(0, 4000), tags: parseTags(tags) });
    setBusy(false);
    if (r.error) { if (missingTable(r.error.message)) setSetupNeeded(true); setFieldError('That observation was not saved. Please try again.'); return; }
    setNotes(''); setTags(''); setAt(nowLocal());
    toast({ title: 'Observation logged', description: 'Saved with the sky as it was at that moment.' });
    void load();
  };
  const remove = async (o: Observation) => {
    const r = await supabase.from('observation_log').delete().eq('id', o.id);
    if (r.error) return toast({ title: 'Not deleted', description: 'Please try again.', variant: 'destructive' });
    setRows(rs => (rs ?? []).filter(x => x.id !== o.id));
  };

  return (
    <article className="mx-auto max-w-5xl space-y-8">
      <PageHead eyebrow="Observation Deck · private to you" title="Observation Log" script="What you saw, against the real sky." art="moon">
        Write down what you notice when you look up: the Moon through a window, a bright planet, a clear night. Each entry is saved with the sky calculated for that moment. Only you can read your log.
      </PageHead>

      {!uid ? (
        <div className="obs-paper space-y-3 p-6"><p>Sign in to keep your own observation log.</p><Button asChild><Link to="/auth?next=/observation-log">Sign in to start your log</Link></Button></div>
      ) : setupNeeded ? (
        <div role="status" className="obs-paper p-6"><h2 className="font-display text-2xl">The log is being set up</h2><p className="mt-2 text-muted-foreground">Observation storage isn’t switched on for this site yet. Nothing you saw is lost; check back shortly.</p></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <form onSubmit={save} noValidate className="obs-paper space-y-4 self-start p-5 sm:p-6" aria-describedby={fieldError ? 'obs-error' : undefined}>
            <h2 className="font-display text-2xl">New observation</h2>
            <div className="space-y-1.5"><Label htmlFor="obs-at">When</Label><Input id="obs-at" type="datetime-local" required value={at} onChange={e => setAt(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="obs-where">Where <span className="text-muted-foreground">(optional)</span></Label><Input id="obs-where" maxLength={160} placeholder="Back porch, Buffalo" value={location} onChange={e => setLocation(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="obs-notes">What you saw</Label><Textarea id="obs-notes" required maxLength={4000} rows={4} placeholder="Thin crescent low in the west after sunset, very bright planet above it." value={notes} onChange={e => setNotes(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="obs-tags">Tags <span className="text-muted-foreground">(comma separated)</span></Label><Input id="obs-tags" placeholder="moon, venus, clear" value={tags} onChange={e => setTags(e.target.value)} /></div>
            {preview && <p className="rounded border border-border p-3 text-sm"><span className="font-label tracking-[0.12em]">Sky at that moment:</span> {preview.phase.name} in {preview.moonSign}{preview.retrograde.length ? ` · ${preview.retrograde.join(', ')} retrograde` : ' · no planets retrograde'}</p>}
            {fieldError && <p id="obs-error" role="alert" className="text-sm text-destructive">{fieldError}</p>}
            <Button type="submit" disabled={busy}><Plus aria-hidden />{busy ? 'Saving…' : 'Log this observation'}</Button>
          </form>

          <section aria-labelledby="obs-list" className="space-y-4">
            <h2 id="obs-list" className="font-display text-2xl">Your log</h2>
            {error && <p role="alert" className="text-destructive">{error}</p>}
            {rows === null ? (
              <div className="space-y-3" aria-label="Loading your log">{[0, 1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
            ) : !rows.length ? (
              <div className="obs-paper flex items-start gap-4 p-5"><Telescope aria-hidden className="mt-1 h-6 w-6 shrink-0" /><div><p className="font-display text-xl">No observations yet</p><p className="mt-1 text-sm text-muted-foreground">Step outside tonight, look for the Moon, and log what you see. Your first entry starts the record.</p></div></div>
            ) : (
              <ol className="space-y-3">
                {rows.map(o => {
                  const sky = skyAt(o.observed_at); const isOpen = open === o.id;
                  return (
                    <li key={o.id} className="obs-paper p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-label text-xs tracking-[0.14em] text-primary">{when(o.observed_at)} · {sky.phase.name} in {sky.moonSign}</p>
                          {o.location && <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin aria-hidden className="h-3.5 w-3.5" />{o.location}</p>}
                        </div>
                        <Button size="icon" variant="ghost" aria-label={`Delete the observation from ${when(o.observed_at)}`} onClick={() => remove(o)}><Trash2 aria-hidden /></Button>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap leading-relaxed">{o.notes}</p>
                      {!!o.tags.length && <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">{o.tags.map(t => <li key={t} className="rounded-full border border-border px-2.5 py-0.5 text-xs">{t}</li>)}</ul>}
                      <button type="button" className="mt-3 font-label text-xs tracking-[0.14em] text-accent underline-offset-4 hover:underline" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : o.id)}>{isOpen ? 'Hide the sky that night' : 'Show the sky that night'}</button>
                      {isOpen && (
                        <table className="mt-3 w-full text-sm"><caption className="sr-only">Planet positions at {when(o.observed_at)}</caption>
                          <thead><tr className="text-left text-xs text-muted-foreground"><th className="py-1 font-normal">Body</th><th className="py-1 font-normal">Sign</th><th className="py-1 font-normal">Degree</th></tr></thead>
                          <tbody>{sky.bodies.map(b => <tr key={b.key} className="border-t border-border"><td className="py-1">{b.glyph} {b.name}</td><td className="py-1">{b.sign}</td><td className="py-1 tabular-nums">{b.deg.toFixed(0)}°{b.retro ? ' ℞' : ''}</td></tr>)}</tbody>
                        </table>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      )}

      {uid && !setupNeeded && patterns.count >= 3 && (
        <section aria-labelledby="obs-patterns" className="obs-panel space-y-4 p-5 sm:p-7">
          <h2 id="obs-patterns" className="font-display text-2xl">Patterns in your log</h2>
          <p className="text-sm text-muted-foreground">Counted from your {patterns.count} entries and the calculated sky on those days. These are counts, not predictions.</p>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div><dt className="font-label text-xs tracking-[0.14em] text-primary">Moon when you looked</dt><dd className="mt-1">{patterns.waxingShare}% while waxing · most often {patterns.phases[0]?.name}</dd></div>
            <div><dt className="font-label text-xs tracking-[0.14em] text-primary">Moon signs</dt><dd className="mt-1">{patterns.moonSigns.map(s => `${s.sign} (${s.n})`).join(', ')}</dd></div>
            <div><dt className="font-label text-xs tracking-[0.14em] text-primary">Your tags</dt><dd className="mt-1">{patterns.topTags.length ? patterns.topTags.map(t => `${t.tag} (${t.n})`).join(', ') : 'No tags yet'}</dd></div>
          </dl>
          {patterns.mercuryRx > 0 && <p className="text-sm">{patterns.mercuryRx} of your entries were made while Mercury was retrograde.</p>}
        </section>
      )}
    </article>
  );
}
