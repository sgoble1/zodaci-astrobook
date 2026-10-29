import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { composeManuscript } from '@/lib/bookManuscript';
import { computeChart, SIGNS, type ChartInput } from '@/lib/astro';
import { toChartInput, type MyBirth } from '@/lib/myBirth';
import fontUrl from '@/assets/fonts/manuscript.ttf?url';
import { manuscriptManifest } from '@/lib/manuscriptManifest';
import type { Person } from '@/lib/bookExtras';
import { buildVolumes, VOLUMES, WORLD_SYSTEMS_FROM } from '@/lib/bookVolumes';
import { BOOK_VERSIONS, versionOf } from '@/lib/books';

/** Composes the reviewable six-volume manuscript for one version from the member's calculated chart and finished readings. */
export function ManuscriptPreview({ birth, edition, extras, coverUrl, certificate, onReady }: { birth: MyBirth; edition: string; extras: string[]; coverUrl?: string; certificate?: string; onReady: (file: { blob: Blob; pages: number }) => void }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [preview, setPreview] = useState<{ url: string; pages: number; readings: number; people: number } | null>(null);
  const version = versionOf(edition);
  const rank = BOOK_VERSIONS.findIndex(v => v.id === version?.id);
  const shownVolumes = VOLUMES.filter(v => v.n !== 'V' || rank >= BOOK_VERSIONS.findIndex(b => b.id === WORLD_SYSTEMS_FROM));
  const volumeCount = shownVolumes.length === 6 ? 'six' : 'five';
  const compose = async () => {
    setBusy(true); setError('');
    try {
      const { data: user } = await supabase.auth.getUser(); if (!user.user) throw new Error('Please sign in.');
      const { data: profile, error: profileError } = await supabase.from('profiles').select('onboarded_at').eq('id', user.user.id).single();
      if (profileError) throw new Error('Your saved chart could not be checked. Please retry.');
      const { data, error: err } = await supabase.from('generated_pages').select('title,content,section,status,updated_at').eq('owner_id', user.user.id).eq('status', 'ready').order('section').order('created_at');
      if (err) throw err;
      const chapters = manuscriptManifest(data ?? [], edition, extras, profile.onboarded_at);
      const c = computeChart(toChartInput(birth));
      let people: Person[] = [];
      if (edition === 'linen') {
        const { data: rel, error: relError } = await supabase.from('relationships').select('name,birth_date,birth_time,lat,lon,tz,place_label').eq('owner_id', user.user.id).order('created_at').limit(3);
        if (relError) throw new Error('Your saved relationships could not be loaded. Please retry.');
        people = (rel ?? []).map(r => ({ name: r.name, chart: computeChart({ date: r.birth_date, time: r.birth_time, lat: r.lat, lon: r.lon, tz: r.tz, placeLabel: r.place_label, placeSource: 'geocoded', houseSystem: birth.houseSystem } as ChartInput) }));
      }
      const chartFacts = [...c.bodies.map(b => `${b.name}: ${b.sign} ${b.deg}°${String(b.min).padStart(2, '0')}′${birth.time && b.house ? ` · house ${b.house}` : ''}`), ...c.aspects.map(a => `${a.a} ${a.type} ${a.b} · orb ${a.orb.toFixed(2)}°`), ...c.flags.map(f => `Limitation: ${f.topic}: ${f.note}`)].join('\n\n');
      const fontBuffer: ArrayBuffer = await (await fetch(fontUrl)).arrayBuffer();
      const coverBuffer: ArrayBuffer | undefined = coverUrl ? await (await fetch(coverUrl)).arrayBuffer() : undefined;
      const sign = (n: string) => c.bodies.find(b => b.name === n)?.sign;
      const bigThree = [sign('Sun') && `Sun in ${sign('Sun')}`, sign('Moon') && `Moon in ${sign('Moon')}`, c.asc != null && `${SIGNS[Math.floor(c.asc / 30)]} Rising`].filter(Boolean).join(' · ');
      const volumes = buildVolumes({ edition, chart: c, name: birth.name, saved: chapters, people, facts: chartFacts });
      const result = await composeManuscript({ bigThree, name: birth.name, birthFacts: `${birth.date} · ${birth.time ?? 'Time unknown'} · ${birth.placeLabel} · ${birth.tz} · ${birth.houseSystem}`, chartFacts, chapters, edition, extras, fontBytes: new Uint8Array(fontBuffer), cover: coverBuffer ? new Uint8Array(coverBuffer) : undefined, volumes, chart: c, certificate });
      const blob = new Blob([result.bytes as BlobPart], { type: 'application/pdf' }); if (preview) URL.revokeObjectURL(preview.url); setPreview({ url: URL.createObjectURL(blob), pages: result.pages, readings: chapters.length, people: people.length }); onReady({ blob, pages: result.pages });
    } catch (e) { setError(e instanceof Error ? e.message : 'Manuscript could not be composed.'); } finally { setBusy(false); }
  };
  return <section className="space-y-4 border-t border-border pt-6">
    <h2 className="text-2xl">Review your real manuscript</h2>
    <p className="text-sm text-muted-foreground">Your book is written in {volumeCount} volumes from your own calculated chart, with any readings you have finished woven in, your cover and numbered contents{version?.trim ? `, laid out at ${version.trim}` : ''}. You do not need to finish readings first. The actual page count is shown before ordering; printer approval is still required.</p>
    <ol className="grid gap-1 text-sm sm:grid-cols-2">{shownVolumes.map(v => <li key={v.n} className="flex gap-2"><span className="w-7 shrink-0 font-display text-gold">{v.n}</span><span>{v.title}</span></li>)}</ol>
    {edition === 'linen' && <p className="text-xs text-muted-foreground">Collector’s Linen compares you with up to three people saved in <a href="/relationships" className="underline">Relationships</a>. With nobody saved, it gives your own synastry keys instead.</p>}
    <Button variant="outline" disabled={busy || !coverUrl} onClick={compose}><FileText />{busy ? 'Composing manuscript…' : 'Compose manuscript PDF'}</Button>
    {!coverUrl && <p className="text-xs text-muted-foreground">Choose a cover above first.</p>}
    {preview && <div className="space-y-3"><p role="status">{preview.pages} pages composed{version ? ` · ${version.name} aims for ${version.pages[0]}–${version.pages[1]} pages` : ''}. {preview.readings ? `${preview.readings} finished reading${preview.readings === 1 ? '' : 's'} included.` : 'Written from your chart; finished readings will add to it if you compose again later.'} {version && preview.pages < version.pages[0] ? 'Finish more readings in My Masterbook to fill it out before printing.' : ''}{edition === 'linen' && !preview.people ? ' No people are saved in Relationships, so your synastry keys are included instead of comparisons.' : ''}</p><Button asChild variant="outline"><a href={preview.url} download="My-AstroBook-Manuscript.pdf"><Download />Download & review PDF</a></Button></div>}
    {error && <p role="alert" className="text-destructive">{error} <a href="/my-masterbook" className="underline">My Masterbook</a></p>}
  </section>;
}
