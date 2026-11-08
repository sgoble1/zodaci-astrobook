import { houseOf, type ChartResult } from '@/lib/astro';
import { transitPositions, type TransitEvent } from '@/lib/transitOverlay';

/**
 * Six plain life areas used to group forecasts and to notice what a member keeps writing about. Areas come from
 * traditional house and planet meanings (interpretation); nothing here is inferred about a person's biography.
 */
export type LifeArea = 'self' | 'love' | 'work' | 'home' | 'mind' | 'health';

export const LIFE_AREAS: Record<LifeArea, { label: string; text: string; readings: string[]; module: string }> = {
  self: { label: 'Self & direction', text: 'who you are becoming, confidence and what feels meaningful', readings: ['core-personality', 'core-legacy', 'core-beliefs-travel'], module: 'purpose' },
  love: { label: 'Love & relationships', text: 'partners, closeness, romance and what you value in others', readings: ['love', 'core-self-worth'], module: 'love' },
  work: { label: 'Work & money', text: 'career, reputation, money and the long projects you carry', readings: ['career', 'core-leadership', 'core-work-style'], module: 'mastery' },
  home: { label: 'Home & family', text: 'home, family, roots, rest and your private inner life', readings: ['core-emotions'], module: 'check-in' },
  mind: { label: 'Mind & friendships', text: 'thinking, talking, learning, friends and groups', readings: ['core-friendship', 'core-learning'], module: 'reframe' },
  health: { label: 'Body & daily rhythm', text: 'energy, routine, stress and how you look after yourself', readings: ['core-resilience', 'core-work-style'], module: 'balance' },
};

/** Traditional house → area (each house belongs to exactly one area). */
export const HOUSE_AREA: Record<number, LifeArea> = { 1: 'self', 2: 'work', 3: 'mind', 4: 'home', 5: 'love', 6: 'health', 7: 'love', 8: 'love', 9: 'self', 10: 'work', 11: 'mind', 12: 'home' };
/** Natal point touched by a transit → area. */
export const POINT_AREA: Record<string, LifeArea> = { sun: 'self', asc: 'self', jupiter: 'self', moon: 'home', mercury: 'mind', venus: 'love', mars: 'health', saturn: 'work', mc: 'work' };

const WORDS: Record<LifeArea, RegExp> = {
  self: /\b(purpose|meaning|identity|confiden\w*|myself|direction|faith|belief\w*|spiritual\w*|goal\w*|future|travel\w*|stud(?:y|ying))\b/gi,
  love: /\b(partner\w*|relationship\w*|love|loved|dating|date|marri\w+|husband|wife|boyfriend|girlfriend|romance|romantic|intima\w+|breakup|divorce|crush)\b/gi,
  work: /\b(work|working|job\w*|career|boss|manager|money|business|promotion|salary|client\w*|project\w*|deadline\w*|rent|debt|bills?|coworker\w*|interview\w*)\b/gi,
  home: /\b(home|family|mom|mum|mother|dad|father|parent\w*|kids?|children|house|moving|roots|childhood|grandm\w+|grandf\w+)\b/gi,
  mind: /\b(friend\w*|talk\w*|conversation\w*|school|learn\w*|writ(?:e|ing)|ideas?|sibling\w*|brother\w*|sister\w*|group\w*|community|social)\b/gi,
  health: /\b(tired|sleep\w*|energy|health\w*|body|exercis\w*|stress\w*|anxious|anxiety|sick|pain|eat\w*|food|routine\w*|burn(?:ed|t)? ?out|workout|gym)\b/gi,
};

/**
 * The member's top life areas from their own writing: simple keyword counts, no AI. An area needs at least two
 * mentions to count. Returns up to `max` areas, most mentioned first.
 */
export function detectPatterns(texts: string[], max = 3): { area: LifeArea; hits: number }[] {
  const all = texts.join('\n');
  return (Object.keys(WORDS) as LifeArea[])
    .map(area => ({ area, hits: (all.match(WORDS[area]) ?? []).length }))
    .filter(x => x.hits >= 2)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, max);
}

/**
 * Which life area a forecast event belongs to: the natal point an exact contact touches, otherwise (timed charts only)
 * the natal house the moving planet stands in that day. General sky events in an untimed chart have no area.
 */
export function eventArea(event: Pick<TransitEvent, 'natalKey' | 'planet' | 'date'>, chart: ChartResult): LifeArea | null {
  if (event.natalKey && POINT_AREA[event.natalKey]) return POINT_AREA[event.natalKey];
  if (!event.planet || !chart.input.time || !chart.cusps) return null;
  const at = transitPositions(event.date).find(p => p.key === event.planet);
  return at ? HOUSE_AREA[houseOf(at.lon, chart.cusps)] : null;
}
