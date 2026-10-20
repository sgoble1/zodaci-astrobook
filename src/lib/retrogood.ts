import type { ChartResult, BodyPos } from '@/lib/astro';
import { TRAD_RULER } from '@/lib/advancedDeductions';

/** RetroGOOD per-planet engine (spec 2.2): dignity, tier, 0–100 score, six-part narrative and compound patterns. Deterministic. */
export type Dignity = 'domicile' | 'exaltation' | 'domicile+exaltation' | 'peregrine' | 'fall' | 'detriment' | 'detriment+fall';
export type RgTier = 'Amplified' | 'Internalized' | 'Refined' | 'Karmic';
export const TIER_RANGE: Record<RgTier, [number, number]> = { Amplified: [80, 100], Internalized: [60, 79], Refined: [40, 59], Karmic: [0, 39] };
export const TIER_GLYPH: Record<RgTier, string> = { Amplified: '✦', Internalized: '◈', Refined: '◇', Karmic: '☽' };
export const TIER_OPENING: Record<RgTier, (planet: string) => string> = {
  Amplified: p => `You carry a rare gift — a ${p} that has been turned inward by the cosmos and forged into something extraordinary.`,
  Internalized: () => 'You process before you pronounce — and that is precisely your power.',
  Refined: () => 'Your challenges forged your craft. This planet did not come easily — and that difficulty is exactly why it is so precise.',
  Karmic: () => 'This is ancient work — carried across time, arriving here in your hands to finally be completed.',
};

// Appendix A.1 essential dignity table (modern rulers for the outer planets)
const D: Record<string, { dom: string[]; ex: string[]; det: string[]; fall: string[] }> = {
  sun: { dom: ['Leo'], ex: ['Aries'], det: ['Aquarius'], fall: ['Libra'] },
  moon: { dom: ['Cancer'], ex: ['Taurus'], det: ['Capricorn'], fall: ['Scorpio'] },
  mercury: { dom: ['Gemini', 'Virgo'], ex: ['Virgo'], det: ['Sagittarius', 'Pisces'], fall: ['Pisces'] },
  venus: { dom: ['Taurus', 'Libra'], ex: ['Pisces'], det: ['Scorpio', 'Aries'], fall: ['Virgo'] },
  mars: { dom: ['Aries', 'Scorpio'], ex: ['Capricorn'], det: ['Libra', 'Taurus'], fall: ['Cancer'] },
  jupiter: { dom: ['Sagittarius', 'Pisces'], ex: ['Cancer'], det: ['Gemini', 'Virgo'], fall: ['Capricorn'] },
  saturn: { dom: ['Capricorn', 'Aquarius'], ex: ['Libra'], det: ['Cancer', 'Leo'], fall: ['Aries'] },
  uranus: { dom: ['Aquarius'], ex: ['Scorpio'], det: ['Leo'], fall: ['Taurus'] },
  neptune: { dom: ['Pisces'], ex: ['Cancer'], det: ['Virgo'], fall: ['Capricorn'] },
  pluto: { dom: ['Scorpio'], ex: ['Aries'], det: ['Taurus'], fall: ['Libra'] },
};
export function dignityOf(key: string, sign: string): Dignity {
  const t = D[key]; if (!t) return 'peregrine';
  const dom = t.dom.includes(sign), ex = t.ex.includes(sign), det = t.det.includes(sign), fall = t.fall.includes(sign);
  if (dom && ex) return 'domicile+exaltation';
  if (dom) return 'domicile'; if (ex) return 'exaltation';
  if (det && fall) return 'detriment+fall';
  if (det) return 'detriment'; if (fall) return 'fall';
  return 'peregrine';
}
const BASE: Record<Dignity, number> = { 'domicile+exaltation': 96, domicile: 92, exaltation: 88, peregrine: 70, fall: 50, detriment: 34, 'detriment+fall': 26 };
export const tierOf = (d: Dignity): RgTier => d.startsWith('domicile') || d === 'exaltation' ? 'Amplified' : d === 'peregrine' ? 'Internalized' : d === 'fall' ? 'Refined' : 'Karmic';

const GOVERNS: Record<string, string> = { mercury: 'thought, speech, learning and how you make sense of things', venus: 'love, pleasure, beauty and what you value', mars: 'drive, desire, courage and how you act', jupiter: 'growth, faith, meaning and opportunity', saturn: 'structure, discipline, time and responsibility', uranus: 'freedom, originality and sudden change', neptune: 'imagination, compassion and the spiritual', pluto: 'power, depth and transformation', chiron: 'the wound that becomes the gift of healing others' };
const SIGN_MODE: Record<string, string> = { Aries: 'with directness and courage', Taurus: 'slowly, sensually and steadily', Gemini: 'through curiosity and many channels at once', Cancer: 'through feeling, memory and protection', Leo: 'through warmth, pride and self-expression', Virgo: 'through precision, analysis and craft', Libra: 'through balance, fairness and relationship', Scorpio: 'through intensity, privacy and depth', Sagittarius: 'through exploration, belief and candour', Capricorn: 'through patience, ambition and structure', Aquarius: 'through independence, ideas and the collective', Pisces: 'through intuition, empathy and dissolving boundaries' };
const HOUSE_ASK = ['', 'asks you to wear it as identity', 'asks you to turn it into resources and self-worth', 'asks you to use it in daily conversation and learning', 'asks you to root it in home and family', 'asks you to create, play and love with it', 'asks you to make it a daily craft', 'asks you to bring it into partnership', 'asks you to take it into shared depths and transformation', 'asks you to build a philosophy with it', 'asks you to make it your public work', 'asks you to share it with friends and community', 'asks you to work with it in solitude and the unseen'];
const GIFT: Record<string, string> = { mercury: 'a mind that processes everything twice and misses very little', venus: 'a love that knows its own value and chooses deliberately', mars: 'action that is planned, strategic and hard to derail', jupiter: 'a personal faith built from your own experience rather than borrowed belief', saturn: 'self-discipline that becomes character rather than rule', uranus: 'an inner revolution that changes how you see before it changes what you do', neptune: 'imagination with depth and a direct line to the unseen', pluto: 'the ability to transform yourself from the inside out', chiron: 'the hard-won capacity to help others heal what you healed in yourself' };
const SHADOW: Record<string, string> = { mercury: 'You may over-analyse or hold back insights until they feel perfect.', venus: 'You may revisit old loves or hesitate to say what you want.', mars: 'You may swallow anger or wait too long to act.', jupiter: 'You may doubt your luck or keep your wisdom private.', saturn: 'Your inner critic can be harsher than anyone else would be.', uranus: 'Change can build silently until it breaks out all at once.', neptune: 'Dreams can blur into escape when life feels heavy.', pluto: 'You may keep intense feelings sealed away for too long.', chiron: 'You may expect the old hurt to repeat before it does.' };
const PRACTICE: Record<string, string> = { mercury: 'Write before you speak; your second draft is your real voice.', venus: 'Name what you value out loud before you agree to anything.', mars: 'Give your energy a plan, then a deadline.', jupiter: 'Keep a record of what has actually worked for you and trust it.', saturn: 'Set standards you would accept from someone you respect, not stricter.', uranus: 'Make small, regular changes so pressure never needs to explode.', neptune: 'Anchor inspiration in a daily practice — art, music, prayer or nature.', pluto: 'Choose one trusted person or page to let the depths out.', chiron: 'Share what you have learned with someone a step behind you.' };
const AFFIRM: Record<string, string> = { mercury: 'My mind goes where others do not dare, and returns with truth.', venus: 'I am worthy of the love I choose.', mars: 'I am strength held with purpose.', jupiter: 'I am my own source of meaning.', saturn: 'I am the architecture and the architect. I build from the inside.', uranus: 'I am free, and I change on my own terms.', neptune: 'I am a channel for beauty and compassion.', pluto: 'I am renewed by everything I move through.', chiron: 'I am the healer my younger self needed.' };
const DIGNITY_TEXT: Record<Dignity, (p: string, s: string) => string> = {
  'domicile+exaltation': (p, s) => `${p} both rules and is exalted in ${s}`,
  domicile: (p, s) => `${p} rules ${s}`, exaltation: (p, s) => `${p} is exalted in ${s}`,
  peregrine: (p, s) => `${p} is neither strengthened nor weakened in ${s}`,
  fall: (p, s) => `${p} is in its fall in ${s}`, detriment: (p, s) => `${p} is in detriment in ${s}`,
  'detriment+fall': (p, s) => `${p} is in both detriment and fall in ${s}`,
};

export type RetroPlanet = { key: string; name: string; glyph: string; sign: string; degree: string; house: number | null; dignity: Dignity; tier: RgTier; score: number; narrative: { context: string; label: string; opening: string; gift: string; shadow: string; integration: string; affirmation: string } };
const RX_KEYS = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron'];
const PERSONAL = ['mercury', 'venus', 'mars'];
const OUTER = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

export function retroPlanets(c: Pick<ChartResult, 'bodies' | 'asc'>): RetroPlanet[] {
  const ascSign = c.asc != null ? Math.floor((((c.asc % 360) + 360) % 360) / 30) : null;
  const ruler = ascSign != null ? TRAD_RULER[ascSign] : null;
  return c.bodies.filter(b => RX_KEYS.includes(b.key) && b.retro).map((b: BodyPos) => {
    const dignity = dignityOf(b.key, b.sign); const tier = tierOf(dignity);
    const [lo, hi] = TIER_RANGE[tier];
    const score = Math.max(lo, Math.min(hi, BASE[dignity] + ([1, 4, 7, 10].includes(b.house ?? 0) ? 2 : 0) + (ruler === b.key ? 2 : 0)));
    const name = b.name; const house = b.house;
    const context = `${name} governs ${GOVERNS[b.key]}. In ${b.sign} it works ${SIGN_MODE[b.sign]}${house ? `, and in your ${house}${['th', 'st', 'nd', 'rd'][house % 10 > 3 || [11, 12, 13].includes(house) ? 0 : house % 10]} house it ${HOUSE_ASK[house]}` : ''}. ${DIGNITY_TEXT[dignity](name, b.sign)}, and because it was retrograde at your birth this energy is processed inwardly before it is shown.`;
    return { key: b.key, name, glyph: b.glyph, sign: b.sign, degree: `${b.deg}°${String(b.min).padStart(2, '0')}′`, house, dignity, tier, score,
      narrative: { context, label: `This is ${tier}. Score: ${score}.`, opening: TIER_OPENING[tier](name), gift: `Your gift is ${GIFT[b.key]}.`, shadow: SHADOW[b.key], integration: `${PRACTICE[b.key]} ${tier === 'Karmic' ? 'Treat difficulty here as unfinished business you are equipped to complete, not as a flaw.' : tier === 'Refined' ? 'The friction you feel here is sharpening a skill few people have.' : tier === 'Amplified' ? 'Trust that your inner processing is a feature, not a delay.' : 'Give yourself time to process; your considered answer is the strong one.'}`, affirmation: AFFIRM[b.key] } };
  }).sort((a, b) => b.score - a.score);
}

export type RxPattern = { name: string; label: string; text: string };
export function retroPatterns(c: Pick<ChartResult, 'bodies'>, rx: RetroPlanet[], handleKey?: string | null): RxPattern[] {
  const keys = new Set(rx.map(r => r.key)); const out: RxPattern[] = [];
  const bySign = new Map<string, number>(), byHouse = new Map<number, number>();
  rx.forEach(r => { bySign.set(r.sign, (bySign.get(r.sign) ?? 0) + 1); if (r.house) byHouse.set(r.house, (byHouse.get(r.house) ?? 0) + 1); });
  if ([...bySign.values(), ...byHouse.values()].some(n => n >= 3)) out.push({ name: 'Retrograde Stellium', label: 'The Internal Architect', text: 'Three or more retrograde planets share a sign or house: profound inward orientation and world-building through private mastery in one life area.' });
  if (handleKey && keys.has(handleKey)) out.push({ name: 'Retrograde Handle', label: 'The Inward Focal Point', text: 'The handle planet of your Bucket chart is retrograde: the chart’s driving force faces inward, and purpose is fulfilled through introspective integration.' });
  if (keys.has('mercury') && keys.has('saturn')) out.push({ name: 'Mercury–Saturn Rx Double', label: 'The Deep Thinker', text: 'Mercury and Saturn are both retrograde: structural thinking and slow-release wisdom. Ideas take time to arrive, but they arrive with weight.' });
  if (OUTER.filter(k => keys.has(k)).length >= 2) out.push({ name: 'Outer Planet Rx Cluster', label: 'Generational Internalization', text: 'Two or more outer planets are retrograde: collective themes are processed through you personally, giving an unusual perspective on society’s structures.' });
  if (PERSONAL.every(k => keys.has(k))) out.push({ name: 'Personal Planet Rx Trio', label: 'The Refiner', text: 'Mercury, Venus and Mars are all retrograde: mind, desire and action are all internalized, an extremely rare pattern of deep self-authority.' });
  return out;
}
