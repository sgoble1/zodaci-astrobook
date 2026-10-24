import { ExternalLink, ArrowLeftRight, Eye, LayoutGrid } from 'lucide-react';
import { useSession } from '@/hooks/useLibrary';
import { isAdminEmail, leaveAprilEdition, openAprilEditionTab, viewAprilEditionInApp, useAprilSpace, setClassicView } from '@/hooks/useAprilSpace';
import { Button } from '@/components/ui/button';

/** Founder edition controls: classic-view switch for April and Shane; admin can also open April's original edition. */
export function AdminEditionSwitch({ fullEdition = false }: { fullEdition?: boolean }) {
  const session = useSession();
  const april = useAprilSpace();
  const admin = isAdminEmail(session?.user.email);
  const classic = april || fullEdition ? <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setClassicView(true)}><LayoutGrid className="h-4 w-4" />Switch to classic view</Button> : null;
  if (!admin || (fullEdition && !april)) return admin && !april ? <div className="space-y-2">{classic}<Button variant="ghost" size="sm" className="w-full justify-start" onClick={viewAprilEditionInApp}><Eye className="h-4 w-4" />View April's content here</Button></div> : classic;
  if (april) {
    return (
      <div className="space-y-2" data-keep-wording role="group" aria-label="Edition">
        <p className="text-xs text-gold">You are viewing April's original edition.</p>
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={leaveAprilEdition}><ArrowLeftRight className="h-4 w-4" />Back to my own content</Button>
        {classic}
      </div>
    );
  }
  return (
    <div className="space-y-2" data-keep-wording role="group" aria-label="Edition">
      <p className="text-xs text-muted-foreground">Viewing your own content.</p>
      <Button variant="outline" size="sm" className="w-full justify-start" onClick={viewAprilEditionInApp}><Eye className="h-4 w-4" />View April's content here</Button>
      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={openAprilEditionTab}><ExternalLink className="h-4 w-4" />Open in a new tab</Button>
    </div>
  );
}
