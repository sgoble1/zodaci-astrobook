export const BOOK_SECTIONS = [
  { title: 'Your chart foundations', description: 'Birth facts, chart wheel, planets, signs, houses and aspects.' },
  { title: 'Your inner world', description: 'Identity, feelings, communication and patterns for reflection.' },
  { title: 'Relationships & connection', description: 'Your relationship needs, boundaries and ways of connecting.' },
  { title: 'Purpose & everyday life', description: 'Work, creativity, energy and practical reflection exercises.' },
];
export const COVER_STYLES = ['Celestial atlas', 'Botanical sky', 'Modern orbit'];
export const bookTotal = (edition: string, extras: number) => (edition === 'expanded' ? 8000 : 4500) + extras * 699;
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
/** Production specs from our print partner Pixartprinting (Art Books range). Prices are quoted per job by the printer. */
export const PRINT_SPECS = {
  partner: 'Pixartprinting', url: 'https://www.pixartprinting.com/printing-magazines-books-catalogues/art-books/',
  bindings: [['Softcover', 'Paperback perfect binding — smooth, professional square spine (our standard and expanded editions).'], ['Hardcover', 'Hardcover binding — premium, collector-grade durability. Coming soon; price on request.']],
  sizes: ['US Letter 8.5″ × 11″', 'Standard Portrait 8″ × 10″', 'US Trade 6″ × 9″ (AstroBook default)', 'Square 8.5″ × 8.5″'],
  papers: ['Uncoated 60, 80 or 100 lb (plus 80 lb recycled)', 'Satin 70, 80 or 100 lb — low glare, ideal for text and charts', 'Gloss 70, 80 or 100 lb — vivid color for illustrations'],
  coatings: ['Matte', 'Gloss', 'Soft-touch (velvety premium feel)'],
  notes: 'Full-color printing with high-resolution image reproduction. Printed individually — from a single copy.',
};
