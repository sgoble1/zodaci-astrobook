import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { DEFAULT_SHIPPING_LEVEL, SHIPPING_LEVELS, type LuluEnv, type ShippingLevel, decimalToCents, luluErrorText, orderPatches, trackingFrom } from './lulu-rules.ts';

/** Lulu credentials live in function secrets; the environment is pinned server-side and defaults to the test sandbox. */
export const luluEnv = (): LuluEnv => Deno.env.get('LULU_ENVIRONMENT')?.trim().toLowerCase() === 'production' ? 'production' : 'sandbox';
export const luluConfigured = () => !!(Deno.env.get('LULU_CLIENT_KEY')?.trim() && Deno.env.get('LULU_CLIENT_SECRET')?.trim());
export const luluShippingLevel = (): ShippingLevel => {
  const v = Deno.env.get('LULU_SHIPPING_LEVEL')?.trim().toUpperCase();
  return (SHIPPING_LEVELS as readonly string[]).includes(v ?? '') ? v as ShippingLevel : DEFAULT_SHIPPING_LEVEL;
};
const base = (env: LuluEnv) => env === 'production' ? 'https://api.lulu.com' : 'https://api.sandbox.lulu.com';

export class LuluError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

let cached: { env: LuluEnv; token: string; expires: number } | null = null;
async function token(env: LuluEnv) {
  if (cached && cached.env === env && cached.expires > Date.now() + 30_000) return cached.token;
  const key = Deno.env.get('LULU_CLIENT_KEY')?.trim(), secret = Deno.env.get('LULU_CLIENT_SECRET')?.trim();
  if (!key || !secret) throw new LuluError(503, 'Lulu is not connected yet. Add the Lulu client key and secret first.');
  const res = await fetch(`${base(env)}/auth/realms/glasstree/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${btoa(`${key}:${secret}`)}` },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(15_000),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.access_token) throw new LuluError(res.status === 401 || res.status === 400 ? 401 : 502, res.status === 401 || res.status === 400 ? 'Lulu rejected the client key or secret. Check them in your Lulu developer account.' : 'Lulu sign-in is unavailable right now. Please retry.');
  cached = { env, token: body.access_token, expires: Date.now() + Math.max(60, Number(body.expires_in) || 300) * 1000 };
  return cached.token;
}

// deno-lint-ignore no-explicit-any
export async function lulu(path: string, init: { method?: string; body?: unknown } = {}, env = luluEnv()): Promise<any> {
  const res = await fetch(`${base(env)}${path}`, {
    method: init.method ?? 'GET',
    headers: { Authorization: `Bearer ${await token(env)}`, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(30_000),
  });
  const text = await res.text();
  let body: unknown = null; try { body = text ? JSON.parse(text) : null; } catch { body = text.slice(0, 300); }
  if (!res.ok) throw new LuluError(res.status >= 500 ? 502 : res.status, luluErrorText(body, `Lulu returned an error (${res.status}).`));
  return body;
}

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
/** Lulu signs each webhook body with the API secret (HMAC-SHA256 over the raw body). */
export async function verifyLuluSignature(raw: string, header: string | null) {
  const secret = Deno.env.get('LULU_CLIENT_SECRET')?.trim();
  if (!secret || !header) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw));
  const given = header.trim();
  return same(given.toLowerCase(), hex(mac)) || same(given, b64(mac));
}

type JobRow = { id: string; order_id: string; environment: LuluEnv; status: string };
/** Save a Lulu job snapshot and move the book order forward (production jobs only, guarded against concurrent changes). */
// deno-lint-ignore no-explicit-any
export async function applyJobUpdate(db: SupabaseClient, row: JobRow, job: any) {
  const status = String(job?.status?.name ?? row.status).slice(0, 40);
  const t = trackingFrom(job);
  const dates = job?.estimated_shipping_dates ?? {};
  const update = {
    status, status_message: String(job?.status?.message ?? '').slice(0, 500),
    total_cost_cents: decimalToCents(job?.costs?.total_cost_incl_tax), currency: typeof job?.costs?.currency === 'string' ? job.costs.currency.slice(0, 3) : null,
    tracking_id: t.tracking_id, tracking_url: t.tracking_url, carrier_name: t.carrier_name,
    arrival_min: /^\d{4}-\d{2}-\d{2}$/.test(dates.arrival_min ?? '') ? dates.arrival_min : null,
    arrival_max: /^\d{4}-\d{2}-\d{2}$/.test(dates.arrival_max ?? '') ? dates.arrival_max : null,
    updated_at: new Date().toISOString(),
  };
  const saved = await db.from('lulu_print_jobs').update(update).eq('id', row.id);
  if (saved.error) throw saved.error;
  const { data: order, error } = await db.from('book_orders').select('id,status,payment_hold').eq('id', row.order_id).single();
  if (error || !order) throw error ?? new Error('Order missing');
  if (order.payment_hold) return { status, note: 'The order is on payment review, so its stage was not changed.' };
  const plan = orderPatches(order, job, row.environment, new Date().toISOString().slice(0, 10));
  let current = order.status as string;
  for (const p of plan.patches) {
    const r = await db.from('book_orders').update({ ...p, updated_at: new Date().toISOString() }).eq('id', order.id).eq('status', current).select('id');
    if (r.error || !r.data?.length) return { status, note: 'The order changed at the same time; refresh to see its stage.' };
    current = p.status;
  }
  if (plan.note) await db.from('lulu_print_jobs').update({ status_message: plan.note }).eq('id', row.id);
  return { status, note: plan.note, orderStatus: current };
}
