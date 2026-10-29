import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentLockedError } from '@/lib/protectedContent';
import { NoEditionAccess } from '@/components/common/PrivateEditionGate';

/**
 * Shown when content fails to load. If the account may not open this private edition it says so (and how to get
 * access); otherwise it says what happened and offers a retry.
 */
export function LoadFailed({ what = 'This page', onRetry, error }: { what?: string; onRetry: () => void; error?: unknown }) {
  if (error instanceof ContentLockedError && !error.signedOut) return <NoEditionAccess onRetry={onRetry} />;
  return (
    <div role="alert" className="rounded-2xl border border-border bg-card/60 p-5 text-sm">
      <p className="font-medium text-foreground">{what} couldn't load.</p>
      <p className="mt-1 text-muted-foreground">Your connection may have dropped. Try again in a moment.</p>
      <Button size="sm" variant="outline" className="mt-4" onClick={onRetry}><RefreshCw className="h-4 w-4" />Try again</Button>
    </div>
  );
}
