import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Row = { email: string; kind: 'zac' | 'investor' };

/** Admin: assign Zac's private edition to his sign-in email, and invite investors. Enforced by RLS (admin only). */
export function AccessManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [email, setEmail] = useState('');
  const [kind, setKind] = useState<Row['kind']>('zac');
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    const [a, b] = await Promise.all([supabase.from('edition_access').select('email'), supabase.from('investor_access').select('email')]);
    if (a.error || b.error) { setErr('Access lists could not load.'); return; }
    setRows([...(a.data ?? []).map(r => ({ email: r.email, kind: 'zac' as const })), ...(b.data ?? []).map(r => ({ email: r.email, kind: 'investor' as const }))]);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const add = async (e: FormEvent) => {
    e.preventDefault(); setErr('');
    const clean = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(clean)) { setErr('Enter a valid email.'); return; }
    const { error } = kind === 'zac' ? await supabase.from('edition_access').insert({ email: clean, edition: 'zac' }) : await supabase.from('investor_access').insert({ email: clean });
    if (error) { setErr('That email could not be added.'); return; }
    setEmail(''); void load();
  };
  const remove = async (r: Row) => {
    const { error } = r.kind === 'zac' ? await supabase.from('edition_access').delete().eq('email', r.email) : await supabase.from('investor_access').delete().eq('email', r.email);
    if (error) setErr('Could not remove access.'); else void load();
  };
  return (
    <section className="space-y-4" aria-labelledby="access-h">
      <h2 id="access-h" className="text-2xl">Editions & investor access</h2>
      <p className="text-sm text-muted-foreground">Zac’s full edition opens for the email listed here once he signs in. Investors can open the investor overview. April, Shane and Zac can always see it.</p>
      <form onSubmit={add} className="flex flex-wrap gap-2">
        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="max-w-xs" aria-label="Email" />
        <select value={kind} onChange={e => setKind(e.target.value as Row['kind'])} className="rounded-md border border-input bg-background px-3 text-sm" aria-label="Access type"><option value="zac">Zac’s edition</option><option value="investor">Investor page</option></select>
        <Button type="submit">Grant access</Button>
      </form>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <ul className="divide-y divide-border text-sm">{rows.map(r => <li key={r.kind + r.email} className="flex items-center justify-between py-2"><span>{r.email} · <span className="text-muted-foreground">{r.kind === 'zac' ? 'Zac’s edition' : 'Investor'}</span></span><Button size="sm" variant="ghost" onClick={() => void remove(r)}>Remove</Button></li>)}</ul>
    </section>
  );
}
