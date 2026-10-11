import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, BookOpen, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { getStripeEnvironment } from '@/lib/stripe';
import { useSubscription } from '@/hooks/useSubscription';

/** Creator plan tools: new Masterbook chapters and podcasts written from the member's own saved chart. */
export function CreatorStudio({ onMade }: { onMade?: () => void }) {
  const sub = useSubscription();
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState<'short' | 'standard' | 'long'>('standard');
  const [busy, setBusy] = useState<null | 'chapter' | 'podcast'>(null);
  const [msg, setMsg] = useState('');

  if (sub.loading) return null;
  if (sub.tier !== 'creator') return (
    <section className="parchment p-5 space-y-2" aria-labelledby="studio-h">
      <h2 id="studio-h" className="text-xl">Creator Studio</h2>
      <p className="text-sm text-muted-foreground">Make podcasts and new Masterbook chapters written from your own chart. Included with the Creator plan ($14.99/month).</p>
      <Button asChild size="sm"><Link to="/pricing">See the Creator plan</Link></Button>
    </section>
  );

  const make = async (kind: 'chapter' | 'podcast') => {
    if (topic.trim().length < 2) return setMsg('Type a topic first.');
    setBusy(kind); setMsg(kind === 'podcast' ? 'Writing and recording your episode — this can take a minute or two…' : 'Writing your chapter…');
    const { data, error } = await supabase.functions.invoke('creator-studio', { body: { kind, topic, duration, environment: getStripeEnvironment() } });
    setBusy(null);
    if (error || data?.error) return setMsg(data?.error || 'Something went wrong. Please try again.');
    setMsg(kind === 'podcast' ? 'Your episode is ready below.' : 'Your chapter is ready below.'); setTopic(''); onMade?.();
  };

  return (
    <section className="parchment p-5 space-y-3" aria-labelledby="studio-h">
      <h2 id="studio-h" className="text-xl">Creator Studio</h2>
      <p className="text-sm text-muted-foreground">Everything is written only from your saved chart — no invented placements.</p>
      <label className="block text-sm" htmlFor="studio-topic">Topic</label>
      <Input id="studio-topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. How I handle money, My Moon and feelings" maxLength={200} />
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => make('chapter')} disabled={!!busy}>{busy === 'chapter' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <BookOpen className="h-4 w-4" aria-hidden />} Write a chapter</Button>
        <label className="sr-only" htmlFor="studio-len">Podcast length</label>
        <select id="studio-len" value={duration} onChange={e => setDuration(e.target.value as typeof duration)} className="h-10 rounded-md border border-input bg-background px-2 text-sm">
          <option value="short">Short (~2 min)</option><option value="standard">Standard (~4 min)</option><option value="long">Long (~8 min)</option>
        </select>
        <Button variant="outline" onClick={() => make('podcast')} disabled={!!busy}>{busy === 'podcast' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Mic className="h-4 w-4" aria-hidden />} Make a podcast</Button>
      </div>
      {msg && <p className="text-sm" aria-live="polite">{msg}</p>}
    </section>
  );
}
