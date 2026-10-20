import { Link, useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useJsonLd } from '@/hooks/useJsonLd';
import { CORE_THEMES } from '@/lib/topicReadings';
import { ThemeArt } from '@/components/common/ThemeArt';

/** Public editorial descriptions — never private member or April text. */
const COPY: Record<string, { desc: string; reads: string[] }> = {
  'core-personality': { desc: 'How your Sun, Moon and Rising combine into the personality others meet and the strengths you lean on.', reads: ['Sun, Moon and Rising synthesis', 'Natural strengths', 'Blind spots to watch'] },
  'core-emotions': { desc: 'What your Moon, fourth house and water placements say about how you feel, soothe and connect.', reads: ['Moon sign and house', 'Emotional needs', 'Self-soothing practices'] },
  'core-friendship': { desc: 'Your eleventh house, Venus and Aquarius emphasis — how you find your people and belong.', reads: ['Eleventh house', 'Social style', 'Community roles'] },
  'core-creativity': { desc: 'Your fifth house, Sun and Venus as a map of play, self-expression and creative risk.', reads: ['Fifth house', 'Creative outlets', 'What blocks expression'] },
  'core-work-style': { desc: 'Your sixth house and Mercury: daily rhythms, habits and the way you work best.', reads: ['Sixth house', 'Ideal routines', 'Focus and energy'] },
  'core-leadership': { desc: 'Your Midheaven, Mars and Saturn — ambition, authority and how you lead.', reads: ['Midheaven', 'Drive and discipline', 'Leadership style'] },
  'core-self-worth': { desc: 'Your second house and Venus: confidence, values and your relationship with money.', reads: ['Second house', 'Core values', 'Building confidence'] },
  'core-resilience': { desc: 'Saturn, Chiron and hard aspects as a guide to stress, recovery and inner strength.', reads: ['Stress patterns', 'Chiron themes', 'Recovery practices'] },
  'core-learning': { desc: 'Mercury, Jupiter and your third and ninth houses — how you learn and grow wiser.', reads: ['Learning style', 'Curiosity drivers', 'Wisdom path'] },
  'core-beliefs-travel': { desc: 'Your ninth house and Jupiter: beliefs, philosophy, travel and adventure.', reads: ['Ninth house', 'Beliefs and meaning', 'Travel themes'] },
  'core-freedom-change': { desc: 'Uranus and your Aquarius placements — independence, change and reinvention.', reads: ['Uranus placement', 'Need for freedom', 'Navigating change'] },
  'core-legacy': { desc: 'Your North Node, Midheaven and tenth house as a compass for life direction and legacy.', reads: ['North Node', 'Life direction', 'What you leave behind'] },
};

export function ThemesIndex() {
  usePageMeta('12 Core Astrology Themes Written From Your Birth Chart | Zodaci', 'Personality, emotions, creativity, work, leadership, self-worth and more — twelve chart-specific readings. Start free with one section of every theme.');
  return (
    <main className="mx-auto max-w-5xl space-y-10 px-5 py-12">
      <header className="space-y-3"><div className="font-smallcaps text-xs text-gold">Core themes</div><h1 className="text-4xl md:text-5xl">Twelve themes, written from your chart</h1><p className="max-w-2xl text-muted-foreground">Every member can open all twelve. Free shows the first section of each; Pro writes every theme in full.</p></header>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CORE_THEMES.map(t => <li key={t.slug}><Link to={`/themes/${t.slug}`} className="group flex h-full flex-col gap-3 rounded-lg border border-border p-5 transition hover:-translate-y-0.5 hover:border-primary/60"><ThemeArt label={t.title} className="h-12 w-12" /><h2 className="text-xl">{t.title}</h2><p className="text-sm text-muted-foreground">{COPY[t.slug]?.desc}</p><span className="mt-auto text-sm text-primary">Explore theme →</span></Link></li>)}
      </ul>
    </main>
  );
}

export function ThemeDetail() {
  const { slug = '' } = useParams();
  const theme = CORE_THEMES.find(t => t.slug === slug);
  const copy = COPY[slug];
  usePageMeta(theme ? `${theme.title} — Your Birth Chart Reading | Zodaci` : 'Core themes | Zodaci', copy?.desc ?? '');
  useJsonLd('theme-crumbs', theme ? { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Core themes', item: 'https://zodaci.com/themes' }, { '@type': 'ListItem', position: 2, name: theme.title, item: `https://zodaci.com/themes/${slug}` }] } : null);
  if (!theme || !copy) return <Navigate to="/themes" replace />;
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-5 py-12">
      <Link to="/themes" className="text-sm text-primary">← All core themes</Link>
      <header className="space-y-3"><ThemeArt label={theme.title} className="h-16 w-16" /><h1 className="text-4xl md:text-5xl">{theme.title}</h1><p className="text-lg text-muted-foreground">{copy.desc}</p></header>
      <section className="space-y-2"><h2 className="text-2xl">What your reading covers</h2><ul className="list-disc space-y-1 pl-5 text-muted-foreground">{copy.reads.map(r => <li key={r}>{r}</li>)}</ul></section>
      <div className="flex flex-wrap gap-2"><Button asChild><Link to={`/auth?next=${encodeURIComponent(`/my-readings/topic/${slug}`)}`}>Read mine free</Link></Button><Button asChild variant="outline"><Link to="/demo">See a full sample</Link></Button></div>
    </main>
  );
}
