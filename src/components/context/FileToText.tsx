import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';

const toB64 = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] ?? ''); r.onerror = rej; r.readAsDataURL(f); });

/** Fill the text box from a diary photo, PDF or text file. Text files are read in the browser; photos and PDFs use one AI credit. */
export function FileToText({ onText }: { onText: (t: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const pick = async (f?: File) => {
    if (!f) return; setErr('');
    if (f.size > 8 * 1024 * 1024) { setErr('That file is too large. Keep it under 8 MB.'); return; }
    if (f.type.startsWith('text/') || /\.(txt|md)$/i.test(f.name)) { onText((await f.text()).slice(0, 6000)); return; }
    setBusy(true);
    try {
      const { data: s } = await supabase.auth.getSession();
      const res = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/context-extract`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.session?.access_token ?? ''}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ mime: f.type, name: f.name, data: await toB64(f) }),
      });
      if (!res.ok || !res.body) { const j = await res.json().catch(() => null); setErr(j?.error ?? 'The file could not be read.'); return; }
      const reader = res.body.getReader(), dec = new TextDecoder(); let text = '';
      while (true) { const { done, value } = await reader.read(); if (done) break; text += dec.decode(value, { stream: true }); onText(text.slice(0, 6000)); }
    } catch { setErr('The file could not be read. Please try again.'); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  };
  return (
    <div className="space-y-1">
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,.txt,.md" className="sr-only" onChange={e => pick(e.target.files?.[0])} aria-label="Choose a file to read" />
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => input.current?.click()}><FileUp />{busy ? 'Reading…' : 'Fill from a photo, PDF or text file'}</Button>
      <p className="text-xs text-muted-foreground">Photos and PDFs use one credit. You review the text before anything is saved.</p>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
    </div>
  );
}
