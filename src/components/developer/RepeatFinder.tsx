import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { loadProtectedJson, loadProtectedText, type Area } from '@/lib/protectedContent';
import { findRepeats, type Repeat } from '@/lib/duplicateFinder';

/** Counts repeated sentences in an edition this account can open (the server still decides access). Read-only. */
export function RepeatFinder() {
  const [area, setArea] = useState<Area>('shane');
  const [state, setState] = useState<{ busy?: boolean; done?: number; total?: number; repeats?: Repeat[]; error?: string }>({});
  const run = async () => {
    setState({ busy: true });
    try {
      const index = await loadProtectedJson<{ id: string }[]>(area, 'index.json');
      const chapters: { id: string; text: string }[] = [];
      for (const [i, e] of index.entries()) {
        try { chapters.push({ id: e.id, text: await loadProtectedText(area, `${e.id}.md`) }); } catch { /* skip unreadable chapter */ }
        if (i % 10 === 0) setState({ busy: true, done: i, total: index.length });
      }
      setState({ repeats: findRepeats(chapters), total: chapters.length });
    } catch { setState({ error: 'This edition could not be opened from this account.' }); }
  };
  return (
    <section className="space-y-3 rounded-sm border border-border p-4" aria-labelledby="repeat-h">
      <h2 id="repeat-h" className="font-display text-xl">Repeated sentences</h2>
      <p className="text-sm text-muted-foreground">Counts sentences that appear in more than one chapter, so they can be folded into one place. Nothing is changed.</p>
      <div className="flex flex-wrap items-center gap-2">
        {(['shane', 'zac'] as Area[]).map(a => <Button key={a} size="sm" variant={area === a ? 'default' : 'outline'} onClick={() => setArea(a)}>{a === 'shane' ? 'Shane' : 'Zac'}</Button>)}
        <Button size="sm" onClick={run} disabled={state.busy}>{state.busy ? `Reading ${state.done ?? 0}/${state.total ?? '…'}` : 'Count repeats'}</Button>
      </div>
      {state.error && <p role="alert" className="text-sm">{state.error}</p>}
      {state.repeats && (state.repeats.length ? <ul className="space-y-1 text-sm">{state.repeats.map(r => <li key={r.fingerprint}><span className="font-medium">{r.count} chapters</span> · “{r.fingerprint}” <span className="text-muted-foreground">({r.chapters.slice(0, 5).join(', ')}{r.chapters.length > 5 ? '…' : ''})</span></li>)}</ul> : <p className="text-sm">No repeated sentences across {state.total} chapters.</p>)}
    </section>
  );
}
