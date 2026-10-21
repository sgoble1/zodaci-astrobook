import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CircleAlert, Clock, HelpCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { parseSiteSettings } from '@/hooks/useSiteSettings';
import { launchChecks, type Check, type CheckState, type Signals } from '@/lib/launchReadiness';

const LOOK: Record<CheckState, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  ready: { label: 'Ready', icon: CheckCircle2, cls: 'text-primary' },
  action: { label: 'Needs action', icon: CircleAlert, cls: 'text-destructive' },
  external: { label: 'Waiting on you', icon: Clock, cls: 'text-gold' },
  unknown: { label: 'Could not check', icon: HelpCircle, cls: 'text-muted-foreground' },
};

/** Admin launch checklist built from live signals (payments, printing, admins, settings). */
export function LaunchChecklist() {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    const [pay, lulu, cfg, ad] = await Promise.all([
      supabase.functions.invoke('admin-stripe-overview', { body: { environment: 'live' } }).catch(() => null),
      supabase.functions.invoke('lulu-print', { body: { action: 'status' } }).catch(() => null),
      supabase.from('platform_settings').select('key,value'),
      supabase.rpc('admin_list_admins'),
    ]);
    const signals: Signals = {
      payments: pay ? { reachable: !pay.error && !!pay.data && !pay.data.error, activeSubscriptions: pay.data?.active_subscriptions } : null,
      lulu: lulu && !lulu.error && lulu.data && !lulu.data.error ? { configured: !!lulu.data.configured, connected: !!lulu.data.connected, environment: lulu.data.environment, webhook: !!lulu.data.webhook } : null,
      admins: ad.error ? null : ((ad.data ?? []) as unknown[]).length,
      maintenance: cfg.error ? null : parseSiteSettings(cfg.data ?? []).maintenance.enabled,
    };
    setChecks(launchChecks(signals));
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const ready = checks?.filter(c => c.state === 'ready').length ?? 0;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="font-display text-2xl">Launch readiness</h2><p className="text-sm text-muted-foreground">{checks ? `${ready} of ${checks.length} ready, checked live just now.` : 'Checking the live systems…'}</p></div>
        <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Check again</Button>
      </div>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card/60">
        {(checks ?? []).map(c => {
          const look = LOOK[c.state]; const Icon = look.icon;
          return <li key={c.id} className="flex flex-wrap items-start gap-3 p-4">
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${look.cls}`} aria-hidden="true" />
            <div className="min-w-0 flex-1"><p className="font-medium">{c.label} <span className={`ml-2 text-xs ${look.cls}`}>{look.label}</span></p><p className="text-sm text-muted-foreground">{c.detail}</p></div>
            {c.tab && <Button asChild size="sm" variant="ghost"><Link to={`/admin?tab=${c.tab}`}>Open</Link></Button>}
          </li>;
        })}
      </ul>
    </div>
  );
}
