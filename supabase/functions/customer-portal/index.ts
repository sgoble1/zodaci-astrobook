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
    const returnUrl = typeof body.returnUrl === "string" && /^https?:\/\//.test(body.returnUrl) ? body.returnUrl : undefined;
    const { data: sub } = await admin.from("billing_subscriptions").select("stripe_customer_id").eq("user_id", user.id).eq("environment", env).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!sub?.stripe_customer_id) return json({ error: "No subscription found for this account yet." }, 404);
    const stripe = createStripeClient(env);
    const session = await stripe.billingPortal.sessions.create({ customer: sub.stripe_customer_id, return_url: returnUrl });
    return json({ url: session.url });
  } catch (e) {
    console.error("customer-portal", e);
    return json({ error: "Could not open billing right now. Please try again." }, 500);
  }
});
