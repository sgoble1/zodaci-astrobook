import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthGate } from '@/components/common/AuthGate';
import { Button } from '@/components/ui/button';
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { passagesFor, type FeedbackPassage } from '@/lib/workbook';
import { authenticatedFunctionHeaders, friendlyChatError } from '@/lib/chatAuth';
import oracle from '@/assets/oracle-within.png';

type Session = { id: string; title: string; updated_at: string };
const SESSIONS_CHANGED = 'therapy-sessions-changed';

const STARTERS = [
  'I keep replaying a conversation and can’t let it go.',
  'Why do I get so angry so fast, then feel fine an hour later?',
  'I feel like I always have to be the strong one.',
  'Help me understand what this year is asking of me.',
];

export default function Companion() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-4">
        <img src={oracle} alt="" width={64} height={64} className="h-16 w-16" />
        <div className="space-y-1">
          <div className="font-smallcaps text-xs text-gold">Workbook · Private sessions</div>
          <h1 className="text-4xl sm:text-5xl">The Oracle Within</h1>
          <p className="max-w-2xl text-muted-foreground">A therapy companion that knows your whole chart — how you feel, react and heal — and blends it with proven therapy approaches. Sessions are saved privately to your account.</p>
          <p role="note" className="max-w-2xl rounded border border-accent/40 bg-accent/10 px-3 py-2 text-sm"><strong>Private to you, April.</strong> Your sessions are never shared with Shane or anyone else — no one but your own account can open them, and Shane cannot see that they exist.</p>
        </div>
      </header>
      <AuthGate what="talk with The Oracle Within">{() => <CompanionInner />}</AuthGate>
      <p className="text-xs text-muted-foreground max-w-2xl">A reflective companion, not a licensed therapist. If you are in crisis or thinking about harming yourself, call or text 988 in the US, or your local emergency number.</p>
    </div>
  );
}

function CompanionInner() {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const creating = useRef(false);

  const load = async () => {
    const { data, error } = await supabase.from('therapy_sessions').select('id,title,updated_at').order('updated_at', { ascending: false });
    if (error) toast.error('Your sessions could not be loaded.');
    setSessions((data ?? []) as Session[]);
    return (data ?? []) as Session[];
  };
  const create = async () => {
    if (creating.current) return;
    creating.current = true;
    const { data, error } = await supabase.from('therapy_sessions').insert({ title: 'New session' }).select('id').single();
    creating.current = false;
    if (error || !data) return toast.error('A new session could not be started.');
    await load();
    nav(`/workbook/companion/${data.id}${location.search}`);
  };
  useEffect(() => {
    load().then(list => {
      if (sessionId) return;
      if (list.length) nav(`/workbook/companion/${list[0].id}${location.search}`, { replace: true });
      else create();
    });
    const reload = () => { load(); };
    window.addEventListener(SESSIONS_CHANGED, reload);
    return () => window.removeEventListener(SESSIONS_CHANGED, reload);
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (id: string) => {
    const { error } = await supabase.from('therapy_sessions').delete().eq('id', id);
    if (error) return toast.error(error.message);
    const list = await load();
    if (id === sessionId) nav(list[0] ? `/workbook/companion/${list[0].id}` : '/workbook/companion', { replace: true });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="parchment h-fit space-y-2 p-3" aria-label="Your sessions">
        <Button className="w-full" onClick={create}><Plus />New session</Button>
        <ul className="space-y-1">
          {sessions?.map(s => (
            <li key={s.id} className="flex items-center gap-1">
              <Link to={`/workbook/companion/${s.id}`} aria-current={s.id === sessionId ? 'page' : undefined} className={`min-h-10 flex-1 truncate rounded px-3 py-2 text-sm ${s.id === sessionId ? 'bg-accent/15 text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>{s.title}</Link>
              <Button variant="ghost" size="icon" onClick={() => remove(s.id)} aria-label={`Delete session: ${s.title}`}><Trash2 /></Button>
            </li>
          ))}
        </ul>
      </aside>
      {sessionId ? <SessionLoader key={sessionId} sessionId={sessionId} /> : <p role="status" className="text-muted-foreground">Opening a session…</p>}
    </div>
  );
}

function SessionLoader({ sessionId }: { sessionId: string }) {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  useEffect(() => {
    supabase.from('therapy_messages').select('ui_id,role,parts,id').eq('session_id', sessionId).order('created_at').then(({ data, error }) => {
      if (error) toast.error('This session could not be loaded.');
      setInitial((data ?? []).map(r => ({ id: r.ui_id || r.id, role: r.role as UIMessage['role'], parts: r.parts as UIMessage['parts'] })));
    });
  }, [sessionId]);
  if (!initial) return <p role="status" className="text-muted-foreground">Opening your session…</p>;
  return <SessionChat sessionId={sessionId} initial={initial} />;
}

function SessionChat({ sessionId, initial }: { sessionId: string; initial: UIMessage[] }) {
  const [params, setParams] = useSearchParams();
  const initialPrompt = params.get('q') ?? '';
  const [draft, setDraft] = useState(initialPrompt);
  const passages = useRef<FeedbackPassage[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const [cited, setCited] = useState<FeedbackPassage[]>([]);
  const transport = useMemo(() => new DefaultChatTransport({
    api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/therapy-chat`,
    prepareSendMessagesRequest: async ({ messages }) => {
      return {
        headers: await authenticatedFunctionHeaders(),
        body: { sessionId, messages, passages: passages.current.map(({ href: _h, ...p }) => p) },
      };
    },
  }), [sessionId]);
  const { messages, sendMessage, status, stop, error: chatError } = useChat({
    id: sessionId, messages: initial, transport,
    onError: (e) => {
      const msg = friendlyChatError(e);
      toast.error(msg || 'The Oracle could not respond. Please try again.');
    },
    onFinish: () => window.dispatchEvent(new Event(SESSIONS_CHANGED)),
  });
  const busy = status === 'submitted' || status === 'streaming';
  const focus = () => box.current?.querySelector('textarea')?.focus();
  useEffect(() => { focus(); }, []);
  useEffect(() => { if (status === 'ready' || status === 'error') focus(); }, [status]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    const prev = lastUser?.parts.map(p => (p.type === 'text' ? p.text : '')).join(' ') ?? '';
    passages.current = await passagesFor(`${t} ${prev}`, 6);
    setCited(passages.current);
    try { await sendMessage({ text: t }); setDraft(''); }
    catch (error) { toast.error(friendlyChatError(error instanceof Error ? error : new Error('The Oracle could not respond.'))); }
    if (params.has('q')) { const next = new URLSearchParams(params); next.delete('q'); setParams(next, { replace: true }); }
  };

  return (
    <section ref={box} className="parchment flex min-h-[70dvh] min-w-0 flex-col overflow-hidden lg:h-[72vh] lg:min-h-0" aria-label="Session">
      <Conversation className="min-h-0 flex-1" aria-label="Session transcript" role="log" aria-live="polite">
        <ConversationContent className="gap-5">
          {messages.length === 0 && (
            <ConversationEmptyState>
              <img src={oracle} alt="" width={56} height={56} className="h-14 w-14" />
              <h2 className="text-xl">What is stirring in you?</h2>
              <p className="text-sm text-muted-foreground">Say it as it comes. Your chart is already in the room.</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">{STARTERS.map(s => <button key={s} type="button" onClick={() => send(s)} className="min-h-10 rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">{s}</button>)}</div>
            </ConversationEmptyState>
          )}
          {messages.map(m => (
            <Message key={m.id} from={m.role}>
              <MessageContent className={m.role === 'user' ? 'group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground' : ''}>
                {m.role === 'assistant' && <span className="sr-only">The Oracle Within:</span>}
                {m.parts.map((p, i) => p.type === 'text' ? (m.role === 'assistant' ? <MessageResponse key={i} isAnimating={busy && m.id === messages[messages.length - 1]?.id}>{p.text}</MessageResponse> : <p key={i} className="whitespace-pre-wrap">{p.text}</p>) : null)}
              </MessageContent>
            </Message>
          ))}
          {status === 'submitted' && <Message from="assistant"><MessageContent><Shimmer>Reading your sky…</Shimmer></MessageContent></Message>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      {cited.length > 0 && (
        <details className="border-t border-border px-4 py-2 text-xs">
          <summary className="cursor-pointer text-muted-foreground">Passages from your sources used in this turn ({cited.length})</summary>
          <ol className="mt-2 space-y-1">{cited.map(p => <li key={p.n}><span className="text-gold">[{p.n}]</span> {p.source} · {p.loc} — <Link className="underline" to={p.href}>open</Link></li>)}</ol>
        </details>
      )}
    <div className="border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {chatError && <p role="alert" className="mb-2 text-sm text-destructive">{friendlyChatError(chatError)}</p>}
        <PromptInput onSubmit={({ text }) => send(text)}>
          <PromptInputTextarea aria-label="Message The Oracle Within" placeholder="Tell me what's on your mind…" value={draft} onChange={event => setDraft(event.target.value)} />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </section>
  );
}
