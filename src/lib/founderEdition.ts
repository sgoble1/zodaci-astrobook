export const SHANE_EMAILS = ['shanegoble@gmail.com', 'shanealecompte@gmail.com'];
export const isShaneAccount = (email?: string | null) => SHANE_EMAILS.includes((email ?? '').toLowerCase());
export const originalAprilView = (email: string | null | undefined, requested: string | null) => !isShaneAccount(email) || requested === 'april';

export type ArchiveEntry = { id: string; label: string; title: string; part: string; words: number; sections: string[]; excerpt: string };
const MATCH: Record<string, RegExp> = {
  planets: /sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|chiron|node|ascendant|midheaven/i,
  houses: /house|life architecture/i, aspects: /aspect|midpoint|arabic|sabian|fixed star/i,
  'big-three': /sun|moon|ascendant|natal.*foundation/i, 'chart-shape': /pattern|stellium|balance|locomotive/i,
  purpose: /purpose|mission|dharma|spiritual path|north node/i, love: /venus|relationship|compatib|partner|attachment/i,
  career: /career|midheaven|vocation|influence/i, money: /financ|wealth|money|resource/i,
  mind: /mercury|communicat|mind|thinking/i, health: /health|wellness|nutrition|exercise|body/i,
  'family-home': /home|pluto|fourth house|4th house/i, 'recurring-themes': /aspect|synthesis|pattern|shadow/i,
  obstacles: /saturn|shadow|challenge|warning/i, 'shadow-work': /shadow|chiron|healing|integration/i,
  'past-lives': /past li|karmic|south node/i, 'spiritual-gifts': /spirit|neptune|intuition|dream/i,
  practices: /ritual|practice|affirmation|action plan|journal/i, numerology: /numerolog/i,
  timing: /timeline|phase|retrograde|eclipse|return|timing|2026/i, 'sex-attraction': /venus|mars|intimacy|relationship/i,
  'core-personality': /sun|ascendant|synthesis/i, 'core-emotions': /moon|emotion/i,
  'core-friendship': /friend|community|eleventh|11th|jupiter/i, 'core-creativity': /creativ|fifth|5th|leo/i,
  'core-work-style': /routine|sixth|6th|health|career/i, 'core-leadership': /sun|midheaven|magnetism|influence/i,
  'core-self-worth': /chiron|confidence|second|2nd|venus/i, 'core-resilience': /shadow|saturn|healing/i,
  'core-learning': /mercury|jupiter|ninth|9th|philosoph/i, 'core-beliefs-travel': /ninth|9th|sagittarius|spiritual/i,
  'core-freedom-change': /uranus|change|outsider/i, 'core-legacy': /midheaven|legacy|mission|synthesis/i,
  'sys-vedic': /vedic|jyotish|nakshatra|dasha/i, 'sys-chinese': /bazi|chinese|four pillars/i,
  'sys-mayan-tzolkin': /mayan|maya|tzolkin/i, 'sys-tibetan-mewa': /tibetan|mewa/i,
  'sys-nine-star-ki': /nine star|japanese/i, 'sys-chaldean-numerology': /numerolog|chaldean/i,
  'sys-tarot-birth-cards': /tarot/i, 'sys-celtic-tree-calendar': /celtic|tree|nature/i,
};
export function chaptersForTheme(entries: ArchiveEntry[], theme: string) {
  const matcher = MATCH[theme] ?? MATCH.practices;
  return entries.filter(e => matcher.test([e.title, e.label, ...e.sections].join(' ')));
}
export function angularDifference(a: number, b: number) { return Math.abs(((a - b + 540) % 360) - 180); }
/** April's menu sections in order of purpose; unrecognised sections keep their order at the end. Nothing is removed. */
const FOUNDER_ORDER: RegExp[] = [/begin|home|start/i, /natal|chart|planet/i, /house|life area|architecture/i, /timing|cycle|timeline|retrograde/i, /other system|feng|kua|numerolog|bagua/i, /masterbook|compendium|library|archive|read/i, /shared|relationship/i, /workbook|counsel|reflect/i];
export function orderFounderGroups<T extends { title: string }>(groups: T[]): T[] {
  const rank = (t: string) => { const i = FOUNDER_ORDER.findIndex(r => r.test(t)); return i < 0 ? FOUNDER_ORDER.length : i; };
  return groups.map((g, i) => ({ g, i, r: rank(g.title) })).sort((a, b) => a.r - b.r || a.i - b.i).map(x => x.g);
}


/** Where a page sits in April's own menu: its section, the section's first page, and the next pages to read. */
export function founderPlace(groups: { title: string; items: { to: string; label: string }[] }[], path: string) {
  for (const g of groups) {
    const i = g.items.findIndex(it => it.to === path);
    if (i < 0) continue;
    const ring = [...g.items.slice(i + 1), ...g.items.slice(0, i)].filter(it => it.to !== path);
    return { section: g.title, home: g.items[0], label: g.items[i].label, next: ring.slice(0, 3) };
  }
  return null;
}

/** In classic view, a page from April's own menu that the member menu doesn't list: tell her it lives in her full edition. */
export function onlyInFullEdition(groups: { title: string; items: { to: string; label: string }[] }[], path: string, memberListed: boolean): boolean {
  return !memberListed && founderPlace(groups, path) !== null;
}
