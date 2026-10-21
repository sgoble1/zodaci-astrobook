import { describe, expect, it } from 'vitest';
import { orderFounderGroups } from './founderEdition';

describe('April menu order', () => {
  const groups = ['Workbook', 'Library', 'Shared Spaces', 'The Natal Chart', 'Mystery', 'Timing & Cycles'].map(title => ({ title }));
  it('orders sections by purpose and keeps unknown ones last', () => expect(orderFounderGroups(groups).map(g => g.title)).toEqual(['The Natal Chart', 'Timing & Cycles', 'Library', 'Shared Spaces', 'Workbook', 'Mystery']));
  it('never drops a section', () => expect(orderFounderGroups(groups)).toHaveLength(groups.length));
});
