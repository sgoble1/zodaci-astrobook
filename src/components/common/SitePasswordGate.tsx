import { useState, type ReactNode, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';

const KEY = 'site-unlocked-v1';

export function SitePasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(KEY) === '1');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (unlocked) return <>{children}</>;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const { data, error } = await supabase.functions.invoke('site-password', { body: { password: pw } });
    setBusy(false);
    if (!error && data?.ok) { localStorage.setItem(KEY, '1'); setUnlocked(true); }
    else setErr('That password is not right. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-card/70 backdrop-blur p-8 space-y-4 shadow-lg">
        <h1 className="text-2xl font-display text-foreground">Private site</h1>
        <p className="text-sm text-muted-foreground">Enter the password to continue.</p>
        <input
          type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          placeholder="Password"
        />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button disabled={busy || !pw} className="w-full rounded-md bg-primary px-3 py-2 text-primary-foreground disabled:opacity-50">
          {busy ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}
