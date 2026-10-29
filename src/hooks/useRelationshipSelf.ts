import { useMemo } from 'react';
import { computeChart, type ChartResult } from '@/lib/astro';
import { kuaNumber } from '@/lib/kua';
import { kuaSex, toChartInput, useMyBirth, type MyBirth } from '@/lib/myBirth';
import { useOwnsEdition } from '@/lib/editionSharing';

/** April's guide states Kua 1; the standard formula differs. Her own comparisons show the guide value and the discrepancy. */
export const APRIL_GUIDE_KUA = 1;

export type SelfKua = { kua: number; source: 'formula' | 'guide'; formula: number | null; steps: string[] };
export type RelationshipSelf = { birth: MyBirth; chart: ChartResult; name: string; kua: SelfKua | null; isApril: boolean };

/**
 * The signed-in person's side of every relationship comparison: their saved birth details, calculated chart, name and
 * Kua. undefined while loading, null when no birth details are saved. Never falls back to anyone else's chart.
 */
export function useRelationshipSelf(): RelationshipSelf | null | undefined {
  const birth = useMyBirth();
  const isApril = useOwnsEdition('april');
  return useMemo(() => {
    if (birth === undefined || isApril === undefined) return undefined;
    if (!birth) return null;
    let chart: ChartResult;
    try { chart = computeChart(toChartInput(birth)); } catch { return null; }
    const formula = kuaNumber(birth.date, kuaSex(birth.sex));
    const kua: SelfKua | null = isApril
      ? { kua: APRIL_GUIDE_KUA, source: 'guide', formula: formula?.kua ?? null, steps: formula?.steps ?? [] }
      : formula ? { kua: formula.kua, source: 'formula', formula: formula.kua, steps: formula.steps } : null;
    return { birth, chart, name: birth.name?.trim() || 'You', kua, isApril };
  }, [birth, isApril]);
}
