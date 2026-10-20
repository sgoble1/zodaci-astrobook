import type { ChartResult } from '@/lib/astro';
import { detectPatterns, retroGood } from '@/lib/chartPatterns';
import { elementOf } from '@/lib/synastry';

/** Perception Engine: ranks deterministic chart findings and assembles a plain-language narrative. No AI. */
export type Insight = { id: string; title: string; text: string; weight: number; source: 'pattern' | 'retro' | 'element' | 'angle' };
export type Tone = 'gentle' | 'direct';

const RETRO_MEANING: Record<string, string> = {
  Mercury: 'You tend to think things through twice; first answers are drafts, and reflection brings the real insight.',
  Venus: 'Love and values are worked out from the inside first; you may revisit past relationships to understand what you want.',
  Mars: 'Drive runs inward; you plan before acting, and anger is often processed privately before it is shown.',
  Jupiter: 'Growth comes from a personal philosophy you build yourself rather than borrowed beliefs.',
  Saturn: 'You set your own rules and standards, often stricter than anyone else would ask of you.',
  Uranus: 'Your independence is quiet and inner; change starts in how you see things.',
  Neptune: 'Imagination and spiritual sensitivity work below the surface and need grounding.',
  Pluto: 'Deep change happens privately, through self-examination rather than outside upheaval.',
};
export const retroMeaning = (name: string) => RETRO_MEANING[name] ?? 'This planet works in a more inward, reflective way.';

export function perceive(chart: Pick<ChartResult, 'bodies' | 'asc' | 'cusps'>, timeKnown: boolean): Insight[] {
  const out: Insight[] = [];
  detectPatterns(chart).forEach(p => {
    if (!timeKnown && /bucket|bundle|handle/i.test(p.code)) return;
    out.push({ id: `p-${p.code}-${p.bodies.join('')}`, title: p.title, text: p.detail, weight: p.weight, source: 'pattern' });
  });
  const rg = retroGood(chart);
  if (rg.tier !== 'none') out.push({ id: 'retro', title: `RetroGOOD: ${rg.tier}`, text: `${rg.planets.join(', ')} ${rg.planets.length === 1 ? 'was' : 'were'} retrograde at birth. ${rg.personal ? 'Personal-planet retrogrades make this especially noticeable in daily life.' : 'These are slower planets, so the effect is generational and subtle.'}`, weight: 2 + rg.score, source: 'retro' });
  const counts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  chart.bodies.filter(b => !['northNode', 'southNode', 'chiron'].includes(b.key)).forEach(b => { const e = elementOf(b.sign); if (e) counts[e]++; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] >= 4) out.push({ id: 'el-strong', title: `Strong ${sorted[0][0]}`, text: `${sorted[0][1]} planets in ${sorted[0][0]} signs set the chart's overall temperament.`, weight: sorted[0][1], source: 'element' });
  sorted.filter(([, n]) => n === 0).forEach(([e]) => out.push({ id: `el-missing-${e}`, title: `No planets in ${e}`, text: `With no planets in ${e} signs, its qualities are something learned consciously rather than given.`, weight: 3, source: 'element' }));
  return out.sort((a, b) => b.weight - a.weight);
}

/** Narrative assembly with tone calibration. */
export function narrative(insights: Insight[], tone: Tone, limit = 3) {
  const top = insights.slice(0, limit);
  if (!top.length) return 'Your chart is balanced, with no single pattern dominating; its story is in the individual placements.';
  const lead = tone === 'gentle' ? 'The patterns that stand out most in your chart are' : 'Your chart is defined by';
  return `${lead} ${top.map(i => i.title.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' and $1')}. ${top[0].text}`;
}
