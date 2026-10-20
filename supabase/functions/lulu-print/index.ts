import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { finalizeBookPdf } from '../_shared/book-delivery.ts';
import { isPaidBook } from '../_shared/book-delivery-rules.ts';
import { LuluError, applyJobUpdate, lulu, luluConfigured, luluEnv, luluShippingLevel } from '../_shared/lulu.ts';
import { CANCELLABLE, FAILED_STATUSES, POD_PACKAGES, PRODUCTION_DELAY_MINUTES, TRIM_PT, decimalToCents, foilText, interiorPageCount, isLinen, isPrintEdition, luluAddress, pageLimitError, type PrintEdition } from '../_shared/lulu-rules.ts';
import { buildCoverWrap, buildInterior } from '../_shared/lulu-files.ts';

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
const Address = z.object({ name: z.string().max(80).optional(), line1: z.string().min(1).max(80), line2: z.string().max(80).optional(), city: z.string().min(1).max(60), state: z.string().min(2).max(3), postal_code: z.string().min(3).max(12), country: z.literal('US').default('US'), phone: z.string().max(25).optional() });
const Body = z.discriminatedUnion('action', [
  z.object({ action: z.literal('status') }),
  z.object({ action: z.literal('quote'), orderId: z.string().uuid().optional(), edition: z.enum(['pocket', 'classic', 'signature', 'linen']).optional(), pages: z.number().int().min(1).max(900).optional(), address: Address.optional() }),
  z.object({ action: z.literal('proof'), orderId: z.string().uuid() }),
  z.object({ action: z.literal('submit'), orderId: z.string().uuid() }),
  z.object({ action: z.literal('sync'), jobId: z.string().uuid() }),
  z.object({ action: z.literal('cancel'), jobId: z.string().uuid() }),
  z.object({ action: z.literal('register-webhook') }),
]);
const SETTINGS_KEY = 'lulu_webhook';
const WEEK = 7 * 24 * 3600;

// deno-lint-ignore no-explicit-any
type Order = any;
async function loadOrder(db: SupabaseClient, id: string): Promise<Order> {
  const { data, error } = await db.from('book_orders').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) throw new LuluError(404, 'Order not found.');
  return data;
}
function printable(order: Order): PrintEdition {
  if (order.format !== 'print') throw new LuluError(409, 'Digital AstroBooks are downloads; nothing is printed.');
  if (!isPrintEdition(order.edition)) throw new LuluError(409, 'Earlier Standard/Expanded editions were specified for another printer. Send this one by hand.');
  return order.edition;
}
/** Real printing (Lulu production) takes live-paid orders only; the Lulu sandbox also accepts test-payment orders for dry runs. */
function readyToPrint(order: Order, env: 'sandbox' | 'production') {
  if (env === 'production' && order.environment !== 'live') throw new LuluError(409, 'This is a test-payment order, so it is never sent for real printing.');
  if (!isPaidBook(order)) throw new LuluError(409, 'Payment for this order has not been confirmed.');
  if (order.payment_hold) throw new LuluError(409, 'This order is on payment review. Resolve it before printing.');
  if (!['paid', 'print_brief_sent'].includes(order.status)) throw new LuluError(409, 'This order is already past the printing step.');
}

/** Build the interior and full cover from the frozen final PDF and upload both privately. */
async function prepareFiles(db: SupabaseClient, order: Order, edition: PrintEdition, folder: string) {
  const path = await finalizeBookPdf(db, order);
  const file = await db.storage.from('book-orders').download(path);
  if (file.error || !file.data) throw new Error('Final PDF unavailable');
  const finalPdf = new Uint8Array(await file.data.arrayBuffer());
  const interior = await buildInterior(finalPdf);
  const limit = pageLimitError(edition, interior.pages);
  if (limit) throw new LuluError(409, limit);
  const pod = POD_PACKAGES[edition];
  const dims = await lulu('/cover-dimensions/', { method: 'POST', body: { pod_package_id: pod, interior_page_count: interior.pages, unit: 'pt' } });
  const width = Number(dims?.width), height = Number(dims?.height);
  if (!(width > 0 && height > 0)) throw new LuluError(502, 'Lulu did not return cover dimensions.');
  const cover = await buildCoverWrap(finalPdf, { pod, interiorPages: interior.pages, width, height, trim: TRIM_PT[edition] });
  const base = `${order.user_id}/${order.id}/lulu/${folder}`;
  const up = async (name: string, bytes: Uint8Array) => {
    const r = await db.storage.from('book-orders').upload(`${base}-${name}.pdf`, bytes, { contentType: 'application/pdf', upsert: true });
    if (r.error) throw r.error;
    return `${base}-${name}.pdf`;
  };
  const [interiorPath, coverPath] = await Promise.all([up('interior', interior.bytes), up('cover', cover.bytes)]);
  return { pod, pages: interior.pages, interiorPath, coverPath, dims: { width, height }, spine: cover.layout.spine };
}
const signed = async (db: SupabaseClient, path: string, seconds: number, download?: string) => {
  const r = await db.storage.from('book-orders').createSignedUrl(path, seconds, download ? { download } : undefined);
  if (r.error) throw r.error;
  return r.data.signedUrl;
};

// deno-lint-ignore no-explicit-any
const quoteSummary = (q: any) => ({
  currency: q?.currency ?? 'USD',
  print_cents: decimalToCents(q?.line_item_costs?.[0]?.total_cost_excl_tax),
  shipping_cents: decimalToCents(q?.shipping_cost?.total_cost_excl_tax),
  fulfillment_cents: decimalToCents(q?.fulfillment_cost?.total_cost_excl_tax) ?? 0,
  tax_cents: decimalToCents(q?.total_tax),
  total_excl_tax_cents: decimalToCents(q?.total_cost_excl_tax),
  total_cents: decimalToCents(q?.total_cost_incl_tax),
});

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL'), key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) throw new Error('Service unavailable');
    const db = createClient(url, key);
    const tokenHeader = req.headers.get('Authorization')?.replace(/^Bearer /, '');
    if (!tokenHeader) return json({ error: 'Please sign in first.' }, 401);
    const { data: { user } } = await db.auth.getUser(tokenHeader);
    if (!user) return json({ error: 'Please sign in first.' }, 401);
    const { data: isAdmin, error: roleError } = await db.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (roleError || !isAdmin) return json({ error: 'Admins only.' }, 403);
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: 'Invalid request.' }, 400);
    const body = parsed.data;
    const env = luluEnv();

    if (body.action === 'status') {
      const { data: hook } = await db.from('platform_settings').select('value').eq('key', SETTINGS_KEY).maybeSingle();
      const base = { configured: luluConfigured(), environment: env, shippingLevel: luluShippingLevel(), contactEmail: Deno.env.get('LULU_CONTACT_EMAIL')?.trim() || user.email || '', webhook: hook?.value ?? null };
      if (!base.configured) return json({ ...base, connected: false });
      try { await lulu('/print-jobs/?page_size=1'); return json({ ...base, connected: true }); }
      catch (e) { return json({ ...base, connected: false, problem: e instanceof LuluError ? e.message : 'Lulu could not be reached.' }); }
    }
    if (!luluConfigured()) return json({ error: 'Lulu is not connected yet. Add the Lulu client key and secret first.' }, 503);

    if (body.action === 'quote') {
      let edition: PrintEdition, pages: number, ship: Record<string, string> | undefined;
      if (body.orderId) {
        const order = await loadOrder(db, body.orderId);
        edition = printable(order);
        if (!order.manuscript_pages) return json({ error: 'This order has no composed manuscript yet.' }, 409);
        pages = interiorPageCount(order.manuscript_pages);
        const a = luluAddress(order.shipping_address);
        if (a.error) return json({ error: a.error }, 409);
        ship = a.address;
      } else {
        if (!body.edition || !body.pages || !body.address) return json({ error: 'Choose a version, page count and US address to quote.' }, 400);
        edition = body.edition; pages = body.pages % 2 ? body.pages + 1 : body.pages;
        const a = luluAddress({ name: body.address.name || 'Quote', ...body.address, country: 'US' });
        if (a.error) return json({ error: a.error }, 400);
        ship = a.address;
      }
      const limit = pageLimitError(edition, pages);
      if (limit) return json({ error: limit }, 400);
      const level = luluShippingLevel();
      const q = await lulu('/print-job-cost-calculations/', { method: 'POST', body: { line_items: [{ page_count: pages, pod_package_id: POD_PACKAGES[edition], quantity: 1 }], shipping_address: { ...ship, phone_number: ship!.phone_number || '000-000-0000' }, shipping_option: level } });
      return json({ quote: { edition, pages, shipping_level: level, environment: env, ...quoteSummary(q) } });
    }

    if (body.action === 'proof') {
      const order = await loadOrder(db, body.orderId);
      const edition = printable(order); readyToPrint(order, env);
      const files = await prepareFiles(db, order, edition, 'proof');
      const [interiorUrl, coverUrl] = await Promise.all([signed(db, files.interiorPath, 600, `AstroBook-${order.id.slice(0, 8)}-interior.pdf`), signed(db, files.coverPath, 600, `AstroBook-${order.id.slice(0, 8)}-cover.pdf`)]);
      return json({ interiorUrl, coverUrl, pages: files.pages, pod: files.pod, cover: files.dims, spinePt: Math.round(files.spine * 10) / 10 });
    }

    if (body.action === 'submit') {
      const order = await loadOrder(db, body.orderId);
      const edition = printable(order); readyToPrint(order, env);
      const ship = luluAddress(order.shipping_address);
      if (ship.error) return json({ error: ship.error }, 409);
      // Release a claim left by an attempt that crashed mid-way, then claim this order (one active job per order).
      await db.from('lulu_print_jobs').update({ status: 'FAILED', status_message: 'The previous attempt did not finish.', updated_at: new Date().toISOString() }).eq('order_id', order.id).eq('environment', env).eq('status', 'SUBMITTING').lt('created_at', new Date(Date.now() - 10 * 60_000).toISOString());
      const level = luluShippingLevel();
      const claim = await db.from('lulu_print_jobs').insert({ order_id: order.id, environment: env, pod_package_id: POD_PACKAGES[edition], page_count: Math.max(1, interiorPageCount(order.manuscript_pages ?? 1)), shipping_level: level, created_by: user.id }).select('id').single();
      if (claim.error) return json({ error: claim.error.code === '23505' ? 'This order already has an active Lulu print job.' : 'The print job could not be started.' }, claim.error.code === '23505' ? 409 : 500);
      const rowId = claim.data.id as string;
      try {
        const files = await prepareFiles(db, order, edition, rowId);
        const [interiorUrl, coverUrl] = await Promise.all([signed(db, files.interiorPath, WEEK), signed(db, files.coverPath, WEEK)]);
        const { data: profile } = await db.from('profiles').select('display_name').eq('id', order.user_id).maybeSingle();
        const job = await lulu('/print-jobs/', { method: 'POST', body: {
          external_id: `zodaci-${order.id}`,
          contact_email: Deno.env.get('LULU_CONTACT_EMAIL')?.trim() || user.email,
          shipping_level: level,
          production_delay: PRODUCTION_DELAY_MINUTES,
          shipping_address: ship.address,
          line_items: [{
            external_id: order.id, title: 'AstroBook', quantity: 1,
            printable_normalization: { pod_package_id: files.pod, interior: { source_url: interiorUrl }, cover: { source_url: coverUrl }, ...(isLinen(files.pod) ? foilText(profile?.display_name) : {}) },
          }],
        } });
        const id = Number(job?.id);
        if (!Number.isFinite(id)) throw new LuluError(502, 'Lulu did not return a print job number.');
        const saved = await db.from('lulu_print_jobs').update({ lulu_job_id: id, page_count: files.pages, interior_path: files.interiorPath, cover_path: files.coverPath, status: String(job?.status?.name ?? 'CREATED'), updated_at: new Date().toISOString() }).eq('id', rowId);
        if (saved.error) throw saved.error;
        if (env === 'production') await db.from('book_orders').update({ lulu_reference: String(id), updated_at: new Date().toISOString() }).eq('id', order.id);
        const result = await applyJobUpdate(db, { id: rowId, order_id: order.id, environment: env, status: 'CREATED' }, job);
        return json({ jobId: rowId, luluJobId: id, status: result.status, environment: env, note: env === 'sandbox' ? 'Sent to the Lulu sandbox: a test job that is never printed. The order stage was not changed.' : result.note });
      } catch (e) {
        const message = e instanceof LuluError ? e.message : 'The print files could not be prepared or sent.';
        if (!(e instanceof LuluError)) console.error('lulu submit', e);
        await db.from('lulu_print_jobs').update({ status: 'FAILED', status_message: message, updated_at: new Date().toISOString() }).eq('id', rowId);
        return json({ error: message }, e instanceof LuluError ? e.status : 500);
      }
    }

    if (body.action === 'sync' || body.action === 'cancel') {
      const { data: row, error } = await db.from('lulu_print_jobs').select('*').eq('id', body.jobId).maybeSingle();
      if (error) throw error;
      if (!row) return json({ error: 'Print job not found.' }, 404);
      if (!row.lulu_job_id) return json({ error: 'This attempt never reached Lulu.' }, 409);
      if (row.environment !== env) return json({ error: `This job belongs to the Lulu ${row.environment} account, but ${env} is connected now.` }, 409);
      if (body.action === 'cancel') {
        if (!CANCELLABLE.includes(row.status)) return json({ error: 'Lulu only cancels jobs that have not been paid yet.' }, 409);
        await lulu(`/print-jobs/${row.lulu_job_id}/status/`, { method: 'PUT', body: { name: 'CANCELED' } });
      }
      const job = await lulu(`/print-jobs/${row.lulu_job_id}/`);
      const result = await applyJobUpdate(db, row, job);
      return json({ status: result.status, note: result.note, failed: FAILED_STATUSES.includes(result.status) });
    }

    if (body.action === 'register-webhook') {
      const hookUrl = `${url}/functions/v1/lulu-webhook`;
      // deno-lint-ignore no-explicit-any
      const list: any = await lulu('/webhooks/');
      // deno-lint-ignore no-explicit-any
      const existing = (Array.isArray(list) ? list : list?.results ?? []).find((w: any) => w?.url === hookUrl);
      const hook = existing
        ? await lulu(`/webhooks/${existing.id}/`, { method: 'PATCH', body: { topics: ['PRINT_JOB_STATUS_CHANGED'], url: hookUrl, is_active: true } })
        : await lulu('/webhooks/', { method: 'POST', body: { topics: ['PRINT_JOB_STATUS_CHANGED'], url: hookUrl } });
      const value = { id: hook?.id ?? existing?.id ?? null, url: hookUrl, environment: env, active: hook?.is_active ?? true, registered_at: new Date().toISOString() };
      const saved = await db.from('platform_settings').upsert({ key: SETTINGS_KEY, value, updated_by: user.id, updated_at: new Date().toISOString() });
      if (saved.error) throw saved.error;
      return json({ webhook: value });
    }
    return json({ error: 'Unknown action.' }, 400);
  } catch (e) {
    if (e instanceof LuluError) return json({ error: e.message }, e.status);
    console.error('lulu-print', e);
    return json({ error: 'The Lulu request could not be completed. Please retry.' }, 500);
  }
});
