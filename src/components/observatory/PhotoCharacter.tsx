import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PanelTitle } from '@/components/observatory/Observatory';

/** Draw your own photo as a 1950s comic character (3 credits). The photo is not kept; the drawing is saved privately to your library. */
export function PhotoCharacter() {
  const input = useRef<HTMLInputElement>(null);
  const [consent, setConsent] = useState(false); const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(''); const [url, setUrl] = useState<string | null>(null);
  const send = async (f?: File) => {
    if (!f) return; setErr('');
    setBusy(true);
    try {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) { window.location.assign('/auth?next=/characters'); return; }
      const fd = new FormData(); fd.append('image', f); fd.append('consent', 'yes');
      const res = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/photo-character`, { method: 'POST', headers: { Authorization: `Bearer ${s.session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: fd });
      const j = await res.json().catch(() => null);
      if (!res.ok) { setErr(j?.error ?? 'The drawing could not be made.'); return; }
      setUrl(j.url);
    } catch { setErr('The drawing could not be made. Please try again.'); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  };
  return (
    <section aria-labelledby="photo-h" className="obs-panel p-5 sm:p-6 space-y-4">
      <PanelTitle eyebrow="Cosmic Studio"><span id="photo-h">Draw me as a character</span></PanelTitle>
      <p className="max-w-2xl text-muted-foreground">Upload a clear photo and we’ll draw you in the observatory’s 1950s comic style. The photo isn’t kept. The drawing is saved privately to your library. Uses 3 credits.</p>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />This is a photo of me, or I have the person’s permission.</label>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Choose a photo" onChange={e => send(e.target.files?.[0])} />
      <Button disabled={!consent || busy} onClick={() => input.current?.click()}>{busy ? 'Drawing… (up to a minute)' : 'Choose a photo'}</Button>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      {url && <img src={url} alt="Your drawn comic character" width={512} height={512} className="w-64 rounded-md border border-border" />}
    </section>
  );
}
