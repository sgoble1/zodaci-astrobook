import type { SpotKind } from '@/components/art/SpotArt';

/** Learn page sections; also the Learn submenu in the public header, so both stay in sync. */
export const LEARN_SECTIONS: { id: string; label: string; description: string; art: SpotKind }[] = [
  { id: 'lessons', label: 'Lessons', description: 'Short Academy lessons from first steps up', art: 'book' },
  { id: 'forecasts', label: 'Sky & forecasts', description: 'Today’s sky and a 30-day sky calendar', art: 'year' },
  { id: 'guides', label: 'Guides', description: 'Illustrated Reading Room guides', art: 'explore' },
  { id: 'articles', label: 'Articles', description: 'Sourced articles on the measured sky', art: 'source' },
  { id: 'journal', label: 'Journal', description: 'Essays and reflections from members', art: 'written' },
];
