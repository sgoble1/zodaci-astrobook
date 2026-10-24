import { useEffect, useId, useState, type ReactNode, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CONTENT_UNLOCKED_EVENT, getContentToken, setContentToken, type Edition } from '@/lib/protectedContent';
import { Button } from '@/components/ui/button';

/** Password form for the private archive. The server issues a time-limited unlock; nothing private ships in the page. */
export function UnlockForm({ onUnlocked, compact = false, edition }: { onUnlocked?: () => void; compact?: boolean; edition?: Edition }) {
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const id = useId();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr('');
    try {
      const { data, error } = await supabase.functions.invoke('site-password', { body: { password: pw, ...(edition ? { edition } : {}) } });
      if (error) {
        // An incorrect archive password is an expected rejection, not a broken service.
        const response = 'context' in error && error.context instanceof Response ? error.context : null;
        setErr(response?.status === 401 ? 'That password is not right. Please try again.' : 'We couldn’t check the password just now. Please try again in a moment.');
        return;
      }
      if (!data?.ok || typeof data.token !== 'string' || typeof data.edition !== 'string') {
        setErr('That password is not right. Please try again.');
        return;
      }
      setContentToken(data.edition as Edition, data.token);
      setPw('');
      window.dispatchEvent(new Event(CONTENT_UNLOCKED_EVENT));
      onUnlocked?.();
    } catch {
      setErr('We couldn’t unlock the archive just now. Please try again in a moment.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={compact ? 'space-y-3' : 'w-full max-w-sm rounded-lg border border-border bg-card/70 backdrop-blur p-8 space-y-4 shadow-lg'}>
      {compact
        ? <p className="flex items-center gap-2 font-medium text-foreground"><Lock className="h-4 w-4 text-gold" aria-hidden="true" />Your private archive is locked</p>
        : <h1 className="text-2xl font-display text-foreground">Private site</h1>}
      <p className="text-sm text-muted-foreground">{compact ? 'Enter your own Masterbook password to open it on this device. The unlock lasts for a while, then asks again.' : 'Enter the password to continue.'}</p>
      <div className={compact ? 'flex flex-col gap-2 sm:flex-row' : 'space-y-4'}>
        <label htmlFor={id} className="sr-only">Archive password</label>
        <input id={id} type="password" autoComplete="current-password" autoFocus={!compact} value={pw} onChange={(e) => setPw(e.target.value)}
          aria-invalid={!!err} aria-describedby={err ? `${id}-err` : undefined}
          className="w-full min-h-10 rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Password" />
        <Button type="submit" disabled={busy || !pw} className={compact ? 'shrink-0' : 'w-full'}>{busy ? 'Checking…' : compact ? 'Unlock' : 'Enter'}</Button>
      </div>
      {err && <p id={`${id}-err`} role="alert" className="text-sm text-destructive">{err}</p>}
    </form>
  );
}

export function SitePasswordGate({ children, edition, alsoAccept }: { children: ReactNode; edition?: Edition; alsoAccept?: Edition }) {
  const has = () => !!getContentToken(edition) || (!!alsoAccept && !!getContentToken(alsoAccept));
  const [unlocked, setUnlocked] = useState(has);

  useEffect(() => {
    const lock = () => setUnlocked(has());
    const unlock = () => setUnlocked(has());
    window.addEventListener('private-content-locked', lock);
    window.addEventListener(CONTENT_UNLOCKED_EVENT, unlock);
    return () => { window.removeEventListener('private-content-locked', lock); window.removeEventListener(CONTENT_UNLOCKED_EVENT, unlock); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { pathname } = useLocation();
  if (unlocked || pathname === '/contents' || pathname.startsWith('/contents/')) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <UnlockForm edition={edition} onUnlocked={() => setUnlocked(has())} />
    </div>
  );
}
