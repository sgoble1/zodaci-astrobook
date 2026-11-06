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
import { PanelTitle, StatusLight } from '@/components/observatory/Observatory';
import { HeroSlideshow, ChartMapSlide, LookUpSlide, PressSlide, ArtSlide } from '@/components/observatory/HeroSlides';
import { MottoRail, ForecastPlate, type MottoLink, ExplorePoster, DestinationTiles, QuotePlate, ArchiveShelf, HowItWorks, ZodiacPlate, TransmissionsPlate, JoinPlate, LessonsTile, PrecisionTile, ShopWindowPlate, type Destination } from '@/components/observatory/Mosaic';
import rooftop from '@/assets/home/rooftop-astronomers.jpg';
import stargazer from '@/assets/home/stargazer-field-guide.jpg';
import giftTower from '@/assets/home/gift-shop-tower.jpg';
import { BookIcon, ChartWheelIcon, RingsIcon, StorefrontIcon, TelescopeIcon } from '@/components/icons/RetroIcons';
import { ALL_READINGS } from '@/lib/topicReadings';
import { PersonalizationStory } from '@/components/books/PersonalizationStory';
import { ACADEMY } from '@/content/academy';
import { HOUSE_SYSTEMS } from '@/lib/astro';

const lessonCount = ACADEMY.reduce((n, p) => n + p.lessons.length, 0);

/** Product facts only — counted from the app itself, never invented usage numbers. */
const FACTS: [string, string][] = [
  [String(ALL_READINGS.length), 'readings written from your chart'],
  [String(HOUSE_SYSTEMS.length), 'house systems to compare'],
  [String(lessonCount), 'free Academy lessons'],
  ['Free', 'to begin — no trial clock'],
];

const PILLARS = [
  { art: 'chart' as SpotKind, title: 'Worked out from astronomy', text: 'Planets, houses and angles are calculated for the minute and place you were born, using the historical time zone for that town.' },
  { art: 'written' as SpotKind, title: 'Written for one chart', text: 'Each reading combines your signs, houses, aspects and rulers, and says which placement every paragraph comes from.' },
  { art: 'honest' as SpotKind, title: 'Clear about uncertainty', text: 'If your birth time is unknown, we say which placements could change. Calculations, interpretation and your own notes are labelled separately.' },
  { art: 'private' as SpotKind, title: 'Private by default', text: 'Your chart, readings and conversations stay in your account. Nobody else sees them unless you share them.' },
];

const FEATURE_ART: SpotKind[] = ['book', 'year', 'radio', 'compass', 'astrobook', 'tv'];
const FEATURES: [string, string, string][] = [
  [`${ALL_READINGS.length} readings`, 'Chapters written from your own placements.', '/learn#guides'],
  ['Personal forecasts', 'Transits to your chart over the coming weeks.', '/forecast'],
  ['Ask the Sources', 'Questions answered from your chart and our reference library, with citations.', '/start'],
  ['Life Compass', 'Six areas of life, read from today’s transits to your chart.', '/start'],
  ['AstroBooks', 'Your chart, printed and bound as a book.', '/astrobook'],
  ['Current Chapter', 'What today’s sky is touching in your chart.', '/start'],
];

/** Motto words on the left rail; each one opens a real page. */
const MOTTO: MottoLink[] = [
  ['Discover', '/learn', 'Free lessons & guides'],
  ['Explore', '/start', 'Your own birth chart'],
  ['Understand', '/demo', 'A sample edition, inside out'],
  ['Connect', '/compatibility', 'Two charts, side by side'],
  ['Create', '/astrobook', 'AstroBooks & AstroComics'],
  ['Collect', '/store', 'The observatory gift shop'],
  ['Evolve', '/pricing', 'Go deeper with Pro'],
];

const DESTINATIONS: Destination[] = [
  { to: '/start', title: 'Birth charts', text: 'Calculated for your birth minute', cta: 'Explore charts', icon: ChartWheelIcon },
  { to: '/astrobook', title: 'AstroBooks', text: 'Your chart as a printed book', cta: 'View AstroBooks', icon: BookIcon },
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
      content: <ChartMapSlide heading="h1" title={<>Map the stars.<br />Understand yourself.</>} script="Your cosmic blueprint, mapped." lines={['Calculated from your exact birth moment', 'Read and written for you alone', 'Kept private in your own archive']} cta={{ to: '/start', label: 'Generate your birth chart' }} secondary={{ to: '/demo', label: 'See a sample edition' }} />,
    },
    {
      id: 'look-up', label: 'Look up',
      content: <LookUpSlide heading="h2" title="Look up. It's all written there." script="The sky at your birth, read for you." text="The sky at your exact birth moment, calculated, read and kept in your own archive." cta={{ to: '/start', label: 'Generate your birth chart' }} secondary={{ to: '/learn', label: 'Start learning' }} />,
    },
    {
      id: 'press', label: 'Take the sky home',
      content: <PressSlide title={<>Take the<br />sky home.</>} script="Your sky, bound in print."
        text={<>An AstroBook is your birth chart written out as a book. Every chapter is worked out from the minute and place you were born, so no two copies say the same thing. AstroComic draws the same chart as an illustrated story.</>}
        points={['Your name and birth details on the cover', `Five editions, from a ${money(fromBook)} PDF to linen hardcover`, 'Printed to order and shipped free in the US']}
        book={{ to: '/astrobook', label: 'Browse AstroBooks' }} comic={{ to: '/astrocomic', label: 'Meet AstroComic' }} />,
    },
    {
      id: 'precision', label: 'Astronomy-grade precision',
      content: <ArtSlide art={{ src: rooftop, alt: 'Two 1950s astronomers on an observatory rooftop at night: one looks through a brass telescope, the other holds a clipboard beside an easel with a zodiac wheel', width: 1400, height: 933 }}
        eyebrow="Our craft" title={<>Astronomy‑grade precision.<br />Plain‑language depth.</>} script="Worked out first, written second."
        text="We work out your chart from the minute and place you were born, with the time-zone rules your town kept that day. Every reading is then written in plain words and names the placement it comes from."
        cta={{ to: '/start', label: 'Start your chart' }} secondary={{ to: '/astrobook', label: 'Get your AstroBook' }} />,
    },
    {
      id: 'field-guide', label: 'Field guide to the stars',
      content: <ArtSlide art={{ src: stargazer, alt: 'A 1950s woman astronomer in a cream lab coat holds a red field guide and points up at a red starburst, with domed observatories and a brass telescope behind her', width: 900, height: 1350 }}
        eyebrow="The Academy" title={<>Your field guide<br />to the stars.</>} script="Free lessons, plain words."
        text={<>{lessonCount} short lessons and illustrated guides take you from the twelve signs to reading your own transits. No account needed to start.</>}
        cta={{ to: '/learn', label: 'Start learning' }} secondary={{ to: '/forecast', label: 'Read today’s sky' }} />,
    },
    {
      id: 'gift-shop', label: 'The Observatory Gift Shop',
      content: <ArtSlide art={{ src: giftTower, alt: 'A 1950s poster of a radio tower and copper-domed observatory above a small town, radio waves rippling into a starry teal sky', width: 900, height: 1125 }}
        eyebrow="The Observatory Gift Shop" title={<>Souvenirs from<br />your own sky.</>} script="Every sign, one atomic age."
        text="Posters, tees, mugs, totes, notebooks and stickers for all twelve signs, drawn in the same 1950s style as the observatory."
        cta={{ to: '/store', label: 'Visit the gift shop' }} secondary={{ to: '/store?collection=atomic', label: 'Atomic Zodiac Collection' }} />,
    },
  ];
  return <div className="brand-site min-h-screen text-foreground">
    <a href="#brand-main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:p-3">Skip to content</a>
    <PublicHeader />
    <main id="brand-main" className="mosaic mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="mosaic-top">
        <div className="mosaic-left"><MottoRail className="mosaic-rail" links={MOTTO} tagline="Your personal guide to the stars — and to yourself." /></div>
        <HeroSlideshow className="mosaic-hero" label="Zodaci highlights" slides={slides} />
        <div className="mosaic-right"><ExplorePoster className="mosaic-poster" to="/learn" /><ForecastPlate /></div>
      </div>

      <DestinationTiles label="Main destinations" items={DESTINATIONS} />

      <div className="mosaic-trio">
        <LessonsTile />
        <ShopWindowPlate />
        <PrecisionTile />
      </div>

      <div className="mosaic-split-1-2">
        <QuotePlate art="magnifier" quote="We check every position twice, name our sources, and never make up details about anyone’s life." by="How we work" />
        <ArchiveShelf />
      </div>

      <HowItWorks />

      <PersonalizationStory />

      <ZodiacPlate />

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

      <div className="mosaic-split-1-1">
        <TransmissionsPlate />
        <JoinPlate />
      </div>

      <section id="contact" aria-labelledby="contact-h" className="obs-panel p-5 sm:p-8"><div className="grid gap-10 md:grid-cols-2"><div><StatusLight label="Desk open" /><h2 id="contact-h" className="mt-3 font-label text-2xl">Write to the observatory</h2><p className="mt-4 max-w-md leading-relaxed text-muted-foreground">Questions about your chart, an AstroBook order or the shop? Send a note to the Zodaci team.</p></div><ContactForm /></div></section>
    </main><GlobalFooter />
  </div>;
}
