/**
 * Astral Research Authority world registry: every page belongs to a place, each place has a
 * staff host. Pages read their banner label/host from here so the world stays consistent.
 */
export type StaffId = 'director' | 'cartographer' | 'archivist' | 'navigator' | 'analyst' | 'broadcaster' | 'researcher' | 'historian' | 'curator';

export const STAFF: Record<StaffId, { title: string; department: string }> = {
  director: { title: 'The Director', department: 'Grand Observatory' },
  cartographer: { title: 'The Cartographer', department: 'Astral Mapping Center' },
  archivist: { title: 'The Archivist', department: 'Cosmic Archive' },
  navigator: { title: 'The Navigator', department: 'Navigation Chamber' },
  analyst: { title: 'The Analyst', department: 'Life Compass' },
  broadcaster: { title: 'The Broadcaster', department: 'Broadcast Studio' },
  researcher: { title: 'The Researcher', department: 'Research Library' },
  historian: { title: 'The Historian', department: 'Timeline Hall' },
  curator: { title: 'The Curator', department: 'Relationship Bureau' },
};

/** Each place has one 1950s scene illustration (banner art) and one icon; components map the key to files. */
export type PlaceScene = 'broadcast-studio' | 'astral-mapping' | 'navigation-chamber' | 'cosmic-archive' | 'relationship-bureau' | 'research-library'
  | 'timeline-hall' | 'founder-command' | 'grand-observatory' | 'observation-deck' | 'gift-shop' | 'radio-room' | 'comic-press';
export interface Place { name: string; host: StaffId; motto: string; scene: PlaceScene }

/** Route prefix → place. First match wins; order from most to least specific. */
export const PLACES: [string, Place][] = [
  ['/dashboard', { name: 'Broadcast Studio', host: 'broadcaster', motto: 'Your current chapter, on air', scene: 'broadcast-studio' }],
  ['/chart', { name: 'Astral Mapping Center', host: 'cartographer', motto: 'The measured sky at your birth', scene: 'astral-mapping' }],
  ['/my-chart', { name: 'Astral Mapping Center', host: 'cartographer', motto: 'The measured sky at your birth', scene: 'astral-mapping' }],
  ['/observations', { name: 'Observation Deck', host: 'cartographer', motto: 'What you saw, logged against the real sky', scene: 'observation-deck' }],
  ['/forecast', { name: 'Navigation Chamber', host: 'navigator', motto: 'Timing and the road ahead', scene: 'navigation-chamber' }],
  ['/transits', { name: 'Navigation Chamber', host: 'navigator', motto: 'Timing and the road ahead', scene: 'navigation-chamber' }],
  ['/astrobook', { name: 'Cosmic Archive', host: 'archivist', motto: 'Astral dossiers, issued to you', scene: 'cosmic-archive' }],
  ['/my-astrobook', { name: 'Cosmic Archive', host: 'archivist', motto: 'Astral dossiers, issued to you', scene: 'cosmic-archive' }],
  ['/masterbook', { name: 'Cosmic Archive', host: 'archivist', motto: 'The full edition, chapter by chapter', scene: 'cosmic-archive' }],
  ['/library', { name: 'Cosmic Archive', host: 'archivist', motto: 'Everything you have collected', scene: 'cosmic-archive' }],
  ['/relationships', { name: 'Relationship Bureau', host: 'curator', motto: 'Charts side by side', scene: 'relationship-bureau' }],
  ['/siblings', { name: 'Relationship Bureau', host: 'curator', motto: 'Brothers and sisters, side by side', scene: 'relationship-bureau' }],
  ['/compatibility', { name: 'Relationship Bureau', host: 'curator', motto: 'Charts side by side', scene: 'relationship-bureau' }],
  ['/academy', { name: 'Research Library', host: 'researcher', motto: 'Learn how the sky is read', scene: 'research-library' }],
  ['/learn', { name: 'Research Library', host: 'researcher', motto: 'Lessons, guides, forecasts and articles', scene: 'research-library' }],
  ['/reading-room', { name: 'Research Library', host: 'researcher', motto: 'Readings and guides', scene: 'research-library' }],
  ['/timeline', { name: 'Timeline Hall', host: 'historian', motto: 'Past, current and emerging chapters', scene: 'timeline-hall' }],
  ['/podcasts', { name: 'Radio Room', host: 'broadcaster', motto: 'Your chart, read aloud', scene: 'radio-room' }],
  ['/my-comic', { name: 'Comic Press', host: 'archivist', motto: 'Your sky, drawn panel by panel', scene: 'comic-press' }],
  ['/astrocomic', { name: 'Comic Press', host: 'archivist', motto: 'Your sky, drawn panel by panel', scene: 'comic-press' }],
  ['/store', { name: 'Observatory Gift Shop', host: 'curator', motto: 'Souvenirs from your own sky', scene: 'gift-shop' }],
  ['/admin', { name: 'Founder Command', host: 'director', motto: 'Operations of the Authority', scene: 'founder-command' }],
  ['/developer', { name: 'Founder Command', host: 'director', motto: 'Operations of the Authority', scene: 'founder-command' }],
];

export function placeFor(pathname: string): Place {
  return PLACES.find(([p]) => pathname === p || pathname.startsWith(`${p}/`))?.[1]
    ?? { name: 'Grand Observatory', host: 'director', motto: 'Same skies. Brighter answers.', scene: 'grand-observatory' };
}

/** Member characters offered at character selection. The Stargazer is always featured first. */
export const MEMBER_CHARACTERS = [
  { id: 'stargazer', name: 'The Stargazer', blurb: 'Observatory apprentice who maps every new light', featured: true },
  { id: 'explorer', name: 'The Explorer', blurb: 'Follows the chart into unknown country' },
  { id: 'builder', name: 'The Builder', blurb: 'Turns insight into structure' },
  { id: 'scholar', name: 'The Scholar', blurb: 'Reads every footnote of the sky' },
  { id: 'inventor', name: 'The Inventor', blurb: 'Tinkers with new ways forward' },
  { id: 'dreamer', name: 'The Dreamer', blurb: 'Listens to the quiet planets' },
  { id: 'storykeeper', name: 'The Storykeeper', blurb: 'Keeps the record of each chapter' },
  { id: 'artist', name: 'The Artist', blurb: 'Draws meaning from color and form' },
  { id: 'visionary', name: 'The Visionary', blurb: 'Sees the long arc of a life' },
  { id: 'wayfinder', name: 'The Wayfinder', blurb: 'Reads the stars to choose a road' },
  { id: 'healer', name: 'The Healer', blurb: 'Tends the body and the heart' },
  { id: 'cadet', name: 'The Navigator Cadet', blurb: 'Learning to steer by the planets' },
] as const;
