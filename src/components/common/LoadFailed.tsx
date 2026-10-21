import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTENT_UNLOCKED_EVENT, getContentToken } from '@/lib/protectedContent';
import { UnlockForm } from '@/components/common/SitePasswordGate';

/**
 * Shown when content fails to load. If the private archive is locked on this device it asks for the
 * archive password right here and reopens the page; otherwise it says what happened and offers a retry.
 */
export function LoadFailed({ what = 'This page', onRetry }: { what?: string; onRetry: () => void }) {
  const [locked, setLocked] = useState(() => !getContentToken());
  useEffect(() => {
    const unlocked = () => { setLocked(false); onRetry(); };
    const relocked = () => setLocked(true);
    window.addEventListener(CONTENT_UNLOCKED_EVENT, unlocked);
    window.addEventListener('private-content-locked', relocked);
    return () => { window.removeEventListener(CONTENT_UNLOCKED_EVENT, unlocked); window.removeEventListener('private-content-locked', relocked); };
  }, [onRetry]);

  if (locked) return (
    <div role="region" aria-label="Unlock your private archive" className="rounded-2xl border border-gold/40 bg-card/60 p-5 text-sm">
      <UnlockForm compact />
    </div>
  );
  return (
    <div role="alert" className="rounded-2xl border border-border bg-card/60 p-5 text-sm">
      <p className="font-medium text-foreground">{what} couldn't load.</p>
      <p className="mt-1 text-muted-foreground">Your connection may have dropped. Try again in a moment.</p>
      <Button size="sm" variant="outline" className="mt-4" onClick={onRetry}><RefreshCw className="h-4 w-4" />Try again</Button>
    </div>
  );
}
