import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { clientIp, hashKey } from '../_shared/public-form.ts';
import { readLimited } from '../_shared/public-form-rules.ts';
import { deliverWorkspaceFailure } from '../_shared/workspace-feed.ts';

const origins = new Set(['https://zodaci.com', 'https://www.zodaci.com', 'https://support.zodaci.com', 'https://auth.zodaci.com', 'https://zodaciof.lovable.app', 'https://id-preview--aee2e954-f4db-40c2-b757-ce2ed7d7a9d3.lovable.app', 'http://localhost:8080']);
const schema = z.object({
  kind: z.enum(['runtime_error', 'unhandled_rejection', 'route_failure']),
  name: z.string().max(100), route: z.string().max(500), stack: z.string().max(8000).optional(),
}).strict();
const reply = (status: number, data: Record<string, unknown>) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// Intentionally public: signed-out startup/route failures must also be reported.
// This accepts diagnostics only, has no member-data access, and fails closed on rate-limit errors.
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return reply(405, { error: 'Method not allowed' });
  if (!origins.has(req.headers.get('origin') ?? '')) return reply(403, { error: 'Origin not allowed' });
  try {
    const text = await readLimited(req.body, 10000);
    if (text === null) return reply(413, { error: 'Report too large' });
    let input: unknown;
    try { input = JSON.parse(text); } catch { return reply(400, { error: 'Invalid report' }); }
    const parsed = schema.safeParse(input);
    if (!parsed.success) return reply(400, { error: 'Invalid report' });
    const db = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const key = await hashKey(clientIp(req.headers));
    if (!key) return reply(429, { error: 'Reporting unavailable' });
    const ip = await db.rpc('form_rate_ok', { _bucket: 'workspace-feed:ip', _key: key, _limit: 20, _window_seconds: 3600 });
    if (ip.error || !ip.data) return reply(429, { error: 'Reporting limit reached' });
    const global = await db.rpc('form_rate_ok', { _bucket: 'workspace-feed:global', _key: 'application', _limit: 300, _window_seconds: 3600 });
    if (global.error || !global.data) return reply(429, { error: 'Reporting limit reached' });
    const result = await deliverWorkspaceFailure(parsed.data);
    return result === 'delivered' ? reply(200, { delivered: true }) : reply(503, { delivered: false });
  } catch { return reply(503, { delivered: false }); }
});