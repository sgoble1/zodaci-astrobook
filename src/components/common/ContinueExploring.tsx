import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export type ExploreLink = { to: string; title: string; text: string };

/** End-of-page onward links so chart pages never dead-end; each page passes its own next steps. */
export function ContinueExploring({ links, heading = 'Continue exploring' }: { links: ExploreLink[]; heading?: string }) {
  return (
    <nav aria-label={heading} className="border-t border-border pt-6">
      <h2 className="font-display text-2xl">{heading}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(l => (
          <li key={l.to}>
            <Link to={l.to} className="group flex h-full flex-col rounded-lg border border-border bg-card p-4 transition-colors duration-500 hover:border-gold focus-visible:outline focus-visible:outline-2">
              <span className="flex items-center justify-between gap-2 font-medium">{l.title}<ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-500 group-hover:translate-x-0.5" aria-hidden="true" /></span>
              <span className="mt-1 text-sm text-muted-foreground">{l.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
