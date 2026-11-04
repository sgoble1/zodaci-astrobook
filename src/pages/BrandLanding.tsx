import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Orbit, PenLine, Scale, ShieldCheck, Check } from 'lucide-react';
import { PublicHeader } from '@/components/brand/PublicHeader';
import { Button } from '@/components/ui/button';
import { ZodaciLogo } from '@/components/brand/ZodaciLogo';
import { SampleChartDemo } from '@/components/brand/SampleChartDemo';
import { GlobalFooter } from '@/components/brand/GlobalFooter';
import { NewsletterSignup } from '@/components/brand/NewsletterSignup';
import { ContactForm } from '@/components/brand/ContactForm';
import { PUBLIC_ARTICLES } from '@/content/publicArticles';
import { ThemeArt } from '@/components/common/ThemeArt';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PLAN_NAME, PLAN_PRICE, CREDIT_ALLOWANCE } from '@/lib/plans';
import { BOOK_VERSIONS, money } from '@/lib/books';
import { COMIC_PLANS } from '@/lib/comic';
import hero from '@/assets/observatory-hero.jpg';
import { RetroTV, PanelTitle, Stamp, ConstellationDraw, StatusLight } from '@/components/observatory/Observatory';
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


const SIGNS: [string, string, string][] = [
  ['♈', 'Aries', 'The first spark'], ['♉', 'Taurus', 'The steady ground'], ['♊', 'Gemini', 'The two voices'], ['♋', 'Cancer', 'The shelter'],
  ['♌', 'Leo', 'The solar heart'], ['♍', 'Virgo', 'The careful hand'], ['♎', 'Libra', 'The balance'], ['♏', 'Scorpio', 'The deep water'],
  ['♐', 'Sagittarius', 'The far road'], ['♑', 'Capricorn', 'The mountain observatory'], ['♒', 'Aquarius', 'The inventor'], ['♓', 'Pisces', 'The cosmic ocean'],
];

const FEATURES: [string, string, string][] = [
  [`${ALL_READINGS.length}+ readings`, 'Chapters written from your exact placements.', '/reading-room'],
  ['Personal forecasts', 'Transits and timing for the road ahead.', '/start'],
  ['AI Observatory', 'Ask questions answered from your own chart, with sources.', '/start'],
  ['Life Compass', 'Career, relationships, finances, purpose, health and creativity signals.', '/start'],
  ['AstroBooks', 'Your chart as a printed astral dossier.', '/astrobook'],
  ['Current Chapters', 'The theme your sky is working on now, on air.', '/start'],
];

export default function BrandLanding() {
  usePageMeta('Zodaci — Astral Research Authority', 'Zodaci is a personal observatory: your birth chart calculated with astronomical precision, readings written for you, forecasts, and AstroBooks. Free to begin, private by default.');
  const fromBook = Math.min(...BOOK_VERSIONS.map(v => v.price));
  const plans = [
    { key: 'free' as const, price: '$0', note: 'Free forever', points: ['Your full calculated chart', 'Two complete readings', `${CREDIT_ALLOWANCE.free} AI credits a month`] },
    { key: 'full' as const, price: PLAN_PRICE.full.month, note: `or ${PLAN_PRICE.full.year}`, points: [`All ${ALL_READINGS.length} chapter readings`, 'Timing, numerology, Ba Zi and Feng Shui', `${CREDIT_ALLOWANCE.full} AI credits a month`] },
    { key: 'creator' as const, price: PLAN_PRICE.creator.month, note: `or ${PLAN_PRICE.creator.year}`, points: ['Everything in Pro', 'Personal podcasts and new chapters', `${CREDIT_ALLOWANCE.creator} AI credits a month`] },
  ];
  return <div className="brand-site min-h-screen text-foreground">
    <a href="#brand-main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:p-3">Skip to content</a>
    <PublicHeader />
    <main id="brand-main" className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:px-6">
      <section className="obs-panel relative isolate overflow-hidden min-h-[520px] sm:min-h-[600px] flex items-center">
        <img src={hero} alt="The Stargazer, an observatory apprentice, points to a projected zodiac wheel beside a retro television showing a birth chart" width={1920} height={1088} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-right" />
        <div className="absolute inset-0 -z-10 brand-artwork-overlay" />
        <div className="obs-deploy w-full px-6 py-14 sm:px-12">
          <p className="font-label text-xs text-primary">Zodaci · Astral Research Authority</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] sm:text-7xl">Discover your cosmic blueprint.</h1>
          <p className="mt-3 font-display text-2xl text-[hsl(var(--brass))] sm:text-3xl">Understand your story. Build your future.</p>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-foreground/85">Your personal observatory: the sky at your exact birth moment, mapped, read and kept in your own archive.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg" variant="destructive" className="bg-accent text-accent-foreground hover:bg-accent/90 font-label"><Link to="/start">Generate your birth chart<ArrowRight /></Link></Button><Button asChild variant="outline" size="lg"><Link to="/demo">See a sample edition</Link></Button></div>
          <p className="mt-6 font-label text-xs text-muted-foreground">Same skies. Brighter answers.</p>
        </div>
      </section>

      <section aria-label="Zodaci at a glance" className="obs-panel"><dl className="grid grid-cols-2 gap-5 px-5 py-6 lg:grid-cols-4">{FACTS.map(([n, l]) => <div key={l}><dt className="sr-only">{l}</dt><dd className="font-display text-3xl text-primary">{n}</dd><dd aria-hidden className="text-sm text-muted-foreground">{l}</dd></div>)}</dl></section>

      <section aria-labelledby="live-h" className="obs-panel p-5 sm:p-8"><PanelTitle eyebrow="Astral Mapping Center" live><span id="live-h">Live chart</span></PanelTitle><SampleChartDemo /></section>

      <section aria-labelledby="how-h" className="obs-paper p-6 sm:p-10">
        <h2 id="how-h" className="font-label text-2xl">How it works</h2>
        <ConstellationDraw className="my-4 h-16" />
        <ol className="grid gap-6 md:grid-cols-3">{STEPS.map(([title, text], i) => <li key={title}><p className="font-label text-sm text-accent">{['Birth data', 'Chart mapping', 'Personal insight'][i]}</p><h3 className="mt-2 text-2xl">{title}</h3><p className="mt-2 leading-relaxed text-muted-foreground">{text}</p></li>)}</ol>
      </section>

      <section aria-labelledby="feat-h" className="obs-panel p-5 sm:p-8"><PanelTitle eyebrow="Inside the observatory"><span id="feat-h">What you can do</span></PanelTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{FEATURES.map(([t, d, to]) => <Link key={t} to={to} className="group rounded-md border border-border p-5 transition-colors hover:border-primary/60"><h3 className="font-label text-lg">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p><p className="mt-3 font-label text-xs text-accent">Explore →</p></Link>)}</div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{PILLARS.map(({ icon: Icon, title, text }) => <div key={title} className="border-t border-border pt-4"><Icon aria-hidden className="h-5 w-5 text-primary" /><h3 className="mt-3 text-lg">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>)}</div>
      </section>

      <section aria-labelledby="book-h" className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="obs-paper grid gap-6 p-6 sm:grid-cols-[180px_1fr] sm:p-8">
          <img src={bookCover} alt="AstroBook cover design, Midnight Stars" width={280} height={420} loading="lazy" className="mx-auto w-40 rounded shadow-xl sm:w-full aspect-[2/3] object-cover" />
          <div><Stamp>Issued by the Authority</Stamp><h2 id="book-h" className="mt-4 font-display text-4xl">The Cosmic Archive</h2><p className="mt-3 leading-relaxed text-muted-foreground">Every AstroBook is an astral dossier: your natal wheel, planetary diagrams and chapter-by-chapter readings, calculated from your chart and written for you alone. Five versions, from a {money(fromBook)} PDF to a linen-bound collector’s edition.</p><div className="mt-6 flex flex-wrap gap-3"><Button asChild variant="destructive" className="bg-accent text-accent-foreground hover:bg-accent/90"><Link to="/astrobook">Browse AstroBooks<ArrowRight /></Link></Button><Button asChild variant="outline" className="border-[hsl(var(--paper-ink)/0.3)] text-[hsl(var(--paper-ink))]"><Link to="/astrocomic">AstroComic</Link></Button></div></div>
        </div>
        <RetroTV channel="Channel 01" label="AstroComic · Issue 1"><img src={comicCover} alt="AstroComic Issue 1 cover" width={280} height={420} loading="lazy" className="h-full w-full object-cover" /></RetroTV>
      </section>

      <section id="pricing" aria-labelledby="price-h" className="obs-panel p-5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4"><PanelTitle eyebrow="Membership"><span id="price-h">Start free. Go deeper when you’re ready.</span></PanelTitle><Button asChild variant="outline"><Link to="/pricing">Compare plans<ArrowRight /></Link></Button></div>
        <div className="grid gap-5 md:grid-cols-3">{plans.map(p => <div key={p.key} className={`rounded-md border p-6 flex flex-col ${p.key === 'full' ? 'border-primary' : 'border-border'}`}><h3 className="font-label text-xl">{PLAN_NAME[p.key]}</h3><p className="mt-3"><span className="font-display text-3xl">{p.price.replace('/month', '')}</span>{p.key !== 'free' && <span className="text-muted-foreground"> /month</span>}</p><p className="text-xs text-muted-foreground">{p.note}</p><ul className="mt-5 flex-1 space-y-2 text-sm">{p.points.map(t => <li key={t} className="flex gap-2"><Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{t}</li>)}</ul><Button asChild className="mt-6" variant={p.key === 'full' ? 'primary' : 'outline'}><Link to={p.key === 'free' ? '/start' : `/pricing?plan=${p.key === 'full' ? 'pro' : 'cosmic'}`}>{p.key === 'free' ? 'Start for free' : `Choose ${PLAN_NAME[p.key]}`}</Link></Button></div>)}</div>
      </section>

      <section aria-labelledby="zodiac-h" className="obs-panel p-5 sm:p-8"><PanelTitle eyebrow="Twelve archetypes"><span id="zodiac-h">Explore the zodiac</span></PanelTitle>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">{SIGNS.map(([g, n, d]) => <li key={n} className="obs-paper p-3 text-center"><span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--paper-ink))] text-2xl text-[hsl(var(--brass))]">{g}</span><p className="mt-2 font-label text-sm">{n}</p><p className="text-xs text-muted-foreground">{d}</p></li>)}</ul>
      </section>

      <section aria-labelledby="tx-h" className="grid gap-6 lg:grid-cols-2">
        <div className="obs-panel p-5 sm:p-8"><PanelTitle eyebrow="Research Library" live><span id="tx-h">Latest transmissions</span></PanelTitle>
          <ul className="divide-y divide-border">{PUBLIC_ARTICLES.map(a => <li key={a.slug}><Link to={`/blog/learn/${a.slug}`} className="flex items-start gap-4 py-4 hover:text-primary"><img src={a.image} alt="" width={1024} height={768} loading="lazy" className="h-16 w-20 shrink-0 rounded object-cover" /><span><span className="font-label text-[0.65rem] text-accent">{a.category}</span><span className="block text-lg leading-snug">{a.title}</span></span><ArrowUpRight className="ml-auto h-4 w-4 shrink-0" /></Link></li>)}</ul>
          <div className="mt-4 flex gap-2"><Button asChild variant="outline" size="sm"><Link to="/academy">Open the Academy</Link></Button><Button asChild variant="ghost" size="sm"><Link to="/blog">All transmissions</Link></Button></div>
        </div>
        <div className="obs-panel p-5 sm:p-8"><PanelTitle eyebrow="Our working rules"><span>How every reading is made</span></PanelTitle><ul className="space-y-4 leading-relaxed">{[['Check the sky twice.', 'Positions come from an astronomy engine and are cross-checked against a second calculation.'], ['Name the source.', 'Every interpretation points to the placement it came from.'], ['Never invent a life.', 'Readings never claim facts about your family, past or future.']].map(([t, d]) => <li key={t}><p className="font-semibold">{t}</p><p className="text-muted-foreground">{d}</p></li>)}</ul></div>
      </section>

      <section id="contact" aria-labelledby="join-h" className="obs-panel p-5 sm:p-8"><div className="grid gap-10 md:grid-cols-2"><div><StatusLight label="Transmission pending" /><h2 id="join-h" className="mt-3 font-label text-2xl">Join the observatory</h2><p className="mt-4 max-w-md leading-relaxed text-muted-foreground">Join the interest list for sky notes and new AstroBooks. Email delivery has not launched yet.</p><div className="mt-6"><NewsletterSignup source="sky-notes" button="Join the interest list" /></div></div><ContactForm /></div></section>
    </main><GlobalFooter />
  </div>;
}
