import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Shown when content fails to load: says what happened and offers a retry, instead of an empty page. */
export function LoadFailed({ what = 'This page', onRetry }: { what?: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-border bg-card/60 p-5 text-sm">
      <p className="font-medium text-foreground">{what} couldn't load.</p>
      <p className="mt-1 text-muted-foreground">Your connection may have dropped or your unlock may have expired. Try again in a moment.</p>
      <Button size="sm" variant="outline" className="mt-4" onClick={onRetry}><RefreshCw className="h-4 w-4" />Try again</Button>
    </div>
  );
}
