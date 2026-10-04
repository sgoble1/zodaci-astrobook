import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Compass, Heart, Home, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DiscoveryItem = {
  title: string;
  description: string;
  to: string;
  category: string;
  sources: { label: string; to: string }[];
};

const categories = [
  { id: 'all', label: 'Everything', icon: Compass },
  { id: 'chart', label: 'Understand April', icon: Sparkles },
  { id: 'timing', label: 'What is happening now', icon: Compass },
  { id: 'growth', label: 'Feelings & growth', icon: Heart },
  { id: 'relationships', label: 'Relationships', icon: Users },
  { id: 'home', label: 'Home & daily life', icon: Home },
  { id: 'sources', label: 'Read & research', icon: BookOpen },
];

const items: DiscoveryItem[] = [
  { category: 'chart', title: 'Start with the complete birth chart', description: 'See April’s strongest traits, needs and patterns, with ordinary-language explanations beside the chart details.', to: '/birth-chart', sources: [{ label: 'Chart foundation chapters', to: '/read/document/part-one-your-natal-chart-the-foundation' }, { label: 'Sun chapter', to: '/read/ch-2' }] },
  { category: 'chart', title: 'Meet the planets', description: 'Learn what each part of the chart represents and how its exact position may show up in April’s everyday life.', to: '/planets', sources: [{ label: 'Moon chapter', to: '/read/ch-3' }, { label: 'Mercury chapter', to: '/read/ch-4' }] },
  { category: 'chart', title: 'Explore the twelve life areas', description: 'Understand which part of life each house describes, from identity and money to home, love and career.', to: '/houses', sources: [{ label: 'Browse chart chapters', to: '/contents' }] },
  { category: 'chart', title: 'Compare other traditions', description: 'See what Vedic, Maya, Tibetan, Japanese, Chaldean, Tarot and Celtic systems calculate for April.', to: '/other-systems', sources: [{ label: 'Numerology source', to: '/read/ch-46' }, { label: 'Tarot source', to: '/read/ch-55' }] },
  { category: 'timing', title: 'See the full timeline overview', description: 'Begin with a simple map of life phases, present cycles, retrogrades, returns and key dates.', to: '/guides/timeline-retrogrades', sources: [{ label: 'Timing source chapters', to: '/read/document/part-three-timing-life-phases' }] },
  { category: 'timing', title: 'Browse April’s life timeline', description: 'Move through the major periods from 1990 to 2060 and see which chapter is active now.', to: '/timeline', sources: [{ label: 'Timeline source index', to: '/contents' }] },
  { category: 'timing', title: 'Check upcoming influences', description: 'Review the most important periods from 2026 to 2040 and what they may mean in practical terms.', to: '/transits', sources: [{ label: 'Saturn transit guide', to: '/read/ch-38' }] },
  { category: 'timing', title: 'Understand retrogrades', description: 'Learn which planets were retrograde when April was born and how those inward patterns may feel.', to: '/retrogrades', sources: [{ label: 'Birth retrogrades appendix', to: '/read/app-c' }, { label: 'Mercury retrograde guide', to: '/read/ch-40' }] },
  { category: 'growth', title: 'Use April’s Workbook', description: 'Work through guided questions slowly, connect patterns to real experiences and save private reflections.', to: '/workbook', sources: [{ label: 'Healing source chapter', to: '/read/x-complete-healing-journey-the-astrological-map-of-april-s-hea' }] },
  { category: 'growth', title: 'Talk privately with the Oracle', description: 'Start a private, supportive conversation shaped around April’s patterns and current concerns.', to: '/workbook/companion', sources: [{ label: 'Shadow-work chapter', to: '/read/ch-56' }] },
  { category: 'growth', title: 'Explore healing themes', description: 'Look at recurring emotional patterns, wounds and practical ways to respond with more choice.', to: '/topics/shadow-work', sources: [{ label: 'Complete shadow-work guide', to: '/read/x-the-complete-shadow-work-guide-every-shadow-in-full-depth' }] },
  { category: 'relationships', title: 'Explore relationships', description: 'Create and compare relationship charts, then read the shared patterns in plain language.', to: '/relationships', sources: [{ label: 'Relationship chapter', to: '/read/ch-49' }] },
  { category: 'relationships', title: 'Read love and relationship themes', description: 'Gather April’s relationship patterns and the relevant passages from her source books in one place.', to: '/topics/love', sources: [{ label: 'Complete relationship guide', to: '/read/x-the-complete-relationship-guide-every-dimension-of-love-in-a' }] },
  { category: 'home', title: 'Understand Family & Home', description: 'Explore April’s needs around belonging, family, care and feeling safe at home.', to: '/topics/family-home', sources: [{ label: 'Family and home sources', to: '/contents' }] },
  { category: 'home', title: 'Arrange the home for April', description: 'Use April’s personal Feng Shui directions and room guidance without needing to know technical terms.', to: '/feng-shui', sources: [{ label: 'Feng Shui chapter', to: '/read/ch-52' }, { label: 'Complete home guide', to: '/read/x-the-complete-feng-shui-guide-every-dimension-of-sacred-space' }] },
  { category: 'sources', title: 'Ask the Sources', description: 'Ask a question and receive an answer drawn from the protected books and saved reading notes, with citations.', to: '/ask', sources: [{ label: 'Browse all source chapters', to: '/read' }] },
  { category: 'sources', title: 'Browse the Reading Room', description: 'Open the available books, documents and shared reading material in one searchable library.', to: '/read', sources: [{ label: 'Masterbook contents', to: '/contents' }] },
  { category: 'sources', title: 'Explore themes and questions', description: 'Choose a life topic and see its key ideas, linked source passages and useful questions to consider.', to: '/topics', sources: [{ label: 'All protected sources', to: '/read' }] },
];

export default function ExploreDiscover() {
  const [active, setActive] = useState('all');
  const visibleItems = useMemo(() => active === 'all' ? items : items.filter(item => item.category === active), [active]);
  const activeLabel = categories.find(category => category.id === active)?.label ?? 'Everything';

  return (
    <div className="space-y-10">
      <header className="max-w-3xl gentle-fade">
        <div className="font-smallcaps text-xs text-gold">Explore & Discover</div>
        <h1 className="font-display mt-2">Choose what you want to understand.</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Pick a subject below. You will see the most useful places to begin, what each page explains, and where to go next.
        </p>
      </header>

      <section aria-labelledby="discovery-categories">
        <h2 id="discovery-categories" className="font-display text-2xl">What are you curious about?</h2>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter discoveries by subject">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                type="button"
                variant={active === category.id ? 'default' : 'outline'}
                onClick={() => setActive(category.id)}
                aria-pressed={active === category.id}
              >
                <Icon aria-hidden="true" />{category.label}
              </Button>
            );
          })}
        </div>
      </section>

      <section aria-live="polite" aria-labelledby="discovery-results">
        <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
          <div>
            <div className="font-smallcaps text-[10px] text-gold">Selected subject</div>
            <h2 id="discovery-results" className="font-display text-2xl">{activeLabel}</h2>
          </div>
          <span className="text-xs text-muted-foreground">{visibleItems.length} places to explore</span>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {visibleItems.map(item => (
            <article key={`${item.category}-${item.to}`} className="rounded border border-border bg-card/60 p-5">
              <h3 className="font-display text-xl leading-tight"><Link to={item.to} className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{item.title}</Link></h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              <Link to={item.to} className="group mt-5 inline-flex items-center gap-2 font-smallcaps text-[10px] text-gold">Open this page <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link>
              <div className="mt-4 border-t border-border/60 pt-3"><div className="font-smallcaps text-[10px] text-muted-foreground">Read the source text</div><ul className="mt-2 space-y-1">{item.sources.map(source => <li key={source.to}><Link className="text-sm underline decoration-border underline-offset-4 hover:text-gold" to={source.to}>{source.label}</Link></li>)}</ul></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}