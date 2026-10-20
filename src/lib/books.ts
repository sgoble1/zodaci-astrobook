/**
 * AstroBook versions, prices and print specifications — the single source for book pricing.
 * Five versions are sold; legacy Standard/Expanded orders (Pixartprinting era) stay readable.
 */
export type Edition = 'digital' | 'pocket' | 'classic' | 'signature' | 'linen';
export type LegacyEdition = 'standard' | 'expanded';
export type AnyEdition = Edition | LegacyEdition;
export type BookFormat = 'print' | 'digital';

export type BookVersion = {
  id: Edition; name: string; price: number; format: BookFormat; lookup: string;
  trim: string | null; trimPt: [number, number]; binding: string; paper: string; cover: string;
  pages: [number, number]; depth: 'standard' | 'expanded'; journal: number; ship: string; tagline: string;
  inside: string[]; lulu: string | null;
};

export const BOOK_VERSIONS: BookVersion[] = [
  { id: 'digital', name: 'Digital PDF', price: 2499, format: 'digital', lookup: 'astrobook_digital_v2', trim: null, trimPt: [432, 648], binding: 'Instant PDF download', paper: 'Full color · print-at-home ready', cover: 'Your chosen cover as the first page', pages: [60, 80], depth: 'standard', journal: 2, ship: 'Ready as soon as payment is confirmed', tagline: 'Your chart and readings, ready to read tonight.', lulu: null,
    inside: ['Birth facts and full planet table', 'Your Big Three', 'Planet, sign and house interpretations from your readings', 'Aspect list with orbs', 'Your birth Moon phase', 'Rulership summary for all 12 houses', '2 journal pages'] },
  { id: 'pocket', name: 'Pocket', price: 3499, format: 'print', lookup: 'astrobook_pocket', trim: '4.25 × 6.875 in', trimPt: [306, 495], binding: 'Paperback, perfect-bound', paper: 'Standard color · 60# white uncoated', cover: 'Glossy cover with your name and birth date', pages: [80, 100], depth: 'standard', journal: 0, ship: '5–7 business days (US)', tagline: 'A small book that fits in a coat pocket.', lulu: 'Pocketbook 4.25×6.875 · Standard Color 60# White · Paperback Perfect Bound · Gloss cover',
    inside: ['Everything in Digital (without journal pages)', 'Your birth-moment verse', 'Printed and bound for your shelf'] },
  { id: 'classic', name: 'Classic', price: 5999, format: 'print', lookup: 'astrobook_classic', trim: '6 × 9 in', trimPt: [432, 648], binding: 'Paperback, perfect-bound', paper: 'Premium color · 80# white coated', cover: 'Matte cover with your name in gold tones', pages: [120, 150], depth: 'expanded', journal: 12, ship: '5–7 business days (US)', tagline: 'The full reading, with your topic chapters.', lulu: 'US Trade 6×9 · Premium Color 80# White Coated · Paperback Perfect Bound · Matte cover',
    inside: ['Everything in Pocket', 'Your finished topic readings as extra chapters', 'Aspect grid', 'Chiron, the Nodes and sensitive points', 'RetroGOOD: your retrograde planets', 'Your birth-sky wheel', 'Solar return preview for your next birthday', '12 journal pages'] },
  { id: 'signature', name: 'Signature Hardcover', price: 9700, format: 'print', lookup: 'astrobook_signature', trim: '8.5 × 8.5 in', trimPt: [612, 612], binding: 'Hardcover, case wrap', paper: 'Premium color · 80# white coated', cover: 'Matte case wrap with your cover art', pages: [150, 200], depth: 'expanded', journal: 20, ship: '7–10 business days (US)', tagline: 'A square hardcover made to keep.', lulu: 'Square 8.5×8.5 · Premium Color 80# White Coated · Hardcover Case Wrap · Matte',
    inside: ['Everything in Classic', 'A personal letter from your sky', 'The Story of Your Sky', 'Element and modality balance', 'Relationship primer: Venus, Mars and your 7th house', 'North Node chapter', '20 journal pages'] },
  { id: 'linen', name: "Collector's Linen", price: 14900, format: 'print', lookup: 'astrobook_linen', trim: '8.5 × 11 in', trimPt: [612, 792], binding: 'Linen hardcover, foil-stamped spine', paper: 'Premium color · 80# white coated', cover: 'Midnight linen with foil-stamped title and name', pages: [200, 250], depth: 'expanded', journal: 30, ship: '10–14 business days (US)', tagline: 'Our most complete edition, bound in linen.', lulu: 'US Letter 8.5×11 · Premium Color 80# White Coated · Linen Hardcover (navy) · Foil stamp',
    inside: ['Everything in Signature', 'Planet mythology', '12-month sky forecast from your chart', '12 personal affirmations', 'Up to 3 relationship comparisons from your saved people', 'Numbered collector’s certificate page', '30 journal pages'] },
];
export const versionOf = (edition: string): BookVersion | undefined => BOOK_VERSIONS.find(v => v.id === edition);
export const isEdition = (e: string): e is Edition => BOOK_VERSIONS.some(v => v.id === e);

/** Legacy editions (orders placed before the five-version launch). */
export const LEGACY_PRICES: Record<LegacyEdition, number> = { standard: 5900, expanded: 8900 };
export const LEGACY_DIGITAL_PRICE = 1999;
export const EXTRA_SECTION_PRICE = 699;

/** Content depth decides which saved chapters enter the manuscript. */
export const contentDepth = (edition: string): 'standard' | 'expanded' => edition === 'expanded' ? 'expanded' : versionOf(edition)?.depth ?? 'standard';
export const editionName = (edition: string, format?: BookFormat) => versionOf(edition)?.name ?? `${edition === 'expanded' ? 'Expanded' : 'Standard'} ${format === 'digital' ? 'PDF' : 'printed'} (earlier edition)`;

export function bookBase(edition: string, format: BookFormat = 'print') {
  const v = versionOf(edition);
  if (v) return v.price;
  return format === 'digital' ? LEGACY_DIGITAL_PRICE : LEGACY_PRICES[edition === 'expanded' ? 'expanded' : 'standard'];
}
export const bookTotal = (edition: string, extras: number, format: BookFormat = 'print') => bookBase(edition, format) + extras * EXTRA_SECTION_PRICE;
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

/** Estimated unit costs used until the admin enters real Lulu quotes (admin "Print costs" table overrides these). */
export const BOOK_COSTING: { edition: AnyEdition; print: number; shipping: number; fees: number; price: number }[] = [
  { edition: 'digital', print: 0, shipping: 0, fees: 102, price: 2499 },
  { edition: 'pocket', print: 650, shipping: 499, fees: 131, price: 3499 },
  { edition: 'classic', print: 2350, shipping: 699, fees: 204, price: 5999 },
  { edition: 'signature', print: 4100, shipping: 899, fees: 311, price: 9700 },
  { edition: 'linen', print: 6900, shipping: 1299, fees: 462, price: 14900 },
  { edition: 'standard', print: 2400, shipping: 900, fees: 220, price: 5900 },
  { edition: 'expanded', print: 3800, shipping: 1100, fees: 310, price: 8900 },
];
export const marginPct = (price: number, cost: number) => price > 0 ? Math.round(((price - cost) / price) * 100) : 0;

export const BOOK_SECTIONS = [
  { title: 'Your chart foundations', description: 'Birth facts, chart wheel, planets, signs, houses and aspects.' },
  { title: 'Your inner world', description: 'Identity, feelings, communication and patterns for reflection.' },
  { title: 'Relationships & connection', description: 'Your relationship needs, boundaries and ways of connecting.' },
  { title: 'Purpose & everyday life', description: 'Work, creativity, energy and practical reflection exercises.' },
];
export const COVER_STYLES = ['Celestial atlas', 'Botanical sky', 'Modern orbit'];

/** Chapter tabs shown on the AstroBook page (what the book covers, in reading order). */
export const CHAPTER_TABS: { id: string; label: string; text: string; points: string[] }[] = [
  { id: 'big-three', label: 'The Big Three', text: 'Your Sun, Moon and Rising: the self you are growing into, what you need to feel safe and how you meet the world.', points: ['Exact degrees from your birth moment', 'How the three work together', 'Rising sign marked uncertain if your birth time is unknown'] },
  { id: 'planets', label: 'Your Planets', text: 'Mercury to Pluto, Chiron and the Nodes, each read by sign, house and strength.', points: ['Sign, house and essential dignity', 'Retrograde planets explained without fear', 'Plain-language summary for every placement'] },
  { id: 'houses', label: 'The Houses', text: 'All twelve areas of life, the planets inside them and where each house ruler leads.', points: ['Cusp sign and ruler for every house', 'Empty houses explained', 'Rulership summary table'] },
  { id: 'aspects', label: 'Aspects & Patterns', text: 'The angles between your planets, from the loudest to the quiet ones, and any patterns they form.', points: ['Aspect list with exact orbs', 'T-squares, grand trines and stelliums when present', 'Aspect grid in Classic and above'] },
  { id: 'timing', label: 'Timing & Transits', text: 'Your solar return preview and, in Collector’s Linen, a 12-month forecast of the sky against your chart.', points: ['Next birthday’s solar return moment', 'Major transits by month (Linen)', 'Retrograde periods to plan around'] },
];
