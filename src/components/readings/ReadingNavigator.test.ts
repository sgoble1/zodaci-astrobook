import { describe, expect, it } from 'vitest';
import { readProgress } from './ReadingNavigator';

describe('reading progress', () => {
  it('is 0% before the reading has scrolled', () => expect(readProgress(120, 3000, 900)).toBe(0));
  it('is 50% halfway through', () => expect(readProgress(-1050, 3000, 900)).toBe(50));
  it('is 100% at the end and never above', () => { expect(readProgress(-2100, 3000, 900)).toBe(100); expect(readProgress(-5000, 3000, 900)).toBe(100); });
  it('treats a reading shorter than the screen as fully read once on screen', () => expect(readProgress(0, 500, 900)).toBe(100));
});
