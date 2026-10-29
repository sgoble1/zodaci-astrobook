import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, PauseCircle, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { confirmAction } from '@/components/common/ConfirmHost';
import { ASSET_TEMPLATES, MYSTIC_CHECKLIST, MYSTIC_INK_NEGATIVE, MYSTIC_PALETTE, SIGN_STYLE, mysticPrompt, type AssetType } from '@/content/mysticInk';

type Pause = { scope: string; message: string; created_at: string };
const SCOPE: Record<string, string> = { workspace: 'All AI features (readings, art, podcasts, covers)' };

/** Admin → AI & illustrations: see and lift automatic AI pauses, and build Mystic Ink prompts. */
export function AiStudioAdmin() {
  return <div className="space-y-12"><AiPauses /><MysticInkBuilder /></div>;
}

function AiPauses() {
  const [rows, setRows] = useState<Pause[] | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState('');
  const load = async () => {
    setErr('');
    const { data, error } = await supabase.rpc('admin_ai_pauses');
    if (error) { setErr('AI status could not be loaded.'); return; }
    setRows((data ?? []) as Pause[]);
  };
  useEffect(() => { void load(); }, []);
  const clear = async (p: Pause) => {
    if (!(await confirmAction('Resume AI features? Do this once the AI service has credit again, or new requests will pause it straight away.', 'Resume AI'))) return;
    setBusy(p.scope);
    const { data, error } = await supabase.rpc('admin_clear_ai_pause', { _scope: p.scope });
    setBusy('');
    if (error) { toast.error('Could not resume AI — please try again.'); return; }
    toast.success(data ? 'AI features are running again.' : 'That pause had already been lifted.');
    void load();
  };
  return (
    <section aria-labelledby="ai-pause" className="space-y-3">
      <div><h2 id="ai-pause" className="text-2xl">AI status</h2><p className="max-w-2xl text-sm text-muted-foreground">When the AI service reports it is out of credit or refuses a request, Zodaci pauses AI features so members see a calm notice instead of repeated failures. Lift the pause here once it is fixed. Every change is written to the audit log.</p></div>
      {err && <p role="alert" className="text-destructive">{err} <Button variant="link" className="h-auto p-0" onClick={() => void load()}>Retry</Button></p>}
      {!rows && !err && <div role="status" aria-label="Loading AI status" className="h-20 animate-pulse rounded bg-muted motion-reduce:animate-none" />}
      {rows && !rows.length && <p className="parchment flex items-center gap-2 p-4 text-sm"><PlayCircle className="h-4 w-4 text-gold" aria-hidden />AI features are running normally.</p>}
      {rows?.map(p => (
        <div key={p.scope} className="parchment flex flex-wrap items-start justify-between gap-4 border-destructive/40 p-4">
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2 font-medium"><PauseCircle className="h-4 w-4 text-destructive" aria-hidden />Paused: {SCOPE[p.scope] ?? p.scope}</p>
            <p className="text-muted-foreground">Since {new Date(p.created_at).toLocaleString()}</p>
            {p.message && <p className="text-muted-foreground">Members see: “{p.message}”</p>}
          </div>
          <Button size="sm" onClick={() => void clear(p)} disabled={busy === p.scope}>{busy === p.scope ? 'Resuming…' : 'Resume AI'}</Button>
        </div>
      ))}
    </section>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); window.setTimeout(() => setDone(false), 1800); }
    catch { toast.error('Copy failed — select the text and copy it instead.'); }
  };
  return <Button type="button" size="sm" variant="outline" onClick={() => void copy()}>{done ? <Check className="mr-1 h-3 w-3" aria-hidden /> : <Copy className="mr-1 h-3 w-3" aria-hidden />}{done ? 'Copied' : label}</Button>;
}

function MysticInkBuilder() {
  const [asset, setAsset] = useState<AssetType>('chapter-opener');
  const [sign, setSign] = useState('Leo');
  const [scene, setScene] = useState('');
  const t = ASSET_TEMPLATES.find(a => a.id === asset)!;
  const prompt = useMemo(() => mysticPrompt(asset, scene, sign || undefined), [asset, scene, sign]);
  const missingSign = t.needsSign && !sign;
  return (
    <section aria-labelledby="mystic" className="space-y-4">
      <div><h2 id="mystic" className="text-2xl">Mystic Ink prompt builder</h2><p className="max-w-2xl text-sm text-muted-foreground">One house style for every illustration. The master style always comes first and stays unchanged; you only describe the scene.</p></div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="mi-asset">What are you making?</Label>
            <select id="mi-asset" value={asset} onChange={e => setAsset(e.target.value as AssetType)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{ASSET_TEMPLATES.map(a => <option key={a.id} value={a.id}>{a.label} · {a.size}</option>)}</select>
          </div>
          <div className="space-y-1.5"><Label htmlFor="mi-sign">Sign{t.needsSign ? '' : ' (optional)'}</Label>
            <select id="mi-sign" value={sign} onChange={e => setSign(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" aria-invalid={missingSign}>
              {!t.needsSign && <option value="">No sign</option>}
              {SIGN_STYLE.map(s => <option key={s.sign} value={s.sign}>{s.sign} — {s.figure}, {s.accents}</option>)}
            </select>
            {missingSign && <p className="text-xs text-destructive">This kind of art needs a sign.</p>}
          </div>
          <div className="space-y-1.5"><Label htmlFor="mi-scene">Scene</Label>
            <Textarea id="mi-scene" value={scene} maxLength={400} rows={4} onChange={e => setScene(e.target.value)} placeholder="A lantern-lit observatory on a cliff, a girl reading star maps" />
            <p className="text-right text-xs text-muted-foreground">{scene.length}/400</p>
          </div>
          <div className="space-y-2"><p className="text-sm font-medium">Palette</p>
            <ul className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">{MYSTIC_PALETTE.map(c => <li key={c.key} className="flex items-center gap-2"><span aria-hidden className="h-6 w-6 shrink-0 rounded border border-border" style={{ background: c.hex }} /><span><span className="block font-medium">{c.name}</span><span className="text-muted-foreground">{c.hex}</span></span></li>)}</ul>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2"><Label htmlFor="mi-out">Prompt</Label><CopyButton text={prompt} label="Copy prompt" /></div>
            <Textarea id="mi-out" readOnly value={prompt} rows={10} className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2"><Label htmlFor="mi-neg">Negative prompt</Label><CopyButton text={MYSTIC_INK_NEGATIVE} label="Copy negative" /></div>
            <Textarea id="mi-neg" readOnly value={MYSTIC_INK_NEGATIVE} rows={4} className="font-mono text-xs" />
          </div>
          <div className="parchment space-y-2 p-4"><p className="text-sm font-medium">Before you use the art</p><ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{MYSTIC_CHECKLIST.map(c => <li key={c}>{c}</li>)}</ul></div>
        </div>
      </div>
    </section>
  );
}
