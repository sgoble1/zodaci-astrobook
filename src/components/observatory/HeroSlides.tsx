import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import cartographer from '@/assets/home/cartographer-guide.jpg';
import facesHero from '@/assets/home-heads-hero.jpg';
import sunFace from '@/assets/spots/self.jpg';
import bookCover from '@/assets/cover-design-midnight-stars-hd.jpg';
import comicCover from '@/assets/comic-issue1-cover-v2.jpg';

export type HeroSlide = { id: string; label: string; content: ReactNode };

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/**
 * Slow cross-fading slideshow in a navy plate. Advances every `interval` ms unless the visitor hovers,
 * focuses inside, presses pause, hides the tab or prefers reduced motion. Hidden slides are inert.
 */
export function HeroSlideshow({ slides, label, interval = 15000, className }: { slides: HeroSlide[]; label: string; interval?: number; className?: string }) {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduced = useReducedMotion();
  const [announce, setAnnounce] = useState('');
  const count = slides.length;
  const auto = count > 1 && !reduced && !stopped && !hover && !hidden;

  useEffect(() => {
    const on = () => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  useEffect(() => {
    if (!auto) return;
    const t = window.setTimeout(() => setIndex(n => (n + 1) % count), interval);
    return () => window.clearTimeout(t);
  }, [auto, index, interval, count]);

  const go = useCallback((n: number) => {
    const next = (n + count) % count;
    setIndex(next);
    setAnnounce(`Slide ${next + 1} of ${count}: ${slides[next]?.label ?? ''}`);
  }, [count, slides]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={cn('hero-slides obs-panel', className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHover(false); }}
      onKeyDown={e => { if (e.key === 'ArrowRight') go(index + 1); if (e.key === 'ArrowLeft') go(index - 1); }}
    >
      <div className="hero-slides-track">
        {slides.map((s, n) => (
          <div
            key={s.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${n + 1} of ${count}: ${s.label}`}
            aria-hidden={n !== index}
            ref={el => { el?.toggleAttribute('inert', n !== index); }}
            className={cn('hero-slide', n === index && 'hero-slide-on')}
          >
            {s.content}
          </div>
        ))}
      </div>
      {count > 1 && (
        <div className="hero-slides-controls">
          <button type="button" className="hero-slides-btn" onClick={() => go(index - 1)} aria-label="Previous slide"><ChevronLeft aria-hidden className="h-4 w-4" /></button>
          <div className="flex items-center gap-1.5">
            {slides.map((s, n) => (
              <button key={s.id} type="button" onClick={() => go(n)} aria-label={`Show slide ${n + 1}: ${s.label}`} aria-current={n === index ? 'true' : undefined} className={cn('hero-slides-dot', n === index && 'hero-slides-dot-on')} />
            ))}
          </div>
          <button type="button" className="hero-slides-btn" onClick={() => go(index + 1)} aria-label="Next slide"><ChevronRight aria-hidden className="h-4 w-4" /></button>
          {!reduced && <button type="button" className="hero-slides-btn" onClick={() => setStopped(v => !v)} aria-label={stopped ? 'Play slideshow' : 'Pause slideshow'} aria-pressed={stopped}>{stopped ? <Play aria-hidden className="h-3.5 w-3.5" /> : <Pause aria-hidden className="h-3.5 w-3.5" />}</button>}
        </div>
      )}
      <p className="sr-only" aria-live="polite">{announce}</p>
    </section>
  );
}

const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const TP = '\uFE0E';

/** Decorative 1950s zodiac dial: twelve sign segments around a sun face; one sign can be lit (e.g. the member's Sun sign). */
export function AstroDial({ highlight, className }: { highlight?: string; className?: string }) {
  const lit = highlight ? SIGN_NAMES.indexOf(highlight) : -1;
  const pt = (r: number, deg: number) => { const a = ((deg - 90) * Math.PI) / 180; return [150 + r * Math.cos(a), 150 + r * Math.sin(a)] as const; };
  const seg = (i: number) => {
    const [x1, y1] = pt(146, i * 30), [x2, y2] = pt(146, i * 30 + 30), [x3, y3] = pt(116, i * 30 + 30), [x4, y4] = pt(116, i * 30);
    return `M${x1} ${y1} A146 146 0 0 1 ${x2} ${y2} L${x3} ${y3} A116 116 0 0 0 ${x4} ${y4}Z`;
  };
  return (
    <svg viewBox="0 0 300 300" className={cn('astro-dial', className)} role="img" aria-label={highlight ? `Zodiac wheel with ${highlight} highlighted` : 'Zodiac wheel of the twelve signs'}>
      <defs><clipPath id="astro-dial-sun"><circle cx="150" cy="150" r="54" /></clipPath></defs>
      <g className="astro-dial-ring">
        {lit >= 0 && <path d={seg(lit)} className="astro-dial-lit" />}
        <circle cx="150" cy="150" r="146" className="astro-dial-line" />
        <circle cx="150" cy="150" r="116" className="astro-dial-line" />
        {SIGN_GLYPHS.map((g, i) => {
          const [x1, y1] = pt(116, i * 30), [x2, y2] = pt(146, i * 30), [gx, gy] = pt(131, i * 30 + 15);
          return <g key={g}><line x1={x1} y1={y1} x2={x2} y2={y2} className="astro-dial-line" /><text x={gx} y={gy} className={cn('astro-dial-glyph', i === lit && 'astro-dial-glyph-lit')} textAnchor="middle" dominantBaseline="central">{g + TP}</text></g>;
        })}
      </g>
      <circle cx="150" cy="150" r="88" className="astro-dial-line astro-dial-faint" />
      {Array.from({ length: 12 }, (_, i) => { const [x1, y1] = pt(58, i * 30), [x2, y2] = pt(114, i * 30); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="astro-dial-line astro-dial-faint" />; })}
      <circle cx="150" cy="150" r="57" className="astro-dial-sun-ring" />
      <image href={sunFace} x="90" y="90" width="120" height="120" clipPath="url(#astro-dial-sun)" preserveAspectRatio="xMidYMid slice" />
    </svg>
  );
}

export type PlanetLine = { glyph: string; name: string; meaning: string; sign?: string };
export const PLANET_MEANINGS: PlanetLine[] = [
  { glyph: '☉', name: 'The Sun', meaning: 'Your essence' }, { glyph: '☽', name: 'The Moon', meaning: 'Your emotions' },
  { glyph: '☿', name: 'Mercury', meaning: 'Your mind' }, { glyph: '♀', name: 'Venus', meaning: 'Your connections' },
  { glyph: '♂', name: 'Mars', meaning: 'Your drive' }, { glyph: '♃', name: 'Jupiter', meaning: 'Your growth' },
  { glyph: '♄', name: 'Saturn', meaning: 'Your discipline' }, { glyph: '♅', name: 'Uranus', meaning: 'Your change' },
  { glyph: '♆', name: 'Neptune', meaning: 'Your imagination' }, { glyph: '♇', name: 'Pluto', meaning: 'Your transformation' },
];

type Cta = { to: string; label: string };
type Heading = 'h1' | 'h2';

/** Slide 1: the Cartographer points to the chart; headline, script subheading, a dial and the planets' meanings. */
export function ChartMapSlide({ heading = 'h1', title, script, lines, cta, secondary, planets = PLANET_MEANINGS, highlight, eager }: { heading?: Heading; title: ReactNode; script: string; lines: string[]; cta: Cta; secondary?: Cta; planets?: PlanetLine[]; highlight?: string; eager?: boolean }) {
  const H = heading;
  return (
    <div className="hero-night relative grid min-h-full md:grid-cols-[auto_minmax(0,1fr)]">
      <img src={cartographer} alt="The Cartographer, the observatory's chart specialist, points up toward the zodiac" width={820} height={1025} loading={eager ? 'eager' : 'lazy'} {...(eager ? { fetchpriority: 'high' } : {})} className="hero-cartographer order-last mx-auto h-72 w-auto self-end sm:h-96 md:order-none md:mx-0 md:h-[34rem]" />
      <div className="relative z-10 flex flex-col gap-6 px-6 pb-4 pt-10 sm:px-10 md:-ml-16 md:py-10 md:pl-0 md:pr-8 lg:-ml-24">
        <div>
          <H className="hero-headline">{title}</H>
          <p className="mt-2 font-script text-3xl text-primary sm:text-4xl">{script}</p>
        </div>
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <ul className="space-y-1 font-label text-sm tracking-[0.14em] text-foreground/85">{lines.map(l => <li key={l}>{l}</li>)}</ul>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="signal" size="lg"><Link to={cta.to}>{cta.label}<ArrowRight /></Link></Button>
              {secondary && <Button asChild variant="outline" size="lg"><Link to={secondary.to}>{secondary.label}</Link></Button>}
            </div>
          </div>
          <AstroDial highlight={highlight} className="mx-auto w-full max-w-[15rem] lg:max-w-[17rem]" />
        </div>
        <ul aria-label="What each planet describes" className="hidden grid-cols-2 gap-x-6 gap-y-1.5 sm:grid xl:grid-cols-5">
          {planets.map(p => (
            <li key={p.name} className="flex min-w-0 items-center gap-2">
              <span aria-hidden className="hero-planet-glyph">{p.glyph + TP}</span>
              <span className="min-w-0"><span className="block font-label text-xs tracking-[0.12em] text-primary">{p.name}{p.sign ? ` · ${p.sign}` : ''}</span><span className="block text-[0.7rem] leading-tight text-muted-foreground">{p.meaning}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Slide 2: the original home hero — a row of 1950s faces looking up at the sky — kept alive. */
export function LookUpSlide({ heading = 'h2', title, script, text, cta, secondary }: { heading?: Heading; title: ReactNode; script: string; text: ReactNode; cta: Cta; secondary?: Cta }) {
  const H = heading;
  return (
    <div className="relative isolate flex min-h-full flex-col justify-start overflow-hidden">
      <img src={facesHero} alt="A row of 1950s-style faces at the bottom of the frame gaze up at a zodiac wheel, planets and starbursts in an indigo night sky" width={1920} height={1088} loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover object-[30%_100%] sm:object-bottom" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-background/85 via-background/40 to-transparent sm:bg-gradient-to-r sm:from-background/85 sm:via-background/30 sm:to-transparent" />
      <div className="px-6 pb-48 pt-10 sm:px-12 sm:pb-56 sm:pt-14">
        <H className="hero-headline max-w-2xl">{title}</H>
        <p className="mt-2 font-script text-3xl text-primary sm:text-4xl">{script}</p>
        <div className="mt-4 max-w-lg text-lg leading-relaxed text-foreground/90">{text}</div>
        <div className="mt-6 flex flex-wrap gap-3"><Button asChild size="lg" variant="signal"><Link to={cta.to}>{cta.label}<ArrowRight /></Link></Button>{secondary && <Button asChild variant="outline" size="lg"><Link to={secondary.to}>{secondary.label}</Link></Button>}</div>
      </div>
    </div>
  );
}

/** Slide 3: the printed products — AstroBook and AstroComic covers side by side. */
export function PressSlide({ heading = 'h2', title, script, text, book, comic }: { heading?: Heading; title: ReactNode; script: string; text: ReactNode; book: Cta; comic: Cta }) {
  const H = heading;
  return (
    <div className="hero-night relative grid min-h-full items-center gap-8 px-6 py-10 sm:px-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <H className="hero-headline">{title}</H>
        <p className="mt-2 font-script text-3xl text-primary sm:text-4xl">{script}</p>
        <div className="mt-4 max-w-md text-lg leading-relaxed text-foreground/90">{text}</div>
        <div className="mt-6 flex flex-wrap gap-3"><Button asChild variant="signal" size="lg"><Link to={book.to}>{book.label}<ArrowRight /></Link></Button><Button asChild variant="outline" size="lg"><Link to={comic.to}>{comic.label}</Link></Button></div>
      </div>
      <div className="flex items-end justify-center gap-4 sm:gap-6">
        <img src={bookCover} alt="An AstroBook with the Midnight Stars cover" width={1280} height={1920} loading="lazy" className="hero-press-cover w-32 -rotate-3 sm:w-44" />
        <img src={comicCover} alt="AstroComic Issue 1 cover" width={1024} height={1536} loading="lazy" className="hero-press-cover w-36 rotate-2 sm:w-52" />
      </div>
    </div>
  );
}
