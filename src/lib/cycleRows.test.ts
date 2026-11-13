import { describe, expect, it } from 'vitest';
import { cycleRows } from './bookLeaves';
import type { ChartResult } from './astro';

describe('cycleRows', () => {
  it('dates the first Saturn return about 29 years after a 1990 birth', () => {
    const rows = cycleRows({ input: { date: '1990-05-01' } } as ChartResult);
    expect(rows.find(r => r[0] === 'First Saturn return')?.[1]).toBe('around 2019 (age 29)');
  });
});
