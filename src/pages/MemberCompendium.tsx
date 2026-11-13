import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHead } from '@/components/observatory/PageHead';
import { usePageMeta } from '@/hooks/usePageMeta';

/** Where each part of the Compendium lives for an ordinary member: the same kinds of reference, built from their own chart. */
export const COMPENDIUM_FOR_MEMBERS: { title: string; body: string; to: string }[] = [
  { title: 'Signs and planets', body: 'Each planet in your chart, its sign and what it does for you.', to: '/planets' },
  { title: 'Houses', body: 'The twelve areas of life and which of your planets sit in each.', to: '/houses' },
  { title: 'Aspects', body: 'How your planets talk to each other, strongest first.', to: '/aspects' },
  { title: 'Fixed stars and star map', body: 'Bright stars close to your planets, and the sky as it was when you were born.', to: '/star-map' },
  { title: 'Chart elements', body: 'Your balance of fire, earth, air and water, and the shape of your chart.', to: '/chart-elements' },
  { title: 'Lessons', body: 'Plain-language lessons on the symbols every reference table uses.', to: '/learn#lessons' },
];

/** /compendium for members: the Master Compendium is one founder's private reference, so members get this guide instead. */
export default function MemberCompendium() {
  usePageMeta('Compendium · Zodaci', 'Where to find signs, planets, houses, aspects and fixed stars for your own chart.');
  return (
    <div className="space-y-8">
      <PageHead eyebrow="Reference" title="The Compendium" script="Your reference shelf." art="book">
        <p>The Master Compendium is a reference volume inside a founder’s private edition, so its pages stay there. Everything it covers is here for you too, worked out from your own birth details.</p>
      </PageHead>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COMPENDIUM_FOR_MEMBERS.map(c => (
          <li key={c.to}>
            <Link to={c.to} className="obs-paper flex h-full flex-col gap-2 p-5 transition-colors duration-500 hover:border-[hsl(var(--brass)/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="font-display text-xl">{c.title}</span>
              <span className="text-sm text-muted-foreground">{c.body}</span>
              <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm text-primary">Open<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
