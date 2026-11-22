import { createClient } from "npm:@supabase/supabase-js@2";
import { creditShortfall } from "../_shared/credits.ts";
import { counselorContext } from "../_shared/member-profile.ts";
import { hasFullAccess } from "../_shared/chat-guard.ts";
import { dreamReadingMessages } from "../_shared/dream-reading-prompt.ts";
import { requestDeadline } from '../_shared/request-deadline.ts';

// One optional symbolic reading of a member's own dream. The browser supplies the
// ephemeris-calculated sky at the member's recorded local dream time.
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);
    const url = Deno.env.get("SUPABASE_URL")!;
    const sb = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return json({ error: "Sign in first." }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (!(await hasFullAccess(admin, u.user.id))) return json({ error: "Dream readings are part of Pro and Cosmic." }, 403);

    const body = await req.json().catch(() => ({})) as { id?: string; sky?: unknown[] };
    if (!body.id) return json({ error: "Choose a dream first." }, 400);
    const { data: entry } = await sb.from("dream_entries").select("id,body,dream_date,dream_time,feelings,recurring").eq("id", body.id).maybeSingle();
    if (!entry) return json({ error: "That dream was not found." }, 404);

    const profile = await counselorContext(sb, admin, u.user.id, u.user.email ?? "");
    if (!profile.ok) return json({ error: profile.error }, 400);
    const short = await creditShortfall(admin, u.user.id, "dream");
    if (short) return json({ error: short }, 402);

    const messages = dreamReadingMessages(profile.context, body.sky, entry);

    const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      signal: requestDeadline(90_000, req.signal),
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({ model: "openai/gpt-6-astra", ...messages, store: false, max_output_tokens: 1500, reasoning: { effort: "low" } }),
    });
    if (!r.ok) {
      if (r.status === 429) return json({ error: "Too many requests. Try again in a moment." }, 429);
      if (r.status === 402) return json({ error: "AI credits have run out." }, 402);
      return json({ error: "The reading could not be written right now." }, 502);
    }
    const out = await r.json();
    // deno-lint-ignore no-explicit-any
    const text = (out.output ?? []).flatMap((o: any) => o.content ?? []).filter((c: any) => c.type === "output_text").map((c: any) => c.text).join("").trim();
    if (!text) return json({ error: "The reading came back empty. Please try again." }, 502);
    await admin.from("ai_usage").insert({ user_id: u.user.id, feature: "dream" });
    const { error } = await sb.from("dream_entries").update({ ai_reading: text, ai_reading_at: new Date().toISOString() }).eq("id", entry.id);
    if (error) return json({ error: "The reading was written but could not be saved." }, 500);
    return json({ reading: text });
  } catch (e) {
    console.error(e);
    return json({ error: "Something went wrong." }, 500);
  }
});
