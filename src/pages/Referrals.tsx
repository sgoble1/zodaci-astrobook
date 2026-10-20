import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Gift, Mail, MessageCircle, Share2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthGate } from '@/components/common/AuthGate';
import { LoadError } from '@/components/common/LoadError';
import { REF_PATTERN, REFERRAL_MESSAGES } from '@/components/common/ReferralCapture';
import { usePageMeta } from '@/hooks/usePageMeta';

type Row = { id: string; status: string; created_at: string; converted_at: string | null; referrer_id: string };
type Grant = { reason: string; starts_at: string; expires_at: string };

/** Invite friends: a friend gets 7 days of Pro; when they first pay, the referrer gets 30 days of Pro. */
export default function Referrals() {
  usePageMeta('Invite a friend — Zodaci', 'Give a friend 7 days free Pro. You both get rewarded.');
  return <AuthGate what="invite friends">{uid => <Inner uid={uid} />}</AuthGate>;
}

function Inner({ uid }: { uid: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [failed, setFailed] = useState(false);
  const [claim, setClaim] = useState('');
  const [msg, setMsg] = useState('');
  const [claiming, setClaiming] = useState(false);
  const load = useCallback(async () => {
    const [c, r, g] = await Promise.all([
      supabase.rpc('my_referral_code'),
      supabase.from('referrals').select('id,status,created_at,converted_at,referrer_id').order('created_at', { ascending: false }),
      supabase.from('plan_grants').select('reason,starts_at,expires_at').eq('user_id', uid).in('reason', ['referral_reward', 'referral_welcome']),
    ]);
    if (c.error || r.error || g.error) { setFailed(true); return; }
    setFailed(false); setCode(c.data as string); setRows((r.data ?? []) as Row[]); setGrants((g.data ?? []) as Grant[]);
  }, [uid]);
  useEffect(() => { void load(); }, [load]);
  if (failed) return <LoadError what="your invitations" onRetry={() => void load()} />;
  if (!code) return <div role="status" aria-label="Loading" className="h-40 animate-pulse rounded-lg bg-muted" />;
  const link = `https://zodaci.com/welcome?ref=${code}`;
  // Share only the public invitation, never account identifiers or chart facts.
  const shareText = 'Explore your birth chart on Zodaci — here’s 7 days of Pro on me.';
  const encodedText = encodeURIComponent(`${shareText} ${link}`);
  const invited = rows.filter(r => r.referrer_id === uid);
  const converted = invited.filter(r => r.status === 'converted').length;
  const earnedDays = grants.filter(g => g.reason === 'referral_reward').length * 30;
  const activeReward = grants.filter(g => g.reason === 'referral_reward' && new Date(g.expires_at) > new Date()).sort((a, b) => b.expires_at.localeCompare(a.expires_at))[0];
  const wasInvited = rows.some(r => r.referrer_id !== uid);
  const copy = async () => { try { await navigator.clipboard.writeText(link); toast.success('Invitation link copied'); } catch { toast.error('Copy failed — select the link and copy it.'); } };
  const share = async () => { if (navigator.share) { try { await navigator.share({ title: 'Zodaci', text: 'Your birth chart, calculated and explained in plain language. Here’s 7 days of Pro on me.', url: link }); } catch { /* closed */ } } else void copy(); };
  const submit = async () => {
    const c = claim.trim().toUpperCase();
    if (!REF_PATTERN.test(c)) { setMsg(REFERRAL_MESSAGES.invalid); return; }
    setClaiming(true);
    const { data, error } = await supabase.rpc('claim_referral', { _code: c });
    setClaiming(false);
    if (error) { setMsg('Could not apply the code. Please try again.'); return; }
    setMsg(REFERRAL_MESSAGES[data as string] ?? 'Done.');
    if (data === 'claimed') { setClaim(''); void load(); }
  };
  return (
    <article className="mx-auto max-w-4xl space-y-10">
      <header><p className="font-smallcaps text-xs text-gold">Invite a friend</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">Give a friend 7 days free Pro.</h1><p className="mt-3 text-lg text-muted-foreground">You both get rewarded: when your friend starts a paid plan, you get 30 days of Pro.</p></header>
      <section className="vellum space-y-4 p-6" aria-labelledby="code-h">
        <h2 id="code-h" className="text-lg">Your invitation</h2>
        <p className="font-display text-3xl tracking-wide">{code}</p>
        <div className="flex flex-col gap-2 sm:flex-row"><Input readOnly value={link} aria-label="Invitation link" onFocus={e => e.currentTarget.select()} /><Button onClick={() => void copy()}><Copy className="h-4 w-4" />Copy link</Button><Button variant="outline" onClick={() => void share()}><Share2 className="h-4 w-4" />Share</Button></div>
        <div className="flex flex-wrap gap-2" aria-label="Share invitation">
          <Button asChild variant="outline"><a href={`mailto:?subject=${encodeURIComponent('Your invitation to Zodaci')}&body=${encodedText}`}><Mail className="h-4 w-4" />Email</a></Button>
          <Button asChild variant="outline"><a href={`https://x.com/intent/post?text=${encodedText}`} target="_blank" rel="noopener noreferrer"><Share2 className="h-4 w-4" />X</a></Button>
          <Button asChild variant="outline"><a href={`https://wa.me/?text=${encodedText}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />WhatsApp</a></Button>
        </div>
        <p className="text-xs text-muted-foreground">Friends can use your link or type the code within 7 days of joining. Rewards apply to live payments, up to 12 per year.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-3" aria-label="Invitation stats">
        {[[Users, 'Friends joined', invited.length], [Gift, 'Became paid members', converted], [Gift, 'Pro days earned', earnedDays]].map(([Icon, label, n]) => { const I = Icon as typeof Users; return <div key={label as string} className="vellum p-5"><I aria-hidden className="h-5 w-5 text-candle" /><p className="mt-3 font-display text-3xl">{n as number}</p><p className="text-sm text-muted-foreground">{label as string}</p></div>; })}
      </section>
      {activeReward && <p className="parchment p-4 text-sm">Your referral Pro access runs until {new Date(activeReward.expires_at).toLocaleDateString()}.</p>}
      {invited.length > 0 && <section aria-labelledby="list-h"><h2 id="list-h" className="text-lg">Your invitations</h2><ul className="mt-3 divide-y divide-border border-y border-border text-sm">{invited.map(r => <li key={r.id} className="flex justify-between gap-3 py-2.5"><span>Friend joined {new Date(r.created_at).toLocaleDateString()}</span><span className={r.status === 'converted' ? 'text-gold' : 'text-muted-foreground'}>{r.status === 'converted' ? `Subscribed ${new Date(r.converted_at ?? r.created_at).toLocaleDateString()} · +30 days Pro` : 'Exploring the free plan'}</span></li>)}</ul></section>}
      {!wasInvited && <section className="space-y-3" aria-labelledby="claim-h"><h2 id="claim-h" className="text-lg">Have a friend’s code?</h2><form className="flex flex-col gap-2 sm:flex-row" onSubmit={e => { e.preventDefault(); void submit(); }}><Input value={claim} onChange={e => setClaim(e.target.value)} placeholder="ZOD-XXXXXX" maxLength={14} aria-label="Invitation code" /><Button type="submit" variant="outline" disabled={claiming}>{claiming ? 'Applying…' : 'Apply code'}</Button></form>{msg && <p role="status" className="text-sm">{msg}</p>}</section>}
      <p className="text-sm text-muted-foreground">Looking for a gift instead? <Link to="/astrobook" className="underline">AstroBook</Link> and <Link to="/astrocomic" className="underline">AstroComic</Link> make personal presents.</p>
    </article>
  );
}
