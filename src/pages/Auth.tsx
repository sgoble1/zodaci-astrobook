import { useState } from 'react';
import { useNavigate, Link, useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useSession } from '@/hooks/useLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Public sign-in and sign-up. */
export default function Auth() {
  const session = useSession();
  const nav = useNavigate();
  const [mode, setMode] = useState<'in' | 'up'>('up');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [params] = useSearchParams();
  const raw = params.get('next') ?? '';
  const next = raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\') ? raw : '/start';
  const forgot = async () => {
    if (!email) return setMsg('Enter your email above first.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setMsg(error ? error.message : 'Check your email for a link to set a new password.');
  };

  if (session && raw) return <Navigate to={next} replace />;
  if (session) return (
    <article className="mx-auto max-w-md space-y-4 py-10 text-center">
      <h1 className="font-display text-3xl">You're signed in</h1>
      <p className="text-muted-foreground">{session.user.email}</p>
      <div className="flex justify-center gap-3">
        <Button asChild><Link to="/my-chart">Open my chart</Link></Button>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>
    </article>
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    const res = mode === 'up'
      ? await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(next)}` } })
      : await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (res.error) return setMsg(res.error.message);
    if (mode === 'up' && !res.data.session) return setMsg('Check your email to confirm your account, then sign in.');
    nav(next);
  };

  return (
    <article className="mx-auto max-w-md space-y-6 py-10">
      <header className="text-center">
        <h1 className="font-display text-3xl">{mode === 'up' ? 'Create your free account' : 'Welcome back'}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{mode === 'up' ? 'Keep your chart safe, sync it across devices and unlock your personal readings.' : 'Sign in to open your Zodaci.'}</p>
      </header>
      <Button type="button" variant="outline" className="w-full" onClick={async () => {
        const r = await lovable.auth.signInWithOAuth('google', { redirect_uri: `${window.location.origin}/auth?next=${encodeURIComponent(next)}` });
        if (r.error) setMsg(r.error.message || 'Google sign-in failed');
      }}>Continue with Google</Button>
      <div className="text-center text-[10px] text-muted-foreground">or with email</div>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1"><Label htmlFor="e">Email</Label><Input id="e" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="space-y-1"><Label htmlFor="p">Password</Label><Input id="p" type="password" required minLength={6} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} value={pw} onChange={e => setPw(e.target.value)} /></div>
        {mode === 'in' && <button type="button" className="text-xs text-primary underline underline-offset-2" onClick={forgot}>Forgot password?</button>}
        {msg && <p role="alert" className="text-sm text-destructive">{msg}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? 'One moment…' : mode === 'up' ? 'Create account' : 'Sign in'}</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {mode === 'up' ? 'Already have an account?' : 'New to Zodaci?'}{' '}
        <button type="button" className="text-primary underline underline-offset-2" onClick={() => { setMode(mode === 'up' ? 'in' : 'up'); setMsg(null); }}>
          {mode === 'up' ? 'Sign in' : 'Create one free'}
        </button>
      </p>
    </article>
  );
}
