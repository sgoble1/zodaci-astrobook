import { fmtLon, type ChartResult } from '@/lib/astro';

/** Personal readings composed only from a member's calculated placements — never invented life events. */
export const SIGN: Record<string, { style: string; strength: string; watch: string }> = {
  Aries: { style: 'direct, quick and brave', strength: 'starting things', watch: 'rushing or losing patience' },
  Taurus: { style: 'steady, patient and sensual', strength: 'building something that lasts', watch: 'digging in when change is needed' },
  Gemini: { style: 'curious, talkative and flexible', strength: 'connecting ideas and people', watch: 'scattering your energy' },
  Cancer: { style: 'caring, protective and feeling-led', strength: 'making people feel safe', watch: 'retreating into your shell' },
  Leo: { style: 'warm, expressive and proud', strength: 'leading with heart', watch: 'needing applause to feel okay' },
  Virgo: { style: 'careful, useful and detail-minded', strength: 'improving and fixing', watch: 'harsh self-criticism' },
  Libra: { style: 'fair, social and harmony-seeking', strength: 'bringing balance', watch: 'avoiding conflict too long' },
  Scorpio: { style: 'intense, private and loyal', strength: 'seeing beneath the surface', watch: 'holding grudges or control' },
  Sagittarius: { style: 'optimistic, free and searching', strength: 'finding meaning', watch: 'overpromising' },
  Capricorn: { style: 'serious, ambitious and responsible', strength: 'long-term achievement', watch: 'all work and no rest' },
  Aquarius: { style: 'independent, inventive and group-minded', strength: 'fresh perspectives', watch: 'emotional distance' },
  Pisces: { style: 'gentle, imaginative and empathic', strength: 'compassion and creativity', watch: 'blurred boundaries' },
};
export const HOUSE = ['', 'self and first impressions', 'money and what you value', 'communication and neighbours', 'home and roots', 'creativity, romance and play', 'work routines and health', 'partners and close one-to-one bonds', 'shared resources and deep change', 'beliefs, study and travel', 'career and public life', 'friends and groups', 'rest, solitude and the inner world'];

export interface Reading { key: string; title: string; facts: string[]; plain: string; daily: string; questions: string[]; art: string }

const AREAS: { key: string; title: string; body: string; theme: string; q: string }[] = [
  { key: 'identity', title: 'Who you are', body: 'sun', theme: 'your core identity', q: 'When do you feel most like yourself?' },
  { key: 'feelings', title: 'Feelings & comfort', body: 'moon', theme: 'your emotional needs', q: 'What reliably makes you feel safe?' },
  { key: 'mind', title: 'Thinking & talking', body: 'mercury', theme: 'how your mind works', q: 'How do you learn best?' },
  { key: 'love', title: 'Love & values', body: 'venus', theme: 'how you love and what you enjoy', q: 'What makes you feel truly valued?' },
  { key: 'drive', title: 'Drive & energy', body: 'mars', theme: 'how you take action', q: 'What gets you moving when you feel stuck?' },
  { key: 'growth', title: 'Luck & growth', body: 'jupiter', theme: 'where you grow easily', q: 'Where does life seem to open doors for you?' },
  { key: 'effort', title: 'Effort & maturity', body: 'saturn', theme: 'where you build through patience', q: 'What have you mastered the slow way?' },
  { key: 'path', title: 'Your growth path', body: 'northNode', theme: 'qualities you are growing into', q: 'What new habit feels uncomfortable but right?' },
];

export function buildReadings(chart: ChartResult, timeKnown: boolean): Reading[] {
  return AREAS.flatMap(a => {
    const b = chart.bodies.find(x => x.key === a.body);
    if (!b) return [];
    const s = SIGN[b.sign];
    const house = timeKnown && b.house ? b.house : null;
    const aspects = chart.aspects.filter(x => x.a === b.name || x.b === b.name).sort((x, y) => x.orb - y.orb).slice(0, 3);
    const facts = [`${b.name} in ${b.sign} ${b.deg}°${String(b.min).padStart(2, '0')}′${b.retro ? ' (retrograde)' : ''}`, house ? `${house}${['th','st','nd','rd'][house % 10 > 3 || [11,12,13].includes(house) ? 0 : house % 10]} house — ${HOUSE[house]}` : 'House not shown (birth time unknown)', ...aspects.map(x => `${x.a} ${x.type} ${x.b} (orb ${x.orb.toFixed(1)}°)`)];
    const plain = `${a.theme[0].toUpperCase()}${a.theme.slice(1)} comes out in a ${s.style} way. Your natural strength here is ${s.strength}.${house ? ` This plays out mostly in the area of ${HOUSE[house]}.` : ''}${b.retro ? ' Retrograde suggests you process this side of life inwardly before showing it.' : ''}`;
    const daily = `In daily life, lean into ${s.strength}${house ? ` especially around ${HOUSE[house]}` : ''}. Something to watch: ${s.watch}.${aspects[0] ? ` Your closest link is ${aspects[0].a} ${aspects[0].type.toLowerCase()} ${aspects[0].b}, so these two parts of you tend to show up together.` : ''}`;
    return [{ key: a.key, title: a.title, facts, plain, daily, questions: [a.q, `Where have you noticed being ${s.style.split(',')[0]}?`, `How could you handle "${s.watch}" a little better this week?`], art: `${b.key}-${b.sign}` }];
  });
}

export const risingLine = (chart: ChartResult) => chart.asc != null ? `Rising sign ${fmtLon(chart.asc)}` : null;
