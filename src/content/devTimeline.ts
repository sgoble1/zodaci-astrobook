/** Project history, summarised from both build chats (original "zodaci" project → this build). Dates are when work happened. */
export type TimelineEvent = { date: string; title: string; summary: string; phase: 'Original build' | 'Current build' };

export const DEV_TIMELINE: TimelineEvent[] = [
  { date: '2025-10-01', phase: 'Original build', title: 'Project started as "Zodiactic"', summary: 'Full outline for personalised star-chart generation, explanations, saving and planning. Backend, sign-in, profiles and roles set up; MVP with birth data and natal charts.' },
  { date: '2025-10-02', phase: 'Original build', title: 'Phases 2–3: interpretations and premium', summary: 'Aspects, transits, retrograde tables and AI interpretations; Stripe enabled; progressions, synastry, historical parallels and action planner.' },
  { date: '2025-10-04', phase: 'Original build', title: 'All five stages completed', summary: 'Articles library (11 seeded), retrograde periods 2025–2027, 20 historical figures, 60+ cities, admin tools.' },
  { date: '2025-11-18', phase: 'Original build', title: 'Renamed to Zodaci', summary: '126 mentions in 35 files rebranded. New cosmic purple/cyan theme with animated stars.' },
  { date: '2025-11-19', phase: 'Original build', title: 'Theme iterations, accessibility, testing, SEO', summary: 'Two typography/colour redesigns; accessibility, Vitest testing, SEO and documentation.' },
  { date: '2025-11-26', phase: 'Original build', title: 'Launch-readiness review', summary: 'Security scan and production check before custom domain; all 10 core phases reported complete; article expansion tool.' },
  { date: '2026-03-09', phase: 'Original build', title: '12-phase, 40-enhancement plan', summary: 'Dark-mode fixes, expanded astronomy logic and new pages — the last major round in the original project.' },
  { date: '2026-07-07', phase: 'Current build', title: 'New build started', summary: 'Fresh project created to rebuild Zodaci on a cleaner foundation with a cinematic design.' },
  { date: '2026-10-04', phase: 'Current build', title: 'Private shared space for Shane & April', summary: 'Conversations, posts, notes, future topics and shared accounts — enforced on the server.' },
  { date: '2026-10-11', phase: 'Current build', title: 'Illustrations, relationships, counselors, usage feed', summary: 'Topic illustrations, relationship pages, private counselor sessions and live usage monitoring; April Mercury house correction with house-system notes.' },
  { date: '2026-10-18', phase: 'Current build', title: '"Digital Sanctuary" design system', summary: 'Theme rebuilt to match the logo; drawn illustrations replace number boxes throughout.' },
  { date: '2026-10-19', phase: 'Current build', title: 'Founder editions', summary: "Shane's ~200,000-word Masterbook imported as chapters; founder access, chart sharing and linked workspace." },
  { date: '2026-10-21', phase: 'Current build', title: 'Zac’s edition, Official AstroBook, shop', summary: "Zac's 198 chapters and workbook; Official AstroBook; Shopify storefront; investor access." },
  { date: '2026-10-25', phase: 'Current build', title: 'Deep audits and fixes', summary: 'Many rounds of gap-finding: April data leaking into member pages, session refresh, admin tabs, store admin, print reports.' },
  { date: '2026-10-28', phase: 'Current build', title: 'Personal charts everywhere, billing hardening', summary: 'Members see only their own planets, houses, timing and relationships; illuminated chart wheel; checkout validation and plan changes.' },
  { date: '2026-10-29', phase: 'Current build', title: 'Account-only privacy, AstroBook = Masterbook', summary: 'Passwords removed; books private to each account with sharing. Six-volume personal AstroBook; cover designer.' },
  { date: '2026-10-29', phase: 'Current build', title: 'Showcases, investor page, Creator Studio, credit packs', summary: 'Illustrated sample pages, AstroComic Issue #1 (7 drawn pages), founder showcases, Pro gets every feature, design-and-download studio, credit packs and the developer dashboard.' },
];
