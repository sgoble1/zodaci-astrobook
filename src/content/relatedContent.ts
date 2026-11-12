import { CORE_THEMES, TOPIC_READINGS } from '@/lib/topicReadings';
import { caseById, type CaseId } from '@/lib/investigations';
import { galleryById, type GalleryId } from '@/lib/museum';

/**
 * Content registry for "Related" panels on readings: each reading belongs to one or more life themes,
 * and each theme points to sibling readings, a Bureau case file, a Museum gallery and a tool page.
 * Titles and links only — nothing here reads or exposes a reading's text.
 */
type Theme = 'relationship' | 'roots' | 'purpose' | 'career' | 'money' | 'health' | 'mind' | 'pattern' | 'spirit' | 'time';

const THEMES_OF: Record<string, Theme[]> = {
  'big-three': ['pattern'], 'chart-shape': ['pattern'], purpose: ['purpose'], love: ['relationship'], career: ['career'], money: ['money'],
  mind: ['mind'], health: ['health'], 'family-home': ['roots', 'relationship'], 'recurring-themes': ['pattern'], obstacles: ['pattern', 'health'],
  'shadow-work': ['pattern', 'spirit'], 'past-lives': ['spirit'], 'spiritual-gifts': ['spirit'], practices: ['spirit', 'health'], numerology: ['mind', 'time'],
  timing: ['time'], 'sex-attraction': ['relationship'],
  'core-personality': ['pattern'], 'core-emotions': ['relationship', 'health'], 'core-friendship': ['relationship'], 'core-creativity': ['mind', 'purpose'],
  'core-work-style': ['career'], 'core-leadership': ['career', 'purpose'], 'core-self-worth': ['money'], 'core-resilience': ['health'],
  'core-learning': ['mind'], 'core-beliefs-travel': ['spirit', 'purpose'], 'core-freedom-change': ['time'], 'core-legacy': ['purpose', 'time'],
};

const PLACES: Record<Theme, { case?: CaseId; gallery?: GalleryId; tool?: { to: string; label: string } }> = {
  relationship: { case: 'relationship', gallery: 'relationships', tool: { to: '/relationships', label: 'Your people & compatibility' } },
  roots: { gallery: 'roots', tool: { to: '/relationships', label: 'Your people & compatibility' } },
  purpose: { case: 'purpose', gallery: 'purpose', tool: { to: '/workbook', label: 'Workbook prompts' } },
  career: { case: 'career', gallery: 'purpose', tool: { to: '/workbook', label: 'Workbook prompts' } },
  money: { case: 'money', tool: { to: '/workbook', label: 'Workbook prompts' } },
  health: { case: 'health', tool: { to: '/observation-log', label: 'Observation Log' } },
  mind: { case: 'pattern', tool: { to: '/my-chart', label: 'Your full chart' } },
  pattern: { case: 'pattern', tool: { to: '/my-chart', label: 'Your full chart' } },
  spirit: { case: 'spirituality', gallery: 'legacy', tool: { to: '/observation-log', label: 'Observation Log' } },
  time: { gallery: 'future', tool: { to: '/forecast', label: 'Forecast' } },
};

export interface RelatedLink { to: string; label: string; kind: 'reading' | 'case' | 'gallery' | 'tool' }

const TITLES = new Map([...TOPIC_READINGS, ...CORE_THEMES].map(t => [t.slug, t.title]));
export const RELATED_SLUGS = Object.keys(THEMES_OF);

/** Up to four sibling readings and three places for a reading slug; empty for unknown slugs. */
export function relatedFor(slug: string): { readings: RelatedLink[]; places: RelatedLink[] } {
  const themes = THEMES_OF[slug];
  if (!themes) return { readings: [], places: [] };
  const readings: RelatedLink[] = [];
  for (const t of themes) for (const [s, ts] of Object.entries(THEMES_OF)) {
    if (s === slug || !ts.includes(t) || readings.some(r => r.to.endsWith(`/${s}`)) || !TITLES.has(s)) continue;
    readings.push({ to: `/my-readings/topic/${s}`, label: TITLES.get(s)!, kind: 'reading' });
  }
  const places: RelatedLink[] = [];
  const push = (l: RelatedLink) => { if (!places.some(p => p.to === l.to)) places.push(l); };
  for (const t of themes) {
    const p = PLACES[t];
    if (p.case) { const c = caseById(p.case); if (c) push({ to: `/investigations/${c.id}`, label: `Case file: ${c.title}`, kind: 'case' }); }
    if (p.gallery) { const g = galleryById(p.gallery); if (g) push({ to: `/museum/${g.id}`, label: `Gallery: ${g.name}`, kind: 'gallery' }); }
    if (p.tool) push({ ...p.tool, kind: 'tool' });
  }
  return { readings: readings.slice(0, 4), places: places.slice(0, 3) };
}
