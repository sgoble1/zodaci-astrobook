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
export function ExplorePoster({ to, title = 'Explore a brighter tomorrow', className }: { to: string; title?: string; className?: string }) {
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

const CHAPTER_ART: Record<string, SpotKind> = { 'big-three': 'self', planets: 'planet', houses: 'house', aspects: 'aspect', timing: 'year' };
const BOOK_TONES = ['shelf-book-navy', 'shelf-book-cream', 'shelf-book-navy', 'shelf-book-red', 'shelf-book-cream'];

/** A sliding shelf of the AstroBook's real chapters, plus the AstroBook and AstroComic covers. */
export function ArchiveShelf({ id = 'archive-h', to = '/astrobook', className }: { id?: string; to?: string; className?: string }) {
  const track = useRef<HTMLUListElement>(null);
  const slide = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <section aria-labelledby={id} className={cn('obs-paper p-5 sm:p-6', className)}>
      <PlateHead id={id} title="The Cosmic Archive" sub="Every AstroBook, written from your own chart" />
      <div className="relative">
        <ul ref={track} className="shelf-track" tabIndex={0} aria-label="AstroBook chapters and covers">
          {CHAPTER_TABS.map((c, i) => (
            <li key={c.id} className="shelf-item">
              <Link to={to} className={cn('shelf-book', BOOK_TONES[i % BOOK_TONES.length])} aria-label={`${c.label}: ${c.text}`}>
                <span className="shelf-book-title">{c.label}</span>
                <SpotArt kind={CHAPTER_ART[c.id] ?? 'book'} className="mx-auto h-20 w-20" orbit={false} />
                <span className="shelf-book-foot">ZODACI</span>
              </Link>
            </li>
          ))}
          <li className="shelf-item"><Link to={to} className="shelf-cover" aria-label="Collector AstroBook sample cover, printed for a fictional reader"><img src={PRODUCT_ART.book.src} alt={PRODUCT_ART.book.alt} width={1024} height={1536} loading="lazy" className="h-full w-full object-cover" /></Link></li>
          <li className="shelf-item"><Link to="/astrocomic" className="shelf-cover shelf-product" aria-label="AstroComic story preview"><img src={PRODUCT_ART.comic.src} alt={PRODUCT_ART.comic.alt} width={768} height={1145} loading="lazy" className="h-full w-full object-contain" /></Link></li>
        </ul>
        <button type="button" onClick={() => slide(-1)} className="shelf-arrow left-0" aria-label="Scroll the shelf left"><ChevronLeft aria-hidden className="h-5 w-5" /></button>
        <button type="button" onClick={() => slide(1)} className="shelf-arrow right-0" aria-label="Scroll the shelf right"><ChevronRight aria-hidden className="h-5 w-5" /></button>
      </div>
      <p className="mt-4 text-center"><Link to={to} className="inline-flex items-center gap-1 font-label text-sm tracking-[0.16em] text-accent hover:underline">View all AstroBooks<ArrowRight aria-hidden className="h-4 w-4" /></Link></p>
    </section>
  );
}

const STEPS: [SpotKind, string, string, string][] = [
  ['birth', 'Your birth date, time & place', 'A unique moment', 'From a birth certificate if you can. No time? We show exactly what that changes.'],
  ['explore', 'A snapshot of the sky', 'The real positions', 'Astronomical data places every planet, house cusp and angle for that minute.'],
  ['chart', 'Your unique chart', 'A cosmic blueprint', 'Signs, exact degrees, houses, rulers and aspects, each with a note on how it was derived.'],
  ['written', 'Personal insights', 'Meaningful guidance', 'Readings name the placement behind every sentence, and your own context if you add it.'],
  ['growth', 'Greater self-awareness', 'A brighter you', 'Practices, timing and reflection questions you can return to as your sky moves.'],
];

export function HowItWorks({ id = 'how-h', className }: { id?: string; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn('obs-paper p-5 sm:p-6', className)}>
      <PlateHead id={id} title="How astrology works" sub="From your birth time to a brighter tomorrow" action={<Link to="/demo" className="inline-flex items-center gap-1 font-label text-sm tracking-[0.16em] text-accent hover:underline">See a sample edition<ArrowRight aria-hidden className="h-4 w-4" /></Link>} />
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
      <p className="mt-5 text-center font-label text-sm tracking-[0.2em] text-muted-foreground">Ancient wisdom. A more connected tomorrow.</p>
    </section>
  );
}

const ZODIAC: [string, string, string][] = [
  ['♈', 'Aries', 'The first spark'], ['♉', 'Taurus', 'The steady ground'], ['♊', 'Gemini', 'The two voices'], ['♋', 'Cancer', 'The shelter'],
  ['♌', 'Leo', 'The solar heart'], ['♍', 'Virgo', 'The careful hand'], ['♎', 'Libra', 'The balance'], ['♏', 'Scorpio', 'The deep water'],
  ['♐', 'Sagittarius', 'The far road'], ['♑', 'Capricorn', 'The mountain observatory'], ['♒', 'Aquarius', 'The inventor'], ['♓', 'Pisces', 'The cosmic ocean'],
];

export function ZodiacPlate({ id = 'zodiac-h', highlight, className }: { id?: string; highlight?: string; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn('obs-paper p-5 sm:p-6', className)}>
      <PlateHead id={id} title="Explore the zodiac" sub="Twelve archetypes. Endless possibilities." />
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
      <PlateHead id={id} title="Latest transmissions" sub="Ideas, insights and cosmic perspectives" />
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
        <p className="mb-4 text-sm text-muted-foreground">Join the interest list for sky notes and new AstroBooks. Email delivery has not launched yet.</p>
        <NewsletterSignup source="sky-notes" button="Sign up" />
        <p className="mt-4 font-label text-xs tracking-[0.16em] text-muted-foreground">Curious souls. Brighter tomorrows.</p>
      </div>
      <img src={poster} alt="" aria-hidden width={720} height={990} loading="lazy" className="join-plate-art" />
    </section>
  );
}
