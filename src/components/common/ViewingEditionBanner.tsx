import { useLocation } from 'react-router-dom';
import { Eye, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { leaveAprilEdition, viewingSharedEdition } from '@/hooks/useAprilSpace';
import { EDITION_OWNER_NAME } from '@/lib/editionSharing';

type Owner = 'april' | 'shane' | 'zac';

/** Which other founder's pages this path belongs to, if any (read from the URL only, never grants access). */
export function editionOwnerOfPath(pathname: string): Owner | null {
  const m = pathname.match(/^\/(april|shane|zac)(\/|$)/) ?? pathname.match(/^\/official-astrobook\/(?:comic|showcase)\/(april|shane|zac)(\/|$)/);
  return m ? (m[1] as Owner) : null;
}

/**
 * A clear strip at the top of the page whenever an account is looking at another founder's
 * edition: "Viewing: Zac's edition". Shown in the in-app view-as mode, and when an authorised
 * account opens another founder's pages from its own menu. Access itself is decided by the server.
 */
export function ViewingEditionBanner({ own }: { own: Owner }) {
  const { pathname } = useLocation();
  const view = viewingSharedEdition();
  const pathOwner = editionOwnerOfPath(pathname);
  const other: Owner | null = view ?? (pathOwner && pathOwner !== own ? pathOwner : null);
  if (!other) return null;
  const name = EDITION_OWNER_NAME[other] ?? other;
  return (
    <div role="status" data-keep-wording className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border-2 border-[hsl(var(--brass)/0.6)] bg-secondary/60 px-4 py-2.5 text-sm">
      <p className="flex items-center gap-2"><Eye className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span className="font-label tracking-wider">Viewing:</span> <span>{name}’s edition{view ? ', exactly as they see it' : ''}</span></p>
      {view && <Button size="sm" variant="outline" onClick={leaveAprilEdition}><ArrowLeftRight className="h-4 w-4" aria-hidden="true" />Back to my edition</Button>}
    </div>
  );
}
