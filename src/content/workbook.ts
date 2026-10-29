import { registerPrivateValue } from '@/lib/privateEditionStore';
/** April's Workbook — guided modules built from her chart. Each question carries a short chart note
 * (why it matters for her placements) and the therapy lens it draws on. */
export type WorkbookQuestion = { key: string; q: string; why: string; lens: string };
export type WorkbookModule = {
  slug: string; title: string; subtitle: string; placements: string; intro: string;
  plainMeaning: string; dailyLife: string;
  visual: { title: string; summary: string; left: string; right: string; responses: [string, string, string]; flow: string[]; signals: string[]; action: string };
  questions: WorkbookQuestion[]; explore: { to: string; label: string }[];
};

export let WORKBOOK_MODULES: WorkbookModule[] = [];

export let ALL_QUESTIONS: { module: WorkbookModule; key: string; q: string; why: string; lens: string; }[] = [];

/** A deterministic "question of the day". */
export function questionOfTheDay(date = new Date()) {
  const day = Math.floor(date.getTime() / 86_400_000);
  return ALL_QUESTIONS.length ? ALL_QUESTIONS[day % ALL_QUESTIONS.length] : undefined;
}

export const EMOTIONS = ['Calm', 'Hopeful', 'Joyful', 'Grateful', 'Tired', 'Anxious', 'Irritable', 'Sad', 'Lonely', 'Overwhelmed', 'Restless', 'Inspired'];

registerPrivateValue("workbook", "WORKBOOK_MODULES", value => { WORKBOOK_MODULES = value as typeof WORKBOOK_MODULES; }, []);
registerPrivateValue("workbook", "ALL_QUESTIONS", value => { ALL_QUESTIONS = value as typeof ALL_QUESTIONS; }, []);
