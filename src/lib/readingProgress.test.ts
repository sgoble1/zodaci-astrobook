import { describe, expect, it } from 'vitest';
import { continueTarget, furthest, isFinished, readMarks, worthSaving } from './readingProgress';

const sections = [{ id: 'a', title: 'Opening' }, { id: 'b', title: 'Middle' }, { id: 'c', title: 'Close' }];

describe('reading progress', () => {
  it('keeps the furthest point reached, within 0–100', () => {
    expect(furthest(80, 10)).toBe(80);
    expect(furthest(20, 64.4)).toBe(64);
    expect(furthest(0, 140)).toBe(100);
  });
  it('saves on a new section, a 5-point move or the end, not on every scroll', () => {
    expect(worthSaving({ progress: 10, section: 'a' }, { progress: 12, section: 'a' })).toBe(false);
    expect(worthSaving({ progress: 10, section: 'a' }, { progress: 15, section: 'a' })).toBe(true);
    expect(worthSaving({ progress: 10, section: 'a' }, { progress: 11, section: 'b' })).toBe(true);
    expect(worthSaving({ progress: 96, section: 'c' }, { progress: 98, section: 'c' })).toBe(true);
  });
  it('treats 98% and above as finished', () => {
    expect(isFinished(98)).toBe(true);
    expect(isFinished(97)).toBe(false);
  });
  it('offers "Continue from" only past the first section, unfinished, and without a #link', () => {
    expect(continueTarget({ section_id: 'b', progress: 40 }, sections, '')?.title).toBe('Middle');
    expect(continueTarget({ section_id: 'a', progress: 5 }, sections, '')).toBeNull();
    expect(continueTarget({ section_id: 'b', progress: 40 }, sections, '#c')).toBeNull();
    expect(continueTarget({ section_id: 'b', progress: 100 }, sections, '')).toBeNull();
    expect(continueTarget({ section_id: 'gone', progress: 40 }, sections, '')).toBeNull();
  });
  it('maps saved rows to chapter paths for sidebar marks', () => {
    const m = readMarks([{ path: '/shane/sm-01', progress: 100 }, { path: '/shane/sm-02', progress: 30 }]);
    expect(m.get('/shane/sm-01')).toBe(100);
    expect(m.get('/shane/sm-02')).toBe(30);
    expect(m.has('/shane/sm-03')).toBe(false);
  });
});
