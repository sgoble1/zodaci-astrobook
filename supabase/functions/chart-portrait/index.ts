import { createClient } from "npm:@supabase/supabase-js@2";
import { creditShortfall } from "../_shared/credits.ts";
import { hasFullAccess } from "../_shared/chat-guard.ts";

// Sky Portrait: a 1950s observatory poster drawn from the member's own saved chart (Sun, Moon, Rising signs and
// the most-occupied element only). It never depicts the member as a person or claims anything about their life.
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const sign = (lon: unknown) => typeof lon === "number" ? SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30)] : null;

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
    if (!(await hasFullAccess(admin, u.user.id))) return json({ error: "Sky Portraits are part of Pro and Cosmic." }, 403);
    const { data: prof } = await admin.from("profiles").select("chart").eq("id", u.user.id).maybeSingle();
    const chart = (prof as { chart?: { bodies?: { key: string; lon: number }[]; asc?: number | null; elements?: Record<string, number> } } | null)?.chart;
    const sun = sign(chart?.bodies?.find(b => b.key === "sun")?.lon);
    const moon = sign(chart?.bodies?.find(b => b.key === "moon")?.lon);
    if (!sun || !moon) return json({ error: "Save your birth details first so the portrait can use your chart." }, 400);
    const rising = sign(chart?.asc);
    const element = Object.entries(chart?.elements ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0];
    const short = await creditShortfall(admin, u.user.id, "chart-portrait");
    if (short) return json({ error: short }, 402);

    const prompt = `A 1950s atomic-age educational observatory poster, square, screen-printed look with grain and halftone. Central motif: the ${sun} zodiac symbol drawn as a large brass instrument medallion, with a crescent Moon emblem for ${moon} ${rising ? `and a rising-horizon arc for ${rising}` : ""} around it, ${element ? `accents themed on the ${element} element,` : ""} constellation lines and orbit rings. Palette: archive cream, deep indigo, warm yellow, signal red, brass. Clean ink linework, mid-century geometry. No people, no faces, no text or letters, no logos, no fantasy, no crystals, no cyberpunk.`;
    const r = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", { method: "POST", headers: { "Lovable-API-Key": apiKey, "Content-Type": "application/json" }, body: JSON.stringify({ model: "openai/gpt-image-2.5-sunburst", prompt, size: "1024x1024", stream: false }) });
    if (!r.ok) {
      const msg = r.status === 429 ? "Too many requests. Try again in a moment." : r.status === 402 ? "AI credits have run out." : "The portrait could not be drawn right now.";
      return json({ error: msg }, [402, 429].includes(r.status) ? r.status : 502);
    }
    const b64 = (await r.json())?.data?.[0]?.b64_json;
    if (!b64) return json({ error: "No portrait came back. Please try again." }, 502);
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const path = `${u.user.id}/creation/sky-portrait-${Date.now()}.png`;
    const st = await admin.storage.from("library").upload(path, bytes, { contentType: "image/png" });
    if (st.error) return json({ error: "The portrait was drawn but could not be saved." }, 500);
    await admin.from("ai_usage").insert({ user_id: u.user.id, feature: "chart-portrait" });
    const title = `Sky Portrait · ${sun} Sun, ${moon} Moon${rising ? `, ${rising} Rising` : ""}`;
    const ins = await admin.from("library_items").insert({ kind: "creation", title, category: "Sky Portraits", file_path: path, file_name: "sky-portrait.png", mime_type: "image/png", size_bytes: bytes.length, owner_id: u.user.id, shared_with_space: false }).select("id").single();
    if (ins.error) return json({ error: "The portrait was drawn but could not be saved." }, 500);
    const { data: signed } = await admin.storage.from("library").createSignedUrl(path, 600);
    return json({ id: ins.data.id, title, url: signed?.signedUrl ?? null });
  } catch (e) { console.error(e); return json({ error: "Something went wrong." }, 500); }
});
