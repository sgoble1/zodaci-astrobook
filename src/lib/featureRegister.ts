/**
 * One feature register for the whole product. The investor page, the developer
 * "Next implementations" board and the Part 28 reference read from here so a
 * feature never shows two different statuses.
 */
export type FeatureStatus = 'Live' | 'Partial' | 'Planned' | 'Blocked';
export type Impact = 'High' | 'Medium' | 'Later';
export interface Feature { id: string; area: string; name: string; status: FeatureStatus; impact: Impact; detail: string; blocker?: string }

export const FEATURES: Feature[] = [
  // Charts & calculation
  { id: 'chart-engine', area: 'Charts & calculation', name: 'Natal chart engine', status: 'Live', impact: 'High', detail: 'Planets, houses, angles, nodes, Chiron and asteroids from an astronomical ephemeris, with historical time zones and daylight saving.' },
  { id: 'unknown-time', area: 'Charts & calculation', name: 'Unknown birth time handling', status: 'Live', impact: 'High', detail: 'Houses and Rising are marked uncertain instead of silently assuming midnight.' },
  { id: 'other-systems', area: 'Charts & calculation', name: 'Other Systems', status: 'Live', impact: 'Medium', detail: 'Vedic, Chinese Ba Zi, numerology, Feng Shui, Flying Stars, Nine Star Ki and Tzolk’in from the same birth data.' },
  { id: 'accuracy-15', area: 'Charts & calculation', name: '15-point accuracy regression', status: 'Partial', impact: 'High', detail: 'Reference-ephemeris tests exist; the expanded 15-chart authoritative set is still to be added.' },
  { id: 'profection-wheel', area: 'Charts & calculation', name: 'Interactive 12-spoke profection wheel', status: 'Planned', impact: 'Medium', detail: 'Annual profections on /profection and /timing as a turnable wheel.' },
  { id: 'bazi-loshu', area: 'Charts & calculation', name: 'BaZi Four Pillars and Lo Shu grid views', status: 'Planned', impact: 'Medium', detail: 'Dedicated visual pillars and grid on the Chinese and Feng Shui pages.' },
  { id: 'radar-tone', area: 'Charts & calculation', name: 'Retrograde Radar tone setting', status: 'Planned', impact: 'Later', detail: 'Gentle, Direct or Strategic wording, saved per member.' },
  { id: 'asteroid-degrees', area: 'Charts & calculation', name: 'Licensed asteroid tables and Sabian Symbols', status: 'Blocked', impact: 'Later', detail: 'Extra points and degree symbols.', blocker: 'Licensing permissions' },
  // Readings & AI
  { id: 'readings', area: 'Readings & guidance', name: 'Personal readings by plan', status: 'Live', impact: 'High', detail: 'Readings written from each member’s calculated placements, with retry and freshness checks.' },
  { id: 'counselors', area: 'Readings & guidance', name: 'Chart-aware counselors', status: 'Live', impact: 'High', detail: 'Private sessions that replay the full conversation with the verified chart.' },
  { id: 'ask-sources', area: 'Readings & guidance', name: 'Ask the Sources with citations', status: 'Live', impact: 'Medium', detail: 'Every claim links to its source passage.' },
  { id: 'dreams', area: 'Readings & guidance', name: 'Dream Ledger', status: 'Live', impact: 'Medium', detail: 'Dreams logged against that night’s sky; optional one-credit reading.' },
  { id: 'context-flow', area: 'Readings & guidance', name: 'One-question personal context flow', status: 'Partial', impact: 'Medium', detail: 'Tap-to-answer questions exist; the one-at-a-time flow with saved chips and skip is still to finish.' },
  { id: 'placement-library', area: 'Readings & guidance', name: 'Reviewed placement text library', status: 'Blocked', impact: 'Later', detail: 'About 216 placement entries for free deterministic readings.', blocker: 'Owner review and AI credits' },
  // Books & comics
  { id: 'astrobook', area: 'AstroBook & AstroComic', name: 'Six-volume AstroBook builder', status: 'Live', impact: 'High', detail: 'Five editions, cover designer, previews and print-ready PDFs.' },
  { id: 'book-showcase', area: 'AstroBook & AstroComic', name: 'Five-spread AstroBook showcase', status: 'Partial', impact: 'High', detail: 'Showcase and sample pages exist; a five-spread walk-through on the books page is next.' },
  { id: 'astrocomic', area: 'AstroBook & AstroComic', name: 'AstroComic Issue #1 and preview', status: 'Live', impact: 'High', detail: 'Drawn pages, 3D page-turn preview, read-through and pre-order.' },
  { id: 'comic-switcher', area: 'AstroBook & AstroComic', name: 'My Comic issue archive', status: 'Live', impact: 'Medium', detail: 'Members open each released issue from their archive on My AstroComic.' },
  { id: 'lulu', area: 'AstroBook & AstroComic', name: 'Automated print fulfilment (Lulu)', status: 'Blocked', impact: 'High', detail: 'Book jobs run in sandbox today.', blocker: 'Production credentials and a proofed sample' },
  { id: 'comic-print', area: 'AstroBook & AstroComic', name: 'Comic printing', status: 'Blocked', impact: 'Medium', detail: 'Paused by the owner.', blocker: 'Owner decision' },
  // Demos
  { id: 'demo', area: 'Demos & previews', name: 'Interactive demo walk-through', status: 'Live', impact: 'High', detail: 'Birth details, chart, reading and book with one fictional sample reader.' },
  { id: 'samples', area: 'Demos & previews', name: 'Public book and comic samples', status: 'Live', impact: 'High', detail: 'All samples use the same fictional Collector-cover reader.' },
  // Shop
  { id: 'shop', area: 'Shop & orders', name: 'Shopify storefront and cart', status: 'Live', impact: 'High', detail: 'Products, prices and stock come from Shopify; checkout runs on Shopify.' },
  { id: 'shop-copy', area: 'Shop & orders', name: 'Rewritten product descriptions', status: 'Partial', impact: 'High', detail: 'Plain, specific descriptions for every listing, pushed to Shopify after owner approval.' },
  { id: 'shop-layout', area: 'Shop & orders', name: 'Admin shop layout', status: 'Planned', impact: 'Medium', detail: 'Department order and featured products arranged in Zodaci admin; Shopify keeps the product data.' },
  { id: 'variant-paging', area: 'Shop & orders', name: 'All variants loaded', status: 'Planned', impact: 'Medium', detail: 'Products with more than 100 variants load every option.' },
  { id: 'shopify-orders', area: 'Shop & orders', name: 'Shopify orders on My Orders', status: 'Blocked', impact: 'Medium', detail: 'Book orders show today; Shopify orders need a store-owned admin app.', blocker: 'Shopify admin app credentials' },
  { id: 'emails', area: 'Shop & orders', name: 'Receipts and notification emails', status: 'Blocked', impact: 'Medium', detail: 'Order and newsletter emails.', blocker: 'Verified sending domain' },
  // Membership
  { id: 'memberships', area: 'Membership & credits', name: 'Pro and Cosmic memberships', status: 'Live', impact: 'High', detail: 'Verified payments, plan changes, refunds; Pro and Cosmic share features and differ in credits.' },
  { id: 'monthly-credits', area: 'Membership & credits', name: 'Monthly credit renewal', status: 'Live', impact: 'High', detail: 'Each paid month gives the plan’s allowance again; renewals refresh the plan from the payment provider.' },
  { id: 'credit-packs', area: 'Membership & credits', name: 'Credit packs and referrals', status: 'Live', impact: 'Medium', detail: 'One-time packs; 20 bonus credits per paying friend, up to 12 a year.' },
  // Privacy
  { id: 'private-editions', area: 'Privacy & sharing', name: 'Private founder editions', status: 'Live', impact: 'High', detail: 'Open only for the owner and people they share with, checked on the server.' },
  { id: 'public-share', area: 'Privacy & sharing', name: 'Public chart share without private details', status: 'Planned', impact: 'Medium', detail: 'A shareable chart that leaves out birth time, exact place, notes and journal.' },
  { id: 'contact-spam', area: 'Privacy & sharing', name: 'Contact form spam protection', status: 'Live', impact: 'Later', detail: 'Hidden trap field plus a server rate limit.' },
  // Media
  { id: 'podcasts', area: 'Media', name: 'Personal podcasts', status: 'Live', impact: 'Medium', detail: 'Written from each chart, voiced, saved to a private library.' },
  { id: 'cassette', area: 'Media', name: 'Cassette-player podcast interface', status: 'Planned', impact: 'Later', detail: '1950s cassette player for listening.' },
  { id: 'studio', area: 'Media', name: 'Cosmic Studio', status: 'Live', impact: 'Medium', detail: 'Wallpapers, posters, journal pages and cards drawn from the saved chart.' },
  // Platform
  { id: 'performance', area: 'Platform', name: 'Lighter, faster site', status: 'Live', impact: 'High', detail: 'Unused code removed, pages load when opened, public pages pre-rendered for sharing.' },
  { id: 'install', area: 'Platform', name: 'Home-screen install', status: 'Live', impact: 'Later', detail: 'Phone install prompt; a mid-century styled banner is planned.' },
  { id: 'launch-checklist', area: 'Platform', name: 'Admin launch checklist', status: 'Partial', impact: 'Medium', detail: 'Live payment, print, privacy and content checks with export.' },
  { id: 'founder-docs', area: 'Platform', name: 'Founder document check on /developer', status: 'Planned', impact: 'Later', detail: 'Upload and compare founder documents privately.' },
  { id: 'case-stamps', area: 'Platform', name: 'Investigation archive stamps', status: 'Planned', impact: 'Later', detail: '“Confidential” and “Verified” stamps on case files.' },
  { id: 'chapter-window', area: 'Platform', name: 'Long chapter list loads visible rows only', status: 'Planned', impact: 'Later', detail: 'Faster 382-chapter index.' },
  // Community
  { id: 'pen-names', area: 'Community', name: 'Community pen names', status: 'Partial', impact: 'Later', detail: 'Posting under a chosen handle and placement badge.' },
  { id: 'social', area: 'Community', name: 'Zodaci Social', status: 'Planned', impact: 'Later', detail: 'Pseudonymous profiles, topic boards and opt-in full-synastry matching.' },
];

const IMPACT_ORDER: Record<Impact, number> = { High: 0, Medium: 1, Later: 2 };
const STATUS_ORDER: Record<FeatureStatus, number> = { Partial: 0, Planned: 1, Blocked: 2, Live: 3 };

/** Not-yet-live work, most visible first; blocked items sink below what can be built now. */
export function nextImplementations(list: Feature[] = FEATURES): Feature[] {
  return list.filter(f => f.status !== 'Live').sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact] || STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

export function statusCounts(list: Feature[] = FEATURES): Record<FeatureStatus, number> {
  const c: Record<FeatureStatus, number> = { Live: 0, Partial: 0, Planned: 0, Blocked: 0 };
  for (const f of list) c[f.status]++;
  return c;
}

export function byArea(list: Feature[] = FEATURES): [string, Feature[]][] {
  const m = new Map<string, Feature[]>();
  for (const f of list) m.set(f.area, [...(m.get(f.area) ?? []), f]);
  return [...m];
}
