// Pure calculations shared by the site and the reading writer (copied to supabase/functions/topic-readings/systemFacts.ts).
export type SysBody = { name: string; lon: number; house?: number | null };
export type SysFacts = { title: string; summary: string; method: string; rows: [string, string][] };

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const RASHI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
const NAKSHATRA = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
const TZOLKIN = ["Imix'", "Ik'", "Ak'b'al", "K'an", 'Chikchan', 'Kimi', "Manik'", 'Lamat', 'Muluk', 'Ok', 'Chuwen', "Eb'", "B'en", 'Ix', 'Men', "Kib'", "Kab'an", "Etz'nab'", 'Kawak', 'Ajaw'];
const TZ_EN = ['Crocodile', 'Wind', 'Night', 'Seed', 'Serpent', 'Death', 'Deer', 'Star', 'Water', 'Dog', 'Monkey', 'Road', 'Reed', 'Jaguar', 'Eagle', 'Vulture', 'Earth', 'Flint', 'Storm', 'Lord/Sun'];
const ARCANA = ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance', 'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'];
const KI = ['', '1 White Water', '2 Black Earth', '3 Jade Wood', '4 Green Wood', '5 Yellow Earth', '6 White Metal', '7 Red Metal', '8 White Earth', '9 Purple Fire'];
const MEWA = ['', '1 White', '2 Black', '3 Blue', '4 Green', '5 Yellow', '6 White', '7 Red', '8 White', '9 Maroon'];
const TREES: [number, number, string][] = [[1, 20, 'Birch'], [2, 17, 'Rowan'], [3, 17, 'Ash'], [4, 14, 'Alder'], [5, 12, 'Willow'], [6, 9, 'Hawthorn'], [7, 7, 'Oak'], [8, 4, 'Holly'], [9, 1, 'Hazel'], [9, 29, 'Vine'], [10, 27, 'Ivy'], [11, 24, 'Reed'], [12, 22, 'Elder'], [12, 23, 'Nameless Day'], [12, 31, 'Birch']];
const mod = (n: number, d: number) => ((n % d) + d) % d;
const digits = (n: number | string) => String(n).split('').filter(c => /\d/.test(c)).map(Number);
const reduce = (n: number) => { while (n > 9 && n !== 11 && n !== 22) n = digits(n).reduce((a, b) => a + b, 0); return n; };
const reduce9 = (n: number) => { while (n > 9) n = digits(n).reduce((a, b) => a + b, 0); return n; };
const jdn = (y: number, m: number, d: number) => { const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3; return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045; };

export const SYSTEM_SLUGS = ['vedic', 'chinese', 'mayan-tzolkin', 'tibetan-mewa', 'nine-star-ki', 'chaldean-numerology', 'tarot-birth-cards', 'celtic-tree-calendar'] as const;

export function systemFacts(slug: string, birthDate: string, bodies: SysBody[], bazi: { label: string; romanized: string; stemElement: string; branchElement: string; animal: string }[] = []): SysFacts | null {
  const [y, m, d] = birthDate.split('-').map(Number);
  const solarYear = m < 2 || (m === 2 && d < 4) ? y - 1 : y;
  if (slug === 'vedic') {
    const ayan = 23.853 + (y - 2000) * 0.013969;
    const rows: [string, string][] = bodies.filter(b => /^(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|North Node)/.test(b.name)).map(b => {
      const s = mod(b.lon - ayan, 360); const si = Math.floor(s / 30); const dd = s - si * 30;
      return [b.name, `${SIGNS[si]} (${RASHI[si]}) ${Math.floor(dd)}°${String(Math.round((dd % 1) * 60)).padStart(2, '0')}′${b.name === 'Moon' ? ` · Nakshatra ${NAKSHATRA[Math.floor(s / (360 / 27))]}` : ''}`];
    });
    return { title: 'Vedic · Jyotish', summary: `${rows.find(r => r[0] === 'Moon')?.[1].split(' ·')[0] ?? ''} Moon`, method: `Tropical positions shifted back by the Lahiri ayanamsa (≈${ayan.toFixed(2)}° for ${y}). Vedic astrology puts most weight on the Moon sign and its nakshatra (lunar mansion).`, rows };
  }
  if (slug === 'chinese') {
    const rows = bazi.map(p => [`${p.label} pillar`, `${p.romanized} · ${p.stemElement} over ${p.branchElement} · ${p.animal}`] as [string, string]);
    return { title: 'Chinese · Ba Zi', summary: bazi.find(p => /year/i.test(p.label))?.animal ? `${bazi.find(p => /year/i.test(p.label))!.animal} year · ${bazi.find(p => /day/i.test(p.label))?.stemElement ?? ''} Day Master` : 'Four Pillars', method: 'Four Pillars of Destiny: heavenly stem and earthly branch for the year, month, day and hour of birth, using solar-term month boundaries. The day pillar’s stem (Day Master) represents the self.', rows };
  }
  if (slug === 'mayan-tzolkin') {
    const kin = mod(jdn(y, m, d) - 584283 + 159, 260); const tone = mod(kin, 13) + 1; const sign = mod(kin, 20);
    return { title: 'Maya · Tzolk’in', summary: `${tone} ${TZOLKIN[sign]} (${TZ_EN[sign]})`, method: `Julian Day Number ${jdn(y, m, d)} with the GMT 584283 correlation, placed in the 260-day sacred count (13 tones × 20 day signs).`, rows: [['Tone', String(tone)], ['Day sign', `${TZOLKIN[sign]} — ${TZ_EN[sign]}`], ['Kin', `${kin + 1} of 260`]] };
  }
  const yr = (yy: number) => { const s = reduce9(digits(yy).reduce((a, b) => a + b, 0)); return yy >= 2000 ? reduce9(mod(9 - s, 9) || 9) : reduce9(11 - s); };
  if (slug === 'nine-star-ki') {
    const star = yr(solarYear);
    return { title: 'Japanese Nine Star Ki', summary: KI[star], method: `Solar year ${solarYear} (the year turns around February 4). Year-star digits reduced and subtracted from 11 (or from 9 after 2000).`, rows: [['Year (principal) star', KI[star]]] };
  }
  if (slug === 'tibetan-mewa') {
    const mw = yr(solarYear);
    return { title: 'Tibetan Mewa', summary: `${MEWA[mw]} Mewa`, method: `Birth-year Mewa from the nine-number cycle for ${solarYear}. The Tibetan year begins at Losar (Feb–Mar), so births near the turn of the year may belong to the previous Mewa.`, rows: [['Birth Mewa', MEWA[mw]], ['Animal year', ['Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Sheep'][mod(solarYear, 12)]]] };
  }
  const total = digits(birthDate).reduce((a, b) => a + b, 0);
  if (slug === 'chaldean-numerology') {
    return { title: 'Chaldean Numerology', summary: `Birth ${reduce9(d)} · Destiny ${reduce(total)}`, method: `Birth day ${d} reduced to ${reduce9(d)}; all birth-date digits total ${total}, reduced to ${reduce(total)}. Name numbers need a full birth name.`, rows: [['Birth (psychic) number', String(reduce9(d))], ['Destiny number', `${reduce(total)} (from ${total})`], ['Compound number', String(total)]] };
  }
  if (slug === 'tarot-birth-cards') {
    let n = m + d + y; while (n > 21) n = digits(n).reduce((a, b) => a + b, 0);
    const second = n > 9 ? reduce9(n) : null;
    return { title: 'Tarot Birth Cards', summary: `${ARCANA[n]}${second ? ` & ${ARCANA[second]}` : ''}`, method: `Month + day + year (${m} + ${d} + ${y}) reduced until 21 or less gives ${n}${second ? `, then ${second}` : ''} (Mary K. Greer’s method).`, rows: [['Birth card', `${n} · ${ARCANA[n]}`], ...(second ? [['Second card', `${second} · ${ARCANA[second]}`] as [string, string]] : [])] };
  }
  if (slug === 'celtic-tree-calendar') {
    const tree = TREES.find(([tm, td]) => m < tm || (m === tm && d <= td))![2];
    return { title: 'Celtic Tree Calendar', summary: tree, method: 'Robert Graves’s 20th-century thirteen-month tree calendar — a modern construction, not an attested ancient Celtic system.', rows: [['Birth tree', tree]] };
  }
  return null;
}
