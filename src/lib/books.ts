export const BOOK_SECTIONS = [
  { title: 'Your chart foundations', description: 'Birth facts, chart wheel, planets, signs, houses and aspects.' },
  { title: 'Your inner world', description: 'Identity, feelings, communication and patterns for reflection.' },
  { title: 'Relationships & connection', description: 'Your relationship needs, boundaries and ways of connecting.' },
  { title: 'Purpose & everyday life', description: 'Work, creativity, energy and practical reflection exercises.' },
];
export const COVER_STYLES = ['Celestial atlas', 'Botanical sky', 'Modern orbit'];
export const bookTotal = (edition: string, extras: number) => (edition === 'expanded' ? 8000 : 4500) + extras * 699;
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);