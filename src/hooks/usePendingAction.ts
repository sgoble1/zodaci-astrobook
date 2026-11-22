import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createSingleFlight } from '@/lib/singleFlight';

/** One synchronous submission gate per action, scoped to the current owner/view. */
export function usePendingAction(scope: string) {
  const identity = useRef(scope);
  identity.current = scope;
  const revision = useRef(0);
  const gates = useRef(new Map<string, ReturnType<typeof createSingleFlight<void>>>());
  const [pending, setPending] = useState<string[]>([]);
  useEffect(() => {
    identity.current = scope; revision.current++; gates.current.clear(); setPending([]);
    return () => { identity.current = ''; revision.current++; };
  }, [scope]);
  const run = (action: string, work: (current: () => boolean) => Promise<unknown>, failure = 'This change could not be saved. Please try again.') => {
    let gate = gates.current.get(action);
    if (!gate) { gate = createSingleFlight<void>(); gates.current.set(action, gate); }
    const owner = scope;
    const version = revision.current;
    return gate(async () => {
      const current = () => identity.current === owner && revision.current === version;
      if (!current()) return;
      setPending(p => [...p, action]);
      try { await work(current); }
      catch { if (current()) toast.error(failure); }
      finally { if (current()) setPending(p => p.filter(a => a !== action)); }
    });
  };
  return { run, pending: (action: string) => pending.includes(action) };
}