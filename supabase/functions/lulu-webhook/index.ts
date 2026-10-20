import { createClient } from 'npm:@supabase/supabase-js@2';
import { applyJobUpdate, luluEnv, verifyLuluSignature } from '../_shared/lulu.ts';

/** Receives Lulu PRINT_JOB_STATUS_CHANGED webhooks. Only signed bodies are trusted; unknown jobs are acknowledged and ignored. */
Deno.serve(async req => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const raw = await req.text();
  if (raw.length > 512_000) return new Response('Too large', { status: 413 });
  if (!(await verifyLuluSignature(raw, req.headers.get('Lulu-HMAC-SHA256')))) return new Response('Invalid signature', { status: 401 });
  try {
    const payload = JSON.parse(raw);
    if (payload?.topic !== 'PRINT_JOB_STATUS_CHANGED') return new Response('ignored', { status: 200 });
    const id = Number(payload?.data?.id);
    if (!Number.isFinite(id)) return new Response('ignored', { status: 200 });
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: row, error } = await db.from('lulu_print_jobs').select('id,order_id,environment,status').eq('environment', luluEnv()).eq('lulu_job_id', id).maybeSingle();
    if (error) throw error;
    if (!row) return new Response('unknown job', { status: 200 });
    await applyJobUpdate(db, row, payload.data);
    return new Response('ok', { status: 200 });
  } catch (e) {
    console.error('lulu-webhook', e);
    return new Response('error', { status: 500 });
  }
});
