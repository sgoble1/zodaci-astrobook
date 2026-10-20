import { Wrench } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

/** Site-wide maintenance notice, switched on by an admin in Admin → Platform → Settings. */
export function SiteNotice() {
  const s = useSiteSettings();
  if (!s.maintenance.enabled) return null;
  return (
    <div role="status" className="flex items-center justify-center gap-2 border-b border-border bg-secondary px-4 py-2 text-center text-sm">
      <Wrench aria-hidden className="h-4 w-4 shrink-0 text-gold" />
      <span>{s.maintenance.message || 'Zodaci is being updated. Some features may be briefly unavailable.'}</span>
    </div>
  );
}
