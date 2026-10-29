import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { computeChart, fmtLon, SIGN_KEYWORDS, BODY_KEYWORDS, type BodyPos } from '@/lib/astro';
import { toChartInput, type MyBirth } from '@/lib/myBirth';
import { PlanetOrb } from '@/components/chart/PlanetOrb';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { ThemeArt } from '@/components/common/ThemeArt';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';

const HOUSE_AREA = ['', 'self, body and first impressions', 'money, possessions and self-worth', 'thinking, siblings and your neighbourhood', 'home, family life and inner foundations', 'creativity, romance, play and children', 'daily routine, work habits and health', 'partners and one-to-one relationships', 'shared resources, intimacy and deep change', 'beliefs, study and travel', 'career, reputation and public life', 'friends, groups and hopes', 'rest, solitude and the hidden inner life'];
/** Traditional and modern rulers, used to trace each house to the planet that runs it. */
export const SIGN_RULER: Record<string, { traditional: string; modern?: string }> = {
  Aries: { traditional: 'mars' }, Taurus: { traditional: 'venus' }, Gemini: { traditional: 'mercury' }, Cancer: { traditional: 'moon' },
  Leo: { traditional: 'sun' }, Virgo: { traditional: 'mercury' }, Libra: { traditional: 'venus' }, Scorpio: { traditional: 'mars', modern: 'pluto' },
  Sagittarius: { traditional: 'jupiter' }, Capricorn: { traditional: 'saturn' }, Aquarius: { traditional: 'saturn', modern: 'uranus' }, Pisces: { traditional: 'jupiter', modern: 'neptune' },
};
/** Where to read more about each planet in the member's own readings. */
const READING_FOR: Record<string, { slug: string; title: string }> = {
  sun: { slug: 'big-three', title: 'Your Big Three' }, moon: { slug: 'big-three', title: 'Your Big Three' }, mercury: { slug: 'mind', title: 'Mind & Communication' },
  venus: { slug: 'love', title: 'Love & Relationships' }, mars: { slug: 'sex-attraction', title: 'Sex & Attraction' }, jupiter: { slug: 'money', title: 'Money & Resources' },
  saturn: { slug: 'obstacles', title: 'Obstacles & Challenges' }, uranus: { slug: 'recurring-themes', title: 'Recurring Themes' }, neptune: { slug: 'spiritual-gifts', title: 'Spiritual Gifts & Intuition' },
  pluto: { slug: 'shadow-work', title: 'Shadow Work & Healing' }, chiron: { slug: 'shadow-work', title: 'Shadow Work & Healing' }, northNode: { slug: 'purpose', title: 'Life Purpose & Mission' },
  southNode: { slug: 'past-lives', title: 'Past Lives & Karma' }, lilith: { slug: 'shadow-work', title: 'Shadow Work & Healing' }, fortune: { slug: 'money', title: 'Money & Resources' }, vertex: { slug: 'love', title: 'Love & Relationships' },
};
const HOUSE_READING: Record<number, { slug: string; title: string }> = {
  1: { slug: 'big-three', title: 'Your Big Three' }, 2: { slug: 'money', title: 'Money & Resources' }, 3: { slug: 'mind', title: 'Mind & Communication' }, 4: { slug: 'family-home', title: 'Family & Home' },
  5: { slug: 'love', title: 'Love & Relationships' }, 6: { slug: 'health', title: 'Health & Wellness' }, 7: { slug: 'love', title: 'Love & Relationships' }, 8: { slug: 'shadow-work', title: 'Shadow Work & Healing' },
  9: { slug: 'spiritual-gifts', title: 'Spiritual Gifts & Intuition' }, 10: { slug: 'career', title: 'Career & Calling' }, 11: { slug: 'recurring-themes', title: 'Recurring Themes' }, 12: { slug: 'spiritual-gifts', title: 'Spiritual Gifts & Intuition' },
};
const ASPECT_MEANING: Record<string, string> = { Conjunction: 'These two act as one — their energies blend.', Opposition: 'These two pull opposite ways; balance is the skill.', Square: 'Friction that turns into growth with practice.', Trine: 'These support each other easily — a natural talent.', Sextile: 'An opportunity that opens when you choose to use it.' };
const ordinal = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

function useMemberChart(birth: MyBirth) {
  return useMemo(() => computeChart({ ...toChartInput(birth), houseSystem: birth.houseSystem }), [birth]);
}

/** One planet or point in the member's own chart: sign, degree, house, aspects and where to read more. */
export function MemberPlanetDetail({ birth, planetKey }: { birth: MyBirth; planetKey: string }) {
  const chart = useMemberChart(birth);
  const list = chart.bodies;
  const i = list.findIndex(b => b.key === planetKey);
  const b = list[i];
  usePageMeta(b ? `Your ${b.name} in ${b.sign} · Zodaci` : 'Planet · Zodaci', b ? `Your ${b.name} at ${b.deg}° ${b.sign}, calculated from your birth details.` : 'A planet in your chart.');
  if (!b) return (
    <article className="space-y-4">
      <h1 className="font-display text-3xl">That point isn’t in your chart</h1>
      <p className="text-muted-foreground">{planetKey === 'chiron' ? 'Chiron is calculated from a NASA JPL table covering 1940–2060, so it isn’t shown for births outside those years.' : 'Choose a planet from your chart instead.'}</p>
      <Button asChild variant="outline"><Link to="/planets">All your planets</Link></Button>
    </article>
  );
  const hasTime = !!birth.time && !!chart.cusps;
  const aspects = chart.aspects.filter(a => a.a === b.name || a.b === b.name).sort((x, y) => x.orb - y.orb);
  const rules = Object.entries(SIGN_RULER).filter(([, r]) => r.traditional === b.key || r.modern === b.key).map(([s]) => s);
  const ruledHouses = hasTime ? chart.cusps!.map((c, n) => ({ n: n + 1, sign: fmtLon(c).sign })).filter(h => rules.includes(h.sign)) : [];
  const reading = READING_FOR[b.key];
  const prev = list[i - 1], next = list[i + 1];
  return (
    <article className="space-y-8">
      <Link to="/planets" className="font-smallcaps text-xs text-muted-foreground hover:text-foreground">← Your planets</Link>
      <header className="flex flex-wrap items-center gap-6">
        <PlanetOrb planet={b.key} size={96} />
        <div>
          <p className="font-smallcaps text-xs text-gold">{birth.date}{birth.time ? ` · ${birth.time}` : ' · time unknown'} · {birth.placeLabel}</p>
          <h1 className="font-display mt-1 text-4xl">Your {b.name} in {b.sign}</h1>
          <p className="mt-2 text-muted-foreground">{b.deg}°{String(b.min).padStart(2, '0')}′ {b.sign}{hasTime && b.house ? ` · ${ordinal(b.house)} house` : ''}{b.retro && !b.key.includes('Node') ? ' · retrograde' : ''} <ConfidenceBadge compact level={b.confidence} note={b.note} /></p>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="vellum p-5"><h2 className="font-smallcaps text-xs text-gold">What it is</h2><p className="mt-2">{BODY_KEYWORDS[b.key] ?? b.name}.</p></div>
        <div className="vellum p-5"><h2 className="font-smallcaps text-xs text-gold">How it works in {b.sign}</h2><p className="mt-2">{SIGN_KEYWORDS[b.sign]}.</p></div>
        <div className="vellum p-5"><h2 className="font-smallcaps text-xs text-gold">Where it shows up</h2><p className="mt-2">{hasTime && b.house ? `The ${ordinal(b.house)} house: ${HOUSE_AREA[b.house]}.` : 'Houses need a birth time.'}</p>{!hasTime && <Link to="/start" className="mt-2 inline-block text-sm underline">Add your birth time</Link>}</div>
      </section>
      {b.retro && !b.key.includes('Node') && <p className="rounded border border-border bg-card/60 p-4 text-sm">Retrograde at birth: this part of you tends to work inwardly first — reflect, review and revise before acting.</p>}
      {b.key === 'chiron' && <p className="text-xs text-muted-foreground">Chiron comes from a NASA JPL Horizons table (1940–2060), interpolated; births outside that range don’t show Chiron.</p>}
      {ruledHouses.length > 0 && <section><h2 className="font-display text-2xl">Houses it runs</h2><p className="mt-2 text-sm">As ruler of {rules.join(' and ')}, your {b.name} also steers {ruledHouses.map(h => `the ${ordinal(h.n)} house (${HOUSE_AREA[h.n]})`).join(' and ')}.</p></section>}
      <section>
        <h2 className="font-display text-2xl">Aspects to your {b.name}</h2>
        {aspects.length ? <ul className="mt-3 space-y-2">{aspects.map((a, k) => <li key={k} className="rounded border border-border bg-card p-3 text-sm"><b>{a.a} {a.symbol} {a.b}</b> <span className="text-muted-foreground">· {a.type}, orb {a.orb.toFixed(1)}°</span><p className="mt-1">{ASPECT_MEANING[a.type] ?? 'A minor link between these two parts of you.'}</p></li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No major aspects within the chart’s limits.</p>}
      </section>
      <div className="flex flex-wrap gap-3">
        {reading && <Button asChild><Link to={`/my-readings/topic/${reading.slug}`}>Read: {reading.title}</Link></Button>}
        <Button asChild variant="outline"><Link to="/my-chart">Your full chart</Link></Button>
      </div>
      <nav className="flex justify-between gap-4" aria-label="Planets">
        {prev ? <Link to={`/planets/${prev.key}`} className="parchment flex items-center gap-2 p-3 text-sm"><ChevronLeft className="h-4 w-4" aria-hidden="true" />{prev.name}</Link> : <span />}
        {next && <Link to={`/planets/${next.key}`} className="parchment flex items-center gap-2 p-3 text-sm">{next.name}<ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>}
      </nav>
    </article>
  );
}

/** One house in the member's own chart: cusp sign, ruler and where it sits, planets inside, and where to read more. */
export function MemberHouseDetail({ birth, house }: { birth: MyBirth; house: number }) {
  const chart = useMemberChart(birth);
  const valid = Number.isInteger(house) && house >= 1 && house <= 12;
  usePageMeta(valid ? `Your ${ordinal(house)} house · Zodaci` : 'House · Zodaci', valid ? `Your ${ordinal(house)} house — ${HOUSE_AREA[house]} — from your own chart.` : 'A house in your chart.');
  if (!valid) return <article className="space-y-4"><h1 className="font-display text-3xl">Houses run from 1 to 12</h1><Button asChild variant="outline"><Link to="/houses">All your houses</Link></Button></article>;
  if (!birth.time || !chart.cusps) return (
    <article className="space-y-4">
      <Link to="/houses" className="font-smallcaps text-xs text-muted-foreground hover:text-foreground">← Your houses</Link>
      <h1 className="font-display text-4xl">Your {ordinal(house)} house</h1>
      <p className="text-muted-foreground">{HOUSE_AREA[house][0].toUpperCase() + HOUSE_AREA[house].slice(1)}. Houses need a birth time to calculate.</p>
      <Button asChild><Link to="/start">Add your birth time</Link></Button>
    </article>
  );
  const cusp = fmtLon(chart.cusps[house - 1]);
  const ruler = SIGN_RULER[cusp.sign];
  const rulerBody: BodyPos | undefined = chart.bodies.find(x => x.key === ruler.traditional);
  const modernBody = ruler.modern ? chart.bodies.find(x => x.key === ruler.modern) : undefined;
  const inside = chart.bodies.filter(x => x.house === house);
  const reading = HOUSE_READING[house];
  return (
    <article className="space-y-8">
      <Link to="/houses" className="font-smallcaps text-xs text-muted-foreground hover:text-foreground">← Your houses</Link>
      <header className="flex flex-wrap items-center gap-6">
        <ThemeArt kind="house" className="h-24 w-24" badge={house} />
        <div>
          <p className="font-smallcaps text-xs text-gold">{birth.houseSystem} houses · {birth.placeLabel}</p>
          <h1 className="font-display mt-1 text-4xl">Your {ordinal(house)} house</h1>
          <p className="mt-2 text-muted-foreground">{HOUSE_AREA[house][0].toUpperCase() + HOUSE_AREA[house].slice(1)} · begins at {cusp.text}</p>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="vellum p-5"><h2 className="font-smallcaps text-xs text-gold">The sign on the door</h2><p className="mt-2">You approach this area with {cusp.sign} style: {SIGN_KEYWORDS[cusp.sign]}.</p></div>
        <div className="vellum p-5"><h2 className="font-smallcaps text-xs text-gold">The planet that runs it</h2>
          {rulerBody ? <p className="mt-2"><Link to={`/planets/${rulerBody.key}`} className="underline">{rulerBody.name}</Link> rules {cusp.sign} and sits in {rulerBody.sign}{rulerBody.house ? `, in your ${ordinal(rulerBody.house)} house (${HOUSE_AREA[rulerBody.house]})` : ''} — so this area connects to that one.{modernBody && <> Modern ruler: <Link to={`/planets/${modernBody.key}`} className="underline">{modernBody.name}</Link> in {modernBody.sign}{modernBody.house ? ` (${ordinal(modernBody.house)} house)` : ''}.</>}</p> : <p className="mt-2 text-muted-foreground">Ruler not available.</p>}
        </div>
      </section>
      <section>
        <h2 className="font-display text-2xl">Planets in this house</h2>
        {inside.length ? <ul className="mt-3 grid gap-3 sm:grid-cols-2">{inside.map(x => <li key={x.key}><Link to={`/planets/${x.key}`} className="flex items-center gap-3 rounded border border-border bg-card p-3 text-sm hover:border-gold"><PlanetOrb planet={x.key} size={36} /><span><b>{x.name} in {x.sign}</b><span className="block text-muted-foreground">{x.deg}°{String(x.min).padStart(2, '0')}′{x.retro && !x.key.includes('Node') ? ' · retrograde' : ''}</span></span></Link></li>)}</ul>
          : <p className="mt-2 text-sm text-muted-foreground">No planets here. The area still matters; it works mainly through its sign ({cusp.sign}) and its ruler.</p>}
      </section>
      <div className="flex flex-wrap gap-3">
        <Button asChild><Link to={`/my-readings/topic/${reading.slug}`}>Read: {reading.title}</Link></Button>
        <Button asChild variant="outline"><Link to="/my-chart">Your full chart</Link></Button>
      </div>
      <nav className="flex justify-between gap-4" aria-label="Houses">
        {house > 1 ? <Link to={`/houses/${house - 1}`} className="parchment flex items-center gap-2 p-3 text-sm"><ChevronLeft className="h-4 w-4" aria-hidden="true" />{ordinal(house - 1)} house</Link> : <span />}
        {house < 12 && <Link to={`/houses/${house + 1}`} className="parchment flex items-center gap-2 p-3 text-sm">{ordinal(house + 1)} house<ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>}
      </nav>
    </article>
  );
}
