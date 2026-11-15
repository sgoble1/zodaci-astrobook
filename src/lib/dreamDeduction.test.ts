import { describe, expect, it } from 'vitest';
import { computeChart } from './astro';
import { dreamDeduction } from './dreamDeduction';

const natal = computeChart({ date: '1990-05-01', time: '12:00', lat: 40.71, lon: -74.0, tz: 'America/New_York', placeLabel: 'New York', placeSource: 'geocoded', houseSystem: 'placidus' } as never);

describe('dream deduction engine', () => {
  it('maps water, flying and teeth motifs to their traditional planetary rulers', () => {
    const water = dreamDeduction(natal, '2026-11-12', ['water'], 'calm');
    const flying = dreamDeduction(natal, '2026-11-12', ['flying'], 'exhilarated');
    const teeth = dreamDeduction(natal, '2026-11-12', ['teeth'], 'dread');
    expect(water.natalResonance.motifs[0]?.rulers).toContain('Neptune');
    expect(water.natalResonance.motifs[0]?.rulers).toContain('Moon');
    expect(flying.natalResonance.motifs[0]?.rulers).toContain('Jupiter');
    expect(flying.natalResonance.motifs[0]?.rulers).toContain('Neptune');
    expect(teeth.natalResonance.motifs[0]?.rulers).toContain('Saturn');
  });
  it('returns the same ordered, grounded steps for identical inputs', () => {
    const first = dreamDeduction(natal, '2026-11-12', ['water', 'flying'], 'calm', '03:00');
    const second = dreamDeduction(natal, '2026-11-12', ['water', 'flying'], 'calm', '03:00');
    expect(first).toEqual(second);
    expect(first.deductionSteps.map(step => step.title)).toEqual(['The Trigger', 'The Archetype', 'The Natal Hook', 'The Inquiry Prompt']);
    expect(first.deductionSteps[0]?.text).toContain('The night mind was activated');
    expect(first.deductionSteps[1]?.text).toContain('Water dreams tend to reach toward Neptune');
  });
  it('uses the logged dream time to calculate the sky and phase', () => {
    const midnight = dreamDeduction(natal, '2026-11-12', ['water'], 'calm', '00:00');
    const evening = dreamDeduction(natal, '2026-11-12', ['water'], 'calm', '18:00');
    expect(midnight.natalResonance.moonPhase).toBeTruthy();
    expect(evening.natalResonance.moonPhase).toBeTruthy();
    expect(midnight.nightSkyContacts).not.toEqual(evening.nightSkyContacts);
  });
  it('does not invent house-dependent natal details when the birth time is unknown', () => {
    const untimed = { ...natal, input: { ...natal.input, time: null }, cusps: null } as typeof natal;
    const result = dreamDeduction(untimed, '2026-11-12', ['water'], 'confused');
    expect(result.templeTraffic).toEqual([]);
    expect(result.natalResonance.houseRuler).toBeNull();
    expect(result.natalResonance.motifs[0]?.natalPlacements).not.toContain('12th house');
    expect(result.deductionSteps[2]?.text).toContain('House-dependent natal details are omitted');
    expect(result.deductionSteps).toHaveLength(4);
  });
});
