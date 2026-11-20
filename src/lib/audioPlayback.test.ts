import { describe, it, expect } from 'vitest';
import { addAudioBookmark, clampSeek, PLAYBACK_SPEEDS, tapeCounter } from './audioPlayback';
describe('cassette playback rules', () => {
  it('offers the three requested speeds', () => expect(PLAYBACK_SPEEDS).toEqual([1, 1.25, 1.5]));
  it('never seeks past either end', () => { expect(clampSeek(-15, 90)).toBe(0); expect(clampSeek(120, 90)).toBe(90); });
  it('keeps chapter bookmarks sorted and unique', () => { const list = addAudioBookmark([], 65, 100); expect(addAudioBookmark(list, 65, 100)).toHaveLength(1); expect(addAudioBookmark(list, 10, 100).map(b => b.seconds)).toEqual([10, 65]); });
  it('shows minute and second tape position', () => expect(tapeCounter(65)).toBe('01:05'));
});