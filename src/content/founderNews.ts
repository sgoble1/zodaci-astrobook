import type { OfficialEdition } from '@/lib/officialEditions';

/**
 * Plain-language "What's new for you" notes for each founder's own account. Written for non-developers: what they can
 * now see or do, and where. April's notes never mention Zac's edition or space; Zac's never mention April's.
 * Add the newest entry first. Refresh at least every five build rounds, alongside siteUpdates and the developer timeline.
 */
export type FounderNote = { date: string; title: string; text: string; to?: string; cta?: string; for: OfficialEdition[] };

export const FOUNDER_NEWS: FounderNote[] = [
  { date: '2026-11-13', for: ['april', 'shane', 'zac'], title: 'Peek inside your own book and comic', text: 'On your Official AstroBook page, “Read the first ten pages” opens the start of your book, and the AstroComic button shows the first ten pages of your next three issues. Each one uses your own birth details.', to: '/official-astrobook', cta: 'Open my books' },
  { date: '2026-11-13', for: ['april', 'shane', 'zac'], title: 'Printed books now email when they ship', text: 'If you order a printed AstroBook, you’ll get an email with the tracking link as soon as it leaves the printer.', to: '/orders', cta: 'My orders' },
  { date: '2026-11-13', for: ['april', 'shane', 'zac'], title: 'New picture guides in Learn', text: 'Learn now starts with four simple drawings: the twelve houses, the main planet angles, the four elements and the Moon’s phases.', to: '/learn#diagrams', cta: 'See the drawings' },
  { date: '2026-11-12', for: ['april'], title: 'Find chapters faster', text: 'Your chapter list can now be narrowed to one document at a time, and each chapter shows roughly how long it takes to read.', to: '/masterbook/index', cta: 'Browse my chapters' },
  { date: '2026-11-12', for: ['april', 'shane', 'zac'], title: 'Four new places to explore', text: 'The menu has an “Astral Bureaus” section: case files about your chart, a museum of your placements, a dated record of everything you’ve made, and printable keepsakes.', to: '/investigations', cta: 'Start with the case files' },
  { date: '2026-11-12', for: ['april', 'shane', 'zac'], title: 'Keepsakes you can print', text: 'Make a Birth-Sky Certificate or a tall Star Scroll from your chart — for your wall, or as a gift.', to: '/keepsakes', cta: 'Make a keepsake' },
  { date: '2026-11-12', for: ['zac'], title: 'Your workbook and comparison', text: 'Your workbook and the brother comparison stay in your own account. Only you and Shane can open them.', to: '/zac/workbook', cta: 'Open my workbook' },
  { date: '2026-11-10', for: ['april', 'shane', 'zac'], title: 'Ask one question, get a sourced answer', text: '“Consult the Observatory” answers a question from your chart, today’s sky and any notes you chose to share. Each line says where it came from.', to: '/observatory', cta: 'Ask a question' },
  { date: '2026-11-10', for: ['april', 'shane', 'zac'], title: 'A reading layout that’s easier on the eyes', text: 'On a wide screen, chapters now show the sections on the left and the chapter’s key facts on the right.', to: '/my-readings', cta: 'Open a reading' },
  { date: '2026-11-09', for: ['april', 'shane', 'zac'], title: 'The shop has departments', text: 'Books, stickers, bags, clothing, home goods and stationery each have their own shelf, with your sign’s items easy to find.', to: '/store', cta: 'Visit the shop' },
  { date: '2026-11-08', for: ['april', 'shane', 'zac'], title: 'Your forecast', text: 'See the next 90 days of sky contacts to your chart, grouped by area of life.', to: '/forecast', cta: 'Open Forecast' },
];

export const founderNewsFor = (edition: OfficialEdition, count?: number) => {
  const list = FOUNDER_NEWS.filter(n => n.for.includes(edition)).sort((a, b) => b.date.localeCompare(a.date));
  return count == null ? list : list.slice(0, count);
};
