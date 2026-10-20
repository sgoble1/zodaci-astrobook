import { describe, expect, it } from 'vitest';
import { headingId, markdownSections } from './NavigatedProse';

describe('reading sections', () => {
  it('lists level-two headings with stable ids, dropping numbering and emphasis', () => {
    expect(markdownSections('# Title\n## 1. Your **Sun**\ntext\n### Detail\n## Strengths & Watch-outs\n')).toEqual([
      { id: 'your-sun', title: 'Your Sun' }, { id: 'strengths-watch-outs', title: 'Strengths & Watch-outs' },
    ]);
  });
  it('makes URL-safe ids', () => expect(headingId('Love — and Money?')).toBe('love-and-money'));
});
