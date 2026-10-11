import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Opened from the password-reset email; sets a new password for the recovery session. */
export default function ResetPassword() {
  const nav = useNavigate();
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) setReady(true);
    const { data } = supabase.auth.onAuthStateChange(e => { if (e === 'PASSWORD_RECOVERY') setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return setMsg(error.message);
    nav('/');
  };
  return (
    <article className="mx-auto max-w-md space-y-4 py-10">
      <h1 className="font-display text-3xl">Set a new password</h1>
      {!ready ? <p className="text-muted-foreground">Open this page from the link in your password-reset email.</p> : (
        <form onSubmit={save} className="space-y-3">
          <Label htmlFor="np">New password</Label>
          <Input id="np" type="password" minLength={6} required autoComplete="new-password" value={pw} onChange={e => setPw(e.target.value)} />
          {msg && <p role="alert" className="text-sm text-destructive">{msg}</p>}
          <Button type="submit">Save password</Button>
        </form>
      )}
    </article>
  );
}
