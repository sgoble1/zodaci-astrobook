import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { sourceResponse } from './sourceResponse';

export type SumPassage = { source: string; loc: string; text: string };

/** Streams a cited summary from the ask-sources function using only the given passages. */
export function SummarisePanel({ title, passages, prompt }: { title: string; passages: SumPassage[]; prompt?: string }) {
  const [sum, setSum] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const run = async () => {
    if (busy || !passages.length) return;
    setBusy(true); setSum(''); setErr(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-sources`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ question: prompt ?? `Summarise "${title}" for April in clear headed sections: key points, patterns, challenges, and practical guidance. Use only the passages.`, passages: passages.slice(0, 14).map((p, i) => ({ n: i + 1, ...p })) }),
      });
      const result = await sourceResponse(res);
      if (!result.body) { setErr(result.error); setBusy(false); return; }
      const r = result.body.getReader(); const d = new TextDecoder();
      while (true) { const { done, value } = await r.read(); if (done) break; setSum(a => a + d.decode(value, { stream: true })); }
    } catch (e) { setErr((e as Error).message); }
    setBusy(false);
  };
  return (
    <section className="parchment p-5 my-6">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="font-smallcaps text-xs text-gold">Summary from the sources</div>
        <button onClick={run} disabled={busy || !passages.length} className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm disabled:opacity-50">{busy ? 'Writing…' : sum ? 'Rewrite' : 'Summarise from the sources'}</button>
      </div>
      {!sum && !err && <p className="text-xs text-muted-foreground">A short overview written only from this text. Numbers like [3] point to the passage it came from.</p>}
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      {sum && <div className="mb-prose text-sm"><ReactMarkdown>{sum}</ReactMarkdown></div>}
    </section>
  );
}

/** Split long text into ~900-char passages with section labels. */
export function toPassages(text: string, source: string, fallbackLoc: string): SumPassage[] {
  const out: SumPassage[] = []; let loc = fallbackLoc; let buf = '';
  const flush = () => { if (buf.trim()) out.push({ source, loc, text: buf.trim() }); buf = ''; };
  text.split(/\n\s*\n/).forEach(par => {
    const h = par.match(/^#{2,6} (.+)/); if (h) { flush(); loc = `${fallbackLoc} › ${h[1]}`; return; }
    const pg = par.match(/<!-- page (\d+) -->/); if (pg) { flush(); loc = `${fallbackLoc} · p. ${pg[1]}`; return; }
    buf += par.replace(/[*>#\\]/g, '') + '\n'; if (buf.length > 900) flush();
  });
  flush();
  // spread across the whole section rather than only its start
  if (out.length <= 14) return out;
  const step = out.length / 14; return Array.from({ length: 14 }, (_, i) => out[Math.floor(i * step)]);
}
