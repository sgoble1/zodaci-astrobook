import { useState, type ReactNode } from 'react';
import { ExternalLink, ArrowLeftRight, ChevronDown, Eye, LayoutGrid } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { leaveAprilEdition, openAprilEditionTab, viewAprilEditionInApp, viewZacEditionInApp, viewingSharedEdition, useAprilSpace, setClassicView } from '@/hooks/useAprilSpace';
import { EDITION_OWNER_NAME, useSharedEditions } from '@/lib/editionSharing';
import { Button } from '@/components/ui/button';

/**
 * Edition controls in the account menu: the classic-view switch for full editions, plus "View … edition here" for every
 * whole edition another owner has shared with this account. The list comes from the database; nothing here grants access.
 * Folded behind one "Editions & views" line so the sidebar stays calm; the same choices are in the account menu.
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
  return <FoldedSwitch>{classic}{shared.map(openButton)}{shared.includes('april') && <Button variant="ghost" size="sm" className="w-full justify-start" onClick={openAprilEditionTab}><ExternalLink className="h-4 w-4" aria-hidden="true" />Open April’s edition in a new tab</Button>}</FoldedSwitch>;
}

function FoldedSwitch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} data-keep-wording>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground">
          <span className="inline-flex items-center gap-2"><Eye className="h-4 w-4" aria-hidden="true" />Editions &amp; views</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-500 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 space-y-1 border-l border-border/60 pl-2" role="group" aria-label="Edition">{children}</CollapsibleContent>
    </Collapsible>
  );
}
