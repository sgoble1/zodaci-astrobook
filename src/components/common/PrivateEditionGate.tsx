import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { NO_ACCESS_MESSAGE } from '@/lib/protectedContent';

/**
 * Private editions open by account only. This gate only makes sure someone is signed in; the server decides,
 * chapter by chapter, whether this account owns the edition or was given access by its owner.
 */
export function PrivateEditionGate({ children, standalone = false }: { children: ReactNode; standalone?: boolean }) {
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const location = useLocation();
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => { if (active) setUid(data.session?.user.id ?? null); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { if (active) setUid(s?.user.id ?? null); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  const frame = (body: ReactNode) => standalone
    ? <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">{body}</div>
    : <div className="py-10">{body}</div>;
  if (uid === undefined) return frame(<p role="status" className="text-muted-foreground">Opening your private edition…</p>);
  if (!uid) return frame(
    <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card/70 p-8 text-center backdrop-blur">
      <Lock className="mx-auto h-6 w-6 text-gold" aria-hidden="true" />
      <h1 className="font-display text-3xl">Private edition</h1>
      <p className="text-sm text-muted-foreground">Sign in with your own account. {NO_ACCESS_MESSAGE}</p>
      <Button asChild><Link to={`/auth?next=${encodeURIComponent(location.pathname + location.search + location.hash)}`}>Sign in</Link></Button>
    </div>,
  );
  // Remount on account change so nothing from a previous account lingers on screen.
  return <div key={uid} className="contents">{children}</div>;
}

/** The message shown when the server says this account may not open an edition or chapter. */
export function NoEditionAccess({ owner, onRetry }: { owner?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-gold/40 bg-card/60 p-5 text-sm">
      <p className="flex items-center gap-2 font-medium text-foreground"><Lock className="h-4 w-4 text-gold" aria-hidden="true" />{owner ? `${owner}’s edition is private` : 'This edition is private'}</p>
      <p className="mt-1 text-muted-foreground">{NO_ACCESS_MESSAGE} If you were expecting access, ask the owner to share it with the email you signed in with.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline"><Link to="/shared-with-me">See what’s shared with me</Link></Button>
        {onRetry && <Button size="sm" variant="ghost" onClick={onRetry}>Try again</Button>}
      </div>
    </div>
  );
}
