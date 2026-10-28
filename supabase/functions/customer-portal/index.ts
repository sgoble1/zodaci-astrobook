import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

/** Opens the payment provider's billing page so members can cancel, change card or see invoices. */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return json({ error: "Please sign in first." }, 401);
    const body = await req.json().catch(() => ({}));
    const env: StripeEnv = body.environment === "sandbox" ? "sandbox" : "live";
    // Only our own sites may be used as the return destination.
    const TRUSTED = /^https:\/\/((www\.)?zodaci\.com|april\.zodaci\.com|[a-z0-9-]+\.lovable\.app)$/;
    let returnUrl: string | undefined;
    try { const u = new URL(String(body.returnUrl)); if (TRUSTED.test(u.origin)) returnUrl = u.origin + u.pathname; } catch { /* ignore */ }
    returnUrl ??= "https://zodaci.com/pricing";
    // Plan memberships and AstroComic subscriptions are stored separately; either can open billing.
    const kind = body.kind === "comic" ? "comic" : "plan";
    const tables = kind === "comic" ? ["comic_subscriptions", "billing_subscriptions"] : ["billing_subscriptions", "comic_subscriptions"];
    let sub: { stripe_customer_id: string | null } | null = null;
    for (const t of tables) {
      const { data } = await admin.from(t).select("stripe_customer_id").eq("user_id", user.id).eq("environment", env).not("stripe_customer_id", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data?.stripe_customer_id) { sub = data; break; }
    }
    if (!sub?.stripe_customer_id) return json({ error: "No subscription found for this account yet." }, 404);
    const stripe = createStripeClient(env);
    const session = await stripe.billingPortal.sessions.create({ customer: sub.stripe_customer_id, return_url: returnUrl });
    return json({ url: session.url });
  } catch (e) {
    console.error("customer-portal", e);
    return json({ error: "Could not open billing right now. Please try again." }, 500);
  }
});
