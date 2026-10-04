import { useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lovable } from '@/integrations/lovable/index';

/** Shows children (upload/manage tools) only when signed in; otherwise a small sign-in card. */
export function AuthGate({ children, what }: { children: (userId: string) => ReactNode; what: string }) {
  const session = useSession();
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
    const res = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (res.error) setMsg(res.error.message);
  };

  return (
    <form onSubmit={submit} className="parchment deckle p-5 space-y-3 max-w-md">
      <div className="font-smallcaps text-[10px] text-gold">Keeper’s access</div>
      <p className="text-sm text-muted-foreground">Sign in with one of the approved April or Shane accounts to {what}. New public accounts cannot be created.</p>
      <Input type="email" required aria-label="Email address" autoComplete="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <Input type="password" required minLength={6} aria-label="Password" autoComplete="current-password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} />
      <Button type="button" variant="outline" className="w-full" onClick={async () => {
        const r = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
        if (r.error) setMsg(r.error.message || 'Google sign-in failed');
      }}>Continue with Google</Button>
      <div className="text-center text-[10px] text-muted-foreground">or with email</div>
      {msg && <p className="text-xs text-destructive">{msg}</p>}
      <Button type="submit" disabled={busy}>Sign in</Button>
    </form>
  );
}
