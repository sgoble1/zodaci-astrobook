import { registerPrivateValue } from '@/lib/privateEditionStore';
import { WORKBOOK_MODULES } from '@/content/workbook';
import { TOPICS } from '@/content/topics';
import { LIBRARY_TOPICS } from '@/content/libraryTopics';
import { TOPIC_READINGS, CORE_THEMES } from '@/lib/topicReadings';

export type NavItem = { to: string; label: string; created?: boolean; badge?: number };
export type NavSubmenu = { label: string; items: NavItem[] };
export type NavGroup = { title: string; items: NavItem[]; submenus?: NavSubmenu[]; footer?: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  { title: 'Themes & Topics', items: [{ to: '/my-readings', label: 'Your personal themes' }, { to: '/wonderings', label: 'Wonderings · Questions & Topics' }], submenus: [{ label: 'In-depth topic readings', items: TOPIC_READINGS.filter(t => t.slug !== 'timing').map(t => ({ to: `/my-readings/topic/${t.slug}`, label: t.title })) }, { label: 'Core themes', items: CORE_THEMES.map(t => ({ to: `/my-readings/topic/${t.slug}`, label: t.title })) }], footer: [{ to: '/create', label: '+ Create a Topic & Page' }] },
  { title: 'Begin', items: [{ to: '/', label: 'Home' }, { to: '/start', label: 'Get Started · Birth Details' }, { to: '/my-chart', label: 'My Chart' }, { to: '/results', label: 'My Results' }, { to: '/retrogood', label: 'RetroGOOD · What Stands Out' }, { to: '/findings', label: 'Key Findings' }, { to: '/my-readings', label: 'My Readings' }, { to: '/my-astrobook', label: 'My Library' }, { to: '/my-masterbook', label: 'My Masterbook' }, { to: '/explore', label: 'Explore & Discover' }, { to: '/academy', label: 'Zodaci Academy' }, { to: '/chat', label: 'SmartChat' }] },
  { title: 'Workbook', items: [{ to: '/counselors', label: 'Counselors · Profiles & Sessions' }, { to: '/workbook/social-integration', label: 'Social Integration · Counselor' }, { to: '/workbook/companion', label: 'The Oracle Within · Therapy Chat' }, { to: '/workbook/check-in', label: 'Daily Check-in' }, { to: '/workbook/reframe', label: 'Thought Reframe' }, { to: '/workbook/journal', label: 'Journal & Patterns' }] },
  { title: 'The Natal Chart', items: [{ to: '/birth-chart', label: 'Birth Chart' }, { to: '/chart-guide', label: 'Chart Guide · Plain Language' }, { to: '/chart-calculator', label: 'Chart Calculator' }, { to: '/planets', label: 'Planets' }, { to: '/houses', label: 'Houses' }, { to: '/aspects', label: 'Aspects' }, { to: '/star-map', label: 'Fixed-Star Sky Map' }] },
  { title: 'Timing & Cycles', items: [{ to: '/timeline', label: 'Personal Timeline' }, { to: '/my-readings/topic/timing', label: 'Key Years & Turning Points' }, { to: '/transits', label: 'Transits' }, { to: '/retrogrades', label: 'Retrogrades' }, { to: '/profection', label: 'Year Ahead · Profection' }] },
  { title: 'Other Systems', items: [{ to: '/other-systems', label: 'Other Systems · Dashboard' }, { to: '/verify', label: 'Verify the Sources' }, { to: '/numerology', label: 'Numerology · Pinnacles' }, { to: '/purpose', label: 'Purpose & Numerology' }, { to: '/chinese', label: 'Chinese · Ba Zi' }, { to: '/other-systems/vedic', label: 'Vedic · Jyotish' }, { to: '/other-systems/mayan-tzolkin', label: 'Maya · Tzolk’in' }, { to: '/other-systems/tibetan-mewa', label: 'Tibetan Mewa & Parkha' }, { to: '/other-systems/nine-star-ki', label: 'Japanese Nine Star Ki' }, { to: '/other-systems/chaldean-numerology', label: 'Chaldean Numerology' }, { to: '/other-systems/tarot-birth-cards', label: 'Tarot Birth Cards' }, { to: '/other-systems/celtic-tree-calendar', label: 'Celtic Tree Calendar' }] },
  { title: 'Library', items: [{ to: '/podcasts', label: 'Podcasts' }, { to: '/books', label: 'Printed AstroBook' }, { to: '/orders', label: 'My Book Orders' }, { to: '/my-comic', label: 'My AstroComic' }, { to: '/referrals', label: 'Invite a Friend' }, { to: '/blog', label: 'Community Journal' }, ...LIBRARY_TOPICS.map(topic => ({ to: `/topics/${topic.slug}`, label: topic.label })), { to: '/data-quality', label: 'Data Quality' }] },
];

export const SHARED_GROUP: NavGroup = { title: 'Shared Spaces', items: [{ to: '/shared', label: 'Shared Dashboard' }, { to: '/shared/conversations', label: 'Conversations' }, { to: '/shared/posts', label: 'Posts' }, { to: '/shared/wonderings', label: 'Wonderings' }, { to: '/shared/reading', label: 'Reading Together' }, { to: '/our-charts', label: 'Our Two Charts' }, { to: '/shared/media', label: 'Media Library' }, { to: '/shared/recommendations', label: 'Recommendations' }, { to: '/shared/notes', label: 'Notes' }, { to: '/shared/later', label: 'Talk Later' }, { to: '/shared/accounts', label: 'Shared Accounts' }] };
export const RELATIONSHIPS_GROUP: NavGroup = { title: 'Relationships', items: [{ to: '/relationships', label: 'All Relationships' }, { to: '/compatibility', label: 'Quick Compatibility Score' }] };

export const MENU_SECTIONS = [NAV_GROUPS[0].title, NAV_GROUPS[1].title, SHARED_GROUP.title, RELATIONSHIPS_GROUP.title, ...NAV_GROUPS.slice(2).map(g => g.title)];

/** Task-led member navigation; original groups remain intact for private editions and created-page placement. */
export const MEMBER_SECTIONS = [
  { title: 'Readings', groupTitles: ['Themes & Topics', 'Timing & Cycles'] },
  { title: 'My Chart', groupTitles: ['The Natal Chart', 'Other Systems'] },
  { title: 'Reflect', groupTitles: ['Workbook'] },
  { title: 'Relationships', groupTitles: ['Relationships'] },
  { title: 'My Library', groupTitles: ['Library'] },
];

/** April's original private menu, shown only to the approved April & Shane accounts. */
export let APRIL_NAV_GROUPS: NavGroup[] = [];

registerPrivateValue("navigation", "APRIL_NAV_GROUPS", value => { APRIL_NAV_GROUPS = value as typeof APRIL_NAV_GROUPS; }, []);

export type Plan = 'free' | 'full' | 'creator';
const FREE_TOPIC_PATHS = ['/my-readings/topic/big-three', '/my-readings/topic/core-personality'];
const FULL_PATHS = ['/my-masterbook', '/counselors', '/workbook/social-integration', '/workbook/companion', '/timeline', '/retrogrades', '/profection'];
const CREATOR_PATHS = ['/podcasts', '/create', '/creator'];
/** The plan a member page needs. Used by the menu locks and the page guard so both always agree. */
export function requiredPlan(path: string): Plan {
  // Core themes are open to free members as a one-section preview.
  if (path.startsWith('/my-readings/topic/')) return FREE_TOPIC_PATHS.includes(path) || path.startsWith('/my-readings/topic/core-') ? 'free' : 'full';
  if (CREATOR_PATHS.some(p => path === p || path.startsWith(`${p}/`))) return 'creator';
  if (FULL_PATHS.some(p => path === p || path.startsWith(`${p}/`))) return 'full';
  return 'free';
}
const RANK: Record<Plan, number> = { free: 0, full: 1, creator: 2 };
// Pro and Cosmic share every feature; Cosmic differs only by credits.
export function planAllows(have: Plan, need: Plan) { return RANK[have] >= Math.min(RANK[need], 1); }
