import { useEffect, useState, type ReactNode, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CONTENT_TOKEN_KEY, CONTENT_UNLOCKED_EVENT, getContentToken } from '@/lib/protectedContent';
import { Button } from '@/components/ui/button';

export function SitePasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => !!getContentToken());
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const lock = () => setUnlocked(false);
    window.addEventListener('private-content-locked', lock);
    return () => window.removeEventListener('private-content-locked', lock);
  }, []);

  if (unlocked) return <>{children}</>;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const { data, error } = await supabase.functions.invoke('site-password', { body: { password: pw } });
    setBusy(false);
    if (!error && data?.ok && data?.token) {
      localStorage.setItem(CONTENT_TOKEN_KEY, data.token);
      window.dispatchEvent(new Event(CONTENT_UNLOCKED_EVENT));
      setUnlocked(true);
    }
    else setErr('That password is not right. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-border bg-card/70 backdrop-blur p-8 space-y-4 shadow-lg">
        <h1 className="text-2xl font-display text-foreground">Private site</h1>
        <p className="text-sm text-muted-foreground">Enter the password to continue.</p>
        <input
          type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          placeholder="Password"
        />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" disabled={busy || !pw} className="w-full">
          {busy ? 'Checking…' : 'Enter'}
        </Button>
      </form>
    </div>
  );
}
