import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const OPEN_DISPUTE = new Set(["warning_needs_response", "warning_under_review", "needs_response", "under_review"]);

/** Read-only payments overview for admins: active plans by price, monthly recurring revenue, recent charges, open disputes and unpaid invoices. */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Please sign in first." }, 401);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return json({ error: "Please sign in first." }, 401);
    const { data: isAdmin, error: roleError } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (roleError || !isAdmin) return json({ error: "Admins only." }, 403);
    const body = await req.json().catch(() => ({}));
    if (body.environment !== "sandbox" && body.environment !== "live") return json({ error: "Invalid environment" }, 400);
    const env = body.environment as StripeEnv;
    const stripe = createStripeClient(env);

    const subs: any[] = [];
    for (const status of ["active", "trialing", "past_due"] as const) {
      let starting_after: string | undefined;
      for (let page = 0; page < 5; page++) {
        const r = await stripe.subscriptions.list({ status, limit: 100, expand: ["data.items.data.price"], ...(starting_after ? { starting_after } : {}) });
        subs.push(...r.data);
        if (!r.has_more) break;
        starting_after = r.data.at(-1)?.id;
      }
    }
    const byPrice: Record<string, { count: number; mrr_cents: number; past_due: number; canceling: number }> = {};
    let mrr = 0;
    for (const s of subs) {
      for (const item of s.items?.data ?? []) {
        const p = item.price;
        const key = p?.lookup_key || p?.metadata?.lovable_external_id || p?.id || "unknown";
        const qty = item.quantity ?? 1;
        const unit = p?.unit_amount ?? 0;
        const interval = p?.recurring?.interval;
        const count = p?.recurring?.interval_count ?? 1;
        const monthly = interval === "year" ? unit / (12 * count) : interval === "month" ? unit / count : interval === "week" ? (unit * 52) / (12 * count) : interval === "day" ? (unit * 365) / (12 * count) : 0;
        const row = byPrice[key] ??= { count: 0, mrr_cents: 0, past_due: 0, canceling: 0 };
        row.count += 1;
        if (s.status !== "past_due") { row.mrr_cents += Math.round(monthly * qty); mrr += Math.round(monthly * qty); }
        if (s.status === "past_due") row.past_due += 1;
        if (s.cancel_at_period_end) row.canceling += 1;
      }
    }
    const [charges, disputes, invoices] = await Promise.all([
      stripe.charges.list({ limit: 25 }),
      stripe.disputes.list({ limit: 25 }),
      stripe.invoices.list({ status: "open", limit: 25 }),
    ]);
    return json({
      environment: env,
      generated_at: new Date().toISOString(),
      active_subscriptions: subs.length,
      mrr_cents: mrr,
      by_price: byPrice,
      charges: charges.data.map((c: any) => ({ id: c.id, created: c.created, amount: c.amount, currency: c.currency, status: c.status, paid: c.paid, refunded: c.refunded, amount_refunded: c.amount_refunded, description: c.description ?? "", email: c.billing_details?.email ?? c.receipt_email ?? "", disputed: c.disputed })),
      disputes: disputes.data.filter((d: any) => OPEN_DISPUTE.has(d.status)).map((d: any) => ({ id: d.id, created: d.created, amount: d.amount, currency: d.currency, reason: d.reason, status: d.status, due_by: d.evidence_details?.due_by ?? null })),
      unpaid_invoices: invoices.data.filter((i: any) => (i.attempt_count ?? 0) > 0).map((i: any) => ({ id: i.id, created: i.created, amount_due: i.amount_due, currency: i.currency, email: i.customer_email ?? "", attempts: i.attempt_count, next_attempt: i.next_payment_attempt ?? null })),
    });
  } catch (e) {
    console.error("admin-stripe-overview", e);
    return json({ error: "The payments overview is unavailable right now." }, 500);
  }
});
