import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { dreamDeduction } from '@/lib/dreamDeduction';

const natal = computeChart({
  date: '1990-05-01',
  time: '12:00',
  lat: 40.71,
  lon: -74.0,
  tz: 'America/New_York',
  placeLabel: 'New York',
  placeSource: 'geocoded',
  houseSystem: 'placidus',
} as never);

describe('dream deduction engine', () => {
  it('maps water, flying and teeth to the correct planetary rulers', () => {
    const water = dreamDeduction(natal, '2026-11-12', ['water'], 'calm');
    const flying = dreamDeduction(natal, '2026-11-12', ['flying'], 'exhilarated');
    const teeth = dreamDeduction(natal, '2026-11-12', ['teeth'], 'dread');

    expect(water.natalResonance.motifs[0]?.rulers).toContain('Neptune');
    expect(water.natalResonance.motifs[0]?.rulers).toContain('Moon');
    expect(flying.natalResonance.motifs[0]?.rulers).toContain('Jupiter');
    expect(flying.natalResonance.motifs[0]?.rulers).toContain('Neptune');
    expect(teeth.natalResonance.motifs[0]?.rulers).toContain('Saturn');
  });

  it('gives deterministic step output for a known chart and date', () => {
    const result = dreamDeduction(natal, '2026-11-12', ['water', 'flying'], 'calm');
    expect(result.deductionSteps.map(step => step.title)).toEqual([
      'The Trigger',
      'The Archetype',
      'The Natal Hook',
      'The Inquiry Prompt',
    ]);
    expect(result.deductionSteps[0]?.text).toContain('The night mind was activated');
    expect(result.deductionSteps[1]?.text).toContain('Water dreams tend to reach toward Neptune');
  });

  it('handles unknown birth times without throwing and omits house-dependent steps', () => {
    const untimed = { ...natal, input: { ...natal.input, time: null }, cusps: null } as typeof natal;
    const result = dreamDeduction(untimed, '2026-11-12', ['water'], 'confused');

    expect(result.templeTraffic).toEqual([]);
    expect(result.natalResonance.houseRuler).toBeNull();
    expect(result.deductionSteps[2]?.text).toContain('The recurring dream image is not tied');
  });
});
