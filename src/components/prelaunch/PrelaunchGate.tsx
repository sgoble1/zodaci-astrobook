import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { hasDeviceAccess, pathBypassesGate } from '@/lib/prelaunch';

const PrelaunchLanding = lazy(() => import('@/pages/PrelaunchLanding'));

/** Shows the pre-launch landing instead of the site while an admin has the gate on. Admins and passcode holders pass. */
export function PrelaunchGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<'checking' | 'open' | 'gated'>(() => hasDeviceAccess() ? 'open' : 'checking');

  useEffect(() => {
    if (state !== 'checking') return;
    let live = true;
    (async () => {
      const { data } = await supabase.functions.invoke('brand-newsletter', { body: { action: 'prelaunch-status' } });
      if (!live) return;
      if (!data?.enabled) {
        setState('open');
        return;
      }
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user.id;
      if (uid) {
        const { data: admin } = await supabase.rpc('has_role', { _user_id: uid, _role: 'admin' });
        if (!live) return;
        if (admin) {
          setState('open');
          return;
        }
      }
      setState('gated');
    })().catch(() => live && setState('open'));
    return () => { live = false; };
  }, [state]);

  const isWaitlistRoute = pathname === '/' || pathname === '/coming-soon' || pathname === '/access';

  if (isWaitlistRoute) {
    return (
      <Suspense fallback={<div role="status" aria-label="Loading" className="min-h-screen bg-background" />}>
        <PrelaunchLanding
          onUnlock={() => {
            setState('open');
            navigate('/welcome', { replace: true });
          }}
          openAccess={pathname === '/access'}
        />
      </Suspense>
    );
  }

  if (state === 'open' || pathBypassesGate(pathname)) return <>{children}</>;
  if (state === 'checking') return <div role="status" aria-label="Loading" className="min-h-screen bg-background" />;

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PrelaunchLanding onUnlock={() => setState('open')} openAccess={pathname === '/access'} />
    </Suspense>
  );
}
