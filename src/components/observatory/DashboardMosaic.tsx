import type { ChartResult } from '@/lib/astro';
import { fmtLon } from '@/lib/astro';
import { HeroSlideshow, ChartMapSlide, LookUpSlide, PressSlide, PLANET_MEANINGS, type HeroSlide, type PlanetLine } from '@/components/observatory/HeroSlides';
import { DestinationTiles, ExplorePoster, type Destination } from '@/components/observatory/Mosaic';

type Cta = { to: string; label: string };

const PLANET_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

/** The ten planets' meanings, each with the sign it occupies in this chart (calculated, never guessed). */
export function chartPlanetLines(chart: ChartResult | null): PlanetLine[] {
  return PLANET_MEANINGS.map((p, i) => ({ ...p, sign: chart?.bodies.find(b => b.key === PLANET_KEYS[i])?.sign }));
}

/** Sun, Moon and Rising lines for the hero. Rising is only stated when the birth time is known. */
export function bigThreeLines(chart: ChartResult | null, hasTime: boolean): string[] {
  if (!chart) return ['Add your birth date, time and place', 'Your chart is calculated in seconds', 'Private to your account'];
  const sun = chart.bodies.find(b => b.key === 'sun')?.sign;
  const moon = chart.bodies.find(b => b.key === 'moon')?.sign;
  const rising = hasTime && chart.asc !== null ? `Rising: ${fmtLon(chart.asc).sign}` : 'Rising needs a birth time';
  return [sun ? `Sun in ${sun} · your essence` : '', moon ? `Moon in ${moon} · your emotions` : '', rising].filter(Boolean);
}

const possessive = (name?: string | null) => (name ? `${name}’s` : 'Your');

/**
 * Every dashboard (member, founder and shared view) opens with the same mosaic as the home page:
 * a personal slideshow drawn from the open chart, a poster, and destination tiles.
 */
export function DashboardMosaic({ chart, name, hasTime, primary, secondary, onAir, press, destinations, posterTo = '/explore' }: {
  chart: ChartResult | null;
  name?: string | null;
  hasTime: boolean;
  primary: Cta;
  secondary?: Cta;
  /** Slide 2: links for today's sky. Omit to leave the slide out (e.g. read-only shared views). */
  onAir?: { cta: Cta; secondary?: Cta };
  /** Slide 3: books and comics. Omit to leave the slide out. */
  press?: { book: Cta; comic: Cta };
  destinations: Destination[];
  posterTo?: string;
}) {
  const sun = chart?.bodies.find(b => b.key === 'sun')?.sign;
  const who = possessive(name);
  const slides: HeroSlide[] = [{
    id: 'map', label: `${who} sky`,
    content: <ChartMapSlide heading="h1" eager title={chart ? <>{who} sky,<br />mapped.</> : <>Meet<br />your sky.</>} script={chart ? 'Your current chapter, on air.' : 'Your cosmic blueprint awaits.'} lines={bigThreeLines(chart, hasTime)} cta={primary} secondary={secondary} planets={chart ? chartPlanetLines(chart) : PLANET_MEANINGS} highlight={sun} />,
  }];
  if (onAir && chart) slides.push({
    id: 'on-air', label: 'Today’s sky',
    content: <LookUpSlide title="Look up. Today’s sky is on air." script="Tuned to your own chart." text="The Broadcast Studio below reads today’s real planetary positions against this chart: the current chapter, career, relationships, the weeks ahead and growth." cta={onAir.cta} secondary={onAir.secondary} />,
  });
  if (press) slides.push({
    id: 'press', label: 'AstroBooks and AstroComics',
    content: <PressSlide title={<>Your chart,<br />in print.</>} script="Books and comics from your own sky." text="AstroBooks and AstroComics are written and drawn from this chart — read them here, or order a printed copy." book={press.book} comic={press.comic} />,
  });
  return (
    <div className="mosaic">
      <div className="mosaic-dash-top">
        <HeroSlideshow className="mosaic-hero" label={`${who} observatory`} slides={slides} />
        <ExplorePoster className="mosaic-dash-poster" to={posterTo} />
      </div>
      <DestinationTiles label="Your destinations" items={destinations} />
    </div>
  );
}
