import { useState } from 'react';
import { Mic } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { loadCorpus, rank, aprilOnly } from '@/lib/corpus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const VOICES = [['Kore', 'Kore · warm, clear'], ['Aoede', 'Aoede · soft, bright'], ['Charon', 'Charon · deep, calm'], ['Puck', 'Puck · lively']] as const;
const DURATIONS = [
  ['short', 'Short', 'about 2 minutes'],
  ['standard', 'Standard', 'about 4 minutes'],
  ['long', 'Long', 'about 8 minutes'],
] as const;
type Duration = typeof DURATIONS[number][0];
const STEPS = ['Gathering passages from the sources…', 'Writing the episode script…', 'Recording the voice…', 'Saving to your podcast list…'];

/** Creates a real, playable episode: sources → written script → recorded voice → listed in Podcasts. */
export function PodcastMaker({ onCreated }: { onCreated: () => void }) {
  const [topic, setTopic] = useState(''); const [brief, setBrief] = useState(''); const [voice, setVoice] = useState('Kore');
  const [duration, setDuration] = useState<Duration>('standard');
  const [shared, setShared] = useState(false);
  const [step, setStep] = useState(-1); const [script, setScript] = useState('');
  const make = async (e: React.FormEvent) => {
    e.preventDefault(); if (!topic.trim() || step >= 0) return;
    setScript(''); setStep(0);
    try {
      const passageCount = duration === 'short' ? 8 : duration === 'long' ? 18 : 12;
      const passages = rank(aprilOnly(await loadCorpus()), `${topic} ${brief}`, passageCount).map((p, i) => ({ n: i + 1, source: p.source, loc: p.loc, text: p.text, href: p.href }));
      setStep(1); const t = window.setTimeout(() => setStep(2), 25000);
      const { data, error } = await supabase.functions.invoke('make-podcast', { body: { topic: topic.trim(), brief, voice, duration, shared, passages } });
      clearTimeout(t);
      if (error || data?.error) { let msg = data?.error; try { msg ??= (await (error as { context?: Response }).context?.json())?.error; } catch { /* ignore */ } throw new Error(msg || 'The episode could not be made.'); }
      setStep(3); setScript(data.script); onCreated();
      toast.success(`“${topic}” is ready — about ${Math.max(1, Math.round(data.seconds / 60))} min`);
      setTopic(''); setBrief('');
    } catch (err) { toast.error((err as Error).message); }
    setStep(-1);
  };
  return (
    <form onSubmit={make} className="parchment p-5 space-y-3" aria-busy={step >= 0}>
      <div className="flex items-center gap-2"><Mic className="h-5 w-5 text-accent" aria-hidden /><h2 className="text-2xl">Create an episode</h2></div>
      <p className="text-sm text-muted-foreground">Pick a topic and listening length. The episode is written from April's own sources, read aloud, and added to the list below.</p>
      <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic — e.g. Venus at 29° Leo and how April loves" aria-label="Episode topic" required />
      <Textarea value={brief} onChange={e => setBrief(e.target.value)} placeholder="Anything to focus on (optional)" aria-label="Focus" rows={2} />
      <fieldset className="space-y-2"><legend className="text-sm font-medium">Who can listen?</legend><label className="flex cursor-pointer gap-2 text-sm"><input type="radio" name="generated-podcast-sharing" checked={!shared} onChange={() => setShared(false)} /><span><strong>Only me</strong><span className="block text-muted-foreground">Keep this episode in your private library. You can share it later.</span></span></label><label className="flex cursor-pointer gap-2 text-sm"><input type="radio" name="generated-podcast-sharing" checked={shared} onChange={() => setShared(true)} /><span><strong>April &amp; Shane</strong><span className="block text-muted-foreground">Add it to the shared podcast library now.</span></span></label></fieldset>
      <fieldset className="space-y-2"><legend className="text-sm font-medium">Episode length</legend><div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{DURATIONS.map(([value, label, detail]) => <label key={value} className={`cursor-pointer rounded-md border p-3 text-sm transition ${duration === value ? 'border-primary bg-primary/15' : 'border-border hover:bg-muted'}`}><input type="radio" name="podcast-duration" value={value} checked={duration === value} onChange={() => setDuration(value)} className="mr-2" /><strong>{label}</strong><span className="mt-1 block text-xs text-muted-foreground">{detail}</span></label>)}</div></fieldset>
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Voice" value={voice} onChange={e => setVoice(e.target.value)} className="h-10 rounded-md border border-input bg-background px-2 text-sm">{VOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <Button type="submit" disabled={step >= 0 || !topic.trim()}>{step >= 0 ? 'Creating…' : 'Create episode'}</Button>
      </div>
      {step >= 0 && <ol role="status" className="space-y-1 text-sm">{STEPS.map((s, i) => <li key={s} className={i < step ? 'text-muted-foreground line-through' : i === step ? 'animate-pulse text-foreground' : 'text-muted-foreground/60'}>{s}</li>)}</ol>}
      {script && <details className="text-sm"><summary className="cursor-pointer underline">Read the cited script</summary><p className="mt-2 whitespace-pre-wrap">{script}</p><p className="mt-2 text-xs text-muted-foreground">Numbers in brackets point to the protected Masterbook and source passages saved with the episode.</p></details>}
    </form>
  );
}
