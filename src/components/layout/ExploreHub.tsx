import { Link } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { BoxArt } from '@/components/common/BoxArt';
import { PLAN_LABEL } from '@/components/common/PlanLock';
import { SYSTEM_READINGS } from '@/lib/topicReadings';
import { useNavState } from './MemberNav';

type Card = { to: string; title: string; body: string };

function HubCard({ card, size = 'md' }: { card: Card; size?: 'lg' | 'md' | 'sm' }) {
  const { lock } = useNavState();
  const need = lock(card.to);
  return (
    <Link to={card.to} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-md transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <BoxArt seed={card.to + card.title} label={card.title} className={size === 'lg' ? 'h-36 w-full' : size === 'md' ? 'h-24 w-full' : 'h-16 w-full'} />
      <span className={`flex flex-1 flex-col gap-2 ${size === 'lg' ? 'p-6' : 'p-4'}`}>
        <span className="flex flex-wrap items-center gap-2">
          <span className={`font-display leading-tight ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>{card.title}</span>
          {need && <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"><Lock className="h-2.5 w-2.5" aria-hidden="true" />{PLAN_LABEL[need]}</span>}
        </span>
        <span className="text-sm text-muted-foreground">{card.body}</span>
        <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs text-primary">Open<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
      </span>
    </Link>
  );
}

function Row({ id, title, intro, children, links }: { id: string; title: string; intro: string; children: React.ReactNode; links?: Card[] }) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 id={id} className="font-display text-3xl">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{intro}</p></div>
        {links && <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">{links.map(l => <li key={l.to}><Link to={l.to} className="inline-flex min-h-10 items-center text-primary underline-offset-4 hover:underline">{l.title} →</Link></li>)}</ul>}
      </div>
      {children}
    </section>
  );
}

const SYSTEM_BLURB: Record<string, string> = {
  '/chinese': 'Four Pillars and your animal year',
  '/other-systems/vedic': 'Your placements in the sidereal zodiac',
  '/other-systems/mayan-tzolkin': 'Your day sign and tone',
  '/other-systems/nine-star-ki': 'Your Japanese year star',
};

/** Explore hub (Section 4): timing, relationships, other systems and community in four rows. */
export function MemberExploreHub() {
  const { rels, shared } = useNavState();
  const first = rels[0];
  const systems: Card[] = [
    ...SYSTEM_READINGS.filter(s => SYSTEM_BLURB[s.route]).map(s => ({ to: s.route, title: s.title, body: SYSTEM_BLURB[s.route] })),
    { to: '/numerology', title: 'Numerology', body: 'Life path, pinnacles and number cycles' },
    { to: '/other-systems', title: 'More systems', body: `All ${SYSTEM_READINGS.length} traditions side by side` },
  ];
  return (
    <div className="space-y-14">
      <header className="max-w-3xl space-y-3">
        <p className="font-smallcaps text-xs text-gold">Explore</p>
        <h1 className="font-display">There’s more to your chart than the birth moment.</h1>
        <p className="text-lg text-muted-foreground">Timing, relationships and other wisdom systems — all in one place, all calculated from your own birth details.</p>
      </header>

      <Row id="explore-timing" title="Timing" intro="What is active for you now, and what is coming." links={[{ to: '/timeline', title: 'Personal Timeline', body: '' }, { to: '/profection', title: 'Year Ahead', body: '' }, { to: '/my-readings/topic/timing', title: 'Key Years', body: '' }]}>
        <div className="grid gap-4 md:grid-cols-2">
          <HubCard size="lg" card={{ to: '/transits', title: 'Current transits', body: 'See what is active in your chart today and which windows are opening.' }} />
          <HubCard size="lg" card={{ to: '/retrogrades', title: 'Retrograde guide', body: 'Navigate Mercury, Venus, Mars and Saturn retrogrades — at your birth and ahead.' }} />
        </div>
      </Row>

      <Row id="explore-relationships" title="Relationships" intro="Compare charts with the people in your life, with their permission.">
        <div className="grid gap-4 sm:grid-cols-3">
          <HubCard size="sm" card={{ to: '/compatibility', title: 'Compatibility', body: 'Compare your chart with someone else’s in a minute.' }} />
          <HubCard size="sm" card={{ to: first ? `/relationships/${first.id}/reading` : '/relationships', title: 'Relationship reading', body: first ? `How your chart meets ${first.name}’s.` : 'Add someone to read how your charts meet.' }} />
          <HubCard size="sm" card={{ to: first ? `/relationships/${first.id}/timeline` : '/relationships', title: 'Relationship timeline', body: 'How timing moves through a connection.' }} />
        </div>
      </Row>

      <Row id="explore-systems" title="Other systems" intro="Independent traditions, each calculated separately — never blended into your astrology.">
        <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-4 lg:grid lg:w-auto lg:grid-cols-6">
            {systems.map(card => <li key={card.to} className="w-56 lg:w-auto"><HubCard size="sm" card={card} /></li>)}
          </ul>
        </div>
      </Row>

      <Row id="explore-community" title="Community" intro="Share, compare and talk things through." links={[{ to: '/workspaces', title: 'Shared workspaces', body: '' }, { to: '/referrals', title: 'Invite a friend', body: '' }, ...(shared ? [{ to: '/shared', title: 'Our Shared Space', body: '' }] : [])]}>
        <div className="grid gap-4 md:grid-cols-2">
          <HubCard card={{ to: '/community', title: 'Connect with members', body: 'Read reflections and reply in the community.' }} />
          <HubCard card={{ to: '/counselors', title: 'Work with a counselor', body: 'Chart-informed counselors that remember your saved sessions.' }} />
        </div>
      </Row>
    </div>
  );
}
