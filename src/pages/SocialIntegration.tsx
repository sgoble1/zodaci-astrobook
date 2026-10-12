import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { BookOpen, Brain, MessageSquareText, Plus, ShieldCheck, Trash2, Users } from 'lucide-react';
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

type Session = { id: string; title: string; updated_at: string };
const SESSIONS_CHANGED = 'social-sessions-changed';
const STARTERS = [
  'Help me understand what may be happening in this social situation.',
  'How can I say what I mean without coming across too strongly?',
  'Give me a script for setting a clear boundary.',
  'Why do I feel out of place in groups, and what can I try next?',
];

export default function SocialIntegration() {
  return <div className="space-y-6">
    <header className="flex flex-wrap items-start gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-accent/10"><Users className="h-7 w-7 text-gold" aria-hidden /></div>
      <div className="space-y-2">
        <div className="font-smallcaps text-xs text-gold">Workbook · Social Integration</div>
        <h1 className="text-4xl sm:text-5xl">Social Counselor</h1>
        <p className="max-w-2xl text-muted-foreground">Describe a human situation as if an observant outsider were studying it. The counselor explains what may be happening, connects it carefully to your chart, and gives practical words, boundaries, and next steps.</p>
        <p role="note" className="max-w-2xl rounded border border-accent/40 bg-accent/10 px-3 py-2 text-sm"><strong>Private to your account.</strong> These conversations are not shared with anyone using another account.</p>
      </div>
    </header>
    <section aria-labelledby="social-method" className="space-y-5 border-y border-border py-6">
      <div className="max-w-3xl"><div className="font-smallcaps text-xs text-gold">How this tool was built</div><h2 id="social-method" className="mt-2 text-2xl">An AstroBook method, grounded in established communication skills</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Social Integration is not an ancient astrological school or a licensed therapy method. AstroBook combines an outsider’s-eye view of a situation with perspective-taking, fact-versus-assumption checks, cognitive reframing, assertive communication, boundaries, and your calculated chart. Its communication sequence resembles parts of Marshall Rosenberg’s Nonviolent Communication, but AstroBook is its own coaching framework.</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Brain, title: 'See the pattern', body: 'Separate what was observed from the story about why it happened. Then consider more than one possible explanation.' },
          { icon: MessageSquareText, title: 'Translate it into words', body: 'Name feelings, needs and likely misunderstandings, then offer direct scripts you could actually say.' },
          { icon: ShieldCheck, title: 'Choose a safe next step', body: 'Set a boundary, make a request, pause, repair or leave. The counselor does not diagnose people or teach manipulation.' },
        ].map(item => { const Icon = item.icon; return <article key={item.title} className="border border-border bg-card/50 p-4"><Icon className="h-5 w-5 text-accent" aria-hidden="true"/><h3 className="mt-3 text-lg">{item.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p></article>; })}
      </div>
      <div className="flex items-start gap-3 text-sm text-muted-foreground"><BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true"/><p><strong className="text-foreground">What it remembers:</strong> every saved message in the open private conversation is used as context. It learns the thread’s details as the conversation develops; it does not secretly train on you or share that history with other chats. Background: <a className="underline" href="https://www.cnvc.org/learn-nvc/what-is-nvc" target="_blank" rel="noreferrer">Center for Nonviolent Communication<span className="sr-only"> (opens in a new tab)</span></a>.</p></div>
    </section>
    <AuthGate what="use your private Social Counselor">{() => <SocialInner />}</AuthGate>
    <p className="max-w-2xl text-xs text-muted-foreground">This is reflective guidance, not medical care or a diagnosis. Astrology is used as a possible lens, not a proven fact.</p>
  </div>;
}

function SocialInner() {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const creating = useRef(false);
  const load = async () => {
    const { data, error } = await supabase.from('social_sessions').select('id,title,updated_at').order('updated_at', { ascending: false });
    if (error) toast.error('Your conversations could not be loaded.');
    const list = (data ?? []) as Session[]; setSessions(list); return list;
  };
  const create = async () => {
    if (creating.current) return;
    creating.current = true;
    const { data, error } = await supabase.from('social_sessions').insert({ title: 'New conversation' }).select('id').single();
    creating.current = false;
    if (error || !data) return toast.error('A conversation could not be started.');
    await load(); nav(`/workbook/social-integration/${data.id}${location.search}`);
  };
  useEffect(() => {
    load().then(list => { if (sessionId) return; if (list.length) nav(`/workbook/social-integration/${list[0].id}${location.search}`, { replace: true }); else create(); });
    const reload = () => { load(); };
    window.addEventListener(SESSIONS_CHANGED, reload);
    return () => window.removeEventListener(SESSIONS_CHANGED, reload);
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps
  const remove = async (id: string) => {
    const { error } = await supabase.from('social_sessions').delete().eq('id', id);
    if (error) return toast.error(error.message);
    const list = await load();
    if (id === sessionId) nav(list[0] ? `/workbook/social-integration/${list[0].id}` : '/workbook/social-integration', { replace: true });
  };
  return <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
    <aside className="parchment h-fit space-y-2 p-3" aria-label="Your private Social Counselor conversations">
      <Button className="w-full" onClick={create}><Plus />New conversation</Button>
      <ul className="space-y-1">{sessions?.map(s => <li key={s.id} className="flex items-center gap-1">
        <Link to={`/workbook/social-integration/${s.id}`} aria-current={s.id === sessionId ? 'page' : undefined} className={`min-h-10 flex-1 truncate rounded px-3 py-2 text-sm ${s.id === sessionId ? 'bg-accent/15 text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>{s.title}</Link>
        <Button variant="ghost" size="icon" onClick={() => remove(s.id)} aria-label={`Delete conversation: ${s.title}`}><Trash2 /></Button>
      </li>)}</ul>
    </aside>
    {sessionId ? <SocialSessionLoader key={sessionId} sessionId={sessionId} /> : <p role="status" className="text-muted-foreground">Opening a conversation…</p>}
  </div>;
}

function SocialSessionLoader({ sessionId }: { sessionId: string }) {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  useEffect(() => { supabase.from('social_messages').select('ui_id,role,parts,id').eq('session_id', sessionId).order('created_at').then(({ data, error }) => {
    if (error) toast.error('This conversation could not be loaded.');
    setInitial((data ?? []).map(row => ({ id: row.ui_id || row.id, role: row.role as UIMessage['role'], parts: row.parts as UIMessage['parts'] })));
  }); }, [sessionId]);
  if (!initial) return <p role="status" className="text-muted-foreground">Opening your conversation…</p>;
  return <SocialSessionChat sessionId={sessionId} initial={initial} />;
}

function SocialSessionChat({ sessionId, initial }: { sessionId: string; initial: UIMessage[] }) {
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(params.get('q') ?? '');
  const passages = useRef<FeedbackPassage[]>([]);
  const [cited, setCited] = useState<FeedbackPassage[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const transport = useMemo(() => new DefaultChatTransport({
    api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/social-counselor`,
    prepareSendMessagesRequest: async ({ messages }) => {
      const headers = await authenticatedFunctionHeaders();
      return { headers, body: { sessionId, messages, passages: passages.current.map(({ href: _href, ...passage }) => passage) } };
    },
  }), [sessionId]);
  const { messages, sendMessage, status, stop, error: chatError } = useChat({ id: sessionId, messages: initial, transport, onError: error => toast.error(friendlyChatError(error) || 'The Social Counselor could not respond.'), onFinish: () => window.dispatchEvent(new Event(SESSIONS_CHANGED)) });
  const busy = status === 'submitted' || status === 'streaming';
  useEffect(() => { box.current?.querySelector('textarea')?.focus(); }, []);
  useEffect(() => { if (status === 'ready' || status === 'error') box.current?.querySelector('textarea')?.focus(); }, [status]);
  const send = async (text: string) => {
    const value = text.trim(); if (!value || busy) return;
    const previous = [...messages].reverse().find(message => message.role === 'user');
    const previousText = previous?.parts.map(part => part.type === 'text' ? part.text : '').join(' ') ?? '';
    passages.current = await passagesFor(`${value} ${previousText}`, 8); setCited(passages.current);
    try { await sendMessage({ text: value }); setDraft(''); }
    catch (error) { toast.error(friendlyChatError(error instanceof Error ? error : new Error('The Social Counselor could not respond.'))); }
    if (params.has('q')) { const next = new URLSearchParams(params); next.delete('q'); setParams(next, { replace: true }); }
  };
  return <section ref={box} className="parchment flex min-h-[70dvh] min-w-0 flex-col overflow-hidden lg:h-[72vh] lg:min-h-0" aria-label="Social Counselor conversation">
    <Conversation className="min-h-0 flex-1" aria-label="Conversation transcript" aria-live="polite">
      <ConversationContent className="gap-5">
        {messages.length === 0 && <ConversationEmptyState><Users className="h-8 w-8 text-gold" aria-hidden /><h2 className="text-xl">What happened between the humans?</h2><p className="text-sm text-muted-foreground">Give the facts, what you felt, and what outcome you want.</p><div className="mt-2 flex flex-wrap justify-center gap-2">{STARTERS.map(starter => <Button key={starter} type="button" variant="outline" size="sm" onClick={() => send(starter)}>{starter}</Button>)}</div></ConversationEmptyState>}
        {messages.map(message => <Message key={message.id} from={message.role}><MessageContent className={message.role === 'user' ? 'group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground' : ''}>{message.role === 'assistant' && <span className="sr-only">Social Counselor:</span>}{message.parts.map((part, index) => part.type === 'text' ? (message.role === 'assistant' ? <MessageResponse key={index} isAnimating={busy && message.id === messages[messages.length - 1]?.id}>{part.text}</MessageResponse> : <p key={index} className="whitespace-pre-wrap">{part.text}</p>) : null)}</MessageContent></Message>)}
        {status === 'submitted' && <Message from="assistant"><MessageContent><Shimmer>Observing the situation…</Shimmer></MessageContent></Message>}
      </ConversationContent><ConversationScrollButton aria-label="Scroll to newest message" />
    </Conversation>
    {cited.length > 0 && <details className="border-t border-border px-4 py-2 text-xs"><summary className="cursor-pointer text-muted-foreground">Sources considered in this reply ({cited.length})</summary><ol className="mt-2 space-y-1">{cited.map(passage => <li key={passage.n}><span className="text-gold">[{passage.n}]</span> {passage.source} · {passage.loc} — <Link className="underline" to={passage.href}>open</Link></li>)}</ol></details>}
    <div className="border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{chatError && <p role="alert" className="mb-2 text-sm text-destructive">{friendlyChatError(chatError)}</p>}<PromptInput onSubmit={({ text }) => send(text)}><PromptInputTextarea aria-label="Message the Social Counselor" placeholder="Describe the social situation…" value={draft} onChange={event => setDraft(event.target.value)} /><PromptInputFooter className="justify-end"><PromptInputSubmit status={status} onStop={stop} /></PromptInputFooter></PromptInput></div>
  </section>;
}