import { describe, expect, it } from 'vitest';
import { demoAllows, demoChapter, demoPartner } from './demoSession';
import { SAMPLE_EDITION } from './sampleEdition';
import { sampleReaderChart } from './sampleBookLeaves';
import { fmtLon } from '@/lib/astro';

describe('isolated Classic demo', () => {
  it('keeps verified Rosalind’s Taurus / Cancer / Taurus chart', () => {
    const chart = sampleReaderChart();
    expect(chart.bodies.find(b => b.key === 'sun')?.sign).toBe('Taurus');
    expect(chart.bodies.find(b => b.key === 'moon')?.sign).toBe('Cancer');
    expect(chart.asc === null ? null : fmtLon(chart.asc).sign).toBe('Taurus');
  });
  it('Free opens overview but locks chapters, audio, transits and tone', () => {
    expect(demoAllows('free', 'overview')).toBe(true);
    for (const feature of ['chapters', 'audio', 'transits', 'tone', 'synastry'] as const) expect(demoAllows('free', feature)).toBe(false);
  });
  it('Pro and Cosmic both open all sample features', () => {
    for (const tier of ['full', 'creator'] as const) for (const feature of ['chapters', 'audio', 'transits', 'tone', 'synastry'] as const) expect(demoAllows(tier, feature)).toBe(true);
  });
  it('tone variants retain the chapter’s exact measurements', () => {
    for (const page of SAMPLE_EDITION.pages) for (const tone of ['educational', 'professional'] as const) {
      const text = demoChapter(page, tone).join(' ');
      for (const fact of page.facts) expect(text).toContain(fact.value);
      expect(text).not.toBe(demoChapter(page, 'oracle').join(' '));
    }
  });
  it('partner choices are fictional samples only', () => {
    expect(demoPartner('signature').reader.name).toBe('Theo Lindqvist');
    expect(() => demoPartner('shane')).toThrow();
    expect(() => demoPartner('collector')).toThrow();
  });
});