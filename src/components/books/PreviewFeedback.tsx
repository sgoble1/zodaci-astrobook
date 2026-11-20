import { BookOpen, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/** Unframed, shape-matched waiting/error view shared by personalized readers. */
export function PreviewFeedback({ kind = 'book', error = false, onRetry, details = false, loadingMessage }: {
  kind?: 'book' | 'comic'; error?: boolean; onRetry?: () => void; details?: boolean; loadingMessage?: string;
}) {
  const product = kind === 'comic' ? 'AstroComic' : 'AstroBook';
  return <section className="preview-feedback" aria-busy={!error} aria-label={`${product} preparation`}>
    <div className="preview-feedback-spread" aria-hidden="true">
      <div className="preview-feedback-page"><BookOpen className="h-8 w-8 text-primary" /><div className="preview-feedback-rule" /><div className="preview-feedback-line" /><div className="preview-feedback-line" /><div className="preview-feedback-line w-2/3" /></div>
      <div className="preview-feedback-page"><div className="preview-feedback-rule" /><div className="preview-feedback-line" /><div className="preview-feedback-line" /><div className="preview-feedback-line" /><div className="preview-feedback-line w-2/3" /></div>
    </div>
    <div role={error ? 'alert' : 'status'} aria-live="polite" className="mx-auto max-w-lg space-y-3 text-center">
      <h3 className="font-display text-xl sm:text-2xl">{error ? `Your ${product} couldn’t be prepared.` : loadingMessage ?? `Preparing your ${product}…`}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{error ? 'Try again. If it still won’t open, review your saved birth details.' : 'Calculating the chart and arranging the pages and artwork. Your preview will open here.'}</p>
      {error && <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={onRetry}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</Button>
        {details && <Button asChild variant="ghost"><Link to="/start">Review birth details</Link></Button>}
        <AlertCircle className="sr-only" aria-hidden="true" />
      </div>}
    </div>
  </section>;
}