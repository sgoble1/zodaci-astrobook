import { describe, expect, it } from 'vitest';
import { readingStatus, readingIsOlder, readingVisitKey } from './readingExperience';

describe('reading experience state', () => {
  it('never treats an unrequested reading as writing', () => {
    expect(readingStatus(undefined)).toBe('not-created');
    expect(readingStatus('generating')).toBe('writing');
  });
  it('retains preview and failed states', () => {
    expect(readingStatus('preview')).toBe('preview');
    expect(readingStatus('failed')).toBe('failed');
    expect(readingStatus('ready')).toBe('ready');
  });
  it('flags readings older than saved birth data', () => {
    expect(readingIsOlder('2026-10-17T10:00:00Z', '2026-10-18T10:00:00Z')).toBe(true);
    expect(readingIsOlder('2026-10-18T11:00:00Z', '2026-10-18T10:00:00Z')).toBe(false);
    expect(readingIsOlder('2026-10-17T10:00:00Z', null)).toBe(false);
  });
  it('keeps saved reading positions separate by account', () => {
    expect(readingVisitKey('april')).not.toBe(readingVisitKey('shane'));
  });
});