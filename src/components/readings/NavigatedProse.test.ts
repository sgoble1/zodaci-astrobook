import { describe, expect, it } from 'vitest';
import { headingId, markdownSections } from './NavigatedProse';

describe('reading sections', () => {
  it('lists level-two headings with stable ids, dropping numbering and emphasis', () => {
    expect(markdownSections('# Title\n## 1. Your **Sun**\ntext\n### Detail\n## Strengths & Watch-outs\n')).toEqual([
      { id: 'your-sun', title: 'Your Sun' }, { id: 'strengths-watch-outs', title: 'Strengths & Watch-outs' },
    ]);
  });
  it('makes URL-safe ids', () => expect(headingId('Love — and Money?')).toBe('love-and-money'));
  it('keeps repeated section destinations unique', () => expect(markdownSections('## Reflection\n## Reflection')).toEqual([{ id: 'reflection', title: 'Reflection' }, { id: 'reflection-2', title: 'Reflection' }]));
  it('supports original third-level chapter headings and document prefixes', () => expect(markdownSections('### Sun\n### Moon', 3, 'chapter-a-')).toEqual([{ id: 'chapter-a-sun', title: 'Sun' }, { id: 'chapter-a-moon', title: 'Moon' }]));
  it('does not navigate into fenced examples', () => expect(markdownSections('```md\n## Example\n```\n## Actual')).toEqual([{ id: 'actual', title: 'Actual' }]));
});
