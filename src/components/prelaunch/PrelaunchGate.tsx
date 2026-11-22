import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { gateView, hasDeviceAccess } from '@/lib/prelaunch';

const PrelaunchLanding = lazy(() => import('@/pages/PrelaunchLanding'));

/** Keeps the waitlist as the public home and conditionally gates the private app. */
export function PrelaunchGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<'checking' | 'open' | 'gated'>(() => hasDeviceAccess() ? 'open' : 'checking');

  useEffect(() => {
    if (state !== 'checking') return;
    let live = true;
    (async () => {
      const { data, error } = await supabase.functions.invoke('brand-newsletter', { body: { action: 'prelaunch-status' } });
      if (!live) return;
      // Do not accidentally open the full application if the gate status cannot be checked.
      if (error || !data || typeof data.enabled !== 'boolean') {
        setState('gated');
        return;
      }
      if (!data.enabled) { setState('open'); return; }
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) { setState('gated'); return; }
      const uid = sessionData.session?.user.id;
      if (uid) {
        const { data: admin, error: roleError } = await supabase.rpc('has_role', { _user_id: uid, _role: 'admin' });
        if (!live) return;
        if (!roleError && admin === true) { setState('open'); return; }
      }
      setState('gated');
    })().catch(() => live && setState('gated'));
    return () => { live = false; };
  }, [state]);

  const unlock = () => { setState('open'); navigate('/', { replace: true }); };
  const landing = (openAccess = false) => (
    <Suspense fallback={<div role="status" className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">Opening Zodaci…</div>}>
      <PrelaunchLanding onUnlock={unlock} openAccess={openAccess} />
    </Suspense>
  );

  const view = gateView(pathname, state);
  if (view === 'site') return <>{children}</>;
  if (view === 'home') return <Navigate to="/" replace />;
  if (view === 'checking') return <div role="status" className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">Opening Zodaci…</div>;
  return landing(pathname === '/access');
}
