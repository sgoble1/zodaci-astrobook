import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ACCOUNT_MENU, ADMIN_MENU, ADMIN_PATHS, MEMBER_DOMAINS, ROUTE_INVENTORY, breadcrumbsFor, domainFor, domainForMenuGroup,
  domainItems, itemLock, memberDestinations, nextStepsFor, visibleColumns,
} from './memberNav';
import { NAV_GROUPS, RELATIONSHIPS_GROUP } from './navigation';
import { CORE_THEMES, TOPIC_READINGS } from '@/lib/topicReadings';

const appRoutes = [...readFileSync(resolve(__dirname, '../App.tsx'), 'utf8').matchAll(/<Route path="([^"]+)"/g)].map(m => m[1]);
const menuPaths = new Set(MEMBER_DOMAINS.flatMap(d => domainItems(d)).map(i => i.to));
const accountPaths = new Set(ACCOUNT_MENU.map(a => a.to));

describe('member navigation architecture', () => {
  it('has exactly five domains at the top level, plus the account menu (7-item cap)', () => {
    expect(MEMBER_DOMAINS.map(d => d.label)).toEqual(['Chart', 'Readings', 'Book', 'Explore', 'Learn']);
    expect(MEMBER_DOMAINS.length + 1).toBeLessThanOrEqual(7);
  });

  it('classifies every route in App.tsx (Appendix A)', () => {
    expect(appRoutes.length).toBeGreaterThan(100);
    expect(appRoutes.filter(r => !ROUTE_INVENTORY[r])).toEqual([]);
  });

  it('puts every secondary route in a menu and every primary route as a hub or account destination', () => {
    const missing = Object.entries(ROUTE_INVENTORY).filter(([path, p]) => p.level === 'secondary' && !path.includes(':') && !menuPaths.has(path) && !accountPaths.has(path)).map(([path]) => path);
    expect(missing).toEqual([]);
    const hubs = new Set([...MEMBER_DOMAINS.map(d => d.hub), '/dashboard', '/welcome', '/my-chart']);
    expect(Object.entries(ROUTE_INVENTORY).filter(([path, p]) => p.level === 'primary' && !hubs.has(path) && !menuPaths.has(path)).map(([path]) => path)).toEqual([]);
  });

  it('keeps every destination from the previous member menu reachable', () => {
    const old = [...NAV_GROUPS.flatMap(g => [...g.items, ...(g.submenus ?? []).flatMap(s => s.items), ...(g.footer ?? [])]), ...RELATIONSHIPS_GROUP.items].map(i => i.to);
    const reachable = new Set([...menuPaths, ...accountPaths, ...memberDestinations({ shane: true, shared: true }).map(d => d.to)]);
    const documentedDuplicates = Object.entries(ROUTE_INVENTORY).filter(([, p]) => p.level === 'duplicate').map(([path]) => path);
    expect(old.filter(to => !reachable.has(to) && !documentedDuplicates.includes(to))).toEqual([]);
  });

  it('lists all 19 topics and 12 core themes in search', () => {
    const all = new Set(memberDestinations().map(d => d.to));
    for (const t of [...TOPIC_READINGS, ...CORE_THEMES]) expect(all.has(`/my-readings/topic/${t.slug}`)).toBe(true);
  });

  it('never puts admin tools in the domain menus; they live only in the account admin list', () => {
    for (const path of ADMIN_PATHS) expect(menuPaths.has(path)).toBe(false);
    expect(ADMIN_MENU.map(a => a.to)).toEqual(['/admin', '/dispatch']);
    expect(ACCOUNT_MENU.some(a => ADMIN_PATHS.includes(a.to))).toBe(false);
  });

  it('has no duplicate destinations inside any one domain menu', () => {
    for (const d of MEMBER_DOMAINS) {
      const paths = domainItems(d).map(i => i.to);
      expect(new Set(paths).size).toBe(paths.length);
    }
  });

  it('hides founder links from ordinary members and shows them to the right accounts', () => {
    const book = MEMBER_DOMAINS.find(d => d.id === 'book')!;
    const explore = MEMBER_DOMAINS.find(d => d.id === 'explore')!;
    expect(visibleColumns(book, {}).map(c => c.title)).toEqual(['My AstroBook', 'Library']);
    expect(visibleColumns(book, { shane: true }).flatMap(c => c.items).some(i => i.to === '/shane')).toBe(true);
    expect(visibleColumns(explore, {}).flatMap(c => c.items).some(i => i.to === '/shared')).toBe(false);
    expect(visibleColumns(explore, { shared: true }).flatMap(c => c.items).some(i => i.to === '/shared')).toBe(true);
  });

  it('shows plan locks instead of hiding gated items', () => {
    expect(itemLock('free', '/timeline')).toBe('full');
    expect(itemLock('free', '/podcasts')).toBe('creator');
    expect(itemLock('full', '/podcasts')).toBe('creator');
    expect(itemLock('creator', '/podcasts')).toBeNull();
    expect(itemLock('free', '/my-readings/topic/big-three')).toBeNull();
    expect(menuPaths.has('/timeline')).toBe(true);
  });

  it('assigns pages to the expected domain', () => {
    expect(domainFor('/transits')).toBe('explore');
    expect(domainFor('/my-readings/topic/timing')).toBe('explore');
    expect(domainFor('/my-readings/topic/love')).toBe('readings');
    expect(domainFor('/planets/venus')).toBe('chart');
    expect(domainFor('/relationships/abc/reading')).toBe('explore');
    expect(domainFor('/other-systems/tarot-birth-cards')).toBe('explore');
    expect(domainFor('/admin')).toBe('account');
    expect(domainFor('/dashboard')).toBe('account');
    expect(domainForMenuGroup('The Natal Chart')).toBe('chart');
    expect(domainForMenuGroup('Library')).toBe('book');
  });

  it('builds breadcrumbs for detail pages only, three levels at most', () => {
    expect(breadcrumbsFor('/planets/venus')).toEqual([{ label: 'Chart', to: '/my-chart' }, { label: 'Planets', to: '/planets' }, { label: 'Venus' }]);
    expect(breadcrumbsFor('/my-readings/topic/core-emotions')?.map(c => c.label)).toEqual(['Readings', 'Core themes', 'Emotional World']);
    expect(breadcrumbsFor('/relationships/r1/timeline', { relationship: () => 'Alex' })?.map(c => c.label)).toEqual(['Relationships', 'Alex', 'Timeline']);
    expect(breadcrumbsFor('/other-systems/celtic-tree-calendar')?.at(-1)?.label).toBe('Celtic Tree Calendar');
    expect(breadcrumbsFor('/my-chart')).toBeNull();
    expect(breadcrumbsFor('/planets')).toBeNull();
    for (const p of ['/planets/sun', '/houses/4', '/counselors/oracle/sessions/s1', '/chat/c1', '/p/x', '/workbook/module/m1']) expect(breadcrumbsFor(p)!.length).toBeLessThanOrEqual(3);
  });

  it('gives every member page three different next steps, never the page itself', () => {
    const steps = nextStepsFor('/my-chart', { plan: 'free', hasChart: true, moonSign: 'Scorpio' });
    expect(steps).toHaveLength(3);
    expect(steps[0]).toMatchObject({ label: 'Your Moon in Scorpio', badge: 'For you' });
    for (const path of ['/planets', '/transits', '/podcasts', '/academy', '/relationships', '/my-readings/topic/love']) {
      const s = nextStepsFor(path, { plan: 'full', hasChart: true });
      expect(s).toHaveLength(3);
      expect(s.some(x => x.to === path)).toBe(false);
      expect(new Set(s.map(x => x.to)).size).toBe(3);
    }
    expect(nextStepsFor('/admin', { plan: 'creator', hasChart: true })).toEqual([]);
    expect(nextStepsFor('/chat/abc', { plan: 'creator', hasChart: true })).toEqual([]);
    expect(nextStepsFor('/my-readings', { plan: 'free', hasChart: false })[0].to).toBe('/start');
  });
});
