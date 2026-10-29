/** Admin dashboard sections, grouped Content / Operations / Platform. The open tab lives in ?tab= so links and reloads keep it. */
export type AdminTab = 'upload' | 'sections' | 'index' | 'relationships' | 'marketing' | 'growth' | 'activity' | 'charts' | 'orders' | 'shop' | 'comic' | 'stripe' | 'studio' | 'newsletter' | 'april' | 'credits' | 'audit' | 'settings' | 'launch' | 'access';
export type AdminTabGroup = { label: string; tabs: { id: AdminTab; label: string; adminOnly?: boolean }[] };

export const ADMIN_TAB_GROUPS: AdminTabGroup[] = [
  { label: 'Content', tabs: [
    { id: 'upload', label: 'Upload documents', adminOnly: true }, { id: 'sections', label: 'Edit sections' }, { id: 'index', label: 'Document Index', adminOnly: true },
    { id: 'relationships', label: 'Relationships' }, { id: 'marketing', label: 'Marketing pages', adminOnly: true },
  ] },
  { label: 'Operations', tabs: [
    { id: 'growth', label: 'Growth & upgrades', adminOnly: true }, { id: 'activity', label: 'Member activity', adminOnly: true }, { id: 'charts', label: 'Member charts', adminOnly: true },
    { id: 'orders', label: 'AstroBook orders', adminOnly: true }, { id: 'shop', label: 'Shop & print', adminOnly: true }, { id: 'comic', label: 'AstroComic queue', adminOnly: true }, { id: 'stripe', label: 'Payments', adminOnly: true },
  ] },
  { label: 'Platform', tabs: [
    { id: 'newsletter', label: 'Newsletter', adminOnly: true }, { id: 'april', label: 'April monitor', adminOnly: true }, { id: 'studio', label: 'AI & illustrations', adminOnly: true }, { id: 'credits', label: 'Credits & grants', adminOnly: true },
    { id: 'audit', label: 'Audit log', adminOnly: true }, { id: 'settings', label: 'Settings', adminOnly: true }, { id: 'launch', label: 'Launch checklist', adminOnly: true }, { id: 'access', label: 'Editions & investors', adminOnly: true },
  ] },
];

const ALL = ADMIN_TAB_GROUPS.flatMap(g => g.tabs);

/** Open the URL's permitted tab, otherwise Growth for admins and Edit sections for members. */
export function resolveAdminTab(requested: string | null, isAdmin: boolean): AdminTab {
  const t = ALL.find(x => x.id === requested);
  if (t && (!t.adminOnly || isAdmin)) return t.id;
  return isAdmin ? 'growth' : 'sections';
}
