import type { LucideIcon } from 'lucide-react';
import {
  Activity, Atom, BookHeart, BookOpen, BookOpenText, Calculator, CalendarClock, CalendarRange, CircleHelp, Compass, Crown, Gift, Globe2,
  GraduationCap, Hash, Headphones, Heart, HeartHandshake, Info, LayoutDashboard, Library, ListChecks, MessageCircle, MessagesSquare, Moon,
  NotebookPen, Orbit, Package, PenLine, PlayCircle, Printer, RefreshCcw, Repeat, ScrollText, Search, Settings2, ShieldCheck, Sparkles, Star,
  Share2, Sun, Telescope, Truck, UserRound, Users, Wand2, Waypoints,
} from 'lucide-react';
import { CORE_THEMES, SYSTEM_READINGS, TOPIC_READINGS } from '@/lib/topicReadings';
import { planAllows, requiredPlan, type Plan } from '@/content/navigation';

/**
 * The member app's single navigation registry (non-April shell).
 * Header mega-menus, phone tabs/sheets, quick-access rows, breadcrumbs, "Continue exploring",
 * member search and the member Instructions page all read from here, so a page placed once appears everywhere.
 * April's private edition keeps her original menu (APRIL_NAV_GROUPS) and is not affected.
 */

export type DomainId = 'chart' | 'readings' | 'book' | 'explore' | 'learn';
/** Who may see an item. Founder/admin audiences mirror checks the database already enforces; they only hide links. */
export type Audience = 'all' | 'shane' | 'shared';
export type MemberNavItem = { to: string; label: string; description: string; icon: LucideIcon; badge?: 'New' | 'Popular' | 'Free'; audience?: Audience };
export type MemberNavColumn = { title: string; items: MemberNavItem[]; more?: { to: string; label: string } };
export type MemberDomain = {
  id: DomainId; label: string; hub: string; hubLabel: string; description: string; icon: LucideIcon;
  columns: MemberNavColumn[];
  /** Quick-access row shown on this domain's hub and section pages (phone-friendly horizontal tabs). */
  tabs: string[];
  /** Extra paths (and their sub-paths) that belong to this domain without being menu items. */
  prefixes: string[];
};

const topic = (slug: string) => `/my-readings/topic/${slug}`;
const topicTitle = (slug: string) => [...TOPIC_READINGS, ...CORE_THEMES].find(t => t.slug === slug)?.title ?? slug;

export const MEMBER_DOMAINS: MemberDomain[] = [
  {
    id: 'chart', label: 'Chart', hub: '/my-chart', hubLabel: 'Open my chart', icon: Orbit,
    description: 'Everything calculated from your own birth details.',
    tabs: ['/my-chart', '/planets', '/houses', '/aspects', '/star-map', '/results', '/findings', '/chart-elements', '/chart-calculator'],
    prefixes: ['/birth-chart', '/chart-guide'],
    columns: [
      { title: 'Your chart', items: [
        { to: '/my-chart', label: 'My Chart', description: 'Your wheel, placements and strongest aspects', icon: Orbit, badge: 'Popular' },
        { to: '/planets', label: 'Planets', description: 'Every planet and point in your chart', icon: Sun },
        { to: '/houses', label: 'Houses', description: 'Your twelve life areas and their cusps', icon: LayoutDashboard },
        { to: '/aspects', label: 'Aspects', description: 'How your planets work together', icon: Waypoints },
        { to: '/star-map', label: 'Fixed-Star Sky Map', description: 'Bright stars near your chart points', icon: Star },
      ] },
      { title: 'Go deeper', items: [
        { to: '/results', label: 'My Results', description: 'Six-tab analysis of your chart patterns', icon: ListChecks },
        { to: '/findings', label: 'Key Findings', description: 'Patterns the chart engine found for you', icon: Sparkles },
        { to: '/chart-elements', label: 'Elements & Modes', description: 'Your fire, earth, air and water balance', icon: Atom },
        { to: '/chart-calculator', label: 'Chart Calculator', description: 'Calculate any date, time and place', icon: Calculator },
        { to: '/start', label: 'Birth details', description: 'Check or change your date, time and place', icon: Settings2 },
        { to: '/our-charts', label: 'Our Two Charts', description: 'April and Shane side by side', icon: Users, audience: 'shared' },
      ] },
    ],
  },
  {
    id: 'readings', label: 'Readings', hub: '/my-readings', hubLabel: 'All my readings', icon: BookOpenText,
    description: 'Readings written only from your own placements.',
    tabs: ['/my-readings', '/chat', '/wonderings', '/counselors', '/workbook', '/retrogood', '/create'],
    prefixes: ['/my-readings', '/workbook', '/counselors', '/chat', '/topics'],
    columns: [
      { title: 'My readings', more: { to: '/my-readings#topics', label: `All ${TOPIC_READINGS.length} topics & ${CORE_THEMES.length} core themes` }, items: [
        { to: '/my-readings', label: 'All my readings', description: 'Topics, core themes and quick readings', icon: BookOpenText },
        { to: topic('big-three'), label: topicTitle('big-three'), description: 'Sun, Moon and Rising together', icon: Sun, badge: 'Free' },
        { to: topic('core-personality'), label: topicTitle('core-personality'), description: 'A core theme, free to start', icon: Sparkles, badge: 'Free' },
        { to: topic('love'), label: topicTitle('love'), description: 'How you love and what you need', icon: Heart },
        { to: topic('career'), label: topicTitle('career'), description: 'Work, calling and direction', icon: Crown },
        { to: topic('purpose'), label: topicTitle('purpose'), description: 'What your chart points you toward', icon: Compass },
      ] },
      { title: 'Ask & talk', items: [
        { to: '/chat', label: 'SmartChat', description: 'Ask anything about your chart', icon: MessageCircle },
        { to: '/wonderings', label: 'Wonderings', description: 'Questions and topics to come back to', icon: Search },
        { to: '/counselors', label: 'Counselors', description: 'Profiles and saved sessions', icon: Users },
        { to: '/workbook/social-integration', label: 'Social Counselor', description: 'Prepare words, boundaries and next steps', icon: HeartHandshake },
        { to: '/workbook/companion', label: 'The Oracle Within', description: 'A private, reflective conversation', icon: Moon },
      ] },
      { title: 'Reflect', items: [
        { to: '/workbook', label: 'Guided Workbook', description: 'Exercises for your placements', icon: NotebookPen },
        { to: '/workbook/check-in', label: 'Daily Check-in', description: 'Name what is happening today', icon: Activity },
        { to: '/workbook/reframe', label: 'Thought Reframe', description: 'Facts, alternatives and a kinder response', icon: RefreshCcw },
        { to: '/workbook/journal', label: 'Journal & Patterns', description: 'Private reflections over time', icon: PenLine },
        { to: '/retrogood', label: 'RetroGOOD', description: 'What stands out in your chart', icon: Repeat },
        { to: '/create', label: 'Create a Topic & Page', description: 'A new cited page about anything', icon: Wand2 },
      ] },
    ],
  },
  {
    id: 'book', label: 'Book', hub: '/my-astrobook', hubLabel: 'Open my library', icon: BookHeart,
    description: 'Your Masterbook, printed AstroBook, audio and keepsakes.',
    tabs: ['/my-astrobook', '/my-masterbook', '/books', '/orders', '/podcasts', '/my-comic'],
    prefixes: ['/shane', '/april', '/zac'],
    columns: [
      { title: 'My AstroBook', items: [
        { to: '/my-masterbook', label: 'My Masterbook', description: 'Your foundational chapters', icon: BookHeart, badge: 'Popular' },
        { to: '/books', label: 'Printed AstroBook', description: 'Choose a version, cover and topics', icon: Printer },
        { to: '/orders', label: 'My book orders', description: 'Downloads, print status and tracking', icon: Truck },
        { to: '/book-preview', label: 'Book preview', description: 'Flip through a sample book', icon: BookOpen },
      ] },
      { title: 'Library', items: [
        { to: '/my-astrobook', label: 'My Library', description: 'Everything that is yours, searchable', icon: Library },
        { to: '/podcasts', label: 'Podcasts', description: 'Turn readings into audio episodes', icon: Headphones },
        { to: '/my-comic', label: 'My AstroComic', description: 'Your illustrated monthly issue', icon: Package },
        { to: '/store', label: 'Zodaci Shop', description: 'Posters, stickers and notebooks', icon: Package },
      ] },
      { title: 'Editions', items: [
        { to: '/shane', label: 'Shane’s Full Masterbook', description: 'Your private founder edition', icon: Crown, audience: 'shane' },
        { to: '/topics', label: 'All Themes & Topics', description: 'Every founder theme in one place', icon: ScrollText, audience: 'shane' },
      ] },
    ],
  },
  {
    id: 'explore', label: 'Explore', hub: '/explore', hubLabel: 'Open Explore', icon: Telescope,
    description: 'Timing, relationships, other traditions and community.',
    tabs: ['/explore', '/transits', '/timeline', '/retrogrades', '/profection', '/relationships', '/other-systems'],
    prefixes: ['/relationships', '/other-systems', '/shared', '/community'],
    columns: [
      { title: 'Timing', items: [
        { to: '/transits', label: 'Transits', description: 'What is moving through your chart now', icon: CalendarClock, badge: 'Popular' },
        { to: '/timeline', label: 'Personal Timeline', description: 'Your life phases at a glance', icon: CalendarRange },
        { to: '/retrogrades', label: 'Retrogrades', description: 'Inward periods, natal and coming', icon: Repeat },
        { to: '/profection', label: 'Year Ahead · Profection', description: 'This year’s focus house', icon: Sun },
        { to: topic('timing'), label: topicTitle('timing'), description: 'Turning points written for you', icon: Sparkles },
      ] },
      { title: 'Relationships', items: [
        { to: '/relationships', label: 'All relationships', description: 'Add people and compare charts', icon: Heart },
        { to: '/compatibility', label: 'Quick Compatibility Score', description: 'Two birthdays, one score', icon: HeartHandshake },
      ] },
      { title: 'Other systems', more: { to: '/other-systems', label: `All ${SYSTEM_READINGS.length} traditions` }, items: [
        { to: '/other-systems', label: 'Other Systems · Dashboard', description: 'Eight traditions from your birth details', icon: Globe2 },
        { to: '/chinese', label: 'Chinese · Ba Zi', description: 'Four Pillars and your animal', icon: Sparkles },
        { to: '/other-systems/vedic', label: 'Vedic · Jyotish', description: 'Sidereal placements', icon: Sun },
        { to: '/other-systems/mayan-tzolkin', label: 'Maya · Tzolk’in', description: 'Your day sign and tone', icon: Orbit },
        { to: '/numerology', label: 'Numerology · Pinnacles', description: 'Life path and number cycles', icon: Hash },
        { to: '/purpose', label: 'Purpose & Numerology', description: 'Purpose themes from your numbers', icon: Compass },
      ] },
      { title: 'Community', items: [
        { to: '/community', label: 'Community', description: 'Read and reply with members', icon: MessagesSquare },
        { to: '/workspaces', label: 'Shared workspaces', description: 'Invite people and share episodes', icon: Users },
        { to: '/referrals', label: 'Invite a Friend', description: 'Share Zodaci with someone', icon: Gift },
        { to: '/shared', label: 'Our Shared Space', description: 'April and Shane’s private space', icon: HeartHandshake, audience: 'shared' },
      ] },
    ],
  },
  {
    id: 'learn', label: 'Learn', hub: '/academy', hubLabel: 'Open the Academy', icon: GraduationCap,
    description: 'Lessons, plain-language guides and articles.',
    tabs: ['/academy', '/themes', '/blog', '/instructions', '/faq', '/verify'],
    prefixes: ['/academy', '/themes', '/blog'],
    columns: [
      { title: 'Academy', items: [
        { to: '/academy', label: 'Zodaci Academy', description: 'Short lessons from first steps up', icon: GraduationCap, badge: 'New' },
        { to: '/themes', label: 'Core themes explained', description: 'The twelve themes, in plain words', icon: Sparkles },
      ] },
      { title: 'Reference & help', items: [
        { to: '/instructions', label: 'Instructions & Help', description: 'Where everything lives', icon: CircleHelp },
        { to: '/faq', label: 'FAQ', description: 'Plans, privacy, books and accuracy', icon: Info },
        { to: '/verify', label: 'Verify the Sources', description: 'Check positions and meanings yourself', icon: ShieldCheck },
        { to: '/demo', label: 'Interactive demo', description: 'See a full sample reading', icon: PlayCircle },
      ] },
      { title: 'Read', items: [
        { to: '/blog', label: 'Community Journal', description: 'Articles and member reflections', icon: ScrollText },
        { to: '/about', label: 'About Zodaci', description: 'Who we are and how it works', icon: Info },
      ] },
    ],
  },
];

export type AccountLink = { to: string; label: string; icon: LucideIcon };
/** Account menu (avatar). Utility destinations live here instead of the main menu. */
export const ACCOUNT_MENU: AccountLink[] = [
  { to: '/dashboard', label: 'My Dashboard & Bookmarks', icon: LayoutDashboard },
  { to: '/start', label: 'Edit birth details', icon: Settings2 },
  { to: '/personal-context', label: 'Personal context', icon: UserRound },
  { to: '/workspaces', label: 'Shared workspaces', icon: Users },
  { to: '/shared-with-me', label: 'Shared with me', icon: Share2 },
  { to: '/pricing', label: 'Plans & Pricing', icon: Crown },
  { to: '/orders', label: 'My book orders', icon: Truck },
  { to: '/creator', label: 'Cosmic Studio', icon: Wand2 },
  { to: '/instructions', label: 'Instructions & Help', icon: CircleHelp },
  { to: '/about', label: 'About Zodaci', icon: Info },
];
/** Admin tools: only ever rendered inside the Account menu for admins; pages check the role again. */
export const ADMIN_MENU: AccountLink[] = [
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
  { to: '/dispatch', label: 'Dispatch desk', icon: Truck },
];
export const ADMIN_PATHS = ['/admin', '/dispatch', '/data-quality'];

export type NavContext = { shane?: boolean; shared?: boolean };
const allowed = (item: MemberNavItem, ctx: NavContext) => !item.audience || item.audience === 'all' || (item.audience === 'shane' ? !!ctx.shane : !!ctx.shared);

/** Menu links for whole editions someone has shared with this account (the database decides; links only follow it). */
const SHARED_EDITION_LINK: Record<string, Omit<MemberNavItem, 'icon'>> = {
  april: { to: '/april', label: 'April’s Masterbook', description: 'Shared with you by April' },
  shane: { to: '/shane', label: 'Shane’s Masterbook', description: 'Shared with you by Shane' },
  zac: { to: '/zac', label: 'Zac’s Astrological Library', description: 'Shared with you by Zac' },
};
export function withSharedEditions(columns: MemberNavColumn[], editions: string[]): MemberNavColumn[] {
  const links = [...new Set(editions)].map(e => SHARED_EDITION_LINK[e]).filter(Boolean).map(l => ({ ...l, icon: Crown }));
  if (!links.length) return columns;
  const at = columns.findIndex(c => c.title === 'Editions');
  if (at < 0) return [...columns, { title: 'Editions', items: links }];
  const have = new Set(columns[at].items.map(i => i.to));
  return columns.map((c, i) => i === at ? { ...c, items: [...c.items, ...links.filter(l => !have.has(l.to))] } : c);
}

/** Columns a person may see; empty columns (e.g. Editions for non-founders) drop out. */
export function visibleColumns(domain: MemberDomain, ctx: NavContext): MemberNavColumn[] {
  return domain.columns.map(c => ({ ...c, items: c.items.filter(i => allowed(i, ctx)) })).filter(c => c.items.length);
}
export function domainItems(domain: MemberDomain, ctx: NavContext = { shane: true, shared: true }) {
  return visibleColumns(domain, ctx).flatMap(c => c.items);
}
export const domainById = (id: DomainId) => MEMBER_DOMAINS.find(d => d.id === id)!;

/** Lock badge for an item: the plan it needs when the member's plan is lower, otherwise null. */
export function itemLock(plan: Plan, to: string): Plan | null {
  const need = requiredPlan(to.split('#')[0]);
  return planAllows(plan, need) ? null : need;
}

const pathOnly = (to: string) => to.split('#')[0].split('?')[0];
const under = (path: string, base: string) => path === base || path.startsWith(`${base}/`);

/** Which domain a path belongs to; 'account' for account utilities, null for pages outside the member menu. */
export function domainFor(path: string): DomainId | 'account' | null {
  if (['/dashboard', '/personal-context', '/pricing', '/creator', '/checkout/return', '/'].includes(path) || ADMIN_PATHS.some(p => under(path, p))) return 'account';
  const hub = MEMBER_DOMAINS.find(d => d.hub === path); if (hub) return hub.id;
  // Exact menu items first (e.g. Key Years lives in Explore although it is a reading).
  for (const d of MEMBER_DOMAINS) if (d.columns.some(c => c.items.some(i => pathOnly(i.to) === path))) return d.id;
  let best: { id: DomainId; len: number } | null = null;
  for (const d of MEMBER_DOMAINS) {
    for (const base of [...d.prefixes, ...d.columns.flatMap(c => c.items.map(i => pathOnly(i.to)))]) {
      if (base !== '/' && under(path, base) && (!best || base.length > best.len)) best = { id: d.id, len: base.length };
    }
  }
  return best?.id ?? null;
}

/** Created pages keep their original menu-group title; this places them in the matching domain. */
export function domainForMenuGroup(group: string): DomainId {
  if (group === 'The Natal Chart') return 'chart';
  if (['Timing & Cycles', 'Other Systems', 'Relationships', 'Shared Spaces'].includes(group)) return 'explore';
  if (group === 'Library') return 'book';
  return 'readings';
}

export type Crumb = { label: string; to?: string };
export type CrumbNames = { relationship?: (id: string) => string | undefined; page?: (id: string) => { title: string; menu_group: string } | undefined };
const titleCase = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const COUNSELOR_NAMES: Record<string, string> = { oracle: 'The Oracle Within', social: 'Social Counselor' };
const hubCrumb = (id: DomainId): Crumb => { const d = domainById(id); return { label: d.label, to: d.hub }; };

/** Breadcrumbs for detail pages (depth 2+). Hubs and menu pages return null — they get the quick-access row instead. Max three levels. */
export function breadcrumbsFor(path: string, names: CrumbNames = {}): Crumb[] | null {
  let m: RegExpMatchArray | null;
  if ((m = path.match(/^\/planets\/([\w-]+)$/))) return [hubCrumb('chart'), { label: 'Planets', to: '/planets' }, { label: titleCase(m[1]) }];
  if ((m = path.match(/^\/houses\/(\d+)$/))) return [hubCrumb('chart'), { label: 'Houses', to: '/houses' }, { label: `House ${m[1]}` }];
  if ((m = path.match(/^\/my-readings\/topic\/([\w-]+)$/))) {
    const slug = m[1];
    if (slug === 'timing') return null; // a menu item under Explore › Timing
    if (MEMBER_DOMAINS.some(d => d.columns.some(c => c.items.some(i => i.to === path)))) return [hubCrumb('readings'), { label: topicTitle(slug) }];
    const core = CORE_THEMES.some(t => t.slug === slug);
    return [hubCrumb('readings'), core ? { label: 'Core themes', to: '/my-readings#core-themes' } : { label: 'In-depth topics', to: '/my-readings#topics' }, { label: topicTitle(slug) }];
  }
  if ((m = path.match(/^\/relationships\/([\w-]+)(?:\/(reading|timeline))?$/))) {
    const name = names.relationship?.(m[1]) ?? 'Relationship';
    return m[2] ? [{ label: 'Relationships', to: '/relationships' }, { label: name, to: `/relationships/${m[1]}` }, { label: titleCase(m[2]) }]
      : [hubCrumb('explore'), { label: 'Relationships', to: '/relationships' }, { label: name }];
  }
  if ((m = path.match(/^\/counselors\/([\w-]+)(?:\/sessions\/[\w-]+)?$/))) {
    const name = COUNSELOR_NAMES[m[1]] ?? titleCase(m[1]);
    return path.includes('/sessions/') ? [{ label: 'Counselors', to: '/counselors' }, { label: name, to: `/counselors/${m[1]}` }, { label: 'Session' }]
      : [hubCrumb('readings'), { label: 'Counselors', to: '/counselors' }, { label: name }];
  }
  if ((m = path.match(/^\/other-systems\/([\w-]+)$/))) {
    if (MEMBER_DOMAINS.some(d => d.columns.some(c => c.items.some(i => i.to === path)))) return null;
    const sys = SYSTEM_READINGS.find(s => s.route === path);
    return [hubCrumb('explore'), { label: 'Other systems', to: '/other-systems' }, { label: sys?.title ?? titleCase(m[1]) }];
  }
  if ((m = path.match(/^\/academy\/([\w-]+)$/))) return [hubCrumb('learn'), { label: 'Academy', to: '/academy' }, { label: titleCase(m[1]) }];
  if ((m = path.match(/^\/themes\/([\w-]+)$/))) return [hubCrumb('learn'), { label: 'Core themes', to: '/themes' }, { label: titleCase(m[1]) }];
  if ((m = path.match(/^\/workbook\/module\/([\w-]+)$/))) return [hubCrumb('readings'), { label: 'Workbook', to: '/workbook' }, { label: titleCase(m[1]) }];
  if (path.match(/^\/workbook\/companion\/[\w-]+$/)) return [hubCrumb('readings'), { label: 'The Oracle Within', to: '/workbook/companion' }, { label: 'Session' }];
  if (path.match(/^\/workbook\/social-integration\/[\w-]+$/)) return [hubCrumb('readings'), { label: 'Social Counselor', to: '/workbook/social-integration' }, { label: 'Session' }];
  if (path.match(/^\/chat\/[\w-]+$/)) return [hubCrumb('readings'), { label: 'SmartChat', to: '/chat' }, { label: 'Conversation' }];
  if (path.match(/^\/shane\/[\w-]+$/)) return [hubCrumb('book'), { label: 'Shane’s Masterbook', to: '/shane' }, { label: 'Chapter' }];
  if ((m = path.match(/^\/p\/([\w-]+)$/))) {
    const page = names.page?.(m[1]);
    return [hubCrumb(page ? domainForMenuGroup(page.menu_group) : 'readings'), { label: 'Your created pages', to: '/my-astrobook' }, { label: page?.title ?? 'Created page' }];
  }
  return null;
}

export type NextStep = { label: string; description: string; to: string; badge?: 'For you' | 'Popular' | 'New' };
export type NextStepContext = { plan: Plan; moonSign?: string; hasChart: boolean; lastVisit?: { path: string; title: string } | null };

const CURATED: Record<string, NextStep[]> = {
  '/my-chart': [
    { label: 'See your current transits', description: 'What is moving through your chart now', to: '/transits' },
    { label: 'Start your first reading', description: 'Your Big Three, written from your placements', to: topic('big-three') },
  ],
  '/my-readings': [
    { label: 'Go deeper with the Oracle Within', description: 'Talk through a reading privately', to: '/workbook/companion' },
    { label: 'Ask a specific question', description: 'SmartChat answers from your chart', to: '/chat' },
    { label: 'Add it to your Workbook', description: 'Guided exercises for your placements', to: '/workbook' },
  ],
  '/my-masterbook': [
    { label: 'Preview your book', description: 'Flip through a sample AstroBook', to: '/book-preview' },
    { label: 'Hold it in print', description: 'Five versions, from digital to linen', to: '/books' },
    { label: 'Listen as a podcast', description: 'Turn chapters into audio', to: '/podcasts' },
  ],
  '/transits': [
    { label: 'See what’s coming in your Timeline', description: 'Your life phases at a glance', to: '/timeline' },
    { label: 'Check your Profection year', description: 'This year’s focus house', to: '/profection' },
    { label: 'Understand retrogrades', description: 'Inward periods, natal and coming', to: '/retrogrades' },
  ],
  '/pricing': [
    { label: 'Try the interactive demo', description: 'A full sample reading, free', to: '/demo' },
    { label: 'Compare AstroBook versions', description: 'Digital PDF to Collector’s Linen', to: '/books' },
    { label: 'Read the FAQ', description: 'Plans, refunds and privacy', to: '/faq' },
  ],
  '/explore': [
    { label: 'Add someone you love', description: 'Compare two charts with permission', to: '/relationships' },
    { label: 'Your year ahead', description: 'Profection shows this year’s focus', to: '/profection' },
  ],
  '/my-astrobook': [
    { label: 'Read your Masterbook', description: 'Your foundational chapters', to: '/my-masterbook' },
    { label: 'Order it in print', description: 'Choose a version and cover', to: '/books' },
  ],
};
/** One bridge per domain so every page also points somewhere new. */
const BRIDGE: Record<DomainId | 'account', NextStep> = {
  chart: { label: 'Read what your chart says', description: 'Readings written from your placements', to: '/my-readings' },
  readings: { label: 'See what is active now', description: 'Transits through your chart', to: '/transits' },
  book: { label: 'Keep reading', description: 'Your topic readings', to: '/my-readings' },
  explore: { label: 'Turn it into a book', description: 'Your Masterbook and AstroBook', to: '/my-astrobook' },
  learn: { label: 'Apply it to your chart', description: 'Open your own birth chart', to: '/my-chart' },
  account: { label: 'Explore what else is here', description: 'Timing, relationships and other systems', to: '/explore' },
};
/** Pages that already end with their own navigation or where a panel would interrupt a task. */
export const NO_NEXT_STEPS = ['/start', '/auth', '/reset-password', '/checkout/return', '/dashboard', '/create', ...ADMIN_PATHS];
const NO_NEXT_PATTERNS = [/^\/chat\/./, /^\/workbook\/(companion|social-integration)\/./, /^\/counselors\/[\w-]+\/sessions\//, /^\/shared(\/|$)/];

/** Three "Continue exploring" steps for a page: personalised first, then curated or sibling steps, then a cross-domain bridge. */
export function nextStepsFor(path: string, ctx: NextStepContext): NextStep[] {
  if (NO_NEXT_STEPS.some(p => p === path) || NO_NEXT_PATTERNS.some(r => r.test(path))) return [];
  if (!ctx.hasChart) return [
    { label: 'Create your chart', description: 'Two minutes of birth details', to: '/start', badge: 'For you' },
    { label: 'Try the interactive demo', description: 'A full sample reading', to: '/demo' },
    { label: 'Learn the basics', description: 'Short Academy lessons', to: '/academy' },
  ];
  const steps: NextStep[] = [];
  const domain = domainFor(path);
  const isHub = MEMBER_DOMAINS.some(d => d.hub === path);
  if (ctx.lastVisit && ctx.lastVisit.path !== path) steps.push({ label: `Continue: ${ctx.lastVisit.title}`, description: 'Pick up where you left off', to: ctx.lastVisit.path, badge: 'For you' });
  else if (isHub && ctx.moonSign) steps.push({ label: `Your Moon in ${ctx.moonSign}`, description: 'Feelings, instincts and what makes you feel safe', to: '/planets', badge: 'For you' });
  steps.push(...(CURATED[path] ?? []));
  if (domain && domain !== 'account') {
    const items = domainItems(domainById(domain), {}).filter(i => !i.to.includes('#'));
    const at = items.findIndex(i => i.to === path);
    const siblings = at >= 0 ? [...items.slice(at + 1), ...items.slice(0, at)] : items;
    for (const s of siblings) steps.push({ label: s.label, description: s.description, to: s.to });
  }
  steps.push(BRIDGE[domain ?? 'account']);
  const seen = new Set<string>([path]);
  return steps.filter(s => { const p = pathOnly(s.to); if (seen.has(p)) return false; seen.add(p); return true; }).slice(0, 3);
}

/** Flat, de-duplicated list of every member destination (search and Instructions). */
export function memberDestinations(ctx: NavContext = {}) {
  const seen = new Map<string, { to: string; label: string; description: string; group: string }>();
  for (const d of MEMBER_DOMAINS) for (const c of visibleColumns(d, ctx)) for (const i of c.items) if (!seen.has(i.to)) seen.set(i.to, { to: i.to, label: i.label, description: i.description, group: `${d.label} · ${c.title}` });
  for (const d of MEMBER_DOMAINS) if (!seen.has(d.hub)) seen.set(d.hub, { to: d.hub, label: `${d.label} · ${d.hubLabel.replace(/^Open /, '')}`, description: d.description, group: d.label });
  for (const t of TOPIC_READINGS) { const to = topic(t.slug); if (!seen.has(to)) seen.set(to, { to, label: t.title, description: 'In-depth topic reading', group: 'Readings · Topics' }); }
  for (const t of CORE_THEMES) { const to = topic(t.slug); if (!seen.has(to)) seen.set(to, { to, label: t.title, description: 'Core theme reading', group: 'Readings · Core themes' }); }
  for (const s of SYSTEM_READINGS) if (!seen.has(s.route)) seen.set(s.route, { to: s.route, label: s.title, description: 'Other systems reading', group: 'Explore · Other systems' });
  for (const a of ACCOUNT_MENU) if (!seen.has(a.to)) seen.set(a.to, { to: a.to, label: a.label, description: 'Account', group: 'Account' });
  return [...seen.values()];
}

type Placement = { domain: DomainId | 'account' | 'public' | 'april' | 'admin'; level: 'primary' | 'secondary' | 'tertiary' | 'utility' | 'duplicate'; note?: string };
const P = (domain: Placement['domain'], level: Placement['level'], note?: string): Placement => ({ domain, level, note });
/**
 * Appendix A: every route in App.tsx and where people find it. memberNav.test.ts fails when a route is missing here,
 * so new pages must be placed before they ship.
 */
export const ROUTE_INVENTORY: Record<string, Placement> = {
  '/index': P('public', 'utility', 'redirects to /welcome'), '/welcome': P('public', 'primary'), '/april': P('public', 'utility', 'April’s shared report; opens for her account and people she shared her edition with'), '/shared-with-me': P('account', 'utility'),
  '/about': P('learn', 'secondary'), '/lp/:slug': P('public', 'utility', 'campaign pages'), '/blog': P('learn', 'secondary'), '/blog/learn/:slug': P('learn', 'tertiary', 'from the Journal'),
  '/community': P('explore', 'secondary'), '/community/guidelines': P('explore', 'tertiary', 'from Community'), '/community/:id': P('explore', 'tertiary', 'from Community'),
  '/astrobook': P('public', 'utility', 'public product page; members use /books'), '/book-preview': P('book', 'secondary'), '/demo': P('learn', 'secondary'),
  '/themes': P('learn', 'secondary'), '/themes/:slug': P('learn', 'tertiary', 'from Core themes explained'), '/faq': P('learn', 'secondary'), '/privacy': P('public', 'utility', 'footer'), '/terms': P('public', 'utility', 'footer'),
  '/astrocomic': P('public', 'utility', 'public product page; members use /my-comic'), '/store': P('public', 'utility', 'public shop'), '/product/:handle': P('public', 'tertiary', 'from the shop'), '/academy': P('learn', 'primary'), '/academy/:slug': P('learn', 'tertiary', 'from the Academy'), '/compatibility': P('explore', 'secondary'),
  '/brand-launch': P('public', 'utility', 'launch kit'), '/contents': P('april', 'utility'), '/contents/:id': P('april', 'utility'), '/read': P('april', 'utility'), '/read/document/:slug': P('april', 'utility'), '/read/:id': P('april', 'utility'),
  '/': P('account', 'duplicate', 'members are sent to /dashboard'), '/explore': P('explore', 'primary'), '/personal-context': P('account', 'utility'), '/workspaces': P('explore', 'secondary'),
  '/wonderings': P('readings', 'secondary'), '/start': P('chart', 'secondary'), '/my-chart': P('chart', 'primary'), '/retrogood': P('readings', 'secondary'), '/our-charts': P('chart', 'secondary', 'shared-space accounts'),
  '/findings': P('chart', 'secondary'), '/results': P('chart', 'secondary'), '/my-readings': P('readings', 'primary'), '/my-readings/topic/:slug': P('readings', 'tertiary', 'every topic and core theme is listed on the Readings hub'),
  '/my-astrobook': P('book', 'primary'), '/auth': P('account', 'utility'), '/reset-password': P('account', 'utility'), '/pricing': P('account', 'utility'), '/creator': P('account', 'utility', 'Cosmic Studio'),
  '/my-comic': P('book', 'secondary'), '/referrals': P('explore', 'secondary'), '/checkout/return': P('account', 'utility'), '/my-masterbook': P('book', 'secondary'), '/books': P('book', 'secondary'), '/orders': P('book', 'secondary'),
  '/dispatch': P('admin', 'utility'), '/instructions': P('learn', 'secondary'), '/birth-chart': P('chart', 'duplicate', 'renders My Chart for members'), '/chart-guide': P('chart', 'duplicate', 'renders My Chart for members'),
  '/planets': P('chart', 'secondary'), '/planets/:key': P('chart', 'tertiary', 'from Planets'), '/houses': P('chart', 'secondary'), '/houses/:num': P('chart', 'tertiary', 'from Houses'), '/aspects': P('chart', 'secondary'),
  '/timeline': P('explore', 'secondary'), '/retrogrades': P('explore', 'secondary'), '/purpose': P('explore', 'secondary'), '/feng-shui': P('april', 'utility'), '/compendium': P('april', 'utility'), '/star-map': P('chart', 'secondary'),
  '/profection': P('explore', 'secondary'), '/numerology': P('explore', 'secondary'), '/transits': P('explore', 'secondary'), '/chinese': P('explore', 'secondary'), '/verify': P('learn', 'secondary'),
  '/other-systems': P('explore', 'secondary'), '/other-systems/:slug': P('explore', 'tertiary', 'from Other Systems'), '/volume-2': P('april', 'utility'), '/data-quality': P('admin', 'duplicate', 'April’s input audit; members see readings'),
  '/masterbook': P('april', 'utility', 'Shane sees his edition'), '/masterbook/index': P('april', 'utility'), '/masterbook/upload': P('april', 'utility'), '/admin': P('admin', 'utility'), '/dashboard': P('account', 'primary'),
  '/masterbook/u/:id': P('april', 'utility'), '/masterbook/pdf/:id': P('april', 'utility'), '/feng-shui/flying-stars': P('april', 'utility'), '/feng-shui/bagua': P('april', 'utility'), '/chart-calculator': P('chart', 'secondary'),
  '/reading': P('april', 'utility', 'Shane sees his edition'), '/bagua-reading': P('april', 'utility'), '/relationships': P('explore', 'secondary'), '/relationships/:id/reading': P('explore', 'tertiary', 'from each relationship'),
  '/relationships/:id/timeline': P('explore', 'tertiary', 'from each relationship'), '/relationships/:id': P('explore', 'tertiary', 'from All relationships'), '/chart-elements': P('chart', 'secondary'),
  '/masterbook/bagua-wheel': P('april', 'utility'), '/masterbook/:id': P('april', 'utility'), '/shane': P('book', 'secondary', 'Shane only'), '/shane/:id': P('book', 'tertiary', 'Shane only, from his Masterbook'),
  '/reading-room': P('learn', 'tertiary', 'Public Reading Room'), '/reading-room/:slug': P('learn', 'tertiary', 'Public Reading Room article'),
  '/zac': P('book', 'tertiary', 'Zac only'), '/zac/workbook': P('book', 'tertiary', 'Zac only'), '/zac/:id': P('book', 'tertiary', 'Zac only, from his library'), '/official-astrobook': P('book', 'tertiary', 'Founders only'), '/official-astrobook/comic/:edition': P('book', 'tertiary', 'Founders only, from the Official AstroBook'), '/official-astrobook/illustrated': P('book', 'tertiary', 'Shane only, from the Official AstroBook'), '/investors': P('book', 'tertiary', 'Invite only'),
  '/podcasts': P('book', 'secondary'), '/sources': P('april', 'utility'), '/sources/read/:id': P('april', 'utility'), '/ask': P('april', 'utility', 'from Chat about this page'), '/chat': P('readings', 'secondary'), '/chat/:id': P('readings', 'tertiary', 'from SmartChat'),
  '/shared': P('explore', 'secondary', 'shared-space accounts'), '/shared/conversations': P('explore', 'tertiary', 'shared space menu'), '/shared/chat/:id': P('explore', 'tertiary', 'shared space menu'), '/shared/posts': P('explore', 'tertiary', 'shared space menu'),
  '/shared/wonderings': P('explore', 'tertiary', 'shared space menu'), '/shared/reading': P('explore', 'tertiary', 'shared space menu'), '/shared/media': P('explore', 'tertiary', 'shared space menu'), '/shared/recommendations': P('explore', 'tertiary', 'shared space menu'),
  '/create': P('readings', 'secondary'), '/workbook': P('readings', 'secondary'), '/workbook/module/:slug': P('readings', 'tertiary', 'from the Workbook'), '/workbook/check-in': P('readings', 'secondary'), '/workbook/reframe': P('readings', 'secondary'),
  '/workbook/journal': P('readings', 'secondary'), '/workbook/companion': P('readings', 'secondary'), '/counselors': P('readings', 'secondary'), '/counselors/:key': P('readings', 'tertiary', 'from Counselors'),
  '/counselors/:key/sessions/:sessionId': P('readings', 'tertiary', 'from each counselor'), '/workbook/companion/:sessionId': P('readings', 'tertiary', 'from the Oracle Within'), '/workbook/social-integration': P('readings', 'secondary'),
  '/workbook/social-integration/:sessionId': P('readings', 'tertiary', 'from the Social Counselor'), '/p/:id': P('readings', 'tertiary', 'created pages: domain menus and My Library'), '/shared/notes': P('explore', 'tertiary', 'shared space menu'),
  '/shared/later': P('explore', 'tertiary', 'shared space menu'), '/shared/accounts': P('explore', 'tertiary', 'shared space menu'), '/topics': P('book', 'secondary', 'Shane only'), '/guides/:slug': P('april', 'utility'), '/topics/:slug': P('april', 'utility'), '*': P('account', 'utility', 'not found'),
};
