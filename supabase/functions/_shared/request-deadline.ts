/** A deadline includes response-body consumption; caller cancellation is preserved. */
export function requestDeadline(timeoutMs: number, parent?: AbortSignal | null): AbortSignal {
  const deadline = AbortSignal.timeout(timeoutMs);
  return parent ? AbortSignal.any([parent, deadline]) : deadline;
}