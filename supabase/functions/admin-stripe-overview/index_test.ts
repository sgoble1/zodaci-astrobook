import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN = `${SUPABASE_URL}/functions/v1/admin-stripe-overview`;

/** Payment figures are for admins only. */
Deno.test("admin-stripe-overview rejects a request with no sign-in", async () => {
  const res = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY }, body: JSON.stringify({ environment: "live" }) });
  await res.text();
  assertEquals(res.status, 401);
});

Deno.test("admin-stripe-overview rejects a forged token", async () => {
  const res = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: "Bearer not-a-real-token" }, body: JSON.stringify({ environment: "live" }) });
  await res.text();
  assertEquals(res.status, 401);
});

Deno.test("admin-stripe-overview only accepts POST", async () => {
  const res = await fetch(FN, { method: "GET", headers: { apikey: SUPABASE_ANON_KEY } });
  await res.text();
  assertEquals(res.status, 405);
});
