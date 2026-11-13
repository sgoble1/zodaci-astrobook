import { describe, it, expect } from 'vitest';
import { questionsForVisit, MAX_PER_VISIT } from './contextQuestions';

describe('context questions', () => {
  it('asks at most three per visit', () => expect(questionsForVisit([], 0).length).toBe(MAX_PER_VISIT));
  it('stops once three were asked this visit', () => expect(questionsForVisit([], 3)).toEqual([]));
  it('never re-asks answered or skipped topics, but re-asks "later" ones', () => {
    const q = questionsForVisit([{ topic: 'life-focus', status: 'answered' }, { topic: 'work', status: 'skipped' }, { topic: 'relationships', status: 'later' }], 0).map(x => x.topic);
    expect(q).not.toContain('life-focus'); expect(q).not.toContain('work'); expect(q[0]).toBe('relationships');
  });
});
