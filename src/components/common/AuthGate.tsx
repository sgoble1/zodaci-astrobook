import { useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/** Shows children (upload/manage tools) only when signed in; otherwise a small sign-in card. */
export function AuthGate({ children, what }: { children: (userId: string) => ReactNode; what: string }) {
  const session = useSession();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<string | null>(null); const [busy, setBusy] = useState(false);

  if (session) return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Signed in as {session.user.email}</span>
        <button className="underline hover:text-foreground" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>
      {children(session.user.id)}
    </div>
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    const res = mode === 'in'
      ? await supabase.auth.signInWithPassword({ email, password: pw })
      : await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.href } });
    setBusy(false);
    if (res.error) setMsg(res.error.message);
    else if (mode === 'up' && !res.data.session) setMsg('Check your email to confirm your account, then sign in.');
  };

  return (
    <form onSubmit={submit} className="parchment deckle p-5 space-y-3 max-w-md">
      <div className="font-smallcaps text-[10px] text-gold">Keeper’s access</div>
      <p className="text-sm text-muted-foreground">Sign in to {what}. Visitors can still browse and listen.</p>
      <Input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <Input type="password" required minLength={6} placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} />
      {msg && <p className="text-xs text-destructive">{msg}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy}>{mode === 'in' ? 'Sign in' : 'Create account'}</Button>
        <button type="button" className="text-xs underline text-muted-foreground" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
          {mode === 'in' ? 'Need an account?' : 'Have an account? Sign in'}
        </button>
      </div>
    </form>
  );
}
