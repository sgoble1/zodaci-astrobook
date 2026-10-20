import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN = `${SUPABASE_URL}/functions/v1/create-checkout`;

/** The money-flow guardrails that must hold no matter what the client sends. */
Deno.test("create-checkout rejects a request with no sign-in", async () => {
  const res = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY }, body: JSON.stringify({ priceId: "pro_monthly", environment: "sandbox", returnUrl: "https://zodaci.com/checkout/return" }) });
  await res.text();
  assertEquals(res.status, 401);
});

Deno.test("create-checkout rejects a forged Authorization header", async () => {
  const res = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: "Bearer not-a-real-token" }, body: JSON.stringify({ orderId: "11111111-1111-1111-1111-111111111111", environment: "live", returnUrl: "https://zodaci.com/orders" }) });
  await res.text();
  assertEquals(res.status, 401);
});

Deno.test("create-checkout only accepts POST", async () => {
  const res = await fetch(FN, { method: "GET", headers: { apikey: SUPABASE_ANON_KEY } });
  await res.text();
  assertEquals(res.status, 405);
});
