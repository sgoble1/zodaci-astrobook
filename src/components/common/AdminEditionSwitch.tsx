import { ExternalLink, ArrowLeftRight } from 'lucide-react';
import { useSession } from '@/hooks/useLibrary';
import { isAdminEmail, leaveAprilEdition, openAprilEditionTab, useAprilSpace } from '@/hooks/useAprilSpace';
import { Button } from '@/components/ui/button';

/** Admin-only: open April's original edition in a separate tab, or return to your own. */
export function AdminEditionSwitch() {
  const session = useSession();
  const april = useAprilSpace();
  if (!isAdminEmail(session?.user.email)) return null;
  return april
    ? <Button variant="outline" size="sm" className="w-full justify-start" onClick={leaveAprilEdition}><ArrowLeftRight className="h-4 w-4" />Back to my own content</Button>
    : <Button variant="outline" size="sm" className="w-full justify-start" onClick={openAprilEditionTab}><ExternalLink className="h-4 w-4" />Open April's content in new tab</Button>;
}
