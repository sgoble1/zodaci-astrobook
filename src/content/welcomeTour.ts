import { MOBILE_TABS, domainById, menuItemFor, type DomainId } from './memberNav';

export type TourStep = { icon: string; title: string; body: string; to?: string; cta?: string };

const tab = (id: DomainId | 'account') => MOBILE_TABS.find(t => t.id === id)?.label ?? 'Account';
/** "Readings menu (Readings tab on a phone)" — names come from the menu registry so the tour never drifts from the menus. */
const where = (id: DomainId) => {
  const phone = MOBILE_TABS.some(t => t.id === id) ? tab(id) : tab('account');
  return `${domainById(id).label} in the top menu (${phone} tab on a phone)`;
};
const tool = (path: string) => {
  const hit = menuItemFor(path);
  return hit ? { label: hit.item.label, section: hit.domain.label } : null;
};

/** First-visit walkthrough: where each kind of tool lives, using the same names as the menus. */
export function tourSteps(): TourStep[] {
  const chat = tool('/chat'); const workbook = tool('/workbook'); const create = tool('/create');
  const steps: TourStep[] = [
    { icon: '✦', title: 'Welcome to Zodaci', body: 'Everything here is calculated from your own birth moment and written in plain language. This short tour shows where things live.' },
    { icon: '☉', title: 'Your chart', body: `Open ${where('chart')}. Tap any planet for its sign, house and the planets it talks to. Dotted words show a quick explanation.`, to: domainById('chart').hub, cta: 'Open my chart' },
    { icon: '❦', title: 'Your readings', body: `Topics and core themes live in ${where('readings')}. They are written from your saved birth details, and a progress bar shows anything still being written.`, to: domainById('readings').hub, cta: 'See my readings' },
  ];
  if (chat || workbook || create) {
    const names = [chat && `${chat.label} answers questions about your chart`, workbook && `${workbook.label} has exercises for your placements`, create && `“${create.label}” writes a new page about anything you are curious about`].filter(Boolean).join('; ');
    const section = (chat ?? workbook ?? create)!.section;
    steps.push({ icon: '✚', title: 'Ask, practise, create', body: `Also in ${section}: ${names}.`, to: chat ? '/chat' : workbook ? '/workbook' : '/create', cta: chat ? `Open ${chat.label}` : 'Open' });
  }
  steps.push(
    { icon: '♪', title: 'Your library', body: `${where('book')} holds your Masterbook, the printed AstroBook, orders and podcasts. Keep episodes private or share them with your workspace.`, to: domainById('book').hub, cta: 'Open my library' },
    { icon: '☾', title: 'Timing and relationships', body: `${where('explore')} has transits, turning points, relationships and other traditions.`, to: domainById('explore').hub, cta: 'Explore' },
    { icon: '✎', title: 'Learn as you go', body: `${domainById('learn').label} has lessons, guides and articles. On a phone it opens from the ${tab('account')} tab.`, to: domainById('learn').hub, cta: 'Open Learn' },
    { icon: '⚙', title: 'Your account', body: `The account button (top right, or the ${tab('account')} tab on a phone) holds your plan, birth details, workspaces, orders and help. Every page ends with ideas for where to go next. You can replay this tour from Instructions & Help.` },
  );
  return steps;
}
