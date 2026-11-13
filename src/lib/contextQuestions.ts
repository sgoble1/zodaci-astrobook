/** The gentle context questions: short clickable answers, at most three per visit, always skippable. */
export const MAX_PER_VISIT = 3;
export const CONTEXT_QUESTIONS: { topic: string; question: string; answers: string[] }[] = [
  { topic: 'life-focus', question: 'What is taking most of your attention lately?', answers: ['Work', 'Relationships', 'Family', 'Health', 'Home', 'A big change', 'Rest'] },
  { topic: 'work', question: 'How does work feel right now?', answers: ['Steady', 'Stretched thin', 'Looking for a change', 'Starting something new', 'Not working right now'] },
  { topic: 'relationships', question: 'How are your closest relationships?', answers: ['Close and steady', 'Going through something', 'Wanting more connection', 'Taking space'] },
  { topic: 'home', question: 'How is home life?', answers: ['Settled', 'Busy', 'Moving or changing', 'Quiet'] },
  { topic: 'energy', question: 'How is your energy most days?', answers: ['Good', 'Up and down', 'Low', 'Restless'] },
  { topic: 'goals', question: 'What would you most like help with?', answers: ['Making a decision', 'Understanding myself', 'Timing', 'Relationships', 'Feeling calmer'] },
];
export type ContextRow = { topic: string; status: 'answered' | 'later' | 'skipped' };
/** Questions to show this visit: unanswered or "ask me later", never skipped ones, capped per visit. */
export function questionsForVisit(rows: ContextRow[], askedThisVisit: number) {
  const done = new Map(rows.map(r => [r.topic, r.status]));
  const room = Math.max(0, MAX_PER_VISIT - askedThisVisit);
  return CONTEXT_QUESTIONS.filter(q => { const s = done.get(q.topic); return !s || s === 'later'; }).slice(0, room);
}
