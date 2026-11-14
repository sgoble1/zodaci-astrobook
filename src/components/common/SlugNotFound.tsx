import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/** Recovery view for a lesson, article or theme address that doesn't exist. Never indexed. */
export function SlugNotFound({ kind, back, backLabel }: { kind: string; back: string; backLabel: string }) {
  useEffect(() => {
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'; m.dataset.slugNotFound = '1';
    document.head.appendChild(m); return () => m.remove();
  }, []);
  return (
    <section role="alert" className="obs-paper mx-auto max-w-lg space-y-4 p-6 text-center">
      <h1 className="font-display text-3xl">We couldn't find that {kind}</h1>
      <p className="text-muted-foreground">The address may be mistyped, or the {kind} may have moved. Everything we publish is listed on the page below.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild><Link to={back}>{backLabel}</Link></Button>
        <Button asChild variant="outline"><Link to="/learn">All of Learn</Link></Button>
      </div>
    </section>
  );
}
