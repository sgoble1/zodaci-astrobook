import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, BookOpen, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { getStripeEnvironment } from '@/lib/stripe';
import { useSubscription } from '@/hooks/useSubscription';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useMyBirth } from '@/lib/myBirth';

/** Cosmic plan tools: new Masterbook chapters and podcasts written from the member's own saved chart. */
export function CreatorStudio({ onMade }: { onMade?: () => void }) {
  const sub = useSubscription();
  const [params] = useSearchParams();
  const spaces = useWorkspaces();
  const birth = useMyBirth();
  const [topic, setTopic] = useState(params.get('topic') ?? '');
  const [workspaceId, setWorkspaceId] = useState('');
  const [duration, setDuration] = useState<'short' | 'standard' | 'long'>('standard');
  const [busy, setBusy] = useState<null | 'chapter' | 'podcast'>(null);
  const [msg, setMsg] = useState('');

  if (sub.loading) return null;
  if (sub.tier !== 'creator') return (
    <section className="parchment p-5 space-y-2" aria-labelledby="studio-h">
      <h2 id="studio-h" className="text-xl">Cosmic Studio</h2>
      <p className="text-sm text-muted-foreground">Make podcasts and new Masterbook chapters written from your own chart. Included with the Cosmic plan ($19/month).</p>
      <Button asChild size="sm"><Link to="/pricing">See the Cosmic plan</Link></Button>
    </section>
  );

  const make = async (kind: 'chapter' | 'podcast') => {
    if (topic.trim().length < 2) return setMsg('Type a topic first.');
    setBusy(kind); setMsg(kind === 'podcast' ? 'Writing and recording your episode — this can take a minute or two…' : 'Writing your chapter…');
    try {
      const { data, error } = await supabase.functions.invoke('creator-studio', { body: { kind, topic, duration, workspaceId: kind === 'podcast' ? workspaceId || null : null, environment: getStripeEnvironment() } });
      if(error || data?.error) { let message=data?.error; if(!message && error?.context instanceof Response) message=(await error.context.json().catch(()=>null))?.error; throw new Error(message || 'Generation could not finish.'); }
      setMsg(kind === 'podcast' ? 'Your episode is saved in Podcasts.' : 'Your chapter is saved in My Masterbook.'); setTopic(''); onMade?.();
    } catch(e) { setMsg(e instanceof Error ? e.message : 'Generation could not finish.'); }
    finally {setBusy(null);}
  };

  return (
    <section className="parchment p-5 space-y-3" aria-labelledby="studio-h">
      <h2 id="studio-h" className="text-xl">Cosmic Studio</h2>
      <p className="text-sm text-muted-foreground">Everything is written only from your saved chart — no invented placements.</p>
      <label className="block text-sm" htmlFor="studio-topic">Topic</label>
      <Input id="studio-topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. How I handle money, My Moon and feelings" maxLength={200} />
      <div className="space-y-2"><h3 className="text-base">Recommended topics to create</h3><div className="flex flex-wrap gap-2">{[birth?.time ? 'My Rising sign and first impressions' : 'Understanding my chart without a birth time','My Moon and emotional needs','Mercury and how I communicate','Work, rest and sustainable routines'].map(t=><Button key={t} variant="outline" size="sm" className="h-auto min-h-9 whitespace-normal text-left" onClick={()=>setTopic(t)}>{t}</Button>)}</div><Link to="/personal-context" className="text-sm text-gold underline">Add your own life examples</Link></div>
      <div><label htmlFor="studio-visibility" className="block text-sm mb-2">Who should be able to listen to this podcast?</label><select id="studio-visibility" value={workspaceId} onChange={e=>setWorkspaceId(e.target.value)} className="w-full h-10 rounded border border-input bg-background px-3"><option value="">Keep private—only me</option>{spaces.map(s=><option key={s.id} value={s.id}>Share with {s.name}</option>)}</select><p className="text-xs text-muted-foreground mt-2">Shared episodes can include examples you approved for generation. <Link to="/workspaces" className="underline">Manage invited members</Link></p></div>
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
