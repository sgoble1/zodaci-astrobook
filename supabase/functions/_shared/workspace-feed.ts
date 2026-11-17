import { WORKSPACE_FEED_URL, WORKSPACE_PROJECT_ID, sanitizeFailure, failureSummary } from './workspace-feed-rules.ts';
declare const Deno: { env: { get(name: string): string | undefined } };

/** Fixed-destination, bounded server-only delivery. Never log credentials or response bodies. */
export async function deliverWorkspaceFailure(input: unknown): Promise<'delivered' | 'not_configured' | 'failed'> {
  const secret = Deno.env.get('HUB_WEBHOOK_SECRET');
  if (!secret) return 'not_configured';
  const failure = sanitizeFailure(input);
  const eventId = crypto.randomUUID();
  const body = {
    workspace_project_id: WORKSPACE_PROJECT_ID,
    event_id: eventId,
    event_type: failure.kind,
    source: 'zodaci.application',
    severity: 'error',
    title: `${failure.name}: ${failure.kind.replace(/_/g, ' ')}`,
    message: failureSummary(failure.kind),
    occurred_at: new Date().toISOString(),
    metadata: { route: failure.route, frames: failure.frames, reported_by: 'browser_unverified' },
  };
  try {
    const response = await fetch(WORKSPACE_FEED_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}`, 'X-Webhook-Secret': secret, 'Idempotency-Key': eventId },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
      redirect: 'error',
    });
    // A successful HTML page is not a webhook receipt.
    const accepted = response.ok && response.headers.get('content-type')?.includes('application/json');
    if (!accepted) console.warn('Workspace feed delivery rejected', { status: response.status });
    return accepted ? 'delivered' : 'failed';
  } catch { console.warn('Workspace feed delivery unavailable'); return 'failed'; }
}