/**
 * Short, direct sidebar labels for founder edition chapters (the full title stays on the chapter page).
 * Shane's chapters use a hand-written map; other titles are shortened by rule.
 */
const SHANE: Record<string, string> = {
  'sm-01': 'Natal Chart Overview', 'sm-02': 'The Houses', 'sm-03': 'Aspects, Lots & Midpoints', 'sm-04': 'Vedic Chart',
  'sm-05': 'World Traditions', 'sm-06': 'Past Lives', 'sm-07': 'Life Phases 1993–2060', 'sm-08': 'Shadow Work',
  'sm-09': 'Relationships', 'sm-10': 'Health & Wellness', 'sm-11': 'Career & Money', 'sm-12': 'Spiritual Path',
  'sm-13': 'Family Dynamics', 'sm-14': 'Ancestral Astrology', 'sm-15': 'The Outsider', 'sm-16': 'Hidden Layers',
  'sm-17': 'Spirit Animals & Feng Shui', 'sm-18': 'Daily Rituals', 'sm-19': 'Influence & Magnetism', 'sm-20': 'Warnings & Synthesis',
  'sm-21': 'A Letter from the Stars', 'sm-22': 'Sun in Aries · 31 Cultures', 'sm-23': 'Advanced Aspects', 'sm-24': 'Nutrition & T1D',
  'sm-25': 'Shadow Work Guide', 'sm-26': 'Shane & Zac', 'sm-27': 'Timeline 2026–2032', 'sm-28': 'Family Soul Group',
  'sm-29': 'The Moon · 30 Cultures', 'sm-30': 'Past Lives & Soul Contracts', 'sm-31': 'Royal Stars', 'sm-32': 'Karmic Debts & Gifts',
  'sm-33': 'Upcoming Transits', 'sm-34': 'Karmic Timeline to 2036', 'sm-35': 'The Next Big Transit', 'sm-36': 'Karmic Healing',
  'sm-37': 'Saturn vs. Pluto', 'sm-38': 'Next 12 Months · Gifts', 'sm-39': 'Legacy by 2034', 'sm-40': 'Identity & Sexuality',
  'sm-41': 'Personality Profile', 'sm-42': '10-Year Planet Map', 'sm-43': 'Saturn’s Case Against Pluto', 'sm-44': 'Shadow Archetypes',
  'sm-45': 'Charisma by Life Area', 'sm-46': 'Karmic Patterns', 'sm-47': 'Predictive Timing', 'sm-48': 'Synastry & Attraction',
  'sm-49': 'Pluto & Saturn Shadow', 'sm-50': 'Karmic vs. Soulmate', 'sm-51': '5-Year Forecast', 'sm-52': 'Red & Green Flags',
  'sm-53': 'Shadow Work by Month', 'sm-54': 'Attachment Patterns', 'sm-55': '12-Month Relationship Timeline', 'sm-56': '30/60/90-Day Signs',
  'sm-57': 'Saturn Relationship Tests', 'sm-58': 'Soulmate Blueprint', 'sm-59': 'Venus Shadow Triggers', 'sm-60': 'Love Language & Attachment',
  'sm-61': 'Breaking Karmic Loops', 'sm-62': 'Discernment Checklist', 'sm-63': 'Transits 2025–2027',
};

const ASTRO = /\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Chiron|Node|Ascendant|Midheaven|Rising|Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces|House|Houses|Stellium|Lagna|Nakshatra|Mahadasha|Navamsa)\b/;

/** Shortens a chapter title: drops degree notes and name possessives, and keeps the direct half of "Poetic: Direct" titles. */
export function shortChapterLabel(id: string, title: string): string {
  if (SHANE[id]) return SHANE[id];
  let t = title.replace(/\s*\([^)]*[°′'][^)]*\)/g, '').replace(/\s*\((Expanded|Complete)\)/gi, '').trim();
  t = t.replace(/\bZachary(?:’|')s\s+/g, '').replace(/\bin Zachary(?:’|')s Chart\b/g, '').trim();
  const colon = t.split(/:\s+/);
  if (colon.length === 2) {
    const [a, b] = colon;
    if (/^The\s/.test(a) && ASTRO.test(b) && !ASTRO.test(a)) t = b;
    else if (b.length > 28 && a.length <= 34) t = a;
  }
  const dash = t.split(/\s+—\s+/);
  if (dash.length === 2 && dash[0].length >= 6) t = dash[0];
  t = t.replace(/^The (Complete|Comprehensive)\s+/i, '').replace(/\s+/g, ' ').trim();
  return t.length > 42 ? `${t.slice(0, 40).replace(/\s+\S*$/, '')}…` : t;
}
