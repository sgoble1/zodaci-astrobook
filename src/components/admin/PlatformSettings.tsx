import { useEffect, useState } from 'react';
import { Mail, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { confirmAction } from '@/components/common/ConfirmHost';
import { parseSiteSettings, refreshSiteSettings, type SiteFlags, type SiteSettings } from '@/hooks/useSiteSettings';
import { useSession } from '@/hooks/useLibrary';
import { PLAN_NAME, PLAN_PRICE } from '@/lib/plans';
import { COMIC_PLANS } from '@/lib/comic';
import { BOOK_VERSIONS } from '@/lib/books';

const FLAG_INFO: Record<keyof SiteFlags, [string, string]> = {
  astrocomic: ['AstroComic', 'Product page, checkout and My AstroComic'],
  referrals: ['Invitations', 'Invite-a-friend page and codes'],
  academy: ['Academy', 'Public learning lessons'],
  compatibility: ['Compatibility', 'Public compatibility score'],
  community: ['Community', 'Public community board'],
};
const general = z.object({ display_name: z.string().trim().min(1, 'Add a display name').max(60), tagline: z.string().trim().max(120), support_email: z.union([z.literal(''), z.string().trim().email('Use a valid support email').max(254)]) });
type Admin = { user_id: string; email: string; display_name: string; joined: string };
const ADMIN_RESULT: Record<string, string> = { ok: 'Done.', no_account: 'No Zodaci account uses that email yet — they need to sign up first.', self: 'You can’t remove your own admin access.', already: 'That account is already an admin.', not_admin: 'That account isn’t an admin.' };

/** Admin settings: site name, maintenance notice, feature switches and admin access. Every save is audited. */
export function PlatformSettings() {
  const session = useSession();
  const [s, setS] = useState<SiteSettings | null>(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState('');
  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [email, setEmail] = useState('');
  const load = async () => {
    setErr('');
    const [cfg, ad] = await Promise.all([supabase.from('platform_settings').select('key,value'), supabase.rpc('admin_list_admins')]);
    if (cfg.error) { setErr('Settings could not be loaded.'); return; }
    setS(parseSiteSettings(cfg.data ?? [])); setAdmins((ad.data ?? []) as Admin[]);
  };
  useEffect(() => { void load(); }, []);
  const save = async (key: string, value: Record<string, unknown>, label: string) => {
    setSaving(key);
    const { error } = await supabase.from('platform_settings').upsert({ key, value: value as never, updated_by: session?.user.id ?? null, updated_at: new Date().toISOString() });
    setSaving('');
    if (error) { toast.error('Could not save — please try again.'); return false; }
    toast.success(label); void refreshSiteSettings(); return true;
  };
  const setAdmin = async (target: string, grant: boolean) => {
    if (!grant && !(await confirmAction(`Remove admin access for ${target}?`, 'Remove access'))) return;
    if (grant && !(await confirmAction(`Give ${target} full admin access? They will see every member’s orders and settings.`, 'Grant admin'))) return;
    const { data, error } = await supabase.rpc('admin_set_admin', { _email: target, _grant: grant, _note: '' });
    if (error) { toast.error('Could not change admin access.'); return; }
    const msg = ADMIN_RESULT[data as string] ?? 'Done.';
    if (data === 'ok') { toast.success(grant ? `${target} is now an admin.` : `${target} is no longer an admin.`); setEmail(''); void load(); } else toast.error(msg);
  };
  if (err) return <p role="alert" className="text-destructive">{err} <Button variant="link" className="h-auto p-0" onClick={() => void load()}>Retry</Button></p>;
  if (!s) return <div role="status" aria-label="Loading settings" className="h-40 animate-pulse rounded bg-muted" />;
  const g = s.general;
  return (
    <div className="space-y-10">
      <section className="vellum space-y-4 p-5" aria-labelledby="ps-general">
        <h2 id="ps-general" className="font-display text-2xl">General</h2>
        <form className="grid gap-3 sm:grid-cols-3" onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); const p = general.safeParse({ display_name: fd.get('display_name'), tagline: fd.get('tagline'), support_email: fd.get('support_email') }); if (!p.success) { toast.error(p.error.issues[0].message); return; } void save('site.general', p.data, 'General settings saved').then(ok => ok && setS({ ...s, general: p.data as SiteSettings['general'] })); }}>
          <div><Label htmlFor="ps-name">Display name</Label><Input id="ps-name" name="display_name" defaultValue={g.display_name} maxLength={60} /></div>
          <div><Label htmlFor="ps-tag">Tagline</Label><Input id="ps-tag" name="tagline" defaultValue={g.tagline} maxLength={120} /></div>
          <div><Label htmlFor="ps-mail">Support email</Label><Input id="ps-mail" name="support_email" type="email" defaultValue={g.support_email} maxLength={254} placeholder="hello@zodaci.com" /></div>
          <Button type="submit" disabled={saving === 'site.general'} className="sm:col-span-3 sm:w-fit">{saving === 'site.general' ? 'Saving…' : 'Save general settings'}</Button>
        </form>
      </section>

      <section className="vellum space-y-4 p-5" aria-labelledby="ps-maint">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="ps-maint" className="font-display text-2xl">Maintenance notice</h2><p className="text-sm text-muted-foreground">Shows a banner across every page while you make changes. The site stays usable.</p></div>
          <div className="flex items-center gap-2"><Switch id="ps-maint-on" checked={s.maintenance.enabled} disabled={saving === 'site.maintenance'} onCheckedChange={v => { const next = { ...s.maintenance, enabled: v }; void save('site.maintenance', next, v ? 'Maintenance notice is showing' : 'Maintenance notice removed').then(ok => ok && setS({ ...s, maintenance: next })); }} /><Label htmlFor="ps-maint-on">{s.maintenance.enabled ? 'On' : 'Off'}</Label></div></div>
        <form className="space-y-2" onSubmit={e => { e.preventDefault(); const msg = String(new FormData(e.currentTarget).get('message') ?? '').trim().slice(0, 300); const next = { ...s.maintenance, message: msg }; void save('site.maintenance', next, 'Notice text saved').then(ok => ok && setS({ ...s, maintenance: next })); }}>
          <Label htmlFor="ps-msg">Notice text</Label><Textarea id="ps-msg" name="message" defaultValue={s.maintenance.message} maxLength={300} rows={2} />
          <Button type="submit" variant="outline" size="sm" disabled={saving === 'site.maintenance'}>Save notice text</Button>
        </form>
      </section>

      <section className="vellum space-y-4 p-5" aria-labelledby="ps-flags">
        <div><h2 id="ps-flags" className="font-display text-2xl">Features</h2><p className="text-sm text-muted-foreground">Switch a feature off to hide it from members and visitors right away. Admins still see it.</p></div>
        <ul className="divide-y divide-border">{(Object.keys(FLAG_INFO) as (keyof SiteFlags)[]).map(k => (
          <li key={k} className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium">{FLAG_INFO[k][0]}</p><p className="text-xs text-muted-foreground">{FLAG_INFO[k][1]}</p></div>
            <Switch aria-label={`${FLAG_INFO[k][0]} ${s.flags[k] ? 'on' : 'off'}`} checked={s.flags[k]} disabled={saving === 'site.flags'} onCheckedChange={v => { const next = { ...s.flags, [k]: v }; void save('site.flags', next, `${FLAG_INFO[k][0]} switched ${v ? 'on' : 'off'}`).then(ok => ok && setS({ ...s, flags: next })); }} /></li>
        ))}</ul>
      </section>

      <section className="vellum space-y-4 p-5" aria-labelledby="ps-admins">
        <h2 id="ps-admins" className="font-display text-2xl flex items-center gap-2"><ShieldCheck aria-hidden className="h-5 w-5 text-gold" />Admin access</h2>
        {admins === null ? <p role="status" className="text-sm text-muted-foreground">Loading…</p> : <ul className="divide-y divide-border">{admins.map(a => (
          <li key={a.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{a.display_name || a.email}</p><p className="text-xs text-muted-foreground">{a.email} · joined {new Date(a.joined).toLocaleDateString()}</p></div>
            {a.user_id === session?.user.id ? <span className="text-xs text-muted-foreground">You</span> : <Button size="sm" variant="ghost" className="text-destructive" onClick={() => void setAdmin(a.email, false)}><Trash2 className="h-4 w-4" />Remove</Button>}</li>
        ))}</ul>}
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={e => { e.preventDefault(); const v = email.trim().toLowerCase(); if (!z.string().email().safeParse(v).success) { toast.error('Enter the email of an existing Zodaci account.'); return; } void setAdmin(v, true); }}>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="member@example.com" aria-label="Email of the account to make admin" maxLength={254} />
          <Button type="submit" variant="outline"><UserPlus className="h-4 w-4" />Grant admin</Button>
        </form>
        <p className="text-xs text-muted-foreground">Admin access is checked by the server on every request. You can’t remove your own access, and every change is in the audit log.</p>
      </section>

      <section className="vellum space-y-3 p-5" aria-labelledby="ps-email">
        <h2 id="ps-email" className="font-display text-2xl flex items-center gap-2"><Mail aria-hidden className="h-5 w-5 text-gold" />Email sending</h2>
        <p className="text-sm">Sender domain: <span className="text-gold">not connected yet</span>.</p>
        <p className="text-sm text-muted-foreground">Newsletters can be written, segmented and scheduled now; they are sent once a sender address on your own domain (for example hello@zodaci.com) is connected. Sign-in emails already work.</p>
      </section>

      <section className="vellum space-y-3 p-5" aria-labelledby="ps-prices">
        <h2 id="ps-prices" className="font-display text-2xl">Prices on sale</h2>
        <p className="text-sm text-muted-foreground">Checkout refuses any payment whose amount doesn’t match these advertised prices.</p>
        <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-sm"><thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Product</th><th>Price</th><th>Checkout id</th></tr></thead><tbody>
          {(['full', 'creator'] as const).flatMap(t => [[`${PLAN_NAME[t]} monthly`, PLAN_PRICE[t].month, PLAN_PRICE[t].monthId], [`${PLAN_NAME[t]} yearly`, PLAN_PRICE[t].year, PLAN_PRICE[t].yearId]]).map(([a, b, c]) => <tr key={c} className="border-b border-border"><td className="py-2">{a}</td><td>{b}</td><td className="font-mono text-xs">{c}</td></tr>)}
          {Object.values(COMIC_PLANS).map(p => <tr key={p.priceId} className="border-b border-border"><td className="py-2">AstroComic {p.name.toLowerCase()}</td><td>{p.label}</td><td className="font-mono text-xs">{p.priceId}</td></tr>)}
          {BOOK_VERSIONS.map(v => <tr key={v.id} className="border-b border-border last:border-0"><td className="py-2">AstroBook {v.name}</td><td>${(v.price / 100).toFixed(2)}</td><td className="font-mono text-xs">{v.lookup}</td></tr>)}
        </tbody></table></div>
      </section>
    </div>
  );
}
