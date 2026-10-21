/** "Recommended for you" on hub pages, from saved chart facts and the last reading only (never typed text). */
export type Recommendation = { title: string; reason: string; to: string; cta: string };
export type RecommendInput = { hub: string; hasChart: boolean; moonSign?: string; lastVisit?: { path: string; title: string } | null; plan?: string | null };

export function recommendFor({ hub, hasChart, moonSign, lastVisit, plan }: RecommendInput): Recommendation | null {
  if (!hasChart) return null; // the get-started banner covers members without a chart
  if (hub === '/my-astrobook') return { title: 'See your book cover', reason: 'Your chart picks a title and cover for your AstroBook — preview it before choosing an edition.', to: '/books', cta: 'Preview my cover' };
  if (lastVisit && hub === '/my-readings') return { title: `Continue: ${lastVisit.title}`, reason: 'Pick up the reading you opened last.', to: lastVisit.path, cta: 'Continue reading' };
  if (hub === '/explore') return { title: 'What is active in your chart now', reason: 'Current transits show which of your placements are being touched this month.', to: '/transits', cta: 'See my transits' };
  if (hub === '/academy') return { title: 'Learn the houses', reason: 'Houses explain where in life each planet in your chart plays out.', to: '/houses', cta: 'Open my houses' };
  if (moonSign) return { title: `Your Moon in ${moonSign}`, reason: 'The Moon describes what you need to feel safe — often the most personal part of a chart.', to: '/my-readings/topic/core-emotions', cta: plan === 'free' ? 'Read the preview' : 'Read about it' };
  if (lastVisit) return { title: `Continue: ${lastVisit.title}`, reason: 'Pick up the reading you opened last.', to: lastVisit.path, cta: 'Continue reading' };
  return null;
}
