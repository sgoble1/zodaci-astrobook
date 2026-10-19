import { ExternalLink, ArrowLeftRight, Eye } from 'lucide-react';
import { useSession } from '@/hooks/useLibrary';
import { isAdminEmail, leaveAprilEdition, openAprilEditionTab, viewAprilEditionInApp, useAprilSpace } from '@/hooks/useAprilSpace';
import { Button } from '@/components/ui/button';

/** Admin-only: view April's original edition in this tab or a separate tab, or return to your own. */
export function AdminEditionSwitch() {
  const session = useSession();
  const april = useAprilSpace();
  if (!isAdminEmail(session?.user.email)) return null;
  if (april) {
    return (
      <div className="space-y-2" data-keep-wording>
        <p className="text-xs text-gold">You are viewing April's original edition.</p>
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={leaveAprilEdition}><ArrowLeftRight className="h-4 w-4" />Back to my own content</Button>
      </div>
    );
  }
  return (
    <div className="space-y-2" data-keep-wording>
      <Button variant="outline" size="sm" className="w-full justify-start" onClick={viewAprilEditionInApp}><Eye className="h-4 w-4" />View April's content here</Button>
      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={openAprilEditionTab}><ExternalLink className="h-4 w-4" />Open in a new tab</Button>
    </div>
  );
}
