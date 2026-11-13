import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PanelTitle } from '@/components/observatory/Observatory';

/** Sky Portrait (3 credits): a 1950s observatory poster drawn from your saved Sun, Moon and Rising signs, saved privately to your library. */
export function SkyPortrait() {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const [art, setArt] = useState<{ url: string | null; title: string } | null>(null);
  const draw = async () => {
    setErr(''); setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('chart-portrait', { body: {} });
      if (error) {
        const j = await (error as { context?: Response }).context?.json?.().catch(() => null);
        setErr(j?.error ?? 'The portrait could not be drawn. Please try again.'); return;
      }
      setArt({ url: data.url, title: data.title });
    } catch { setErr('The portrait could not be drawn. Please try again.'); }
    finally { setBusy(false); }
  };
  return (
    <section aria-labelledby="sky-portrait-h" className="obs-panel space-y-4 p-5 sm:p-6">
      <PanelTitle eyebrow="Cosmic Studio"><span id="sky-portrait-h">Sky Portrait</span></PanelTitle>
      <p className="max-w-2xl text-muted-foreground">A poster drawn from your own chart: your Sun, Moon and Rising signs as observatory emblems. It's saved privately to your library. Uses 3 credits.</p>
      <Button disabled={busy} onClick={draw}>{busy ? 'Drawing… (up to a minute)' : 'Draw my Sky Portrait'}</Button>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      {art?.url && <figure className="space-y-2"><img src={art.url} alt={art.title} width={512} height={512} className="w-72 rounded-md border border-border" /><figcaption className="text-sm text-muted-foreground">{art.title}</figcaption></figure>}
    </section>
  );
}
