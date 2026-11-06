import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RetroEmblem, type RetroIconComponent } from '@/components/icons/RetroIcons';
import { SpotArt, type SpotKind } from '@/components/art/SpotArt';
import { NewsletterSignup } from '@/components/brand/NewsletterSignup';
import { PUBLIC_ARTICLES } from '@/content/publicArticles';
import { CHAPTER_TABS } from '@/lib/books';
import poster from '@/assets/home/observatory-poster.jpg';
import { PRODUCT_ART } from '@/content/productArtwork';

/**
 * Weathered panel mosaic from the observatory concept: navy plates (obs-panel) and aged cream
 * plates (obs-paper) fitted together. Every piece here is reused by the home page and dashboards.
 */

export function PlateHead({ id, title, sub, script, action }: { id?: string; title: ReactNode; sub?: string; script?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 id={id} className="plate-title">{title}</h2>
        {sub && <p className="plate-sub">{sub}</p>}
        {script && <p className="mt-1 font-script text-2xl text-primary">{script}</p>}
      </div>
      {action}
    </div>
  );
}

/** Narrow navy rail of motto words; each word is a real destination with a short descriptor. */
export type MottoLink = [label: string, to: string, descriptor?: string];
export function MottoRail({ links, tagline, className }: { links: MottoLink[]; tagline: string; className?: string }) {
  return (
    <nav aria-label="Ways in" className={cn('obs-panel flex flex-col justify-between gap-6 p-5', className)}>
      <ul className="space-y-2.5">{links.map(([label, to, descriptor]) => <li key={label}><Link to={to} className="motto-item group"><span className="motto-link">{label}</span>{descriptor && <span className="motto-desc">{descriptor}</span>}</Link></li>)}</ul>
      <div className="space-y-4 border-t border-[hsl(var(--brass)/0.4)] pt-4">
        <p className="font-label text-xs leading-relaxed tracking-[0.16em] text-muted-foreground">{tagline}</p>
        <SpotArt kind="planet" className="h-14 w-14" orbit={false} />
      </div>
    </nav>
  );
}

/** Short cream plate under the Explore poster: today's sky broadcasts on the Forecast page. */
export function ForecastPlate({ className }: { className?: string }) {
  return <Link to="/forecast" className={cn('obs-paper forecast-plate group', className)}>
    <SpotArt kind="radio" className="forecast-plate-art" orbit={false} />
    <span className="min-w-0">
      <span className="block font-label text-xl leading-none">Sky broadcasts</span>
      <span className="mt-1 block text-xs leading-snug text-muted-foreground">Today's planets &amp; the next 30 days</span>
      <span className="mt-2 inline-flex items-center gap-1 font-label text-sm text-accent">Tune in<ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-700 group-hover:translate-x-1" /></span>
    </span>
  </Link>;
}

/** Tall travel-poster plate: the observatory on its hill under the Moon. */
export function ExplorePoster({ to, title = 'Learn to read your chart', className }: { to: string; title?: string; className?: string }) {
  return (
    <Link to={to} className={cn('explore-poster group', className)}>
      <img src={poster} alt="A domed observatory on a forested hilltop under a full Moon" width={720} height={990} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-bottom" />
      <span className="relative z-10 block p-5"><span className="explore-poster-title">{title}</span></span>
      <span className="relative z-10 mt-auto block p-5 text-right"><span className="block font-display text-3xl tracking-wide text-primary">ZODACI</span><span className="block font-label text-[0.65rem] tracking-[0.2em] text-foreground/85">Astral Research Authority</span></span>
    </Link>
  );
}

export function QuotePlate({ quote, by, art, className }: { quote: string; by: string; art?: SpotKind; className?: string }) {
  return (
    <figure className={cn('obs-paper flex flex-col justify-center gap-3 p-6', className)}>
      {art && <SpotArt kind={art} className="mb-2 h-28 w-28" />}
      <blockquote className="font-label text-lg leading-snug tracking-[0.08em]">“{quote}”</blockquote>
      <figcaption className="text-right font-label text-sm tracking-[0.14em] text-accent">— {by}</figcaption>
    </figure>
  );
}

export type Destination = { to: string; title: string; text: string; cta: string; icon: RetroIconComponent };

/** A row of cream destination tiles with navy medallions, like the concept's category strip. */
export function DestinationTiles({ items, label, className }: { items: Destination[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn('obs-paper dest-tiles p-2', className)}>
      <ul className="dest-grid" style={{ '--n': items.length, '--n3': Math.min(items.length, 3) } as CSSProperties}>
        {items.map(d => (
          <li key={d.to + d.title}>
            <Link to={d.to} className="dest-tile group">
              <RetroEmblem icon={d.icon} size={60} className="retro-emblem-ink shrink-0" />
              <span className="min-w-0">
                <span className="block font-display text-lg uppercase leading-tight">{d.title}</span>
                <span className="block text-sm text-muted-foreground">{d.text}</span>
                <span className="mt-1.5 inline-flex items-center gap-1 font-label text-xs tracking-[0.16em] text-accent">{d.cta}<ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-700 group-hover:translate-x-1" /></span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The Cosmic Archive shelf: the real products, every one standing at the same angle with the same slow lift —
 * the three sample AstroBooks (fictional readers), the AstroComic, then the gift shop's Cosmic Archive books.
 */
export function ArchiveShelf({ id = 'archive-h', to = '/astrobook', className }: { id?: string; to?: string; className?: string }) {
  const track = useRef<HTMLUListElement>(null);
  const slide = (dir: 1 | -1) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  };
  return (
    <section aria-labelledby={id} className={cn('obs-paper p-5 sm:p-6', className)}>
      <PlateHead id={id} title="The Cosmic Archive" sub="AstroBooks, AstroComic and the archive reference books" />
      <div className="relative">
        <ul ref={track} className="shelf-track shelf-track-real" tabIndex={0} aria-label="Books and comics on the shelf, scroll sideways for more">
          {COVER_SAMPLES.map(s => (
            <li key={s.id} className="shelf-item">
              <Link to={to} className="shelf-real group" aria-label={`${s.edition} AstroBook sample, printed for ${s.name}, a fictional reader`}>
                <span className="shelf-real-book"><SampleCover sample={s} /></span>
                <span className="shelf-real-caption">{s.edition} AstroBook</span>
              </Link>
            </li>
          ))}
          <li className="shelf-item">
            <Link to="/astrocomic" className="shelf-real group" aria-label="AstroComic: your first issue, drawn from your own chart">
              <span className="shelf-real-book"><img src={comicCutout} alt="" width={636} height={948} loading="lazy" decoding="async" className="shelf-real-cutout" /></span>
              <span className="shelf-real-caption">AstroComic</span>
            </Link>
          </li>
          {ARCHIVE_BOOKS.map(b => (
            <li key={b.handle} className="shelf-item">
              <Link to={`/product/${b.handle}`} className="shelf-real group">
                <span className="shelf-real-book"><img src={b.img.src} alt="" width={b.img.width} height={b.img.height} loading="lazy" decoding="async" className="shelf-real-cutout" /></span>
                <span className="shelf-real-caption">{b.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => slide(-1)} className="shelf-arrow left-0" aria-label="Scroll the shelf left"><ChevronLeft aria-hidden className="h-5 w-5" /></button>
        <button type="button" onClick={() => slide(1)} className="shelf-arrow right-0" aria-label="Scroll the shelf right"><ChevronRight aria-hidden className="h-5 w-5" /></button>
      </div>
      <p className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-center">
        <Link to={to} className="inline-flex items-center gap-1 font-label text-sm tracking-[0.16em] text-accent hover:underline">Choose an AstroBook<ArrowRight aria-hidden className="h-4 w-4" /></Link>
        <Link to="/store?collection=atomic&type=Books" className="inline-flex items-center gap-1 font-label text-sm tracking-[0.16em] text-accent hover:underline">Browse archive books<ArrowRight aria-hidden className="h-4 w-4" /></Link>
      </p>
    </section>
  );
}

/** Cream plate: the observatory library, opening the free lessons on Learn. */
export function LessonsTile({ className }: { className?: string }) {
  const lessons = ACADEMY.reduce((n, p) => n + p.lessons.length, 0);
  return (
    <Link to="/learn" className={cn('obs-paper art-tile group', className)}>
      <span className="art-tile-pic"><img src={library} alt="" width={800} height={800} loading="lazy" decoding="async" /></span>
      <span className="art-tile-copy">
        <span className="block font-label text-sm tracking-[0.16em] text-accent">Free lessons</span>
        <span className="art-tile-title">Learn to read the sky</span>
        <span className="block text-sm leading-snug text-muted-foreground">{lessons} short lessons, from the twelve signs to reading your own transits.</span>
      </span>
      <span className="art-tile-go" aria-hidden="true"><ArrowRight className="h-5 w-5" /></span>
    </Link>
  );
}

/** Navy plate: how a chart is worked out, opening the About page's calculation notes. */
export function PrecisionTile({ className }: { className?: string }) {
  return (
    <Link to="/about#calc-h" className={cn('obs-panel art-tile art-tile-night group', className)}>
      <span className="art-tile-pic"><img src={chartMakers} alt="" width={1400} height={700} loading="lazy" decoding="async" className="object-left" /></span>
      <span className="art-tile-copy">
        <span className="block font-label text-sm tracking-[0.16em] text-primary">How we calculate</span>
        <span className="art-tile-title">Astronomy-grade precision</span>
        <span className="block text-sm leading-snug text-muted-foreground">Your birth minute, the historical time zone for your town, and every placement checked.</span>
      </span>
      <span className="art-tile-go" aria-hidden="true"><ArrowRight className="h-5 w-5" /></span>
    </Link>
  );
}

/** The gift shop window as a mosaic plate: the Atomic Zodiac set and four departments. */
export function ShopWindowPlate({ id = 'shopwin-h', className }: { id?: string; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn('obs-paper p-4 sm:p-5', className)}>
      <PlateHead id={id} title="The gift shop" sub="Atomic Zodiac prints, tees, mugs and totes" action={<Link to="/store" className="inline-flex items-center gap-1 font-label text-sm tracking-[0.16em] text-accent hover:underline">Visit the shop<ArrowRight aria-hidden className="h-4 w-4" /></Link>} />
      <ShopDepartmentGrid compact headingId={id} />
    </section>
  );
}

const STEPS: [SpotKind, string, string, string][] = [
  ['birth', 'Your birth date, time & place', 'Where it starts', 'A birth certificate is best. No time? We show which parts that affects.'],
  ['explore', 'The sky at that minute', 'Calculated', 'An astronomy engine places every planet, house cusp and angle for that minute and place.'],
  ['chart', 'Your chart', 'Degrees, houses, aspects', 'Each placement comes with a note on how it was worked out.'],
  ['written', 'Your readings', 'Tied to placements', 'Every paragraph names the placement it comes from. Your own context is used only if you add it.'],
  ['growth', 'Coming back to it', 'As the sky moves', 'Timing, practices and questions to return to when transits change.'],
];

export function HowItWorks({ id = 'how-h', className }: { id?: string; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn('obs-paper p-5 sm:p-6', className)}>
      <PlateHead id={id} title="How astrology works" sub="What happens between your birth time and your first reading" action={<Link to="/demo" className="inline-flex items-center gap-1 font-label text-sm tracking-[0.16em] text-accent hover:underline">See a sample edition<ArrowRight aria-hidden className="h-4 w-4" /></Link>} />
      <ol className="grid grid-cols-1 gap-x-5 gap-y-7 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {STEPS.map(([art, title, text, detail], i) => (
          <li key={title} className="how-step">
            <SpotArt kind={art} badge={i + 1} className="mx-auto h-20 w-20" orbit={false} />
            <p className="mt-3 font-label text-sm leading-tight tracking-[0.1em]">{title}</p>
            <p className="text-xs font-semibold text-accent">{text}</p>
            <p className="mx-auto mt-1.5 max-w-[15rem] text-xs leading-relaxed text-muted-foreground">{detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const ZODIAC: [string, string, string][] = [
  ['♈', 'Aries', 'Starting things'], ['♉', 'Taurus', 'Keeping things'], ['♊', 'Gemini', 'Talk and learning'], ['♋', 'Cancer', 'Home and care'],
  ['♌', 'Leo', 'Being seen'], ['♍', 'Virgo', 'Getting it right'], ['♎', 'Libra', 'Fairness and partners'], ['♏', 'Scorpio', 'Depth and trust'],
  ['♐', 'Sagittarius', 'Travel and belief'], ['♑', 'Capricorn', 'Work and structure'], ['♒', 'Aquarius', 'Groups and ideas'], ['♓', 'Pisces', 'Imagination and rest'],
];

export function ZodiacPlate({ id = 'zodiac-h', highlight, className }: { id?: string; highlight?: string; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn('obs-paper p-5 sm:p-6', className)}>
      <PlateHead id={id} title="Explore the zodiac" sub="The twelve signs, in a few words each" />
      <ul className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6 xl:grid-cols-12">
        {ZODIAC.map(([g, n, motto]) => (
          <li key={n} className="text-center">
            <span aria-hidden className={cn('zodiac-coin', n === highlight && 'zodiac-coin-on')}>{g + '\uFE0E'}</span>
            <span className="mt-1.5 block font-label text-[0.68rem] tracking-[0.1em]">{n}{n === highlight && <span className="sr-only"> (your Sun sign)</span>}</span>
            <span className="block text-[0.68rem] leading-tight text-muted-foreground">{motto}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TransmissionsPlate({ id = 'tx-h', className }: { id?: string; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn('obs-paper p-5 sm:p-6', className)}>
      <PlateHead id={id} title="Latest transmissions" sub="Short articles from the Academy" />
      <ul className="divide-y divide-[hsl(var(--comic-navy)/0.18)]">
        {PUBLIC_ARTICLES.slice(0, 5).map(a => (
          <li key={a.slug}><Link to={`/learn/${a.slug}`} className="group flex items-baseline gap-3 py-2"><span aria-hidden className="text-accent">✦</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold leading-snug group-hover:underline">{a.title}</span><span className="block font-label text-[0.65rem] tracking-[0.14em] text-muted-foreground">{a.category}</span></span></Link></li>
        ))}
      </ul>
      <Link to="/learn#articles" className="mt-3 inline-flex items-center gap-1 font-label text-xs tracking-[0.16em] text-accent hover:underline">View all transmissions<ArrowRight aria-hidden className="h-3.5 w-3.5" /></Link>
    </section>
  );
}

export function JoinPlate({ id = 'join-h', className }: { id?: string; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn('obs-paper relative overflow-hidden p-5 sm:p-6', className)}>
      <div className="relative z-10 max-w-[19rem]">
        <PlateHead id={id} title="Join the observatory" />
        <p className="mb-4 text-sm text-muted-foreground">Leave your email to hear when sky notes and new AstroBooks go out. We haven’t sent any yet.</p>
        <NewsletterSignup source="sky-notes" button="Sign up" />
      </div>
      <img src={poster} alt="" aria-hidden width={720} height={990} loading="lazy" className="join-plate-art" />
    </section>
  );
}
