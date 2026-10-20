import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Affirmation } from '@/lib/affirmations';
import { Button } from '@/components/ui/button';

const BACKS = ['from-primary/30 via-background to-background', 'from-gold/25 via-background to-background', 'from-accent/30 via-background to-background', 'from-oxblood/30 via-background to-background', 'from-starlight/20 via-background to-background'];

/** MOD-006: one affirmation per slide; swipe or use the arrows; save favourites to your account. */
export function AffirmationsCarousel({ items }: { items: Affirmation[] }) {
  const [i, setI] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [uid, setUid] = useState<string | null>(null);
  const touch = useRef<number | null>(null);
  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const id = s.session?.user.id ?? null; setUid(id); if (!id) return;
      const { data } = await supabase.from('saved_affirmations').select('text').eq('owner_id', id);
      setSaved(new Set((data ?? []).map(r => r.text)));
    })();
  }, []);
  if (!items.length) return null;
  const a = items[i];
  const go = (d: number) => setI(x => (x + d + items.length) % items.length);
  const toggle = async () => {
    if (!uid) { toast.error('Sign in to save affirmations'); return; }
    if (saved.has(a.text)) {
      const { error } = await supabase.from('saved_affirmations').delete().eq('owner_id', uid).eq('text', a.text);
      if (error) return toast.error('Could not remove it. Please try again.');
      setSaved(s => { const n = new Set(s); n.delete(a.text); return n; });
    } else {
      const { error } = await supabase.from('saved_affirmations').insert({ owner_id: uid, text: a.text, source: a.source.slice(0, 120) });
      if (error && !/duplicate/i.test(error.message)) return toast.error('Could not save it. Please try again.');
      setSaved(s => new Set(s).add(a.text)); toast.success('Saved to your affirmations');
    }
  };
  const share = async () => {
    const text = `“${a.text}” — ${a.source}, from my chart on Zodaci`;
    try { if (navigator.share) await navigator.share({ text, url: 'https://zodaci.com' }); else { await navigator.clipboard.writeText(text); toast.success('Copied to share'); } } catch { /* closed */ }
  };
  return (
    <div className="space-y-3" aria-roledescription="carousel" aria-label="Your affirmations">
      <div onTouchStart={e => { touch.current = e.touches[0].clientX; }} onTouchEnd={e => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); touch.current = null; }}
        className={`relative flex min-h-56 flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${BACKS[i % BACKS.length]} p-8 text-center transition-colors duration-1000`} aria-live="polite" aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}`}>
        <p className="max-w-xl font-display text-2xl leading-snug md:text-3xl">“{a.text}”</p>
        <p className="mt-4 text-xs text-muted-foreground">{a.source}</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button size="icon" variant="outline" onClick={() => go(-1)} aria-label="Previous affirmation"><ChevronLeft className="h-4 w-4" /></Button>
        <span className="text-sm text-muted-foreground">{i + 1} / {items.length}</span>
        <div className="flex gap-2">
          <Button size="sm" variant={saved.has(a.text) ? 'secondary' : 'outline'} onClick={toggle} aria-pressed={saved.has(a.text)}><Heart className={`h-4 w-4 ${saved.has(a.text) ? 'fill-current' : ''}`} aria-hidden />{saved.has(a.text) ? 'Saved' : 'Save'}</Button>
          <Button size="sm" variant="outline" onClick={share}><Share2 className="h-4 w-4" aria-hidden />Share</Button>
          <Button size="icon" variant="outline" onClick={() => go(1)} aria-label="Next affirmation"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      {saved.size > 0 && <details className="rounded border border-border bg-card p-3 text-sm"><summary className="cursor-pointer">Your saved affirmations ({saved.size})</summary><ul className="mt-2 list-disc space-y-1 pl-5">{[...saved].map(t => <li key={t}>{t}</li>)}</ul></details>}
    </div>
  );
}
