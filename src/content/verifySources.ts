/**
 * Real academic, scientific and historical references April can use to check
 * the claims behind each chart and system page. Each source says WHAT it can
 * verify — astronomy facts, history of a method, or research on whether
 * astrology predicts personality — so nothing is presented as proof of fate.
 */
export type VerifyKind = 'Astronomy' | 'History' | 'Primary text' | 'Research';
export type VerifySource = { label: string; href: string; kind: VerifyKind; checks: string };
export type VerifyGroup = { id: string; title: string; plain: string; routes: string[]; sources: VerifySource[] };

const S = {
  horizons: { label: 'NASA JPL Horizons ephemeris', href: 'https://ssd.jpl.nasa.gov/horizons/', kind: 'Astronomy', checks: 'Look up where each planet really was on Sept 6, 1990, 19:38 UTC from Geneva, NY. This confirms the degrees in her chart.' },
  zodiac: { label: 'Britannica — Zodiac', href: 'https://www.britannica.com/topic/zodiac', kind: 'History', checks: 'Where the twelve signs come from (Babylonian astronomy) and how they relate to constellations.' },
  astrology: { label: 'Britannica — Astrology', href: 'https://www.britannica.com/topic/astrology', kind: 'History', checks: 'A neutral history of Western astrology, houses, aspects and horoscopes.' },
  precession: { label: 'Britannica — Precession of the equinoxes', href: 'https://www.britannica.com/science/precession-of-the-equinoxes', kind: 'Astronomy', checks: 'Why tropical signs (used here) now differ from the visible constellations by about 24°.' },
  tetrabiblos: { label: 'Ptolemy, Tetrabiblos (Loeb translation, LacusCurtius)', href: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Ptolemy/Tetrabiblos/home.html', kind: 'Primary text', checks: 'The 2nd-century source for planet meanings, aspects and sign rulerships still used today.' },
  retro: { label: 'Britannica — Retrograde motion', href: 'https://www.britannica.com/science/retrograde-motion', kind: 'Astronomy', checks: 'Why planets appear to move backward: an effect of Earth passing them, not a real reversal.' },
  moon: { label: 'NASA — Moon phases', href: 'https://science.nasa.gov/moon/moon-phases/', kind: 'Astronomy', checks: 'Confirms what a waning gibbous Moon is (her Sun–Moon gap of about 157°).' },
  eclipse: { label: 'NASA Eclipse website', href: 'https://eclipse.gsfc.nasa.gov/', kind: 'Astronomy', checks: 'Official dates of eclipses before her birth and in coming years.' },
  iauStars: { label: 'IAU Working Group on Star Names — official list', href: 'https://exopla.net/star-names/modern-iau-star-names/', kind: 'Astronomy', checks: 'Official names of fixed stars such as Spica and Regulus.' },
  valens: { label: 'Vettius Valens, Anthology (2nd century) — background', href: 'https://en.wikipedia.org/wiki/Vettius_Valens', kind: 'Primary text', checks: 'The ancient source for annual profections and time-lord techniques.' },
  carlson: { label: 'Carlson (1985), “A double-blind test of astrology”, Nature', href: 'https://www.nature.com/articles/318419a0', kind: 'Research', checks: 'A well-known controlled test that found astrologers could not match charts to personality profiles.' },
  forer: { label: 'Forer (1949), the “Barnum effect” study', href: 'https://doi.org/10.1037/h0059240', kind: 'Research', checks: 'Why general readings feel personal. A good reason to compare claims against her real experience.' },
  campion: { label: 'Nicholas Campion, A History of Western Astrology (library search)', href: 'https://search.worldcat.org/search?q=Campion+History+of+Western+Astrology', kind: 'History', checks: 'Academic history of astrology from Mesopotamia to today (University of Wales Trinity Saint David).' },
  warburg: { label: 'The Warburg Institute (University of London)', href: 'https://warburg.sas.ac.uk/', kind: 'History', checks: 'Leading research library for the history of astrology and magic.' },
  fengshui: { label: 'Britannica — Feng shui', href: 'https://www.britannica.com/topic/feng-shui', kind: 'History', checks: 'Origins of feng shui, the compass (luopan) and the Bagua.' },
  chineseCal: { label: 'Britannica — Chinese calendar', href: 'https://www.britannica.com/science/Chinese-calendar', kind: 'Astronomy', checks: 'How the stems, branches and solar terms used in Ba Zi are counted.' },
  numerology: { label: 'Britannica — Numerology', href: 'https://www.britannica.com/topic/numerology', kind: 'History', checks: 'Where modern numerology comes from and how life-path numbers are made.' },
  pythagoras: { label: 'Stanford Encyclopedia of Philosophy — Pythagoras', href: 'https://plato.stanford.edu/entries/pythagoras/', kind: 'History', checks: 'What Pythagoras actually taught about number, versus later legends.' },
} satisfies Record<string, VerifySource>;

export const VERIFY_GROUPS: VerifyGroup[] = [
  { id: 'chart', title: 'Birth chart, planets & houses', plain: 'Check the sky positions with NASA, and the meanings with the old books they come from.', routes: ['/birth-chart', '/chart-guide', '/planets', '/houses', '/chart-calculator', '/chart-elements', '/reading', '/compendium', '/purpose'], sources: [S.horizons, S.zodiac, S.precession, S.tetrabiblos, S.astrology, S.campion, S.carlson, S.forer] },
  { id: 'aspects', title: 'Aspects & Moon phase', plain: 'Aspects are angles between planets — anyone can measure them from the NASA positions.', routes: ['/aspects'], sources: [S.horizons, S.moon, S.tetrabiblos, S.carlson] },
  { id: 'timing', title: 'Timing, transits & retrogrades', plain: 'Dates of retrogrades and eclipses are real astronomy; what they mean is tradition.', routes: ['/timeline', '/retrogrades', '/transits', '/profection'], sources: [S.retro, S.eclipse, S.horizons, S.valens, S.campion, S.forer] },
  { id: 'stars', title: 'Fixed stars', plain: 'Star names and positions are official astronomy; star meanings come from Ptolemy and later writers.', routes: ['/star-map'], sources: [S.iauStars, S.precession, S.tetrabiblos, S.warburg] },
  { id: 'chinese', title: 'Chinese astrology & Feng Shui', plain: 'The calendar math is real; the Kua and Bagua meanings are a traditional practice.', routes: ['/chinese', '/feng-shui', '/bagua-reading', '/masterbook/bagua-wheel'], sources: [S.chineseCal, S.fengshui, S.campion] },
  { id: 'numerology', title: 'Numerology', plain: 'You can redo the number math by hand; the meanings are modern, not ancient Greek.', routes: ['/numerology'], sources: [S.numerology, S.pythagoras, S.forer] },
  { id: 'other', title: 'Other systems', plain: 'Each system page lists its own history links too. These are the general checks.', routes: ['/other-systems'], sources: [S.astrology, S.warburg, S.carlson, S.forer] },
];

export function verifyGroupFor(pathname: string): VerifyGroup | undefined {
  return VERIFY_GROUPS.find(g => g.routes.some(r => pathname === r || pathname.startsWith(r + '/')));
}
