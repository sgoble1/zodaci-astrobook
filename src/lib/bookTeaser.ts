import { fmtLon, type ChartResult } from '@/lib/astro';
import { SIGN_EXPRESSIONS, HOUSE_ARENAS } from '@/content/interpretationLibrary';

export type TeaserPage = { key: 'sun' | 'moon' | 'rising'; title: string; position: string | null; body: string[]; note?: string };

const houseLine = (h: number | null) => h && HOUSE_ARENAS[h]?.arena ? `It sits in your ${h}${['th','st','nd','rd'][h % 10 > 3 || [11,12,13].includes(h) ? 0 : h % 10]} house, the house of ${HOUSE_ARENAS[h].arena}.` : null;

/** Three AstroBook teaser pages built only from the calculated chart and the shared sign/house library (no AI). */
export function buildBookTeaser(chart: ChartResult, timed: boolean): TeaserPage[] {
  const find = (k: string) => chart.bodies.find(b => b.key === k);
  const page = (key: 'sun' | 'moon' | 'rising', label: string, sign: string, position: string, house: number | null, lead: string): TeaserPage => {
    const s = SIGN_EXPRESSIONS[sign];
    return { key, title: `${label} in ${sign}`, position, body: [lead, `${sign} ${s.core}. Its gift is ${s.gift}; its shadow is ${s.shadow}. It is a ${s.mode} ${s.element.toLowerCase()} sign ruled by ${s.ruler}.`, ...(houseLine(house) ? [houseLine(house)!] : [])] };
  };
  const sun = find('sun'); const moon = find('moon');
  const pages: TeaserPage[] = [];
  if (sun) pages.push(page('sun', 'Sun', sun.sign, fmtLon(sun.lon).text, timed ? sun.house : null, 'The Sun is the steady centre of your chart: what you are building towards.'));
  if (moon) {
    const p = page('moon', 'Moon', moon.sign, fmtLon(moon.lon).text, timed ? moon.house : null, 'The Moon describes what settles you and how you take in feeling.');
    if (!timed) p.note = 'Your birth time is unknown. The Moon moves about 13° a day, so its sign is shown for noon and may differ.';
    pages.push(p);
  }
  if (timed && chart.asc != null) { const a = fmtLon(chart.asc); pages.push(page('rising', 'Rising', a.sign, a.text, null, 'Your Rising sign is the horizon at the moment you were born: how you meet the world first.')); }
  else pages.push({ key: 'rising', title: 'Rising sign', position: null, body: ['Your Rising sign needs your birth time. Add it to your chart and this page will be written from it.'] });
  return pages;
}
