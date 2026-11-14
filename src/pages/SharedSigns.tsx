import { Link, useLocation } from 'react-router-dom';
import { decodeShare, SHAREABLE } from '@/lib/publicChartShare';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';

const LABEL: Record<string, string> = { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto' };

/** Public view of a shared chart: planet signs only, no birth details. */
export default function SharedSigns() {
  const share = decodeShare(useLocation().search);
  usePageMeta(share?.name ? `${share.name}’s planets — Zodaci` : 'Shared planets — Zodaci', 'Planet signs shared from a Zodaci chart. Birth details stay private.');
  if (!share) return (
    <article className="mx-auto max-w-lg space-y-4 py-12 text-center"><h1 className="text-3xl">This share link is incomplete</h1><p className="text-muted-foreground">Ask the person who sent it to copy it again from their chart.</p><Button asChild><Link to="/chart-calculator">Calculate your own chart</Link></Button></article>
  );
  return (
    <article className="mx-auto max-w-2xl space-y-8 py-8">
      <header className="space-y-2"><h1 className="text-4xl">{share.name ? `${share.name}’s planets` : 'Shared planets'}</h1>
        <p className="text-muted-foreground">The sign each planet was in at birth. Birth date, time, place, Rising and houses stay private.</p></header>
      <ul className="grid gap-3 sm:grid-cols-2">{SHAREABLE.filter(k => share.signs[k]).map(k => <li key={k} className="vellum flex items-baseline justify-between p-4"><span className="font-label tracking-[0.12em]">{LABEL[k]}</span><span className="text-xl">{share.signs[k]}</span></li>)}</ul>
      <div className="flex flex-wrap gap-3"><Button asChild><Link to="/chart-calculator">Calculate your own chart</Link></Button><Button asChild variant="outline"><Link to="/demo">See what Zodaci makes from it</Link></Button></div>
    </article>
  );
}
