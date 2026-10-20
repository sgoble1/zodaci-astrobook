import { useEffect, useState } from 'react';
import { Gift, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { confirmAction } from '@/components/common/ConfirmHost';
import { PLAN_NAME } from '@/lib/plans';

type Member = { id: string; label: string; detail: string };
type Grant = { id: string; user_id: string; kind: 'plan' | 'credits'; what: string; reason: string; note: string; expires_at: string; created_at: string };
const REASON: Record<string, string> = { admin: 'Admin', gift: 'Gift', referral_reward: 'Referral reward', referral_welcome: 'Invited by a friend', signup_bonus: 'Welcome bonus', referral_bonus: 'Referral bonus' };

/** Give a member extra plan days or bonus AI credits. Grants are server-checked, capped and written to the audit log. */
export function MemberGrants({ initialMember }: { initialMember?: string | null }) {
  const [q, setQ] = useState('');
  const [found, setFound] = useState<Member[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [kind, setKind] = useState<'plan' | 'credits'>('plan');
  const [tier, setTier] = useState<'full' | 'creator'>('full');
  const [days, setDays] = useState(30);
  const [credits, setCredits] = useState(20);
  const [note, setNote] = useState('');
  const [grants, setGrants] = useState<Grant[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [names, setNames] = useState<Record<string, string>>({});
  const loadGrants = async () => {
    const [p, c] = await Promise.all([
      supabase.from('plan_grants').select('id,user_id,tier,reason,note,expires_at,created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('credit_grants').select('id,user_id,amount,reason,note,expires_at,created_at').order('created_at', { ascending: false }).limit(50),
    ]);
    const rows: Grant[] = [
      ...(p.data ?? []).map(r => ({ id: r.id, user_id: r.user_id, kind: 'plan' as const, what: `${PLAN_NAME[r.tier as 'full' | 'creator'] ?? r.tier} plan`, reason: r.reason, note: r.note, expires_at: r.expires_at, created_at: r.created_at })),
      ...(c.data ?? []).map(r => ({ id: r.id, user_id: r.user_id, kind: 'credits' as const, what: `${r.amount} credits`, reason: r.reason, note: r.note, expires_at: r.expires_at, created_at: r.created_at })),
    ].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 60);
    setGrants(rows);
    const ids = [...new Set(rows.map(r => r.user_id))];
    if (ids.length) { const { data } = await supabase.rpc('admin_member_emails', { _ids: ids }); setNames(Object.fromEntries(((data ?? []) as { id: string; email: string }[]).map(x => [x.id, x.email]))); }
  };
  useEffect(() => { void loadGrants(); }, []);
  useEffect(() => {
    if (!initialMember) return;
    void supabase.rpc('admin_member_emails', { _ids: [initialMember] }).then(({ data }) => { const e = ((data ?? []) as { id: string; email: string }[])[0]; if (e) setMember({ id: e.id, label: e.email, detail: '' }); });
  }, [initialMember]);
  const search = async () => {
    if (q.trim().length < 2) return;
    const { data, error } = await supabase.rpc('admin_search', { _q: q.trim() });
    if (error) { toast.error('Search failed.'); return; }
    const m = ((data ?? []) as { kind: string; id: string; label: string; detail: string }[]).filter(r => r.kind === 'member');
    setFound(m); if (!m.length) toast.message('No members match.');
  };
  const grant = async () => {
    if (!member) return;
    const what = kind === 'plan' ? `${days} days of ${PLAN_NAME[tier]}` : `${credits} bonus credits for ${days} days`;
    if (!(await confirmAction(`Give ${member.label} ${what}?`, 'Give'))) return;
    setBusy(true);
    const { error } = await supabase.rpc('admin_grant', { _user_id: member.id, _kind: kind, _tier: kind === 'plan' ? tier : 'full', _days: days, _credits: kind === 'credits' ? credits : 0, _note: note.trim().slice(0, 300) });
    setBusy(false);
    if (error) { toast.error(error.message.includes('must be') ? error.message : 'Could not give the grant.'); return; }
    toast.success(`${member.label} now has ${what}.`); setNote(''); void loadGrants();
  };
  return (
    <section className="space-y-6" aria-labelledby="mg-h">
      <div><h2 id="mg-h" className="font-display text-2xl">Member grants</h2><p className="text-sm text-muted-foreground">Extra Pro or Cosmic days, or bonus AI credits, for support cases, gifts and thank-yous.</p></div>
      <div className="vellum grid gap-5 p-5 lg:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="mg-q">Find a member</Label>
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); void search(); }}><Input id="mg-q" value={q} onChange={e => setQ(e.target.value)} placeholder="Name or email" /><Button type="submit" variant="outline" size="icon" aria-label="Search members"><Search className="h-4 w-4" /></Button></form>
          {found.length > 0 && <ul className="divide-y divide-border rounded border border-border">{found.map(m => <li key={m.id}><button type="button" onClick={() => { setMember(m); setFound([]); }} className="w-full px-3 py-2 text-left text-sm hover:bg-muted">{m.label}<span className="block text-xs text-muted-foreground">{m.detail}</span></button></li>)}</ul>}
          {member && <p className="parchment p-3 text-sm">Selected: <strong>{member.label}</strong>{member.detail && member.detail !== member.label ? ` · ${member.detail}` : ''}</p>}
        </div>
        <form className="space-y-3" onSubmit={e => { e.preventDefault(); void grant(); }}>
          <div role="radiogroup" aria-label="Grant type" className="grid grid-cols-2 gap-1 rounded-md border border-border p-1 text-sm">{(['plan', 'credits'] as const).map(k => <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={`rounded px-2 py-1.5 ${kind === k ? 'bg-primary/15' : 'text-muted-foreground'}`}>{k === 'plan' ? 'Plan days' : 'Bonus credits'}</button>)}</div>
          <div className="grid grid-cols-2 gap-3">
            {kind === 'plan' ? <div><Label htmlFor="mg-tier">Plan</Label><select id="mg-tier" className="h-10 w-full rounded border border-border bg-input px-2 text-sm" value={tier} onChange={e => setTier(e.target.value as 'full' | 'creator')}><option value="full">{PLAN_NAME.full}</option><option value="creator">{PLAN_NAME.creator}</option></select></div>
              : <div><Label htmlFor="mg-cr">Credits (1–1000)</Label><Input id="mg-cr" type="number" min={1} max={1000} value={credits} onChange={e => setCredits(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))} /></div>}
            <div><Label htmlFor="mg-days">{kind === 'plan' ? 'Days (1–366)' : 'Expires after (days)'}</Label><Input id="mg-days" type="number" min={1} max={366} value={days} onChange={e => setDays(Math.max(1, Math.min(366, Number(e.target.value) || 1)))} /></div>
          </div>
          <div><Label htmlFor="mg-note">Note (members can’t see this)</Label><Input id="mg-note" value={note} maxLength={300} onChange={e => setNote(e.target.value)} placeholder="Why this grant was given" /></div>
          <Button type="submit" disabled={!member || busy}><Gift className="h-4 w-4" />{busy ? 'Giving…' : 'Give grant'}</Button>
        </form>
      </div>
      <div>
        <h3 className="text-lg">Recent grants</h3>
        {grants === null ? <p role="status" className="text-sm text-muted-foreground">Loading…</p> : !grants.length ? <p className="text-sm text-muted-foreground">No grants yet.</p> : (
          <div className="mt-2 overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Given</th><th>Member</th><th>Grant</th><th>Reason</th><th>Expires</th><th>Note</th></tr></thead>
            <tbody>{grants.map(g => <tr key={g.kind + g.id} className={`border-b border-border ${new Date(g.expires_at) < new Date() ? 'opacity-60' : ''}`}><td className="py-2">{new Date(g.created_at).toLocaleDateString()}</td><td>{names[g.user_id] ?? g.user_id.slice(0, 8)}</td><td>{g.what}</td><td>{REASON[g.reason] ?? g.reason}</td><td>{new Date(g.expires_at).toLocaleDateString()}</td><td className="text-muted-foreground">{g.note}</td></tr>)}</tbody></table></div>
        )}
      </div>
    </section>
  );
}
