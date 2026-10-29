import * as Astronomy from 'astronomy-engine';
import { computeChart, eclLon, fmtLon, SIGNS, type ChartInput, type ChartResult } from '@/lib/astro';
import { balance, houseAnalysis, placementText, aspectText, ordinal } from '@/lib/resultsEngine';
import { retroPlanets, retroPatterns } from '@/lib/retrogood';
import { perceive, narrative } from '@/lib/perception';
import { chartAffirmations } from '@/lib/affirmations';
import { upcomingEvents } from '@/lib/transitOverlay';
import { interAspects, scoreSummary } from '@/lib/synastry';

/** A manuscript chapter. `draw` asks the composer to draw a figure page instead of (or before) text. */
export type BookChapter = { title: string; content: string; draw?: 'wheel' | 'grid' | 'certificate' | 'volume' };
export type Person = { name: string; chart: ChartResult };

const norm = (x: number) => ((x % 360) + 360) % 360;
const sign = (c: ChartResult, key: string) => c.bodies.find(b => b.key === key)?.sign;
const body = (c: ChartResult, key: string) => c.bodies.find(b => b.key === key);
const risingSign = (c: ChartResult) => c.asc != null ? SIGNS[Math.floor(norm(c.asc) / 30)] : null;

const PHASES: [string, string][] = [
  ['New Moon', 'Born under a New Moon, you tend to start things by instinct before the plan is clear. Your life often feels like a series of fresh beginnings, and your best work comes from trusting the first spark.'],
  ['Waxing Crescent', 'Born under a Waxing Crescent, you carry the energy of something pushing up through the soil. You grow by persisting through early doubt and by protecting new ideas until they are strong enough to be seen.'],
  ['First Quarter', 'Born under a First Quarter Moon, you meet life through decisive action. Obstacles tend to sharpen you, and you are at your best when there is something concrete to build or overcome.'],
  ['Waxing Gibbous', 'Born under a Waxing Gibbous Moon, you are a refiner. You notice what is almost right and keep adjusting until it is, and you grow through study, practice and patient improvement.'],
  ['Full Moon', 'Born under a Full Moon, the Sun and Moon faced each other when you arrived. Relationships act as your mirror, and much of your growth comes from balancing what you want with what others need.'],
  ['Disseminating', 'Born under a Disseminating (waning gibbous) Moon, you are a natural sharer. What you learn wants to be passed on, and you often find meaning by teaching, writing or explaining.'],
  ['Last Quarter', 'Born under a Last Quarter Moon, you are wired to question old structures and keep only what still works. Turning points are familiar to you, and you grow by letting go with intention.'],
  ['Balsamic', 'Born under a Balsamic Moon, the last sliver before the New Moon, you carry an inward, visionary quality. You often sense what is coming next and do your deepest work quietly, close to endings and beginnings.'],
];
export function moonPhase(c: ChartResult) {
  const sun = body(c, 'sun')!.lon, moon = body(c, 'moon')!.lon;
  const angle = norm(moon - sun);
  const [name, text] = PHASES[Math.floor(angle / 45) % 8];
  return { angle, name, text, illumination: Math.round((1 - Math.cos(angle * Math.PI / 180)) / 2 * 100) };
}

const SIGN_IMAGE: Record<string, string> = {
  Aries: 'a struck match', Taurus: 'a field after rain', Gemini: 'two birds on one wire', Cancer: 'a lamp left on at home', Leo: 'a hearth fire', Virgo: 'a careful hand sorting seed',
  Libra: 'a held balance', Scorpio: 'a deep, still well', Sagittarius: 'an arrow over open country', Capricorn: 'a mountain path', Aquarius: 'a window thrown open', Pisces: 'the tide coming in',
};
export function birthVerse(c: ChartResult, name: string) {
  const s = sign(c, 'sun')!, m = sign(c, 'moon')!, r = risingSign(c);
  const lines = [
    `When ${name || 'you'} arrived, the Sun stood in ${s}:`,
    `${SIGN_IMAGE[s]}, steady at the center.`,
    `The Moon kept ${m} close —`,
    `${SIGN_IMAGE[m]}, the place you return to.`,
    r ? `And at the eastern edge, ${r} was rising:` : 'The rising sign is unknown, so the horizon stays open:',
    r ? `${SIGN_IMAGE[r]}, the door you walk through first.` : 'a door you will name yourself.',
  ];
  return lines.join('\n');
}

export function rulershipSummary(c: ChartResult) {
  const houses = houseAnalysis(c);
  if (!houses.length) return 'Your birth time is unknown, so house rulers cannot be calculated. Every planet’s sign is still exact; add a birth time to unlock this table.';
  return houses.map(h => `House ${h.n} · ${h.sign} on the cusp · ruled by ${h.ruler}${h.rulerSign ? ` in ${h.rulerSign}` : ''}${h.rulerHouse ? `, ${ordinal(h.rulerHouse)} house` : ''}${h.occupants.length ? ` · holds ${h.occupants.map(o => o.name).join(', ')}` : ' · empty'}`).join('\n');
}

const SENSITIVE = ['chiron', 'northNode', 'southNode', 'lilith', 'fortune', 'vertex'];
export function sensitivePoints(c: ChartResult, timeKnown: boolean) {
  return c.bodies.filter(b => SENSITIVE.includes(b.key)).map(b => `## ${b.name} · ${b.sign} ${b.deg}°${b.house ? ` · ${ordinal(b.house)} house` : ''}\n\n${placementText(b, timeKnown)}`).join('\n\n');
}

export function retroChapter(c: ChartResult) {
  const rx = retroPlanets(c);
  if (!rx.length) return 'No personal or outer planet was retrograde when you were born. Your planets express themselves directly and outwardly; when retrograde periods come in the sky, you may feel them as a change of pace rather than a homecoming.';
  const top = rx[0];
  const pats = retroPatterns(c, rx, top.key);
  return [
    `${rx.length} planet${rx.length > 1 ? 's were' : ' was'} retrograde at your birth. Retrograde planets are not broken; they work inward first, then outward.`,
    ...rx.map(r => `## ${r.name} retrograde in ${r.sign} · ${r.tier} · ${r.score}/100\n\n${r.narrative.opening}\n\nGift: ${r.narrative.gift}\n\nShadow: ${r.narrative.shadow}\n\nIntegration: ${r.narrative.integration}\n\n“${r.narrative.affirmation}”`),
    ...pats.map(p => `## Pattern: ${p.name} — ${p.label}\n\n${p.text}`),
  ].join('\n\n');
}

const toLocal = (d: Date, tz: string) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour === '24' ? '00' : p.hour}:${p.minute}` };
};
/** The exact moment the Sun returns to its natal degree on or after `from`. */
export function nextSolarReturn(c: ChartResult, from = new Date()) {
  const target = body(c, 'sun')!.lon;
  const [, mm, dd] = c.input.date.split('-').map(Number);
  let year = from.getUTCFullYear();
  const diff = (d: Date) => ((eclLon(Astronomy.Body.Sun, d) - target + 540) % 360) - 180;
  const find = (y: number) => {
    let lo = new Date(Date.UTC(y, mm - 1, dd) - 3 * 864e5), hi = new Date(lo.getTime() + 6 * 864e5);
    for (let i = 0; i < 40; i++) { const mid = new Date((lo.getTime() + hi.getTime()) / 2); if (diff(mid) < 0) lo = mid; else hi = mid; }
    return hi;
  };
  let when = find(year);
  if (when < from) when = find(++year);
  return when;
}
export function solarReturnChapter(c: ChartResult, timeKnown: boolean, from = new Date()) {
  const when = nextSolarReturn(c, from);
  const local = toLocal(when, c.input.tz);
  const sr = computeChart({ ...c.input, date: local.date, time: local.time } as ChartInput);
  const srRising = sr.asc != null ? SIGNS[Math.floor(norm(sr.asc) / 30)] : null;
  const moon = body(sr, 'moon')!;
  return [
    `Your next solar return — the moment the Sun comes back to ${fmtLon(body(c, 'sun')!.lon).text} — falls on ${when.toLocaleString('en-US', { timeZone: c.input.tz, dateStyle: 'long', timeStyle: 'short' })} (${c.input.tz}), calculated for your birthplace.`,
    `## The year’s Moon\n\nThe Moon will be in ${moon.sign}${moon.house ? `, in the ${ordinal(moon.house)} house of the return chart` : ''}. ${placementText(moon, timeKnown)}`,
    srRising && timeKnown ? `## The year’s Rising sign\n\n${srRising} rises for this solar return. Read it as the tone of the year ahead: the way you will tend to meet new situations until your next birthday.` : '## The year’s Rising sign\n\nBecause your birth time is unknown, the return chart’s Rising sign is not calculated.',
    'Solar returns are usually read for the place you spend your birthday; this preview uses your birthplace.',
  ].join('\n\n');
}

export function letter(c: ChartResult, name: string) {
  const s = sign(c, 'sun'), m = sign(c, 'moon'), r = risingSign(c);
  const insight = perceive(c, !!c.input.time)[0];
  return [
    `Dear ${name || 'reader'},`,
    `This book was written from one moment: the sky over ${c.input.placeLabel} when you were born. Nothing in it was guessed. The positions were calculated, and every interpretation that follows starts from them.`,
    `You were born with the Sun in ${s}, which asks you to grow into ${SIGN_IMAGE[s!]}. Your Moon in ${m} is the part of you that needs ${SIGN_IMAGE[m!]} to feel safe.${r ? ` And ${r} rising is how people first meet you.` : ''}`,
    insight ? `If one thread runs through your chart, it is this: ${insight.text}` : 'Your chart is balanced, so its story is told planet by planet.',
    'Read slowly. Write in the margins. Come back to it on your birthday. Astrology is a language for reflection, not a verdict, and this book is meant to help you think, not tell you who to be.',
    'With care,\nZodaci',
  ].join('\n\n');
}

const ELEMENT_TEXT: Record<string, string> = { Fire: 'Fire brings drive, warmth and the courage to start.', Earth: 'Earth brings patience, practicality and the wish to build things that last.', Air: 'Air brings ideas, conversation and the need for perspective.', Water: 'Water brings feeling, intuition and deep loyalty.' };
const MODE_TEXT: Record<string, string> = { Cardinal: 'Cardinal energy starts things.', Fixed: 'Fixed energy sustains and protects what matters.', Mutable: 'Mutable energy adapts, connects and translates.' };
export function elementChapter(c: ChartResult) {
  const b = balance(c);
  const missing = Object.entries(b.el).filter(([, n]) => n === 0).map(([e]) => e);
  return [
    `Counting the ten planets${c.asc != null ? ' and your Ascendant' : ''}: ${Object.entries(b.el).map(([e, n]) => `${e} ${n}`).join(' · ')}. Modes: ${Object.entries(b.mo).map(([e, n]) => `${e} ${n}`).join(' · ')}.`,
    `## Your strongest element: ${b.dominant}\n\n${ELEMENT_TEXT[b.dominant]} With ${b.dominant} leading, it is the first language your chart speaks.`,
    `## Your strongest mode: ${b.mode}\n\n${MODE_TEXT[b.mode]}`,
    missing.length ? `## Missing ${missing.join(' and ')}\n\nNo planet sits in ${missing.join(' or ')}. That rarely means a lack; more often it is something you seek out in people, places and practices, and can grow deliberately.` : '## No missing element\n\nEvery element is represented, which tends to give you range: more than one way to respond to the same situation.',
  ].join('\n\n');
}

export function relationshipPrimer(c: ChartResult, timeKnown: boolean) {
  const venus = body(c, 'venus')!, mars = body(c, 'mars')!;
  const seventh = houseAnalysis(c)[6];
  return [
    `## Venus in ${venus.sign}\n\n${placementText(venus, timeKnown)}`,
    `## Mars in ${mars.sign}\n\n${placementText(mars, timeKnown)}`,
    seventh ? `## Your 7th house: ${seventh.sign} on the cusp\n\n${seventh.text}` : '## Your 7th house\n\nThe house of partnership needs a birth time. Venus and Mars above still describe how you love and pursue.',
    '## A reflection\n\nThink of two relationships that changed you. Which of these placements did each one bring out?',
  ].join('\n\n');
}

const NODE_AXIS: Record<string, string> = {
  Aries: 'toward independence and self-trust, away from over-relying on others’ approval', Libra: 'toward partnership and fairness, away from going it alone',
  Taurus: 'toward simplicity, stability and self-worth, away from crisis and intensity', Scorpio: 'toward depth, shared power and transformation, away from clinging to comfort',
  Gemini: 'toward curiosity, questions and everyday conversation, away from having to be right', Sagittarius: 'toward meaning, faith and the bigger picture, away from endless detail',
  Cancer: 'toward home, feeling and emotional honesty, away from defining yourself by achievement', Capricorn: 'toward responsibility, structure and earned authority, away from staying safe at home',
  Leo: 'toward creative self-expression and heart, away from hiding in the group', Aquarius: 'toward community, ideals and the future, away from needing the spotlight',
  Virgo: 'toward practical service and daily craft, away from escaping into vagueness', Pisces: 'toward trust, compassion and surrender, away from controlling every detail',
};
export function northNodeChapter(c: ChartResult) {
  const nn = body(c, 'northNode')!, sn = body(c, 'southNode')!;
  return [
    `Your North Node is in ${nn.sign}${nn.house ? ` in the ${ordinal(nn.house)} house` : ''}; your South Node is in ${sn.sign}${sn.house ? ` in the ${ordinal(sn.house)} house` : ''}.`,
    `## The direction of growth\n\nThe Nodes describe a lifelong pull ${NODE_AXIS[nn.sign]}. The South Node is a familiar talent you can lean on; the North Node is the unfamiliar direction that tends to feel most alive once you take it.`,
    `## A practice\n\nOnce this month, choose the ${nn.sign} response on purpose, even if the ${sn.sign} one comes first. Notice what changes.`,
  ].join('\n\n');
}

const MYTHS: Record<string, string> = {
  sun: 'Helios drove the chariot of the Sun across the sky each day; in Rome he became Sol Invictus, the unconquered light.',
  moon: 'Selene drove a silver chariot by night. Artemis and Diana later carried the Moon’s wildness and her protection of the young.',
  mercury: 'Hermes, the messenger with winged sandals, guided travellers and souls, invented the lyre and was patron of trade and tricksters.',
  venus: 'Aphrodite rose from the sea foam at Cyprus. She governed love, beauty and the binding pull between people.',
  mars: 'Ares was the god of battle’s heat; the Roman Mars was also a protector of fields and the father of Rome.',
  jupiter: 'Zeus ruled from Olympus with thunder and law. Jupiter was the sky-father who kept oaths and hospitality sacred.',
  saturn: 'Kronos ruled the Golden Age and devoured time itself; Saturn’s Roman festival, Saturnalia, turned the world upside down for a week.',
  uranus: 'Ouranos was the starry sky that covered the Earth, the first ruler of the heavens before his children rebelled.',
  neptune: 'Poseidon shook the earth and ruled the sea; his kingdom was beautiful, vast and impossible to hold.',
  pluto: 'Hades ruled the underworld and its hidden riches. Persephone’s descent and return gave the world its seasons.',
};
export function mythologyChapter(c: ChartResult) {
  return Object.entries(MYTHS).map(([k, m]) => { const b = body(c, k)!; return `## ${b.name} in ${b.sign}\n\n${m} In your chart this story plays out in ${b.sign}${b.house ? `, in the ${ordinal(b.house)} house` : ''}.`; }).join('\n\n');
}

export function forecastChapter(c: ChartResult, from = new Date()) {
  const events = upcomingEvents(c, from, 365);
  const months = new Map<string, typeof events>();
  events.forEach(e => { const k = e.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: c.input.tz }); months.set(k, [...(months.get(k) ?? []), e]); });
  if (!months.size) return 'No major transits to your chart were found in the next twelve months.';
  return [`The twelve months from ${from.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}, calculated against your natal chart. The most significant contacts each month are listed first.`,
    ...[...months.entries()].slice(0, 12).map(([m, list]) => `## ${m}\n\n${[...list].sort((a, b) => b.weight - a.weight).slice(0, 4).map(e => `${e.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: c.input.tz })} · ${e.title}. ${e.detail}`).join('\n\n')}`)].join('\n\n');
}

export function affirmationsChapter(c: ChartResult) {
  return chartAffirmations(c, c.input.date).slice(0, 12).map((a, i) => `${i + 1}. ${a.text}\n(${a.source})`).join('\n\n');
}

export function synastryChapter(c: ChartResult, people: Person[]) {
  return people.slice(0, 3).map(p => {
    const ia = interAspects(c, p.chart, 'You', p.name);
    const s = scoreSummary(ia);
    return `## You and ${p.name}\n\nHarmony ${s.harmony} · Tension ${s.tension} · Fusion ${s.fusion}\n\n${ia.slice(0, 6).map(x => `${x.aName} ${x.symbol} ${p.name}’s ${x.bName} (${x.orb.toFixed(1)}°): ${x.text}`).join('\n\n')}`;
  }).join('\n\n');
}
