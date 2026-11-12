import { describe, expect, it } from 'vitest';
import { cardFee, scenario, SCENARIOS, unitEconomics } from './investorEconomics';

const find = (group: string, item: RegExp) => unitEconomics().find(r => r.group === group && item.test(r.item))!;

describe('investor unit economics use the live prices', () => {
  it('card fees are 2.9% + $0.30', () => {
    expect(cardFee(9)).toBe(0.56);
    expect(cardFee(19)).toBe(0.85);
  });
  it('Pro at $9/month nets $8.44 before AI, and AI comes off after', () => {
    const pro = find('Membership', /^Pro, monthly/);
    expect(pro.price).toBe(9);
    expect(pro.fees).toBe(0.56);
    expect(pro.net).toBe(+(9 - 0.56 - pro.cost).toFixed(2));
    expect(pro.cost).toBeGreaterThan(0);
  });
  it('AstroBook rows use the saved print, shipping and fee costs', () => {
    const linen = find('AstroBook', /Linen/);
    expect(linen.price).toBe(189);
    expect(linen.net).toBe(+(189 - 5.78 - 88.31 - 13.99).toFixed(2));
    const digital = find('AstroBook', /Digital/);
    expect(digital.cost).toBe(0);
    expect(digital.net).toBe(23.97);
  });
  it('AstroComic monthly is $14.99 and every credit pack is listed', () => {
    expect(find('AstroComic', /Monthly/).price).toBe(14.99);
    expect(unitEconomics().filter(r => r.group === 'Credit pack').map(r => r.price)).toEqual([15, 20, 25, 30, 50, 100]);
  });
  it('scenario totals add up and costs are deducted', () => {
    const s = scenario(SCENARIOS[0]);
    expect(s.lines.find(l => l.line === 'Pro members')!.gross).toBe(400 * 9 * 12);
    expect(s.gross).toBe(s.lines.reduce((a, l) => a + l.gross, 0));
    expect(s.net).toBe(s.gross - s.costs);
    expect(s.net).toBeLessThan(s.gross);
    expect(s.arpu).toBe(+(s.gross / 10_000).toFixed(2));
  });
});
