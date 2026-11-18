import { describe, expect, it } from 'vitest';
import { bookPlateSpec, renderBookPlate } from './bookPlate';
import { sampleReaderChart } from '@/content/sampleBookLeaves';

describe('chart-relative engraved plates', () => {
  it('retains exact coordinates and six actual contacts rather than inventing ornament as aspects', () => {
    const chart = sampleReaderChart();
    const spec = bookPlateSpec(chart, 'venus', 'Earth');
    expect(spec.positions.find(p => p.key === 'sun')?.lon).toBe(chart.bodies.find(p => p.key === 'sun')?.lon);
    expect(spec.sunSign).toBe('Taurus');
    expect(spec.moonSign).toBe('Cancer');
    expect(spec.contacts).toHaveLength(6);
    for (const contact of spec.contacts) expect(chart.aspects).toEqual(expect.arrayContaining([expect.objectContaining(contact)]));
  });
  it('varies the engraving for all ten rulers and all four elements', () => {
    const chart = sampleReaderChart();
    const variants = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].map(key => renderBookPlate(bookPlateSpec(chart, key, 'Earth')));
    expect(new Set(variants).size).toBe(10);
    expect(new Set(['Fire', 'Earth', 'Air', 'Water'].map(el => renderBookPlate(bookPlateSpec(chart, 'venus', el)))).size).toBe(4);
  });
  it('omits stale horizon data, provisional lunar positions and lunar contacts for date-only charts', () => {
    const timed = sampleReaderChart();
    const spec = bookPlateSpec({ ...timed, input: { ...timed.input, time: null } }, 'venus', 'Earth');
    expect(spec.positions).toHaveLength(9);
    expect(spec.positions.some(p => p.key === 'moon')).toBe(false);
    expect(spec.moonSign).toBeUndefined();
    expect(spec.contacts.every(a => a.a !== 'Moon' && a.b !== 'Moon')).toBe(true);
    expect(JSON.stringify(spec)).not.toMatch(/ascendant|midheaven|cusps|house/i);
  });
});