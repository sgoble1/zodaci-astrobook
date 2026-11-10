import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Square, Telescope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
import { computeChart } from '@/lib/astro';
import { transitsTo } from '@/lib/transitOverlay';
import { chapterFrom } from '@/lib/currentChapter';
import { observatoryLines, OBSERVATORY_STARTERS, parseSources, type ConsultSource } from '@/lib/observatoryConsult';
import { sourceResponse } from '@/components/common/sourceResponse';
import { PageHead } from '@/components/observatory/PageHead';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

/**
 * Consult the Observatory: one question answered from the member's own chart, today's sky against it, their Current
 * Chapter, Observation Log and opted-in context. Each claim carries its source tag; expected denials show inline.
 */
export default function Observatory() {
  usePageMeta('Consult the Observatory · Zodaci', 'Ask one question and get an answer drawn from your own chart, today’s sky, your Current Chapter and your Observation Log.');
  const session = useSession();
  const birth = useMyBirth();
  const chart = useMemo(() => { if (!birth) return null; try { return computeChart(toChartInput(birth)); } catch { return null; } }, [birth]);
  const hits = useMemo(() => { if (!chart) return []; try { return transitsTo(chart, new Date()); } catch { return []; } }, [chart]);
  const chapter = useMemo(() => chapterFrom(hits), [hits]);
  const [question, setQuestion] = useState('');
  const [asked, setAsked] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<ConsultSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  // A different account must never see the previous account's answer.
  useEffect(() => { abort.current?.abort(); setAnswer(''); setAsked(''); setSources([]); setError(null); }, [session?.user.id]);

  const ask = async (e?: FormEvent, preset?: string) => {
    e?.preventDefault();
    const q = (preset ?? question).trim();
    if (q.length < 3 || busy) return;
    abort.current?.abort();
    const ctl = new AbortController(); abort.current = ctl;
    setBusy(true); setError(null); setAnswer(''); setSources([]); setAsked(q); if (preset) setQuestion(preset);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/observatory-consult`, {
        method: 'POST', signal: ctl.signal,
        headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ question: q, sky: observatoryLines(hits), chapter: { title: chapter.title, summary: chapter.summary } }),
      });
      const out = await sourceResponse(res);
      if (out.error) { setError(out.error); return; }
      setSources(parseSources(res.headers.get('X-Observatory-Sources')));
      const reader = out.body.getReader(); const dec = new TextDecoder();
      let text = '';
      for (;;) { const { done, value } = await reader.read(); if (done) break; text += dec.decode(value, { stream: true }); setAnswer(text); }
      if (!text.trim()) setError('The Observatory sent back an empty answer. Please ask again.');
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setError('The Observatory could not answer right now. Check your connection and try again.');
    } finally { if (abort.current === ctl) setBusy(false); }
  };

  const gate = !session
    ? <p className="text-muted-foreground"><Link to="/auth?next=/observatory" className="text-primary underline underline-offset-4">Sign in</Link> to consult the Observatory about your own chart.</p>
    : !birth
      ? <p className="text-muted-foreground"><Link to="/start?next=/observatory" className="text-primary underline underline-offset-4">Add your birth details</Link> first, so answers come from your own calculated chart.</p>
      : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <PageHead eyebrow="Grand Observatory · private to you" title="Consult the Observatory" script="One question, read against your own sky." art="magnifier">
        <p>Answers draw only on your calculated chart, today’s sky against it, your Current Chapter, your Observation Log and the context notes you chose to share. Every point says which of these it came from. Nothing here is saved.</p>
      </PageHead>

      {gate ?? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <section className="space-y-5" aria-labelledby="consult-q">
            <form onSubmit={ask} className="obs-panel space-y-3 p-4 sm:p-5">
              <Label htmlFor="consult-question" id="consult-q" className="font-label text-sm tracking-[0.14em] text-primary">Your question</Label>
              <Textarea id="consult-question" value={question} maxLength={1200} rows={3} onChange={e => setQuestion(e.target.value)} placeholder="What is today’s sky asking of me at work?" onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) ask(); }} />
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" variant="signal" disabled={busy || question.trim().length < 3}><Telescope />{busy ? 'Consulting…' : 'Consult the Observatory'}</Button>
                {busy && <Button type="button" variant="outline" onClick={() => { abort.current?.abort(); setBusy(false); }}><Square />Stop</Button>}
                <span className="text-xs text-muted-foreground">Uses one AI credit.</span>
              </div>
            </form>
            {!asked && (
              <div>
                <p className="mb-2 font-label text-xs tracking-[0.16em] text-muted-foreground">Try one of these</p>
                <ul className="flex flex-wrap gap-2">{OBSERVATORY_STARTERS.map(s => <li key={s}><button type="button" onClick={() => ask(undefined, s)} className="rounded-full border border-border px-3 py-1.5 text-left text-sm transition-colors duration-500 hover:border-primary/60">{s}</button></li>)}</ul>
              </div>
            )}
            {error && <p role="alert" className="obs-panel border-accent/60 p-4 text-sm">{error}</p>}
            {asked && (answer || busy) && (
              <article className="obs-paper space-y-3 p-5 sm:p-6" aria-live="polite" aria-busy={busy}>
                <p className="font-label text-xs tracking-[0.16em] text-primary">You asked</p>
                <p className="font-semibold leading-snug">{asked}</p>
                <div className="prose-reading max-w-none text-base leading-relaxed">
                  {answer ? <ReactMarkdown>{answer}</ReactMarkdown> : <p className="text-muted-foreground"><Sparkles className="mr-1 inline h-4 w-4" />Reading your chart against today’s sky…</p>}
                </div>
                {sources.length > 0 && (
                  <div className="border-t border-border/60 pt-3">
                    <p className="mb-2 font-label text-xs tracking-[0.16em] text-muted-foreground">Sources used</p>
                    <ul className="flex flex-wrap gap-2">{sources.map(s => <li key={s.kind} className="rounded-full border border-primary/40 px-3 py-1 text-xs">{s.label}</li>)}</ul>
                  </div>
                )}
              </article>
            )}
          </section>
          <aside className="space-y-4 text-sm" aria-label="What the Observatory reads">
            <div className="obs-panel space-y-2 p-4">
              <p className="font-label text-xs tracking-[0.16em] text-primary">Current Chapter</p>
              <p className="font-semibold">{chapter.title}</p>
              <p className="text-muted-foreground">{chapter.summary}</p>
            </div>
            <div className="obs-panel space-y-2 p-4">
              <p className="font-label text-xs tracking-[0.16em] text-primary">Today’s sky against your chart</p>
              {hits.length ? <ul className="space-y-1 text-muted-foreground">{observatoryLines(hits).slice(0, 6).map(l => <li key={l}>{l}</li>)}</ul> : <p className="text-muted-foreground">No close contacts today.</p>}
            </div>
            <div className="obs-panel space-y-1 p-4">
              <p className="font-label text-xs tracking-[0.16em] text-primary">Add to what it reads</p>
              <Link to="/observation-log" className="block text-primary underline underline-offset-4">Observation Log</Link>
              <Link to="/personal-context" className="block text-primary underline underline-offset-4">Your context notes</Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
