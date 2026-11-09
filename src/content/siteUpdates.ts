/**
 * Member-facing "What's new" log. Public-safe: describes features anyone can use, never founder or private content.
 * Add the newest entry first. Refresh at least every five build rounds, alongside the developer timeline.
 */
export type SiteUpdate = { date: string; title: string; text: string; to?: string; cta?: string };

export const SITE_UPDATES: SiteUpdate[] = [
  { date: '2026-11-09', title: 'More on every TV channel', text: 'See each contact explained, its timing and a reflection question, with calculation times and birth-time limits.', to: '/dashboard#broadcast-studio', cta: 'Tune in' },
  { date: '2026-11-09', title: 'Browse by department', text: 'Books, stickers, bags, clothing, home goods and stationery now group the shop’s product types. Atomic Zodiac and sign filters still work together.', to: '/store', cta: 'Browse the shop' },
  { date: '2026-11-08', title: 'Your forecast and workbook', text: 'See 90 days of chart contacts by life area. Workbook reflections can be added to private personal context only when you choose.', to: '/forecast', cta: 'Open Forecast' },
  { date: '2026-11-07', title: 'Keep your place', text: 'Readings remember your last section. Your private reading history brings you back to it.', to: '/reading-history', cta: 'Reading history' },
  { date: '2026-11-07', title: 'Observation Log and Content Center', text: 'Save private sky observations and review the personal examples you choose for future writing.', to: '/content-center', cta: 'Open Content Center' },
  { date: '2026-11-06', title: 'A new home for the gift shop', text: 'Shop the Atomic Zodiac Collection by department — posters, tees, mugs, stickers and books — with every sign in each.', to: '/store?collection=atomic', cta: 'Visit the shop' },
  { date: '2026-11-06', title: 'Real books on the Cosmic Archive shelf', text: 'The home page and your dashboard now show the actual AstroBook covers from the shop.', to: '/astrobook', cta: 'See AstroBook' },
  { date: '2026-11-05', title: 'Forecast Center', text: 'Today’s sky for everyone, plus broadcasts timed to your own chart when you’re signed in.', to: '/forecast', cta: 'Open Forecast' },
  { date: '2026-11-05', title: 'Pages open where they should', text: 'Links now open at the top of the new page, section links land on their section, and Back returns you to where you were.' },
  { date: '2026-11-04', title: 'The Broadcast Studio', text: 'Five TV channels on your dashboard read today’s transits to your chart: Current Chapter, Career, Relationship, Forecast Window and Growth.', to: '/dashboard#broadcast-studio', cta: 'Tune in' },
];

export const latestUpdates = (n = 3, list: SiteUpdate[] = SITE_UPDATES) => [...list].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n);
