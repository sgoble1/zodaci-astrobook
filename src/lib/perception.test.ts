import { describe, expect, it } from 'vitest';
import { narrative, perceive } from './perception';

const body = (key: string, name: string, sign: string, lon: number, retro = false) => ({ key, name, sign, lon, retro } as never);

describe('perception engine', () => {
  const chart = { asc: null, cusps: [], bodies: [body('sun', 'Sun', 'Aries', 10), body('moon', 'Moon', 'Leo', 130), body('mercury', 'Mercury', 'Aries', 15, true), body('venus', 'Venus', 'Sagittarius', 250), body('mars', 'Mars', 'Aries', 20)] } as never;
  it('ranks insights by weight, highest first', () => {
    const ins = perceive(chart, false);
    for (let i = 1; i < ins.length; i++) expect(ins[i - 1].weight).toBeGreaterThanOrEqual(ins[i].weight);
  });
  it('flags missing elements and retrograde Mercury', () => {
    const ins = perceive(chart, false);
    expect(ins.some(i => i.id === 'el-missing-Water')).toBe(true);
    expect(ins.find(i => i.id === 'retro')?.text).toContain('Mercury');
  });
  it('changes lead wording with tone', () => {
    const ins = perceive(chart, false);
    expect(narrative(ins, 'gentle')).not.toEqual(narrative(ins, 'direct'));
  });
});
