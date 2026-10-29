import { ExternalLink, ArrowLeftRight, Eye, LayoutGrid } from 'lucide-react';
import { leaveAprilEdition, openAprilEditionTab, viewAprilEditionInApp, viewZacEditionInApp, viewingSharedEdition, useAprilSpace, setClassicView } from '@/hooks/useAprilSpace';
import { EDITION_OWNER_NAME, useSharedEditions } from '@/lib/editionSharing';
import { Button } from '@/components/ui/button';

/**
 * Edition controls in the account menu: the classic-view switch for full editions, plus "View … edition here" for every
 * whole edition another owner has shared with this account. The list comes from the database; nothing here grants access.
 */
export function AdminEditionSwitch({ fullEdition = false }: { fullEdition?: boolean }) {
  const april = useAprilSpace();
  const shared = useSharedEditions().filter(e => e === 'april' || e === 'zac');
  const view = viewingSharedEdition();
  const classic = april || fullEdition ? <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setClassicView(true)}><LayoutGrid className="h-4 w-4" aria-hidden="true" />Switch to classic view</Button> : null;
  const openButton = (e: 'april' | 'zac') => (
    <Button key={e} variant="ghost" size="sm" className="w-full justify-start" onClick={e === 'april' ? viewAprilEditionInApp : viewZacEditionInApp}>
      <Eye className="h-4 w-4" aria-hidden="true" />View {EDITION_OWNER_NAME[e]}’s edition here
    </Button>
  );
  if (view) return (
    <div className="space-y-2" data-keep-wording role="group" aria-label="Edition">
      <p className="text-xs text-gold">You are viewing {EDITION_OWNER_NAME[view]}’s edition, shared with you.</p>
      <Button variant="outline" size="sm" className="w-full justify-start" onClick={leaveAprilEdition}><ArrowLeftRight className="h-4 w-4" aria-hidden="true" />Back to my own content</Button>
      {view === 'april' && classic}
      {shared.filter(e => e !== view).map(openButton)}
    </div>
  );
  if (!shared.length) return classic;
  return (
    <div className="space-y-2" data-keep-wording role="group" aria-label="Edition">
      {classic}
      {shared.map(openButton)}
      {shared.includes('april') && <Button variant="ghost" size="sm" className="w-full justify-start" onClick={openAprilEditionTab}><ExternalLink className="h-4 w-4" aria-hidden="true" />Open April’s edition in a new tab</Button>}
    </div>
  );
}
