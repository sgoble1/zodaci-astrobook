import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import type Stripe from "https://esm.sh/stripe@22.0.2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

import { snapshotBookPdf } from '../_shared/book-delivery.ts';

/** Mirrors SELLABLE_PRICES / PLAN_AMOUNT in src/lib/plans.ts (cents, billing interval). Checkout refuses any provider price that differs. */
const MEMBERSHIP: Record<string, { amount: number; interval: 'month' | 'year' }> = {
  pro_monthly: { amount: 900, interval: 'month' }, pro_yearly: { amount: 8900, interval: 'year' },
  cosmic_monthly: { amount: 1900, interval: 'month' }, cosmic_yearly: { amount: 17900, interval: 'year' },
};
const ALLOWED = new Set(Object.keys(MEMBERSHIP));
/** Preview and local builds may only ever open test checkouts, so a preview can never take a real payment. */
const isPreviewOrigin = (origin: string) => { try { const h = new URL(origin).hostname; return h === 'localhost' || h === '127.0.0.1' || h.startsWith('id-preview--') || h.endsWith('.lovableproject.com'); } catch { return true; } };
/** Mirrors BOOK_VERSIONS in src/lib/books.ts (price in cents, lookup key, format). */
const BOOK_VERSION: Record<string, { lookup: string; price: number; format: 'print' | 'digital' }> = {
  digital: { lookup: 'astrobook_digital_v2', price: 2499, format: 'digital' },
  pocket: { lookup: 'astrobook_pocket', price: 3499, format: 'print' },
  classic: { lookup: 'astrobook_classic', price: 5999, format: 'print' },
  signature: { lookup: 'astrobook_signature', price: 9700, format: 'print' },
  linen: { lookup: 'astrobook_linen', price: 14900, format: 'print' },
};
/** Mirrors COMIC_PLANS in src/lib/comic.ts. AstroComic never grants a Zodaci plan tier. */
const COMIC: Record<string, { lookup: string; price: number; mode: 'subscription' | 'payment' }> = {
  monthly: { lookup: 'comic_monthly', price: 1499, mode: 'subscription' },
  yearly: { lookup: 'comic_yearly', price: 14999, mode: 'subscription' },
  single: { lookup: 'comic_single', price: 1899, mode: 'payment' },
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function resolveOrCreateCustomer(stripe: ReturnType<typeof createStripeClient>, options: { email?: string; userId?: string }): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");
  if (options.userId) {
    const found = await stripe.customers.search({ query: `metadata['userId']:'${options.userId}'`, limit: 1 });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, { metadata: { ...customer.metadata, userId: options.userId } });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    // Subscriptions belong to a signed-in account, so require one.
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return json({ error: "Please sign in first." }, 401);

    const { priceId, orderId, comicPlan, returnUrl, environment } = await req.json();
    if (!orderId && !comicPlan && !ALLOWED.has(priceId)) return json({ error: "Unknown plan" }, 400);
    if (environment !== "sandbox" && environment !== "live") return json({ error: "Invalid environment" }, 400);
    if (typeof returnUrl !== "string" || !/^https?:\/\//.test(returnUrl)) return json({ error: "Invalid return URL" }, 400);
    const origin = req.headers.get('Origin');
    if (!origin || new URL(returnUrl).origin !== origin) return json({ error: 'Return URL must match this site.' }, 400);
    if (environment === 'live' && isPreviewOrigin(origin)) return json({ error: 'Live payments only open on the published site.' }, 400);
    const env = environment as StripeEnv;

    const stripe = createStripeClient(env);
    if (comicPlan) {
      const plan = COMIC[comicPlan as string];
      if (!plan) return json({ error: 'Unknown AstroComic plan' }, 400);
      const { data: existing, error: existingError } = await admin.from('comic_subscriptions').select('id,plan,status,checkout_session_id').eq('user_id', user.id).eq('environment', env);
      if (existingError) throw existingError;
      if (comicPlan !== 'single' && (existing ?? []).some(r => r.plan !== 'single' && ['active', 'paused', 'past_due'].includes(r.status))) return json({ error: 'You already have an AstroComic subscription. Manage it from My AstroComic.' }, 409);
      const prices = await stripe.prices.list({ lookup_keys: [plan.lookup] });
      const price = prices.data[0];
      if (!price) return json({ error: 'AstroComic prices are not configured.' }, 404);
      if (price.currency !== 'usd' || price.unit_amount !== plan.price) return json({ error: 'Checkout prices do not match the advertised AstroComic prices. Please contact support.' }, 409);
      let row = (existing ?? []).find(r => r.plan === comicPlan && r.status === 'pending');
      if (row?.checkout_session_id) {
        const previous = await stripe.checkout.sessions.retrieve(row.checkout_session_id);
        if (previous.status === 'open') return json({ clientSecret: previous.client_secret });
        if (previous.status === 'complete') return json({ error: 'Payment was submitted. Please wait for confirmation.' }, 409);
      }
      if (!row) {
        const inserted = await admin.from('comic_subscriptions').insert({ user_id: user.id, plan: comicPlan, environment: env, status: 'pending' }).select('id,plan,status,checkout_session_id').single();
        if (inserted.error) throw inserted.error;
        row = inserted.data;
      }
      const customerId = await resolveOrCreateCustomer(stripe, { email: user.email ?? undefined, userId: user.id });
      const meta = { userId: user.id, kind: 'comic', comicId: row!.id, comicPlan, managed_payments: 'false' };
      const session = await stripe.checkout.sessions.create({
        mode: plan.mode, ui_mode: 'embedded_page', return_url: returnUrl, customer: customerId,
        line_items: [{ price: price.id, quantity: 1 }],
        automatic_tax: { enabled: true },
        customer_update: { shipping: 'auto', address: 'auto' }, shipping_address_collection: { allowed_countries: ['US'] },
        metadata: meta,
        ...(plan.mode === 'subscription' ? { subscription_data: { metadata: meta } } : { payment_intent_data: { description: 'AstroComic single issue', metadata: meta } }),
      } as Stripe.Checkout.SessionCreateParams, { idempotencyKey: `comic-${row!.id}-${env}-${row!.checkout_session_id || 'first'}` });
      const saved = await admin.from('comic_subscriptions').update({ checkout_session_id: session.id }).eq('id', row!.id).eq('status', 'pending');
      if (saved.error) throw saved.error;
      return json({ clientSecret: session.client_secret });
    }
    if (orderId) {
      if (typeof orderId !== 'string' || !/^[a-f0-9-]{36}$/.test(orderId)) return json({ error: 'Invalid order' }, 400);
      const { data: order, error: orderError } = await admin.from('book_orders').select('*').eq('id', orderId).eq('user_id', user.id).single();
      if (orderError || !order) return json({ error: 'Order not available.' }, 404);
      if (!['draft','awaiting_payment'].includes(order.status)) return json({ error: 'This order is not awaiting payment.' }, 400);
      if (order.payment_hold) return json({ error: 'This order needs a payment review before continuing.' }, 409);
      if (order.checkout_session_id && order.environment !== env) return json({ error: 'This order is already tied to another payment environment.' }, 409);
      const digital = order.format === 'digital';
      const addr = order.shipping_address as Record<string, string> | null;
      const addrOk = !!addr && addr.country === 'US' && !!addr.name?.trim() && !!addr.line1?.trim() && !!addr.city?.trim() && addr.state?.trim().length === 2 && /^\d{5}(-\d{4})?$/.test(addr.postal_code?.trim() ?? '');
      if (!digital && !addrOk) return json({ error: 'A complete US shipping address is required.' }, 400);
      if (!order.cover_path?.startsWith(`${user.id}/book-covers/`)) return json({ error: 'Choose a personal cover first.' }, 400);
      if (!order.manuscript_path?.startsWith(`${user.id}/manuscripts/`) || !Number.isInteger(order.manuscript_pages) || order.manuscript_pages < 4) return json({ error: 'Compose and review your manuscript before paying.' }, 400);
      const manuscript = await admin.storage.from('library').download(order.manuscript_path);
      if (manuscript.error || !manuscript.data || manuscript.data.size < 1000) return json({ error: 'Your manuscript file is not available. Please compose it again.' }, 400);
      await snapshotBookPdf(admin, order);
      const extras = Array.isArray(order.extra_sections) ? order.extra_sections : [];
      if (extras.length > 2 || extras.some((s:unknown) => typeof s !== 'string' || !s.trim() || s.length > 160)) return json({ error: 'Choose up to two additional sections.' }, 400);
      if (order.checkout_session_id && order.environment === env) {
        const previous = await stripe.checkout.sessions.retrieve(order.checkout_session_id);
        if (previous.status === 'open') return json({ clientSecret: previous.client_secret });
        if (previous.status === 'complete') return json({ error: 'Payment was submitted. Please wait for order confirmation.' }, 409);
      }
      const version = BOOK_VERSION[order.edition];
      const legacy = !version;
      if (version && (version.format === 'digital') !== digital) return json({ error: 'This edition and format do not match.' }, 400);
      const lookup = version ? version.lookup : digital ? 'astrobook_digital' : order.edition === 'expanded' ? 'astrobook_print_expanded' : 'astrobook_print_standard';
      const prices = await stripe.prices.list({ lookup_keys: [lookup,'astrobook_print_extra'] });
      const base = prices.data.find(p => p.lookup_key === lookup);
      const extra = prices.data.find(p => p.lookup_key === 'astrobook_print_extra');
      if (!base || (extras.length && !extra)) return json({ error: 'Book prices are not configured.' }, 404);
      const expected = version ? version.price : digital ? 1999 : order.edition === 'expanded' ? 8900 : 5900;
      if (legacy && order.status === 'draft' && !order.checkout_session_id) return json({ error: 'This earlier edition is no longer sold. Please start a new AstroBook order.' }, 409);
      if (base.currency !== 'usd' || base.unit_amount !== expected || (extras.length && (extra?.currency !== 'usd' || extra.unit_amount !== 699))) return json({ error: 'Checkout prices do not match the advertised book prices. Please contact support.' }, 409);
      const productId = typeof base.product === 'string' ? base.product : base.product.id;
      const product = await stripe.products.retrieve(productId);
      const customerId = await resolveOrCreateCustomer(stripe, { email: user.email ?? undefined, userId: user.id });
      const reservation = await admin.rpc('reserve_book_checkout', { p_order: order.id, p_owner: user.id });
      if (reservation.error) throw reservation.error;
      const lease = reservation.data;
      if (!lease) return json({ error: 'Checkout is already opening. Please wait a moment, then retry.' }, 409);
      try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment', ui_mode: 'embedded_page', return_url: returnUrl, customer: customerId,
        line_items: [{ price: base.id, quantity: 1 }, ...(extras.length && extra ? [{ price: extra.id, quantity: extras.length }] : [])],
        automatic_tax: { enabled: true },
        // Digital editions are a download, so only printed books collect a shipping address (and a phone number the carrier needs).
        ...(digital ? { customer_update: { address: 'auto' } } : { customer_update: { shipping: 'auto' }, shipping_address_collection: { allowed_countries: ['US'] }, phone_number_collection: { enabled: true } }),
        payment_intent_data: { description: product.name, metadata: { userId: user.id, orderId: order.id } },
        metadata: { userId: user.id, orderId: order.id, managed_payments: 'false' },
      }, { idempotencyKey: `book-${order.format}-${order.id}-${env}-${order.checkout_session_id || 'first'}` });
      const saved = await admin.from('book_orders').update({ checkout_session_id:session.id,environment:env,status:'awaiting_payment',shipping_cents:0,base_price_cents:expected,extras_cents:extras.length * 699,updated_at:new Date().toISOString() }).eq('id',order.id).eq('checkout_lease', lease).in('status', ['draft','awaiting_payment']).select('id');
      if (saved.error || !saved.data?.length) throw saved.error ?? new Error('Order changed while checkout was opening');
      return json({ clientSecret:session.client_secret });
      } finally {
        await admin.from('book_orders').update({ checkout_lease: null, checkout_lease_at: null }).eq('id', order.id).eq('checkout_lease', lease);
      }
    }
    // One membership per account: plan changes go through Manage billing so nobody pays twice.
    const { data: current, error: currentError } = await admin.from('billing_subscriptions').select('id').eq('user_id', user.id).eq('environment', env).in('status', ['active', 'trialing', 'past_due']).limit(1);
    if (currentError) throw currentError;
    if (current?.length) return json({ error: 'You already have a membership. Change or cancel it from Manage billing.', code: 'already_subscribed' }, 409);
    const prices = await stripe.prices.list({ lookup_keys: [priceId] });
    if (!prices.data.length) return json({ error: "Price not found" }, 404);
    const advertised = MEMBERSHIP[priceId];
    const live = prices.data[0];
    if (live.currency !== 'usd' || live.unit_amount !== advertised.amount || live.recurring?.interval !== advertised.interval) {
      console.error('Membership price mismatch', priceId, live.unit_amount, live.currency, live.recurring?.interval);
      return json({ error: 'Checkout prices do not match the advertised plan prices. Please contact support.' }, 409);
    }
    const customerId = await resolveOrCreateCustomer(stripe, { email: user.email ?? undefined, userId: user.id });

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: prices.data[0].id, quantity: 1 }],
      mode: "subscription",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      customer: customerId,
      managed_payments: { enabled: true },
      metadata: { userId: user.id, managed_payments: "true" },
      subscription_data: { metadata: { userId: user.id } },
    } as Stripe.Checkout.SessionCreateParams);
    return json({ clientSecret: session.client_secret });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Checkout failed" }, 500);
  }
});
