import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Friendly fallback shown when content fails to load, with a retry action instead of a silent empty screen. */
export function LoadError({ what = 'this content', onRetry }: { what?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="vellum flex flex-col items-center gap-3 p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-accent" aria-hidden />
      <p className="text-sm text-muted-foreground">We couldn't load {what}. It may be a temporary connection problem.</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}><RefreshCw /> Try again</Button>}
    </div>
  );
}
