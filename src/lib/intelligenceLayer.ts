import { LIFE_AREAS, type LifeArea } from './lifeAreas';
export const INTERVIEW_TOPIC = 'current-question';
export type ReadingFocus = { area: LifeArea; question: string };
export function validFocus(value: unknown): value is LifeArea { return typeof value === 'string' && Object.prototype.hasOwnProperty.call(LIFE_AREAS, value); }
/** Only explicit member choices select highlights. No chart input, mutation, event prediction or AI. */
export function contextHighlights(focus: ReadingFocus | null) {
  if (!focus || !validFocus(focus.area)) return [];
  return LIFE_AREAS[focus.area].readings.map(slug => ({ slug, to: `/my-readings/topic/${slug}`, area: focus.area }));
}
export function parseFocus(answer: string | null | undefined): ReadingFocus | null {
  try { const data = JSON.parse(answer ?? 'null'); return data && validFocus(data.area) && typeof data.question === 'string' ? { area: data.area, question: data.question.slice(0, 600) } : null; } catch { return null; }
}