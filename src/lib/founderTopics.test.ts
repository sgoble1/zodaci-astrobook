import { describe, expect, it } from 'vitest';
import { groupChaptersByTopic, MORE_TOPIC } from './founderTopics';

const ch = (id: string, label: string) => ({ id, label });
describe('groupChaptersByTopic', () => {
  it('puts past-life chapters under Past Lives & Karma', () => {
    const g = groupChaptersByTopic([ch('a', 'Past Lives & Soul Contracts'), ch('b', 'Karmic Debts & Gifts')], c => c.label);
    expect(g).toEqual([{ label: 'Past Lives & Karma', items: [ch('a', 'Past Lives & Soul Contracts'), ch('b', 'Karmic Debts & Gifts')] }]);
  });
  it('keeps every chapter exactly once', () => {
    const list = ['Natal Chart Overview', 'Shane & Zac', 'Nutrition & T1D', 'Transits 2025–2027', 'Zzz unknown'].map((l, i) => ch(String(i), l));
    const g = groupChaptersByTopic(list, c => c.label);
    expect(g.flatMap(x => x.items).length).toBe(5);
    expect(g.find(x => x.label === MORE_TOPIC)?.items[0].label).toBe('Zzz unknown');
  });
});
