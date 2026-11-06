import { usePageMeta } from '@/hooks/usePageMeta';
import observatoryArt from '@/assets/places/grand-observatory.jpg';
import { useState } from 'react';
import { useNavigate, Link, useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useSession } from '@/hooks/useLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { internalDestination } from '@/lib/internalDestination';

/** Public sign-in and sign-up. */
export default function Auth() {
  usePageMeta('Sign in · Zodaci', 'Sign in or create your Zodaci account to calculate your birth chart and open your readings.');
  const session = useSession();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<'in' | 'up'>(() => params.get('mode') === 'signup' ? 'up' : 'in');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const raw = params.get('next') ?? '';
  const next = internalDestination(raw, '/start');
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
    <div className="auth-stage mx-auto grid max-w-4xl items-stretch gap-6 py-6 lg:grid-cols-[1fr_minmax(0,28rem)] lg:py-10">
    <aside className="poster-header relative hidden overflow-hidden lg:block">
      <img src={observatoryArt} alt="A 1950s observatory with white domes and searchlights over a reflecting pool" width={1536} height={640} decoding="async" className="absolute inset-0 h-full w-full object-cover object-[40%_center]" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 space-y-3 p-7">
        <p className="font-label text-sm tracking-[0.2em] text-primary">Zodaci · Astral Research Authority</p>
        <p className="font-script text-3xl text-primary">Your sky. Your story.</p>
        <ul className="space-y-1.5 text-sm text-foreground/85">
          <li>Your chart is calculated to the minute from your birth details.</li>
          <li>Your birth data and readings stay private unless you share them.</li>
          <li>Free to start; no card needed for a free account.</li>
        </ul>
      </div>
    </aside>
    <article className="obs-panel w-full space-y-6 p-6 sm:p-8">
      <header className="text-center">
        <p className="font-label text-xs tracking-[0.2em] text-primary lg:hidden">Zodaci · Astral Research Authority</p>
        <h1 className="mt-1 font-display text-3xl">{mode === 'up' ? 'Create your free account' : 'Welcome back'}</h1>
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
    </div>
  );
}
