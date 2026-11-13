import { describe, it, expect } from 'vitest';
import { episodeTitle } from './episodeTitle';

describe('episode titles', () => {
  it('turns uploaded file names into readable titles', () => {
    expect(episodeTitle('birth-chart-series-v2-part-2-shane-1993.mp3')).toBe('Birth chart series v2 · Part 2 shane 1993');
    expect(episodeTitle("Shane's Cosmic Blueprint.mp3")).toBe("Shane's Cosmic Blueprint");
  });
  it('leaves typed titles alone', () => {
    expect(episodeTitle("Zac's Base Cosmic Blueprint")).toBe("Zac's Base Cosmic Blueprint");
    expect(episodeTitle('Mars-Venus: a love story')).toBe('Mars-Venus: a love story');
    expect(episodeTitle('')).toBe('Untitled episode');
  });
});
