/**
 * Topic-led menu for Shane's and Zac's editions: every chapter sits under one plain life topic
 * (like April's menu), in a fixed order. Nothing is dropped — unmatched chapters land in "More chapters".
 */
export type TopicChapter = { id: string; label: string; title?: string; part?: string };

export const FOUNDER_TOPICS: { label: string; match: RegExp }[] = [
  { label: 'Start Here', match: /overview|quick reference|at a glance|contents|series|introduction|profile|letter|synthesis|foundation/i },
  { label: 'Past Lives & Karma', match: /past li|karm|soul contract|south node|node axis|reincarnat|ancestral|dharma/i },
  { label: 'Love & Relationships', match: /love|relationship|soulmate|synastry|venus|attraction|attachment|partner|seventh|7th|flags|marriage|intimacy|sexual/i },
  { label: 'Family & Brotherhood', match: /family|brother|shane|zac\b|father|mother|sibling|pet|animal bond|home|fourth|4th/i },
  { label: 'Career, Money & Purpose', match: /career|money|wealth|financ|vocation|calling|purpose|mission|legacy|midheaven|tenth|10th|second house|2nd|influence|charisma|magnetism/i },
  { label: 'Shadow Work & Healing', match: /shadow|healing|chiron|pluto|saturn|wound|warning|outsider|hidden|eighth|8th|twelfth|12th/i },
  { label: 'Health & Daily Life', match: /health|wellness|nutrition|t1d|body|ritual|routine|daily|sixth|6th/i },
  { label: 'Mind & Personality', match: /personality|mind|mercury|identity|emotion|moon|sun|ascendant|rising|aries|cancer|leo|capricorn/i },
  { label: 'Spiritual Gifts', match: /spirit|intuition|neptune|dream|tarot|chakra|affirmation/i },
  { label: 'Timing & Forecasts', match: /timeline|transit|forecast|progress|profection|return|retrograde|eclipse|year|month|20\d\d|phase|predict|next|cycle|30\/60/i },
  { label: 'World Systems', match: /vedic|jyotish|nakshatra|dasha|navamsa|sidereal|ba ?zi|chinese|pillar|maya|tzolk|tibet|nine star|numerolog|feng|culture|tradition|celtic/i },
  { label: 'Stars, Degrees & Points', match: /star|sabian|degree|arabic|lot|midpoint|aspect|asteroid|lilith|vertex|house|temple|planet/i },
];
export const MORE_TOPIC = 'More chapters';

/** Groups chapters by topic in FOUNDER_TOPICS order; each chapter appears exactly once. */
export function groupChaptersByTopic<T extends TopicChapter>(chapters: T[], label: (c: T) => string): { label: string; items: T[] }[] {
  const buckets = new Map<string, T[]>();
  for (const c of chapters) {
    const text = `${label(c)} ${c.title ?? ''} ${c.label}`;
    const topic = FOUNDER_TOPICS.find(t => t.match.test(label(c)))?.label ?? FOUNDER_TOPICS.find(t => t.match.test(text))?.label ?? MORE_TOPIC;
    buckets.set(topic, [...(buckets.get(topic) ?? []), c]);
  }
  return [...FOUNDER_TOPICS.map(t => t.label), MORE_TOPIC].filter(l => buckets.has(l)).map(l => ({ label: l, items: buckets.get(l)! }));
}
