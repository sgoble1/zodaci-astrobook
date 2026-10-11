import { TOPICS } from '@/content/topics';
import { LIBRARY_TOPICS } from '@/content/libraryTopics';

export type NavItem = { to: string; label: string; created?: boolean; badge?: number };
export type NavSubmenu = { label: string; items: NavItem[] };
export type NavGroup = { title: string; items: NavItem[]; submenus?: NavSubmenu[] };

export const NAV_GROUPS: NavGroup[] = [
  { title: 'Begin', items: [{ to: '/', label: 'Home' }, { to: '/start', label: 'Get Started · Birth Details' }, { to: '/my-chart', label: 'My Chart' }, { to: '/instructions', label: 'Instructions & Help' }, { to: '/explore', label: 'Explore & Discover' }, { to: '/dashboard', label: 'My Dashboard & Bookmarks' }, { to: '/chat', label: 'SmartChat' }, { to: '/create', label: '+ Create a Topic & Page' }] },
  { title: 'Workbook', items: [{ to: '/counselors', label: 'Counselors · Profiles & Sessions' }, { to: '/workbook/social-integration', label: 'Social Integration · Counselor' }, { to: '/workbook/companion', label: 'The Oracle Within · Therapy Chat' }, { to: '/workbook/check-in', label: 'Daily Check-in' }, { to: '/workbook/reframe', label: 'Thought Reframe' }, { to: '/workbook/journal', label: 'Journal & Patterns' }] },
  { title: 'The Natal Chart', items: [{ to: '/birth-chart', label: 'Birth Chart' }, { to: '/chart-guide', label: 'Chart Guide · Plain Language' }, { to: '/chart-calculator', label: 'Chart Calculator' }, { to: '/planets', label: 'Planets' }, { to: '/houses', label: 'Houses' }, { to: '/aspects', label: 'Aspects' }, { to: '/star-map', label: 'Fixed-Star Sky Map' }] },
  { title: 'Timing & Cycles', items: [{ to: '/transits', label: 'Transits' }, { to: '/retrogrades', label: 'Retrogrades' }] },
  { title: 'Other Systems', items: [{ to: '/other-systems', label: 'Other Systems · Dashboard' }, { to: '/verify', label: 'Verify the Sources' }, { to: '/numerology', label: 'Numerology · Pinnacles' }, { to: '/purpose', label: 'Purpose & Numerology' }, { to: '/chinese', label: 'Chinese · Ba Zi' }, { to: '/other-systems/vedic', label: 'Vedic · Jyotish' }, { to: '/other-systems/mayan-tzolkin', label: 'Maya · Tzolk’in' }, { to: '/other-systems/tibetan-mewa', label: 'Tibetan Mewa & Parkha' }, { to: '/other-systems/nine-star-ki', label: 'Japanese Nine Star Ki' }, { to: '/other-systems/chaldean-numerology', label: 'Chaldean Numerology' }, { to: '/other-systems/tarot-birth-cards', label: 'Tarot Birth Cards' }, { to: '/other-systems/celtic-tree-calendar', label: 'Celtic Tree Calendar' }] },
  { title: 'Library', items: [{ to: '/podcasts', label: 'Podcasts' }, ...LIBRARY_TOPICS.map(topic => ({ to: `/topics/${topic.slug}`, label: topic.label })), { to: '/data-quality', label: 'Data Quality' }] },
];

export const SHARED_GROUP: NavGroup = { title: 'Shared Spaces', items: [{ to: '/shared', label: 'Shared Dashboard' }, { to: '/shared/conversations', label: 'Conversations' }, { to: '/shared/posts', label: 'Posts' }, { to: '/shared/wonderings', label: 'Wonderings' }, { to: '/shared/reading', label: 'Reading Together' }, { to: '/shared/media', label: 'Media Library' }, { to: '/shared/recommendations', label: 'Recommendations' }, { to: '/shared/notes', label: 'Notes' }, { to: '/shared/later', label: 'Talk Later' }, { to: '/shared/accounts', label: 'Shared Accounts' }] };
export const RELATIONSHIPS_GROUP: NavGroup = { title: 'Relationships', items: [{ to: '/relationships', label: 'All Relationships' }] };

export const MENU_SECTIONS = [NAV_GROUPS[0].title, NAV_GROUPS[1].title, SHARED_GROUP.title, RELATIONSHIPS_GROUP.title, ...NAV_GROUPS.slice(2).map(g => g.title)];
