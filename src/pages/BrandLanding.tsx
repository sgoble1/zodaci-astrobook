import { CinematicVideo } from '@/components/fx/CinematicVideo';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Orbit, PenLine, Scale, ShieldCheck, Check } from 'lucide-react';
import { PublicHeader } from '@/components/brand/PublicHeader';
import { Button } from '@/components/ui/button';
import { ZodaciLogo } from '@/components/brand/ZodaciLogo';
import { SampleChartDemo } from '@/components/brand/SampleChartDemo';
import { PromoVideo } from '@/components/brand/PromoVideo';
import { GlobalFooter } from '@/components/brand/GlobalFooter';
import { NewsletterSignup } from '@/components/brand/NewsletterSignup';
import { ContactForm } from '@/components/brand/ContactForm';
import { PUBLIC_ARTICLES } from '@/content/publicArticles';
import { ThemeArt } from '@/components/common/ThemeArt';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PLAN_NAME, PLAN_PRICE, CREDIT_ALLOWANCE } from '@/lib/plans';
import { BOOK_VERSIONS, money } from '@/lib/books';
import { COMIC_PLANS } from '@/lib/comic';
import hero from '@/assets/zodaci-brand-hero.jpg';
import bookCover from '@/assets/cover-design-midnight-stars-hd.jpg';
import comicCover from '@/assets/comic-issue1-cover-v2.jpg';
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

/** Section anchors, in the required order. */
const navigation = ['Work', 'Process', 'Capabilities', 'Team', 'Contact'];

const PILLARS = [
  { icon: Orbit, title: 'Calculated, not guessed', text: 'Every planet, house and angle comes from astronomical data for your exact birth moment, time and place — never a sun-sign template.' },
  { icon: PenLine, title: 'Written for one person', text: 'Readings combine your sign, house, aspects and rulers, and name the placement behind every sentence — so they could only be about you.' },
  { icon: Scale, title: 'Honest about limits', text: 'No birth time? We show exactly what changes. Measured positions, interpretations and your own notes always stay clearly separate.' },
  { icon: ShieldCheck, title: 'Private by design', text: 'Your chart, readings and conversations belong to your account. Nothing is shared unless you invite someone in.' },
];

const STEPS = [
  ['Save your birth details', 'Date, time and place. If the time is unknown, Zodaci keeps that uncertainty visible instead of guessing.'],
  ['Explore the measured sky', 'Your chart is calculated live: planets, houses, aspects and patterns, each explained twice — technically and in everyday words.'],
  ['Go deeper when you’re ready', 'Read full chapters, compare charts with people you love, turn readings into audio, or have your sky printed as an AstroBook.'],
];


export default function BrandLanding() {
  usePageMeta('Zodaci — Your sky. Your story.', 'Zodaci calculates your birth chart with astronomical precision, then translates every symbol into plain language. Free to begin, private by default.');
  const fromBook = Math.min(...BOOK_VERSIONS.map(v => v.price));
  const plans = [
    { key: 'free' as const, price: '$0', note: 'Free forever', points: ['Your full calculated chart', 'Two complete readings', `${CREDIT_ALLOWANCE.free} AI credits a month`] },
    { key: 'full' as const, price: PLAN_PRICE.full.month, note: `or ${PLAN_PRICE.full.year}`, points: [`All ${ALL_READINGS.length} chapter readings`, 'Timing, numerology, Ba Zi and Feng Shui', `${CREDIT_ALLOWANCE.full} AI credits a month`] },
    { key: 'creator' as const, price: PLAN_PRICE.creator.month, note: `or ${PLAN_PRICE.creator.year}`, points: ['Everything in Pro', 'Personal podcasts and new chapters', `${CREDIT_ALLOWANCE.creator} AI credits a month`] },
  ];
  return <div className="brand-site min-h-screen bg-background text-foreground">
    <a href="#brand-main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:p-3">Skip to content</a>
    <PublicHeader sections={navigation} />
    <main id="brand-main">
      <section className="relative isolate min-h-[520px] sm:min-h-[600px] overflow-hidden flex items-center border-b border-border">
        <CinematicVideo poster={hero} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background/90 via-background/60 to-background/20" />
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-10 py-16 sm:py-20">
          <Link to="/demo" className="pill-note mb-6">See a full sample edition <ArrowRight className="h-3.5 w-3.5" /></Link>
          <h1 className="text-silver font-display text-6xl sm:text-8xl leading-[0.95]">An encyclopedia<br />of you</h1>
          <p className="mt-6 text-lg sm:text-xl leading-relaxed max-w-xl text-muted-foreground">The planets, stars and points of the sky at the minute you were born, calculated to the arc-minute and written up in depth. Written to name the things you have been trying to put into words your whole life.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3"><Button asChild size="lg"><Link to="/start">Get started</Link></Button><Button asChild variant="ghost" size="lg"><Link to="/demo">See what’s inside</Link></Button></div>
          <p className="mt-6 text-sm text-muted-foreground">Free to begin · Personal by design · Private by default</p>
        </div>
      </section>

      <section aria-label="Zodaci at a glance" className="border-b border-border bg-card/40"><dl className="mx-auto grid grid-cols-2 lg:flex max-w-7xl lg:flex-wrap lg:justify-center gap-x-6 lg:gap-x-12 gap-y-5 px-5 py-7 sm:px-10">{FACTS.map(([n, l]) => <div key={l} className="flex flex-col lg:flex-row lg:items-baseline gap-1 lg:gap-2"><dt className="sr-only">{l}</dt><dd className="font-display text-3xl">{n}</dd><dd aria-hidden className="text-sm text-muted-foreground">{l}</dd></div>)}</dl></section>

      <section aria-labelledby="film-h" className="brand-band border-b border-border">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <p className="font-smallcaps text-xs text-gold">The short film</p>
            <h2 id="film-h" className="mt-3">See Zodaci<br />in 24 seconds.</h2>
            <p className="mt-4 max-w-md text-muted-foreground leading-relaxed">A quick look at what you get: a chart calculated from your exact birth moment, readings written about you alone, free lessons, and AstroComic.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link to="/start">Explore your chart<ArrowRight /></Link></Button><Button asChild variant="ghost"><Link to="/demo">Try the interactive demo</Link></Button></div>
          </div>
          <PromoVideo schema />
        </div>
      </section>

      <section aria-labelledby="pillars-h" className="brand-band border-b border-border">
        <h2 id="pillars-h" className="sr-only">Why Zodaci</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{PILLARS.map(({ icon: Icon, title, text }) => <div key={title} className="border-t border-border pt-5"><Icon aria-hidden="true" className="h-6 w-6 text-candle" /><h3 className="mt-4 text-xl">{title}</h3><p className="mt-2 text-muted-foreground leading-relaxed">{text}</p></div>)}</div>
      </section>

      <section aria-label="Sample chart" className="brand-band border-b border-border bg-card/30"><SampleChartDemo /></section>

      <section id="work" className="brand-band"><div className="flex flex-wrap justify-between items-end gap-5 mb-8"><div><h2>The Zodaci reading room</h2><p className="text-muted-foreground mt-3 max-w-xl">Understand the measured sky first, then make space for your own questions.</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to="/academy">Open the Academy<ArrowUpRight /></Link></Button><Button asChild variant="ghost"><Link to="/blog">All articles</Link></Button></div></div><div className="grid sm:grid-cols-3 gap-6">{PUBLIC_ARTICLES.map(article => <Link key={article.slug} to={`/blog/learn/${article.slug}`} className="vellum overflow-hidden"><img src={article.image} alt={`${article.category} editorial illustration`} width={1024} height={768} loading="lazy" className="w-full aspect-[4/3] object-cover" /><div className="p-5"><p className="font-smallcaps text-xs text-gold">{article.category}</p><h3 className="text-xl mt-3">{article.title}</h3><p className="text-sm text-muted-foreground mt-3 leading-relaxed">{article.summary}</p><p className="text-sm text-gold mt-5 flex items-center gap-2">Read the guide<ArrowUpRight className="w-4 h-4" /></p></div></Link>)}</div></section>

      <section id="process" className="brand-band border-y border-border bg-card/30"><h2>From a birth moment<br />to a fresh perspective.</h2><ol className="grid md:grid-cols-3 gap-8 mt-10">{STEPS.map(([title, text], i) => <li key={title} className="vellum p-6"><ThemeArt kind={(['chart', 'planet', 'self'] as const)[i]} badge={i + 1} /><h3 className="mt-5 text-2xl">{title}</h3><p className="mt-3 text-muted-foreground leading-relaxed">{text}</p></li>)}</ol></section>

      <section id="capabilities" className="brand-band">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><h2>Start free. Go deeper when you’re ready.</h2><p className="mt-3 text-muted-foreground max-w-xl">One chart, three ways to explore it. No time-limited trial — the Free plan stays free.</p></div><Button asChild variant="outline"><Link to="/pricing">Compare plans<ArrowRight /></Link></Button></div>
        <div className="grid gap-6 md:grid-cols-3 mt-10">{plans.map(p => <div key={p.key} className={`vellum p-6 flex flex-col ${p.key === 'full' ? 'ring-1 ring-candle/50' : ''}`}><h3 className="text-2xl">{PLAN_NAME[p.key]}</h3><p className="mt-3"><span className="text-3xl font-display">{p.price.replace('/month', '')}</span>{p.key !== 'free' && <span className="text-muted-foreground"> /month</span>}</p><p className="text-xs text-muted-foreground">{p.note}</p><ul className="mt-5 space-y-2 text-sm flex-1">{p.points.map(t => <li key={t} className="flex gap-2"><Check aria-hidden="true" className="h-4 w-4 shrink-0 text-candle mt-0.5" />{t}</li>)}</ul><Button asChild className="mt-6" variant={p.key === 'full' ? 'default' : 'outline'}><Link to={p.key === 'free' ? '/start' : `/pricing?plan=${p.key === 'full' ? 'pro' : 'cosmic'}`}>{p.key === 'free' ? 'Start for free' : `Choose ${PLAN_NAME[p.key]}`}</Link></Button></div>)}</div>
        <div className="grid gap-6 lg:grid-cols-2 mt-12">
          <Link to="/astrobook" className="vellum group grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-5 p-5 items-center"><img src={bookCover} alt="AstroBook cover design, Midnight Stars" width={280} height={420} loading="lazy" className="rounded shadow-lg aspect-[2/3] object-cover" /><div><p className="font-smallcaps text-xs text-gold">AstroBook</p><h3 className="text-2xl mt-2">Your sky, in print.</h3><p className="mt-2 text-sm text-muted-foreground leading-relaxed">A book calculated from your chart and written for you alone. Five versions, from a {money(fromBook)} PDF to a linen-bound collector’s edition.</p><p className="mt-4 text-sm text-gold flex items-center gap-2">Explore AstroBook<ArrowUpRight className="h-4 w-4" /></p></div></Link>
          <Link to="/astrocomic" className="vellum group grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-5 p-5 items-center"><img src={comicCover} alt="AstroComic Issue 1 cover: a young man holding a glowing astrolabe" width={280} height={420} loading="lazy" className="rounded shadow-lg aspect-[2/3] object-cover" /><div><p className="font-smallcaps text-xs text-gold">AstroComic</p><h3 className="text-2xl mt-2">Your month, as a comic.</h3><p className="mt-2 text-sm text-muted-foreground leading-relaxed">A printed 24-page digest each month, starring the planets in your chart and the transits that touch it. {COMIC_PLANS.monthly.label} or a single issue for {COMIC_PLANS.single.label}.</p><p className="mt-4 text-sm text-gold flex items-center gap-2">Meet the cast<ArrowUpRight className="h-4 w-4" /></p></div></Link>
        </div>
      </section>

      <section id="team" className="brand-band border-y border-border bg-card/30"><div className="grid md:grid-cols-2 gap-8"><div><h2>How we make<br />every reading.</h2><p className="mt-4 text-muted-foreground max-w-md">The people behind Zodaci hold every page to three working rules.</p></div><ul className="vellum space-y-5 p-7 leading-relaxed">{[['Check the sky twice.', 'Positions come from an astronomy engine and are cross-checked against a second calculation before they reach your chart.'], ['Name the source.', 'Every interpretation points to the placement it came from, so you can see why a sentence is there.'], ['Never invent a life.', 'Readings never claim facts about your family, past or future. Your own notes stay yours, and you decide when they count.']].map(([t, d]) => <li key={t}><p className="text-foreground font-semibold">{t}</p><p className="text-muted-foreground mt-1">{d}</p></li>)}</ul></div></section>

      <section id="contact" className="brand-band"><div className="grid md:grid-cols-2 gap-10"><div><p className="font-smallcaps text-xs text-gold">Weekly Sky Notes</p><h2 className="mt-3">Sky notes, coming soon.</h2><p className="mt-4 text-muted-foreground max-w-md leading-relaxed">Join the interest list for sky notes, reflections from the reading room and occasional prompts to look up. Email delivery has not launched yet.</p><p className="mt-4 text-sm text-muted-foreground">Free subscribers welcome. No chart required to sign up.</p><div className="mt-6"><NewsletterSignup source="sky-notes" button="Join the interest list" /></div></div><ContactForm /></div></section>
    </main><GlobalFooter />
  </div>;
}
