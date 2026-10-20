import * as Astronomy from 'astronomy-engine';
import { eclLon, fmtLon, houseOf, SIGNS, SIGN_GLYPH, type ChartResult } from '@/lib/astro';
import { transitPositions, upcomingEvents, type TransitEvent } from '@/lib/transitOverlay';

/**
 * AstroComic — the single source for comic plans, print spec, character bible and the
 * deterministic 24-page issue plan (chart + that month's transits; no AI, no credits).
 */
export type ComicPlan = 'monthly' | 'yearly' | 'single';
export const COMIC_PLANS: Record<ComicPlan, { priceId: string; cents: number; label: string; name: string; blurb: string }> = {
  monthly: { priceId: 'comic_monthly', cents: 1499, label: '$14.99/month', name: 'Monthly', blurb: 'A new personalized issue every month. Cancel anytime.' },
  yearly: { priceId: 'comic_yearly', cents: 14999, label: '$149.99/year', name: 'Yearly', blurb: 'Twelve issues for the price of ten.' },
  single: { priceId: 'comic_single', cents: 1899, label: '$18.99', name: 'Single issue', blurb: 'One issue for next month — a gift or a first look.' },
};
export const isComicPlan = (p: unknown): p is ComicPlan => p === 'monthly' || p === 'yearly' || p === 'single';

export const COMIC_SPEC = [
  ['Size', '5.5 × 8.5 in digest'], ['Pages', '24 including covers'], ['Binding', 'Saddle-stitched'],
  ['Color', 'Full-color CMYK'], ['Cover', '100 lb gloss'], ['Interior', '80 lb gloss text'],
  ['Print files', '0.125 in bleed · 0.25 in safe zone · 300 DPI minimum (350 preferred) · PDF/X-1a or X-4'],
] as const;

/** Exact FAQ wording from the AstroComic document. */
export const COMIC_FAQ: { q: string; a: string }[] = [
  { q: 'Is every issue really personalized to my chart?', a: 'Yes — your Sun, Moon, and Rising signs drive the story arcs, house spotlights, and reflection prompts. No two issues are identical.' },
  { q: 'What size is the comic and how many pages?', a: '5.5 x 8.5 inches (digest size), 24 pages, saddle-stitched, full color.' },
  { q: 'When does my first issue ship?', a: "Issues ship by the 8th of each month. If you subscribe before the 1st, you're in the current month's run. Subscribe after the 1st and your first issue ships the following month." },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime from your account dashboard, no questions asked.' },
  { q: "What if I don't have a Zodaci account yet?", a: "No problem — you'll create your free Zodaci account as part of checkout. Your birth chart is built from your birth date, time, and location." },
];

export type ComicCharacter = { key: string; planet: string; name: string; look: string; companion: string; voice: string; retro: string };
/** Planet character bible ("Celestial Noir"). Saturn is a fair teacher, never a villain. */
export const CAST: ComicCharacter[] = [
  { key: 'sun', planet: 'Sun', name: 'Sovereign', look: 'Gold armor, a crown of rays, amber light', companion: 'a lion', voice: 'Generous and steady; speaks about who you are becoming.', retro: '' },
  { key: 'moon', planet: 'Moon', name: 'Dreamer', look: 'Silver robes that change with the phases, a soft halo', companion: 'an owl', voice: 'Gentle and intuitive; notices what you need before you say it.', retro: '' },
  { key: 'mercury', planet: 'Mercury', name: 'Messenger', look: 'Feathered helmet, quick feet, ink-stained hands full of scrolls', companion: 'a paper bird', voice: 'Clever and fast. Retrograde, he walks backwards to reread every letter.', retro: 'rereads, revises and finds the missed line' },
  { key: 'venus', planet: 'Venus', name: 'Enchantress', look: 'Rose-gold gown, a floral crown', companion: 'two doves', voice: 'Warm and discerning about what is worth loving.', retro: 'returns to old loves and old values to check what still fits' },
  { key: 'mars', planet: 'Mars', name: 'Warrior', look: 'Red armor with old scars, a wolf at his side, embers in the air', companion: 'a wolf', voice: 'Direct and brave; asks what you are willing to fight for.', retro: 'sharpens strategy before swinging' },
  { key: 'jupiter', planet: 'Jupiter', name: 'Philosopher', look: 'Robes patterned with maps, round glasses, a globe-topped staff', companion: 'an eagle', voice: 'Wise and encouraging; widens the frame.', retro: 'turns the search inward and finds the lesson already learned' },
  { key: 'saturn', planet: 'Saturn', name: 'Elder', look: 'Weathered face, gray geometric robes, an hourglass staff', companion: 'a mountain goat', voice: 'A fair teacher — strict about time, kind about effort.', retro: 'audits the foundations so the next build lasts' },
  { key: 'uranus', planet: 'Uranus', name: 'Rebel', look: 'Angular futuristic clothes, electric-blue static hair', companion: 'a spark of lightning', voice: 'Disruptive and inventive; breaks the rule that no longer serves.', retro: 'rewires change from the inside' },
  { key: 'neptune', planet: 'Neptune', name: 'Mystic', look: 'Iridescent robes that dissolve into mist, a luminous trident', companion: 'a silver fish', voice: 'Poetic and dreamy; speaks in images.', retro: 'clears the fog so the real dream shows' },
  { key: 'pluto', planet: 'Pluto', name: 'Transformer', look: 'A cloak that swallows light, intense eyes, phoenix flames', companion: 'a phoenix', voice: 'Quiet and intense; talks about what has to end so something true can begin.', retro: 'digs up the root and composts it' },
];
export const castOf = (key: string) => CAST.find(c => c.key === key);

/** Celestial Noir art rules (print palette — content data, not UI colors). */
export const ART_RULES = {
  palette: [['Night navy', '#07080F'], ['Royal purple', '#3B0F6E'], ['Burnt gold', '#B45309'], ['Fire', '#C2410C'], ['Water', '#0D9488'], ['Earth', '#4D7C0F'], ['Air', '#7C3AED']] as [string, string][],
  rules: ['Art Nouveau frames, indie-comic inking, tarot symbolism and 1960s space-poster color', 'Black 2–4 pt outlines, flat color, minimal halftone — never photorealistic or airbrushed', 'Mixed panel shapes: bleeds, ovals and arched frames', 'Covers: full-bleed golden-thread constellation, title and month in the top third', 'Dot stars, ink-wash nebulae and moon phases as recurring texture', 'Lettering: hand-drawn speech balloons, serif captions'],
};

/** Issues ship by the 8th. Anyone who joins during a month starts with the next month's run. */
export function firstIssueMonth(joined: Date): Date { return new Date(Date.UTC(joined.getUTCFullYear(), joined.getUTCMonth() + 1, 1)); }
export const shipBy = (month: Date) => new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 8));
export const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
export const monthLabel = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** The next issue month for a subscription, honoring a pause date and skipped months. Null when nothing more ships. */
export function nextIssueMonth(sub: { plan: ComicPlan; status: string; created_at: string; paused_until: string | null; skip_months: string[]; current_period_end?: string | null; cancel_at_period_end?: boolean }, shipped: string[], now = new Date()): Date | null {
  if (['canceled', 'completed', 'pending'].includes(sub.status)) return null;
  const first = firstIssueMonth(new Date(sub.created_at));
  if (sub.plan === 'single') return shipped.length ? null : first;
  const thisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  // This month's run is still open until the 8th.
  let m = now.getUTCDate() <= 8 ? thisMonth : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  if (m < first) m = first;
  const pausedUntil = sub.paused_until ? new Date(sub.paused_until + 'T00:00:00Z') : null;
  for (let i = 0; i < 24; i++) {
    const key = monthKey(m);
    const paused = pausedUntil && shipBy(m) <= pausedUntil;
    if (!paused && !sub.skip_months.includes(key) && !shipped.includes(key)) {
      if (sub.cancel_at_period_end && sub.current_period_end && shipBy(m) > new Date(sub.current_period_end)) return null;
      return m;
    }
    m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1));
  }
  return null;
}

export type ComicPanel = { shape: 'wide' | 'square' | 'oval' | 'bleed' | 'tall'; scene: string; caption?: string; balloons?: { who: string; text: string }[] };
export type ComicPage = { n: number; section: string; title: string; panels: ComicPanel[]; body?: string[] };
export type ComicIssue = { title: string; month: string; monthLabel: string; issueNumber: number; reader: string; signs: { sun: string; moon: string | null; rising: string | null }; mainEvent: string; pages: ComicPage[] };

const THEME: Record<string, string> = { sun: 'who you are becoming', moon: 'what you need to feel safe', mercury: 'how you think and talk', venus: 'what and whom you love', mars: 'what you go after', jupiter: 'where you grow', saturn: 'what you are building', uranus: 'where you want freedom', neptune: 'what you dream', pluto: 'what you are ready to change', asc: 'how you meet the world', mc: 'your public path' };
const HOUSE_FOCUS: [string, string][] = [
  ['Self & first impressions', 'your body, your style and how you begin things'], ['Money & worth', 'income, possessions and what you value about yourself'], ['Words & neighborhood', 'siblings, short trips, messages and daily learning'],
  ['Home & roots', 'where you live, family patterns and private life'], ['Joy & creation', 'romance, play, children and creative risks'], ['Work & health', 'routines, chores, service and your body’s needs'],
  ['Partnership', 'close one-to-one relationships and agreements'], ['Shared resources & depth', 'intimacy, debts, inheritance and trust'], ['Horizons', 'travel, study, beliefs and big-picture meaning'],
  ['Career & reputation', 'your public role, goals and recognition'], ['Friends & future', 'groups, community and long-range hopes'], ['Rest & the unseen', 'solitude, endings, dreams and inner work'],
];
const CONSTELLATION: Record<string, [string, string]> = {
  Aries: ['Hamal', 'The golden ram that carried Phrixus to safety, whose fleece the Argonauts later sailed to find.'],
  Taurus: ['Aldebaran', 'The white bull Zeus became to carry Europa across the sea; the Pleiades ride on its shoulder.'],
  Gemini: ['Pollux', 'Castor and Pollux, twins who chose to share one immortality rather than be parted.'],
  Cancer: ['Tarf', 'The crab Hera sent against Heracles — small, stubborn and placed in the sky for its loyalty.'],
  Leo: ['Regulus', 'The Nemean lion, whose hide no blade could pierce, set among the stars after its great fight.'],
  Virgo: ['Spica', 'The maiden holding a sheaf of wheat — Astraea, the last immortal to leave the earth.'],
  Libra: ['Zubeneschamali', 'The scales of justice, once the claws of the Scorpion, weighing what is fair.'],
  Scorpio: ['Antares', 'The scorpion that fought Orion; the two are placed on opposite sides of the sky.'],
  Sagittarius: ['Kaus Australis', 'The centaur archer aiming at the heart of the Scorpion and the center of the galaxy.'],
  Capricorn: ['Deneb Algedi', 'The sea-goat — half climber, half swimmer — linked to Pan and to Amalthea who nursed Zeus.'],
  Aquarius: ['Sadalsuud', 'Ganymede the water-bearer, pouring a stream that flows toward the Southern Fish.'],
  Pisces: ['Alpherg', 'Aphrodite and Eros, who became two fish tied by a cord to escape the monster Typhon.'],
};
const ELEMENT: Record<string, string> = { Aries: 'fire', Leo: 'fire', Sagittarius: 'fire', Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth', Gemini: 'air', Libra: 'air', Aquarius: 'air', Cancer: 'water', Scorpio: 'water', Pisces: 'water' };

const signOf = (c: ChartResult, key: string) => c.bodies.find(b => b.key === key)?.sign ?? null;
const DAY = 864e5;
const fmtDay = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/** Moon phases (new, first quarter, full, last quarter) within a month, with the Moon's sign. */
export function lunarCalendar(month: Date) {
  const end = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));
  const names = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'];
  const out: { date: Date; name: string; sign: string }[] = [];
  let t = Astronomy.MakeTime(new Date(month.getTime() - DAY));
  for (let guard = 0; guard < 8; guard++) {
    const q = Astronomy.SearchMoonQuarter(t);
    const d = q.time.date;
    if (d >= end) break;
    if (d >= month) out.push({ date: d, name: names[q.quarter], sign: fmtLon(eclLon(Astronomy.Body.Moon, d)).sign });
    t = Astronomy.MakeTime(new Date(d.getTime() + DAY));
  }
  return out;
}

/** Planets retrograde at any point in the month, with the dates they station. */
export function monthRetrogrades(month: Date) {
  const days = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
  const series = Array.from({ length: days }, (_, i) => transitPositions(new Date(month.getTime() + i * DAY + DAY / 2)));
  return series[0].filter(p => !['sun', 'moon'].includes(p.key)).map(p => {
    const flags = series.map(s => s.find(x => x.key === p.key)!.retro);
    if (!flags.some(Boolean)) return null;
    const station = flags.findIndex((f, i) => i > 0 && f !== flags[i - 1]);
    const at = series[Math.max(0, flags.indexOf(true))].find(x => x.key === p.key)!;
    return { key: p.key, name: p.name, sign: at.sign, whole: flags.every(Boolean), stationDay: station > 0 ? new Date(month.getTime() + station * DAY) : null, turnsRetro: station > 0 ? flags[station] : null };
  }).filter((x): x is NonNullable<typeof x> => !!x);
}

const story = (ev: TransitEvent | undefined, natal: ChartResult): { headline: string; transitKey: string; natalKey: string; aspect: string } => {
  if (!ev) {
    const sun = natal.bodies.find(b => b.key === 'sun')!;
    return { headline: `Sovereign walks the ${sun.sign} road`, transitKey: 'sun', natalKey: 'sun', aspect: 'Conjunction' };
  }
  const tKey = CAST.find(c => ev.title.startsWith(c.planet))?.key ?? 'sun';
  const target = /natal (\w+)/.exec(ev.title)?.[1]?.toLowerCase() ?? 'sun';
  const nKey = target === 'ascendant' ? 'asc' : target === 'midheaven' ? 'mc' : target;
  const aspect = ev.title.includes('☍') ? 'Opposition' : ev.title.includes('□') ? 'Square' : ev.title.includes('△') ? 'Trine' : ev.title.includes('⚹') ? 'Sextile' : 'Conjunction';
  return { headline: ev.title.replace(/ [☌☍△□⚹] natal /, ' meets your '), transitKey: tKey, natalKey: nKey, aspect };
};
const ASPECT_STORY: Record<string, [string, string]> = {
  Conjunction: ['They arrive at the same door at the same moment.', 'Two voices, one decision: what you start now carries both of their signatures.'],
  Opposition: ['They stand on opposite banks of a river of stars.', 'Neither has to win. The bridge is built from the part of each that is true.'],
  Square: ['Their paths cross at a hard right angle.', 'The friction is the point — it shows you exactly where effort will pay off.'],
  Trine: ['A current carries one straight to the other.', 'The help is already here. The only task is to notice it and say yes.'],
  Sextile: ['A side gate swings open between them.', 'An opportunity, not a guarantee: it rewards the first small step.'],
};

/** Build the 24-page issue plan for one reader and one month. Deterministic: same chart + month = same issue. */
export function buildComicIssue(natal: ChartResult, opts: { reader: string; month: Date; issueNumber: number }): ComicIssue {
  const { reader, month, issueNumber } = opts;
  const first = reader.trim().split(/\s+/)[0] || 'Reader';
  const label = monthLabel(month);
  const days = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
  const sun = signOf(natal, 'sun')!;
  const timed = !!natal.input.time;
  const moon = timed ? signOf(natal, 'moon') : signOf(natal, 'moon');
  const rising = natal.asc != null && timed ? fmtLon(natal.asc).sign : null;
  const events = upcomingEvents(natal, month, days).filter(e => e.date.getUTCMonth() === month.getUTCMonth());
  const exact = events.filter(e => e.kind === 'exact').sort((a, b) => b.weight - a.weight);
  const main = story(exact[0], natal);
  const tc = castOf(main.transitKey) ?? CAST[0];
  const nc = castOf(main.natalKey);
  const natalName = nc ? `your ${nc.name}` : main.natalKey === 'asc' ? 'the guardian of your Rising sign' : 'the keeper of your Midheaven';
  const [setup, turn] = ASPECT_STORY[main.aspect];
  const mid = new Date(month.getTime() + 14 * DAY);
  const sky = transitPositions(mid);
  const sunNow = sky.find(p => p.key === 'sun')!;
  const solarHouse = natal.cusps && timed ? houseOf(sunNow.lon, natal.cusps) : ((SIGNS.indexOf(sunNow.sign as typeof SIGNS[number]) - SIGNS.indexOf(sun as typeof SIGNS[number]) + 12) % 12) + 1;
  const [houseTitle, houseText] = HOUSE_FOCUS[solarHouse - 1];
  const rx = monthRetrogrades(month);
  const moons = lunarCalendar(month);
  const nextMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));
  const nextEvents = upcomingEvents(natal, nextMonth, 30).filter(e => e.kind !== 'ingress').sort((a, b) => b.weight - a.weight);
  const [star, myth] = CONSTELLATION[sun];
  const signs = { sun, moon, rising };
  const element = ELEMENT[sun];
  const pages: ComicPage[] = [];
  const add = (p: Omit<ComicPage, 'n'>) => pages.push({ n: pages.length + 1, ...p });

  add({ section: 'Cover', title: `${first}’s Sky · ${label}`, panels: [{ shape: 'bleed', scene: `Full-bleed golden-thread constellation of ${sun}. ${tc.name} (${tc.planet}) in the foreground with ${tc.companion}. Title, month and ${SIGN_GLYPH[SIGNS.indexOf(sun as typeof SIGNS[number])]} in the top third.`, caption: `AstroComic · Issue ${issueNumber}` }] });
  add({ section: 'Your Sky This Month', title: 'Where the planets are', panels: [{ shape: 'wide', scene: 'A star-map table with ten small character tokens placed on the zodiac ring.' }], body: sky.map(p => `${p.name} in ${p.sign} ${p.deg}°${p.retro ? ' — retrograde' : ''}`) });
  add({ section: 'Letter from the Stars', title: `Dear ${first},`, panels: [{ shape: 'oval', scene: `Sovereign writing by lamplight, ${moon ? 'Dreamer reading over his shoulder' : 'an owl on the desk'}.` }], body: [
    `This month the sky is busy around ${THEME[main.natalKey] ?? 'your chart'} — ${exact[0] ? `${tc.planet} reaches your natal ${nc?.planet ?? (main.natalKey === 'asc' ? 'Ascendant' : 'Midheaven')}` : `the Sun moves through ${sunNow.sign}`}, and your ${sun} Sun takes it personally, in the best way.`,
    moon ? `Your ${moon} Moon will want ${ELEMENT[moon] === 'water' ? 'quiet and closeness' : ELEMENT[moon] === 'fire' ? 'movement and something to look forward to' : ELEMENT[moon] === 'earth' ? 'routine and something you can touch' : 'conversation and room to think'} — give it that, and the rest gets easier.` : 'Your birth time isn’t saved, so this issue reads your Sun and the planets — add a time later for Moon and Rising spotlights.',
    rising ? `With ${rising} rising, people will notice the change before you mention it.` : 'Take what fits, leave what doesn’t. — The Stars',
  ] });
  const arc: ComicPanel[][] = [
    [{ shape: 'bleed', scene: `${tc.name} sets out across a night city, ${tc.companion} at heel. ${tc.look}.`, caption: `${main.headline}.` }, { shape: 'square', scene: `${natalName} waits at a lit window.`, caption: setup }],
    [{ shape: 'wide', scene: `The two characters meet. ${main.aspect === 'Square' || main.aspect === 'Opposition' ? 'Tension in the frame: a diagonal split panel.' : 'A shared spotlight: one round panel.'}`, balloons: [{ who: tc.name, text: `I came about ${THEME[main.transitKey] ?? 'something important'}.` }, { who: nc?.name ?? 'Guardian', text: `Then you came to the right place — this is about ${THEME[main.natalKey] ?? 'what matters to you'}.` }] }],
    [{ shape: 'tall', scene: `A memory panel in ink-wash: ${first} at a small crossroads from earlier this year — no specifics, just the feeling.`, caption: turn }, { shape: 'square', scene: `${tc.companion} nudges ${first} forward.` }],
    [{ shape: 'bleed', scene: `Dawn. ${tc.name} and ${natalName} walk the same road, the ${element} element glowing in the sky.`, caption: exact[0] ? `Watch for it around ${fmtDay(exact[0].date)} — and the days just before.` : 'Watch for it at mid-month.' }],
  ];
  arc.forEach((panels, i) => add({ section: 'Main Story', title: i === 0 ? main.headline : `${main.headline} (${i + 1})`, panels }));
  const rxBody = rx.length ? rx.map(r => { const c = castOf(r.key); return `${c?.name ?? r.name} (${r.name}) ${r.whole ? 'is retrograde all month' : r.turnsRetro ? `turns retrograde ${fmtDay(r.stationDay!)}` : `turns direct ${fmtDay(r.stationDay!)}`} in ${r.sign} — a purposeful review: ${c?.retro || 'a second look'}.`; }) : ['No planet is retrograde this month — a clear run for starting things.'];
  add({ section: 'Retrograde Watch', title: 'Planets walking backwards', panels: [{ shape: 'wide', scene: rx.length ? `${castOf(rx[0].key)?.name ?? 'Messenger'} walking backwards through an archive, rereading.` : 'Every character facing forward on a clear road.' }], body: rxBody.slice(0, 4) });
  add({ section: 'Retrograde Watch', title: 'Review, not rewind', panels: [{ shape: 'square', scene: 'A desk with drafts being revised in gold ink.' }], body: ['Retrograde periods aren’t bad luck. They are invitations to revisit — the second draft is where the real idea shows.', ...rxBody.slice(4)] });
  const moonBody = moons.map(m => `${fmtDay(m.date)} · ${m.name} in ${m.sign}`);
  add({ section: 'Lunar Calendar', title: 'The Moon this month', panels: [{ shape: 'wide', scene: 'Dreamer turning the phases on a silver wheel.' }], body: moonBody.slice(0, 2) });
  add({ section: 'Lunar Calendar', title: 'Phase by phase', panels: [{ shape: 'wide', scene: 'A row of moon phases along a shoreline.' }], body: [...moonBody.slice(2), moon ? `With your Moon in ${moon}, the ${moons.find(m => m.sign === moon)?.name ?? 'Full Moon'} is your most personal lunar moment.` : 'Use the New Moon to begin and the Full Moon to finish.'] });
  const hBody = [`The Sun spends this month in your ${ordinal(solarHouse)} house: ${houseText}.`, timed ? 'Calculated from your birth time and house system.' : 'Without a birth time, this uses houses counted from your Sun sign.'];
  add({ section: 'House Focus', title: `${ordinal(solarHouse)} house · ${houseTitle}`, panels: [{ shape: 'bleed', scene: `Sovereign lighting the ${ordinal(solarHouse)} room of a twelve-room tower.` }], body: hBody });
  add({ section: 'House Focus', title: 'What lives here', panels: [{ shape: 'square', scene: 'Objects that belong to this house laid on a table.' }, { shape: 'square', scene: `${first} picking one of them up.` }], body: [`Small moves here count double this month. Choose one part of ${houseText.split(',')[0]} to give real attention.`] });
  add({ section: 'House Focus', title: 'Who visits', panels: [{ shape: 'wide', scene: 'Characters knocking on the tower’s doors in turn.' }], body: sky.filter(p => natal.cusps && timed ? houseOf(p.lon, natal.cusps) === solarHouse : p.sign === sunNow.sign).map(p => `${castOf(p.key)?.name ?? p.name} (${p.name}) is here too.`).concat(['The more visitors, the louder the theme.']).slice(0, 4) });
  add({ section: 'House Focus', title: 'Your move', panels: [{ shape: 'oval', scene: `${first} closing a door gently behind them.` }], body: ['Make one promise to yourself in this area of life and keep it small enough to finish this month.'] });
  add({ section: 'The Reading Room', title: `What is a ${main.aspect.toLowerCase()}?`, panels: [{ shape: 'wide', scene: 'Philosopher at a chalkboard drawing angles between planets.' }], body: [readingRoom(main.aspect)] });
  add({ section: 'The Reading Room', title: `Meet ${tc.name}`, panels: [{ shape: 'tall', scene: `A character card for ${tc.name}: ${tc.look}, with ${tc.companion}.` }], body: [`${tc.name} is ${tc.planet} in the AstroComic cast. ${tc.voice}`] });
  const prompts = [
    `Where in ${THEME[main.natalKey] ?? 'your life'} are you ready for a new chapter?`,
    `What would ${tc.name} — ${tc.voice.split(';')[0].toLowerCase()} — tell you to try this month?`,
    `In ${houseText.split(',')[0]}, what is one thing you keep postponing?`,
    rx.length ? `What are you being asked to revisit while ${rx[0].name} is retrograde?` : 'What do you want to start while the sky is clear of retrogrades?',
    moon ? `What does your ${moon} Moon need from you this week?` : 'What helps you feel at home in yourself?',
    `Which ${element} habit — ${element === 'fire' ? 'action, courage, play' : element === 'earth' ? 'rest, routine, craft' : element === 'air' ? 'talking, learning, connecting' : 'feeling, caring, imagining'} — would help most right now?`,
    rising ? `How do you want to show up when people meet your ${rising} Rising this month?` : 'How do you want people to experience you this month?',
    'What would make this month feel well spent when you look back?',
  ];
  add({ section: 'Reflection Prompts', title: 'Questions for you', panels: [{ shape: 'oval', scene: 'Dreamer holding a lantern over an open journal.' }], body: prompts.slice(0, 4) });
  add({ section: 'Reflection Prompts', title: 'More questions', panels: [{ shape: 'oval', scene: 'The journal, pages turning on their own.' }], body: prompts.slice(4) });
  add({ section: 'Your Constellation', title: sun, panels: [{ shape: 'bleed', scene: `The ${sun} constellation in golden thread across a navy sky, brightest star ${star} marked.` }], body: [myth] });
  add({ section: 'Your Constellation', title: `Find ${star}`, panels: [{ shape: 'wide', scene: 'A small figure on a hill pointing up.' }], body: [`${star} is the brightest star in ${sun}. Look for it when the constellation is up at night — or simply know it’s there, behind the daylight, on your birthday.`] });
  const nx = nextEvents[0];
  add({ section: 'Next Month', title: monthLabel(nextMonth), panels: [{ shape: 'wide', scene: nx ? `A silhouette of ${castOf(CAST.find(c => nx.title.startsWith(c.planet))?.key ?? 'sun')?.name ?? 'Sovereign'} at the edge of the frame.` : 'A door left ajar with light behind it.' }], body: [nx ? `Coming up: ${nx.title.replace(/ [☌☍△□⚹] /, ' and ')} around ${fmtDay(nx.date)}.` : 'A quieter month ahead — room to integrate.'] });
  add({ section: 'About Zodaci', title: 'Your chart, any time', panels: [{ shape: 'square', scene: 'QR code to zodaci.com/my-chart beside the Zodaci logo.' }], body: ['Scan to open your full calculated chart, readings and the Results page.', 'AstroComic is a creative reflection on your chart and this month’s sky — not prediction or advice.'] });
  add({ section: 'Back Cover', title: `Issue ${issueNumber} · ${label}`, panels: [{ shape: 'bleed', scene: 'The full cast in silhouette along a horizon of moon phases.' }], body: ['AstroComic by Zodaci'] });

  return { title: `${first}’s Sky · ${label}`, month: monthKey(month), monthLabel: label, issueNumber, reader: first, signs, mainEvent: main.headline, pages };
}

function ordinal(n: number) { return n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`; }
function readingRoom(aspect: string) {
  return {
    Conjunction: 'A conjunction is two planets at the same place in the zodiac. Their themes fuse — you feel them as one thing, which is powerful and sometimes hard to tell apart.',
    Opposition: 'An opposition is two planets 180° apart. It works like a seesaw: awareness comes from feeling both ends and finding the middle.',
    Square: 'A square is two planets 90° apart. It creates pressure that asks for action — the classic engine of growth in a chart.',
    Trine: 'A trine is two planets 120° apart, usually in the same element. It flows easily — a talent that works best when you use it on purpose.',
    Sextile: 'A sextile is two planets 60° apart. It is an open door: helpful, but it asks you to walk through it.',
  }[aspect] ?? '';
}

/** Manifest row for the print queue CSV. */
export function manifestCsv(rows: { name: string; email: string; sun: string; plan: string; status: string; address: Record<string, string>; issue: string; issueStatus: string }[]) {
  const head = ['Name', 'Email', 'Sun sign', 'Plan', 'Subscription status', 'Address line 1', 'Address line 2', 'City', 'State', 'ZIP', 'Country', 'Issue', 'Issue status'];
  const esc = (v: string) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  return [head, ...rows.map(r => [r.name, r.email, r.sun, r.plan, r.status, r.address.line1 ?? '', r.address.line2 ?? '', r.address.city ?? '', r.address.state ?? '', r.address.postal_code ?? '', r.address.country ?? '', r.issue, r.issueStatus])].map(r => r.map(v => esc(String(v))).join(',')).join('\n');
}
