import { sanitizeFailure, type FailureKind } from '../../supabase/functions/_shared/workspace-feed-rules';
import { isChunkError } from '@/lib/chunkRecovery';

const recent = new Map<string, number>();
let windowStart = 0;
let count = 0;
/** Diagnostics only: never send raw error text, account data, query strings or component props. */
export function reportApplicationFailure(error: unknown, kind: FailureKind = 'runtime_error'): void {
  try {
    const failure = sanitizeFailure({
      kind: isChunkError(error) ? 'route_failure' : kind,
      name: error instanceof Error ? error.name : 'Error',
      stack: error instanceof Error ? error.stack : '',
      route: window.location.pathname,
    });
    const now = Date.now();
    if (now - windowStart >= 60000) { windowStart = now; count = 0; recent.clear(); }
    const signature = JSON.stringify(failure);
    if (count >= 10 || recent.has(signature)) return;
    recent.set(signature, now); count++;
    // Lazy import avoids loading the Cloud client ahead of the application.
    void import('@/integrations/supabase/client').then(({ supabase }) =>
      supabase.functions.invoke('workspace-feed', { body: { kind: failure.kind, name: failure.name, route: failure.route, stack: failure.frames.join('\n') } })
    ).catch(() => undefined);
  } catch { /* Reporting must never crash the application or recurse. */ }
}