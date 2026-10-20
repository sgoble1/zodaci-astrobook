import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSiteSettings, type SiteFlags } from '@/hooks/useSiteSettings';
import { useIsAdmin, useSession } from '@/hooks/useLibrary';

const NAME: Record<keyof SiteFlags, string> = { astrocomic: 'AstroComic', referrals: 'Invitations', academy: 'Zodaci Academy', compatibility: 'Compatibility', community: 'Community' };

/** Hides a feature an admin has switched off. Admins still see it, with a reminder that it is off for everyone else. */
export function FeatureGate({ flag, children }: { flag: keyof SiteFlags; children: ReactNode }) {
  const s = useSiteSettings();
  const admin = useIsAdmin(useSession());
  if (s.flags[flag]) return <>{children}</>;
  if (admin) return <><p role="status" className="mb-6 rounded-md border border-border bg-secondary px-4 py-2 text-sm">{NAME[flag]} is switched off for members and visitors. You can see it because you are an admin.</p>{children}</>;
  return (
    <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
      <h1 className="font-display text-4xl">{NAME[flag]} is resting</h1>
      <p className="text-muted-foreground">This part of Zodaci is temporarily unavailable. Please check back soon.</p>
      <Button asChild variant="outline"><Link to="/welcome">Back to Zodaci</Link></Button>
    </div>
  );
}
