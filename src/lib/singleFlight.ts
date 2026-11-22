/** Coalesce repeated submissions synchronously; failed work can be retried. Scope one gate per action/owner. */
export function createSingleFlight<T>() {
  let pending: Promise<T> | null = null;
  return (work: () => Promise<T>): Promise<T> => {
    if (pending) return pending;
    pending = Promise.resolve().then(work).finally(() => { pending = null; });
    return pending;
  };
}