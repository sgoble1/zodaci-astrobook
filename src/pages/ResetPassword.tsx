import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePageMeta } from '@/hooks/usePageMeta';

type Stage = 'checking' | 'ready' | 'expired' | 'none';
const MIN = 8;

/** Read the reset link: older links carry the session in the hash, newer ones a one-time code or token in the query. */
async function openRecoverySession(): Promise<Stage> {
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.slice(1));
  if (hash.get('error') || url.searchParams.get('error')) return 'expired';
  if (hash.get('type') === 'recovery') return 'ready';
  const code = url.searchParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    window.history.replaceState(null, '', url.pathname);
    return error ? 'expired' : 'ready';
  }
  const tokenHash = url.searchParams.get('token_hash');
  if (tokenHash && url.searchParams.get('type') === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
    window.history.replaceState(null, '', url.pathname);
    return error ? 'expired' : 'ready';
  }
  return 'none';
}

/** Opened from the password-reset email; sets a new password for the recovery session. */
export default function ResetPassword() {
  usePageMeta('Set a new password · Zodaci', 'Choose a new password for your Zodaci account.');
  const nav = useNavigate();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<Stage>('checking');
  useEffect(() => {
    let on = true;
    const { data } = supabase.auth.onAuthStateChange(e => { if (e === 'PASSWORD_RECOVERY' && on) setStage('ready'); });
    void openRecoverySession().then(s => { if (on) setStage(prev => (prev === 'ready' ? prev : s)); }).catch(() => { if (on) setStage('expired'); });
    return () => { on = false; data.subscription.unsubscribe(); };
  }, []);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < MIN) return setMsg(`Use at least ${MIN} characters.`);
    if (pw !== confirm) return setMsg('The two passwords don’t match.');
    setBusy(true); setMsg('');
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      if (/same|different from the old/i.test(error.message)) return setMsg('Choose a password you haven’t used for this account before.');
      if (/session|expired|jwt/i.test(error.message)) { setStage('expired'); return; }
      return setMsg('Your password couldn’t be saved. Check your connection and try again.');
    }
    toast.success('Password updated — you’re signed in.');
    nav('/dashboard', { replace: true });
  };
  return (
    <article className="mx-auto max-w-md space-y-4 py-10">
      <h1 className="font-display text-3xl">Set a new password</h1>
      {stage === 'checking' && <p role="status" className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Checking your reset link…</p>}
      {stage === 'none' && <p className="text-muted-foreground">Open this page from the link in your password-reset email. Need a new link? <Link to="/auth" className="text-primary underline underline-offset-2">Go to sign in</Link> and choose “Forgot password?”.</p>}
      {stage === 'expired' && (
        <div role="alert" className="space-y-3 rounded-lg border border-destructive/40 p-4 text-sm">
          <p>This reset link has expired or was already used.</p>
          <Button asChild variant="outline" size="sm"><Link to="/auth">Request a new link</Link></Button>
        </div>
      )}
      {stage === 'ready' && (
        <form onSubmit={save} className="space-y-3" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="np">New password</Label>
            <div className="relative">
              <Input id="np" type={show ? 'text' : 'password'} minLength={MIN} required autoComplete="new-password" value={pw} onChange={e => { setPw(e.target.value); setMsg(''); }} aria-describedby="np-hint" className="pr-10" />
              <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <p id="np-hint" className="text-xs text-muted-foreground">At least {MIN} characters.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="np2">Confirm new password</Label>
            <Input id="np2" type={show ? 'text' : 'password'} required autoComplete="new-password" value={confirm} onChange={e => { setConfirm(e.target.value); setMsg(''); }} />
          </div>
          {msg && <p role="alert" className="text-sm text-destructive">{msg}</p>}
          <Button type="submit" disabled={busy}>{busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />}Save password</Button>
        </form>
      )}
    </article>
  );
}
