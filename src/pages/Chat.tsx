import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { MessageSquarePlus, Square, Send, Trash2, Telescope } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAprilSpace } from '@/hooks/useAprilSpace';
import { loadCorpus, rank, type Passage } from '@/lib/corpus';
import { AuthGate } from '@/components/common/AuthGate';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Convo = { id: string; title: string; updated_at: string };
type Cited = { n: number; source: string; loc: string; href: string; text: string };
type Msg = { id: string; role: 'user' | 'assistant'; content: string; passages: Cited[] | null };

export default function Chat() {
  return (
    <div className="space-y-6">
      <header>
        <div className="font-smallcaps text-xs text-gold">The Oracle Desk · Conversations</div>
        <h1 className="text-4xl sm:text-5xl mt-2">SmartChat</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">Talk with the sources over several turns. Every answer cites the passages it used, and your conversations are saved to your account.</p>
      </header>
      <AuthGate what="use SmartChat and keep your history">{() => <ChatInner />}</AuthGate>
    </div>
  );
}

function ChatInner() {
  const { id } = useParams();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [convos, setConvos] = useState<Convo[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [corpus, setCorpus] = useState<Passage[] | null>(null);
  const april = useAprilSpace();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const loadConvos = async () => {
    const { data } = await supabase.from('chat_conversations').select('id,title,updated_at').order('updated_at', { ascending: false });
    setConvos(data ?? []);
  };
  // Only the private edition loads source passages; members chat from their own chart.
  useEffect(() => { loadConvos(); }, []);
  useEffect(() => { if (april) loadCorpus().then(setCorpus).catch(() => setCorpus([])); }, [april]);
  useEffect(() => { const prompt = params.get('q'); if (prompt) setQ(prompt); }, [params]);
  useEffect(() => {
    if (!id) { setMsgs([]); return; }
    supabase.from('chat_messages').select('id,role,content,passages').eq('conversation_id', id).order('created_at')
      .then(({ data }) => setMsgs((data ?? []) as unknown as Msg[]));
  }, [id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs]);

  const send = async () => {
    const question = q.trim();
    if (!question || busy) return;
    // Retrieve with the previous user turn too, so follow-ups like "tell me more" still find passages.
    const prevUser = [...msgs].reverse().find(m => m.role === 'user')?.content ?? '';
    // Members without the source library still get chart-based answers from their own saved chart.
    const top = corpus && april ? rank(corpus, `${question} ${prevUser}`, 12) : [];
    const cited: Cited[] = top.map((p, i) => ({ n: i + 1, source: p.source, loc: p.loc, href: p.href, text: p.text.slice(0, 1200) }));
    setBusy(true); setQ('');
    let convoId = id;
    if (!convoId) {
      const { data, error } = await supabase.from('chat_conversations').insert({ title: question.slice(0, 80) }).select('id').single();
      if (error || !data) { toast.error(error?.message ?? 'Could not start a conversation'); setBusy(false); return; }
      convoId = data.id; nav(`/chat/${convoId}`, { replace: true });
    }
    const history = msgs.map(m => ({ role: m.role, content: m.content }));
    await supabase.from('chat_messages').insert({ conversation_id: convoId, role: 'user', content: question });
    const tmp: Msg = { id: 'pending', role: 'assistant', content: '', passages: cited };
    setMsgs(m => [...m, { id: crypto.randomUUID(), role: 'user', content: question, passages: null }, tmp]);
    let answer = '';
    abort.current = new AbortController();
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-sources`, {
        method: 'POST', signal: abort.current.signal,
        headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ question, history, passages: cited.map(c => ({ n: c.n, source: c.source, loc: c.loc, text: top[c.n - 1].text })) }),
      });
      if (!res.ok || !res.body) { const j = await res.json().catch(() => ({})); throw new Error(j.error ?? 'Something went wrong.'); }
      const reader = res.body.getReader(); const dec = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        answer += dec.decode(value, { stream: true });
        setMsgs(m => m.map(x => x.id === 'pending' ? { ...x, content: answer } : x));
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') { toast.error((e as Error).message); answer = answer || `_${(e as Error).message}_`; }
    }
    if (answer) {
      await supabase.from('chat_messages').insert({ conversation_id: convoId, role: 'assistant', content: answer, passages: cited as unknown as never });
      await supabase.from('chat_conversations').update({ updated_at: new Date().toISOString() }).eq('id', convoId!);
    }
    setMsgs(m => m.map(x => x.id === 'pending' ? { ...x, id: crypto.randomUUID() } : x));
    setBusy(false); loadConvos();
  };

  const del = async (cid: string) => {
    if (!confirm('Delete this conversation?')) return;
    await supabase.from('chat_conversations').delete().eq('id', cid);
    if (cid === id) nav('/chat'); loadConvos();
  };

  return (
    <div className="grid lg:grid-cols-[230px_1fr] gap-5">
      <aside className="space-y-2">
        <Button className="w-full" variant="outline" onClick={() => nav('/chat')}><MessageSquarePlus className="w-4 h-4 mr-2" />New conversation</Button>
        <div className="font-smallcaps text-[10px] text-gold pt-2">History</div>
        {convos.length === 0 && <p className="text-xs text-muted-foreground">No saved conversations yet.</p>}
        <ul className="space-y-1 max-h-[60vh] overflow-y-auto">
          {convos.map(c => (
            <li key={c.id} className={`group flex items-center gap-1 rounded px-2 py-1.5 text-sm ${c.id === id ? 'bg-accent/15' : 'hover:bg-muted/60'}`}>
              <Link to={`/chat/${c.id}`} className="flex-1 truncate">{c.title}</Link>
              <button aria-label="Delete conversation" onClick={() => del(c.id)} className="opacity-50 hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="parchment p-4 sm:p-5 flex flex-col min-h-[60vh]" aria-label="SmartChat conversation">
        <div className="sr-only" aria-live="polite">{busy ? 'SmartChat is composing a response.' : `${msgs.length} messages in this conversation.`}</div>
        <div className="flex-1 space-y-5">
          {msgs.length === 0 && (
            <div className="text-center text-muted-foreground py-16">
              <Telescope className="w-8 h-8 mx-auto mb-3 text-gold" />
              Ask about any part of the chart, a transit year, Feng Shui or your relationships. Follow-up questions remember the conversation.
            </div>
          )}
          {msgs.map(m => m.role === 'user' ? (
            <div key={m.id} className="flex justify-end"><div className="max-w-[85%] rounded-2xl bg-primary text-primary-foreground px-4 py-2 text-sm whitespace-pre-wrap">{m.content}</div></div>
          ) : (
            <div key={m.id} className="space-y-2">
              <div className="mb-prose text-sm leading-relaxed">
                {m.content ? <ReactMarkdown components={{ a: ({ href, children }) => <a href={href} className="text-gold align-super text-[0.7em] font-semibold px-0.5">{children}</a> }}>
                  {m.content.replace(/\[(\d+)\]/g, `[[$1]](#c-${m.id}-$1)`)}
                </ReactMarkdown> : <span className="italic text-muted-foreground">Reading the passages…</span>}
              </div>
              {m.passages && m.content && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">Cited passages ({new Set([...m.content.matchAll(/\[(\d+)\]/g)].map(x => x[1])).size})</summary>
                  <ol className="mt-2 space-y-2">
                    {m.passages.filter(p => m.content.includes(`[${p.n}]`)).map(p => (
                      <li key={p.n} id={`c-${m.id}-${p.n}`} className="border-l-2 border-accent pl-3">
                        <span className="text-gold font-semibold">[{p.n}]</span> <span className="font-smallcaps">{p.source}</span> · {p.loc} · <Link to={p.href} aria-label={`Open cited passage ${p.n} from ${p.source}, ${p.loc}`} className="underline">open passage</Link>
                        <p className="mt-1 line-clamp-3 text-muted-foreground">{p.text}</p>
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={e => { e.preventDefault(); send(); }} className="mt-4 flex gap-2 items-end">
          <Textarea rows={2} aria-label="Ask SmartChat" aria-describedby="smartchat-keyboard-hint" value={q} onChange={e => setQ(e.target.value)} placeholder={corpus || april === false ? 'Ask a question or follow up…' : 'Loading sources…'}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} className="flex-1" />
          <span id="smartchat-keyboard-hint" className="sr-only">Press Enter to send. Press Shift and Enter for a new line.</span>
          {busy ? <Button type="button" size="icon" variant="outline" aria-label="Stop" onClick={() => abort.current?.abort()}><Square className="w-4 h-4" /></Button>
            : <Button type="submit" size="icon" aria-label="Send" disabled={!q.trim() || (!corpus && april !== false)}><Send className="w-4 h-4" /></Button>}
        </form>
      </section>
    </div>
  );
}
