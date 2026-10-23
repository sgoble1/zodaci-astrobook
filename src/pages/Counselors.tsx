import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Lock, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AuthGate } from '@/components/common/AuthGate';
import { Button } from '@/components/ui/button';
import { MessageResponse } from '@/components/ai-elements/message';
import oracle from '@/assets/oracle-within.png';

type Key = 'oracle' | 'social';
type Counselor = {
  key: Key; name: string; role: string; chatPath: string; image?: string;
  bio: string; plain: string; specialties: string[];
  sessions: 'therapy_sessions' | 'social_sessions'; messages: 'therapy_messages' | 'social_messages';
};

export const COUNSELORS: Counselor[] = [
  {
    key: 'oracle', name: 'The Oracle Within', role: 'Therapy counselor', chatPath: '/workbook/companion', image: oracle,
    bio: "A warm, steady therapy companion tuned to your own calculated birth chart. It listens first, reflects back what it hears, and offers gentle tools drawn from established therapy approaches, using your chart as a language for patterns rather than a verdict.",
    plain: 'Like talking with a kind therapist who already knows your chart, so you never have to explain it from scratch.',
    specialties: ['Emotional processing & reflection', 'CBT-style thought reframing', 'Self-compassion & the inner critic', 'Quick reactions & emotional triggers', 'Boundaries & relationships', 'Grounding & calming exercises'],
    sessions: 'therapy_sessions', messages: 'therapy_messages',
  },
  {
    key: 'social', name: 'Social Counselor', role: 'Social integration coach', chatPath: '/workbook/social-integration',
    bio: "A practical coach for the 'outsider looking in' feeling. It explains social situations from a calm third-person view and gives concrete, chart-aware ways for you to connect with people while staying yourself.",
    plain: 'Like a friendly guide who explains how people work and gives you simple things to try next time.',
    specialties: ['Reading social situations', 'Small talk & starting conversations', 'Friendship & group belonging', 'Playful, confident expression', 'Recovering after awkward moments', 'Step-by-step practice plans'],
    sessions: 'social_sessions', messages: 'social_messages',
  },
];

function RetryNote({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-border bg-card/60 p-4 text-sm">
      <p className="font-medium text-foreground">{what} couldn't load.</p>
      <p className="mt-1 text-muted-foreground">Your connection may have dropped. Nothing was lost — try again in a moment.</p>
      <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>Try again</Button>
    </div>
  );
}

const fmt = (d: string) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const PrivacyNote = () => (
  <p className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
    <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Your sessions are private to your account. They never appear in shared spaces or in your other counselor's chats.
  </p>
);

export function CounselorsIndex() {
  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <header><h1 className="font-display text-3xl">Counselors</h1><p className="text-muted-foreground">Meet the counselors and find your past sessions.</p></header>
      <PrivacyNote />
      <ul className="grid gap-4 sm:grid-cols-2">
        {COUNSELORS.map(c => (
          <li key={c.key} className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-display text-xl"><Link className="hover:underline focus-visible:underline" to={`/counselors/${c.key}`}>{c.name}</Link></h2>
            <p className="text-sm text-muted-foreground">{c.role}</p>
            <p className="mt-2 text-sm">{c.plain}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

function useCounselor() {
  const { key } = useParams();
  return COUNSELORS.find(c => c.key === key);
}

export function CounselorProfile() {
  const c = useCounselor();
  const [sessions, setSessions] = useState<{ id: string; title: string; created_at: string; updated_at: string }[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!c) return;
    let active = true;
    setFailed(false); setSessions(null);
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!active) return;
      if (!u.user) return setSessions([]);
      // Owner-only: database rules already limit rows to the signed-in person; the filter makes it explicit.
      const { data, error } = await supabase.from(c.sessions).select('id,title,created_at,updated_at').eq('owner_id', u.user.id).order('updated_at', { ascending: false });
      if (!active) return;
      if (error) return setFailed(true);
      setSessions(data ?? []);
    })().catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [c, attempt]);
  if (!c) return <p>Counselor not found. <Link className="underline" to="/counselors">See all counselors</Link></p>;
  return (
    <AuthGate what="your counselor sessions">{() => (
      <article className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center gap-4">
          {c.image && <img loading="lazy" decoding="async" src={c.image} alt="" className="h-20 w-20 rounded-full object-cover" />}
          <div><h1 className="font-display text-3xl">{c.name}</h1><p className="text-muted-foreground">{c.role}</p></div>
        </header>
        <section aria-labelledby="bio"><h2 id="bio" className="font-display text-xl">About</h2><p className="mt-2">{c.bio}</p><p className="mt-2 text-sm text-muted-foreground"><strong>In plain words:</strong> {c.plain}</p></section>
        <section aria-labelledby="spec"><h2 id="spec" className="font-display text-xl">Specialties</h2>
          <ul className="mt-2 flex flex-wrap gap-2">{c.specialties.map(s => <li key={s} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-sm">{s}</li>)}</ul>
        </section>
        <section aria-labelledby="sess" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="sess" className="font-display text-xl">Your sessions</h2>
            <Button asChild><Link to={c.chatPath}><MessageCircle className="mr-2 h-4 w-4" aria-hidden />Start or continue a chat</Link></Button></div>
          <PrivacyNote />
          {failed ? <RetryNote what="Your sessions" onRetry={() => setAttempt(a => a + 1)} />
            : sessions === null ? <p role="status" className="text-muted-foreground">Loading…</p>
            : sessions.length === 0 ? <p className="text-muted-foreground">No sessions yet.</p>
            : <ul className="divide-y divide-border rounded-lg border border-border">{sessions.map(s => (
              <li key={s.id}><Link to={`/counselors/${c.key}/sessions/${s.id}`} className="flex flex-wrap justify-between gap-2 p-3 hover:bg-muted/50 focus-visible:bg-muted/50">
                <span className="font-medium">{s.title}</span><span className="text-sm text-muted-foreground">Started {fmt(s.created_at)} · last {fmt(s.updated_at)}</span></Link></li>))}</ul>}
        </section>
      </article>
    )}</AuthGate>
  );
}

type Row = { id: string; role: string; parts: unknown; created_at: string };
export function CounselorSession() {
  const c = useCounselor();
  const { sessionId } = useParams();
  const [title, setTitle] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!c || !sessionId) return;
    let active = true;
    setFailed(false); setRows(null);
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!active) return;
      if (!u.user) return setDenied(true);
      const { data: s, error: sErr } = await supabase.from(c.sessions).select('title').eq('id', sessionId).eq('owner_id', u.user.id).maybeSingle();
      if (!active) return;
      if (sErr) return setFailed(true);
      if (!s) return setDenied(true);
      setTitle(s.title);
      const { data, error } = await supabase.from(c.messages).select('id,role,parts,created_at').eq('session_id', sessionId).eq('owner_id', u.user.id).order('created_at');
      if (!active) return;
      if (error) return setFailed(true);
      setRows((data ?? []) as Row[]);
    })().catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [c, sessionId, attempt]);
  if (!c) return <p>Counselor not found.</p>;
  const text = (p: unknown) => (Array.isArray(p) ? p : []).map((x: { type?: string; text?: string }) => (x.type === 'text' ? x.text : '')).join('');
  return (
    <AuthGate what="this session">{() => (
      <article className="mx-auto max-w-3xl space-y-4">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link className="underline" to="/counselors">Counselors</Link> / <Link className="underline" to={`/counselors/${c.key}`}>{c.name}</Link></nav>
        {denied ? <p role="alert">This session isn't available. Sessions can only be opened by the person who had them.</p> : <>
          <header className="flex flex-wrap items-center justify-between gap-2"><h1 className="font-display text-2xl">{title || 'Session'}</h1>
            <Button asChild variant="outline"><Link to={`${c.chatPath}/${sessionId}`}>Continue this chat</Link></Button></header>
          <PrivacyNote />
          {failed ? <RetryNote what="This conversation" onRetry={() => setAttempt(a => a + 1)} /> : rows === null ? <p role="status">Loading…</p> : rows.length === 0 ? <p className="text-muted-foreground">No messages in this session yet.</p> :
            <ol className="space-y-4" aria-label="Conversation">{rows.map(r => {
              const you = r.role === 'user';
              return (
                <li key={r.id} className={`flex flex-col ${you ? 'items-end' : 'items-start'}`}>
                  <div className="mb-1 text-xs text-muted-foreground"><span className="font-medium">{you ? 'You' : c.name}</span> · <time dateTime={r.created_at}>{fmt(r.created_at)}</time></div>
                  <div className={you ? 'max-w-[85%] rounded-lg bg-primary px-4 py-2 text-primary-foreground' : 'max-w-full'}>
                    {you ? <p className="whitespace-pre-wrap">{text(r.parts)}</p> : <MessageResponse>{text(r.parts)}</MessageResponse>}
                  </div>
                </li>);
            })}</ol>}
        </>}
      </article>
    )}</AuthGate>
  );
}
