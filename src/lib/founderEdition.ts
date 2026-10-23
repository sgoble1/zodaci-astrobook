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


type FounderLink = { to: string; label: string };
export type FounderGroup = { title: string; items: FounderLink[]; submenus?: { label: string; items: FounderLink[] }[]; footer?: FounderLink[] };
export type FounderPlace = { section: string; home: FounderLink; label: string; parent?: FounderLink; next: FounderLink[] };

/** Main links plus submenu links (in menu order); footer actions only count for matching, never as reading suggestions. */
const readable = (g: FounderGroup) => {
  const seen = new Set<string>();
  return [...g.items, ...(g.submenus ?? []).flatMap(s => s.items)].filter(it => !seen.has(it.to) && seen.add(it.to));
};

/**
 * Where a page sits in April's own menu: its section, the section's first page and the next pages to read.
 * Detail pages (for example a Masterbook chapter) resolve to their closest menu parent. A section with a
 * single page suggests the first page of the following section, so no page is a dead end.
 */
export function founderPlace(groups: FounderGroup[], path: string): FounderPlace | null {
  const nextSectionStart = (gi: number) => {
    for (let k = 1; k < groups.length; k++) { const first = readable(groups[(gi + k) % groups.length])[0]; if (first && first.to !== path) return first; }
    return undefined;
  };
  for (const [gi, g] of groups.entries()) {
    const items = readable(g);
    const i = items.findIndex(it => it.to === path);
    const isFooter = i < 0 && (g.footer ?? []).some(it => it.to === path);
    if (i < 0 && !isFooter) continue;
    const label = i >= 0 ? items[i].label : (g.footer ?? []).find(it => it.to === path)!.label;
    const ring = i >= 0 ? [...items.slice(i + 1), ...items.slice(0, i)] : items;
    const next = ring.filter(it => it.to !== path).slice(0, 3);
    if (!next.length) { const n = nextSectionStart(gi); if (n) next.push(n); }
    return { section: g.title, home: items[0] ?? { to: path, label }, label, next };
  }
  // Closest menu parent for detail routes; '/' never acts as a parent.
  let best: { gi: number; item: FounderLink } | null = null;
  for (const [gi, g] of groups.entries()) for (const it of [...readable(g), ...(g.footer ?? [])]) {
    if (it.to !== '/' && path.startsWith(`${it.to}/`) && (!best || it.to.length > best.item.to.length)) best = { gi, item: it };
  }
  if (!best) return null;
  const g = groups[best.gi];
  const items = readable(g);
  const next = [best.item, ...items.filter(it => it.to !== best!.item.to)].slice(0, 3);
  return { section: g.title, home: items[0] ?? best.item, label: best.item.label, parent: best.item, next };
}

/** In classic view, a page from April's own menu that the member menu doesn't list: tell her it lives in her full edition. */
export function onlyInFullEdition(groups: FounderGroup[], path: string, memberListed: boolean): boolean {
  return !memberListed && founderPlace(groups, path) !== null;
}
