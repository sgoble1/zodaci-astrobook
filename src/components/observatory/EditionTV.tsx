import { useMemo } from 'react';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
import { computeChart } from '@/lib/astro';
import { CurrentChapterPanel } from '@/components/observatory/CurrentChapterPanel';

/** The same Broadcast Studio every account sees, fed by the chart for the open edition. */
export function EditionTV() {
  const birth = useMyBirth();
  const chart = useMemo(() => { if (!birth) return null; try { return computeChart(toChartInput(birth)); } catch { return null; } }, [birth]);
  if (!chart) return null;
  return <CurrentChapterPanel chart={chart} name={birth?.name} />;
}
