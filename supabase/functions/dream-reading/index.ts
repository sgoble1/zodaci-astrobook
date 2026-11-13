import { createClient } from "npm:@supabase/supabase-js@2";
import { creditShortfall } from "../_shared/credits.ts";
import { counselorContext } from "../_shared/member-profile.ts";
import { hasFullAccess } from "../_shared/chat-guard.ts";

// Dream reading: one short symbolic reading of a member's own saved dream, using their calculated chart and the
// night's sky lines computed in the browser (lib/dreamSky). Saved on the member's own row through their session.
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
const clip = (v: unknown, n: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);

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
    const { data: entry } = await sb.from("dream_entries").select("id,body,dream_date,feelings,recurring").eq("id", body.id).maybeSingle();
    if (!entry) return json({ error: "That dream was not found." }, 404);

    const profile = await counselorContext(sb, admin, u.user.id, u.user.email ?? "");
    if (!profile.ok) return json({ error: profile.error }, 400);
    const short = await creditShortfall(admin, u.user.id, "dream");
    if (short) return json({ error: short }, 402);

    const sky = (Array.isArray(body.sky) ? body.sky : []).slice(0, 12).map(s => clip(s, 200)).filter(Boolean);
    const instructions = `You read one member's dream at Zodaci as symbolism, never as prediction or diagnosis.
Use only the dream text, the calculated chart and the sky lines below. Never invent placements, people, events or biography, and never say what the dream "means will happen".
Name the chart factor behind each point in brackets, e.g. [Moon in Cancer] or [Neptune that night]. If the sky lines are empty, say the night had no close contacts and read from the dream and natal chart only.
Plain, warm, specific language. Three short paragraphs, then one reflection question. Under 220 words. If the dream suggests distress or danger, gently suggest talking with someone qualified.

CHART:
${profile.context}

SKY THAT NIGHT (calculated):
${sky.length ? sky.map(s => `- ${s}`).join("\n") : "- no close contacts"}`;
    const input = `Dream on ${entry.dream_date}${entry.recurring ? " (recurring)" : ""}${entry.feelings?.length ? `, feelings: ${entry.feelings.join(", ")}` : ""}:\n${clip(entry.body, 4000)}`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({ model: "openai/gpt-6-astra", instructions, input: [{ role: "user", content: input }], store: false, max_output_tokens: 1500, reasoning: { effort: "low" } }),
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
