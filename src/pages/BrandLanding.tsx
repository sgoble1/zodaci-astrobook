import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { SpotArt, type SpotKind } from '@/components/art/SpotArt';
import { PublicHeader } from '@/components/brand/PublicHeader';
import { Button } from '@/components/ui/button';
import { SampleChartDemo } from '@/components/brand/SampleChartDemo';
import { GlobalFooter } from '@/components/brand/GlobalFooter';
import { ContactForm } from '@/components/brand/ContactForm';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PLAN_NAME, PLAN_PRICE, CREDIT_ALLOWANCE } from '@/lib/plans';
import { BOOK_VERSIONS, money } from '@/lib/books';
import { PanelTitle } from '@/components/observatory/Observatory';
import { HeroSlideshow, ChartMapSlide, LookUpSlide, PressSlide } from '@/components/observatory/HeroSlides';
import { MottoRail, ExplorePoster, DestinationTiles, QuotePlate, ArchiveShelf, HowItWorks, ZodiacPlate, TransmissionsPlate, JoinPlate, type Destination } from '@/components/observatory/Mosaic';
import { BookIcon, ChartWheelIcon, RingsIcon, StorefrontIcon, TelescopeIcon } from '@/components/icons/RetroIcons';
import { ALL_READINGS } from '@/lib/topicReadings';
import { ACADEMY } from '@/content/academy';
import { HOUSE_SYSTEMS } from '@/lib/astro';

/** Product facts only — counted from the app itself, never invented usage numbers. */
const FACTS: [string, string][] = [
  [String(ALL_READINGS.length), 'readings written from your chart'],
  [String(HOUSE_SYSTEMS.length), 'house systems to compare'],
  [String(ACADEMY.reduce((n, p) => n + p.lessons.length, 0)), 'free Academy lessons'],
  ['Free', 'to begin — no trial clock'],
];

const PILLARS = [
  { art: 'chart' as SpotKind, title: 'Calculated, not guessed', text: 'Every planet, house and angle comes from astronomical data for your exact birth moment, time and place — never a sun-sign template.' },
  { art: 'written' as SpotKind, title: 'Written for one person', text: 'Readings combine your sign, house, aspects and rulers, and name the placement behind every sentence — so they could only be about you.' },
  { art: 'honest' as SpotKind, title: 'Honest about limits', text: 'No birth time? We show exactly what changes. Measured positions, interpretations and your own notes always stay clearly separate.' },
  { art: 'private' as SpotKind, title: 'Private by design', text: 'Your chart, readings and conversations belong to your account. Nothing is shared unless you invite someone in.' },
];

const FEATURE_ART: SpotKind[] = ['book', 'year', 'radio', 'compass', 'astrobook', 'tv'];
const FEATURES: [string, string, string][] = [
  [`${ALL_READINGS.length}+ readings`, 'Chapters written from your exact placements.', '/learn#guides'],
  ['Personal forecasts', 'Transits and timing for the road ahead.', '/start'],
  ['AI Observatory', 'Ask questions answered from your own chart, with sources.', '/start'],
  ['Life Compass', 'Career, relationships, finances, purpose, health and creativity signals.', '/start'],
  ['AstroBooks', 'Your chart as a printed astral dossier.', '/astrobook'],
  ['Current Chapters', 'The theme your sky is working on now, on air.', '/start'],
];

/** Motto words on the left rail; each one opens a real page. */
const MOTTO: [string, string][] = [['Discover', '/learn'], ['Explore', '/start'], ['Understand', '/demo'], ['Evolve', '/pricing']];

const DESTINATIONS: Destination[] = [
  { to: '/start', title: 'Birth charts', text: 'Your cosmic blueprint', cta: 'Explore charts', icon: ChartWheelIcon },
  { to: '/astrobook', title: 'AstroBooks', text: 'Your personal astral dossier', cta: 'View AstroBooks', icon: BookIcon },
  { to: '/compatibility', title: 'Relationships', text: 'Two charts, side by side', cta: 'Compare charts', icon: RingsIcon },
  { to: '/learn#forecasts', title: 'Forecasts', text: 'Today’s sky and the month ahead', cta: 'See the sky', icon: TelescopeIcon },
  { to: '/store', title: 'Gift Shop', text: 'Prints, books and keepsakes', cta: 'Visit the shop', icon: StorefrontIcon },
];

export default function BrandLanding() {
  usePageMeta('Zodaci — Astral Research Authority', 'Zodaci is a personal observatory: your birth chart calculated with astronomical precision, readings written for you, forecasts, and AstroBooks. Free to begin, private by default.');
  const fromBook = Math.min(...BOOK_VERSIONS.map(v => v.price));
  const plans = [
    { key: 'free' as const, price: '$0', note: 'Free forever', points: ['Your full calculated chart', 'Two complete readings', `${CREDIT_ALLOWANCE.free} AI credits a month`] },
    { key: 'full' as const, price: PLAN_PRICE.full.month, note: `or ${PLAN_PRICE.full.year}`, points: [`All ${ALL_READINGS.length} chapter readings`, 'Timing, numerology, Ba Zi and Feng Shui', `${CREDIT_ALLOWANCE.full} AI credits a month`] },
    { key: 'creator' as const, price: PLAN_PRICE.creator.month, note: `or ${PLAN_PRICE.creator.year}`, points: ['Everything in Pro', 'Personal podcasts and new chapters', `${CREDIT_ALLOWANCE.creator} AI credits a month`] },
  ];
  const slides = [
    {
      id: 'map', label: 'Map the stars',
      content: <ChartMapSlide heading="h1" eager title={<>Map the stars.<br />Understand yourself.</>} script="Your cosmic blueprint, mapped." lines={['Calculated from your exact birth moment', 'Read and written for you alone', 'Kept private in your own archive']} cta={{ to: '/start', label: 'Generate your birth chart' }} secondary={{ to: '/demo', label: 'See a sample edition' }} />,
    },
    {
      id: 'look-up', label: 'Look up',
      content: <LookUpSlide title="Look up. It's all written there." script="The sky at your birth, read for you." text="The sky at your exact birth moment, calculated, read and kept in your own archive." cta={{ to: '/start', label: 'Generate your birth chart' }} secondary={{ to: '/learn', label: 'Start learning' }} />,
    },
    {
      id: 'press', label: 'AstroBooks and AstroComics',
      content: <PressSlide title={<>Your chart,<br />in print.</>} script="Books and comics from your own sky." text={<>Every AstroBook is an astral dossier written from your chart — five versions, from a {money(fromBook)} PDF to a linen-bound collector’s edition. AstroComic turns the same chart into an illustrated serial.</>} book={{ to: '/astrobook', label: 'Browse AstroBooks' }} comic={{ to: '/astrocomic', label: 'AstroComic' }} />,
    },
  ];
  return <div className="brand-site min-h-screen text-foreground">
    <a href="#brand-main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:p-3">Skip to content</a>
    <PublicHeader />
    <main id="brand-main" className="mosaic mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="mosaic-top">
        <MottoRail className="mosaic-rail" links={MOTTO} tagline="Your personal guide to the stars — and to yourself." />
        <HeroSlideshow className="mosaic-hero" label="Zodaci highlights" slides={slides} />
        <ExplorePoster className="mosaic-poster" to="/learn" />
      </div>

      <DestinationTiles label="Main destinations" items={DESTINATIONS} />

      <div className="mosaic-split-1-2">
        <QuotePlate quote="Check the sky twice. Name the source. Never invent a life." by="The Authority’s working rules" />
        <ArchiveShelf />
      </div>

      <HowItWorks />

      <div className="mosaic-split-2-1">
        <ZodiacPlate />
        <TransmissionsPlate />
      </div>

      <section aria-labelledby="live-h" className="obs-panel p-5 sm:p-8"><PanelTitle eyebrow="Astral Mapping Center" live><span id="live-h">Live chart</span></PanelTitle><SampleChartDemo /></section>

      <section aria-label="Zodaci at a glance" className="obs-panel"><dl className="grid grid-cols-2 gap-5 px-5 py-6 lg:grid-cols-4">{FACTS.map(([n, l]) => <div key={l}><dt className="sr-only">{l}</dt><dd className="font-display text-3xl text-primary">{n}</dd><dd aria-hidden className="text-sm text-muted-foreground">{l}</dd></div>)}</dl></section>

      <section aria-labelledby="feat-h" className="obs-panel p-5 sm:p-8"><PanelTitle eyebrow="Inside the observatory"><span id="feat-h">What you can do</span></PanelTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{FEATURES.map(([t, d, to], i) => <Link key={t} to={to} className="atomic-box group"><SpotArt kind={FEATURE_ART[i]} className="atomic-box-art" /><h3 className="font-label text-lg">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p><p className="mt-3 font-label text-xs text-accent">Explore →</p></Link>)}</div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{PILLARS.map(({ art, title, text }) => <div key={title} className="atomic-box"><SpotArt kind={art} className="h-20 w-20" /><h3 className="text-lg">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>)}</div>
      </section>

      <section id="pricing" aria-labelledby="price-h" className="obs-panel p-5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4"><PanelTitle eyebrow="Membership"><span id="price-h">Start free. Go deeper when you’re ready.</span></PanelTitle><Button asChild variant="outline"><Link to="/pricing">Compare plans<ArrowRight /></Link></Button></div>
        <div className="grid gap-5 md:grid-cols-3">{plans.map(p => <div key={p.key} className={`rounded-md border p-6 flex flex-col ${p.key === 'full' ? 'border-primary' : 'border-border'}`}><h3 className="font-label text-xl">{PLAN_NAME[p.key]}</h3><p className="mt-3"><span className="font-display text-3xl">{p.price.replace('/month', '')}</span>{p.key !== 'free' && <span className="text-muted-foreground"> /month</span>}</p><p className="text-xs text-muted-foreground">{p.note}</p><ul className="mt-5 flex-1 space-y-2 text-sm">{p.points.map(t => <li key={t} className="flex gap-2"><Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{t}</li>)}</ul><Button asChild className="mt-6" variant={p.key === 'full' ? 'primary' : 'outline'}><Link to={p.key === 'free' ? '/start' : `/pricing?plan=${p.key === 'full' ? 'pro' : 'cosmic'}`}>{p.key === 'free' ? 'Start for free' : `Choose ${PLAN_NAME[p.key]}`}</Link></Button></div>)}</div>
      </section>

      <div id="contact" className="mosaic-split-1-1">
        <JoinPlate />
        <section aria-label="Write to the observatory" className="obs-panel p-5 sm:p-8"><ContactForm /></section>
      </div>
    </main><GlobalFooter />
  </div>;
}
