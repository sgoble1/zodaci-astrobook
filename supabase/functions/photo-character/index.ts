import { createClient } from "npm:@supabase/supabase-js@2";
import { creditShortfall } from "../_shared/credits.ts";
import { hasFullAccess } from "../_shared/chat-guard.ts";

// Turns a member's own photo into a 1950s observatory comic stand-in. The photo is used once and never stored;
// only the drawn result is saved to the member's private library ({uid}/creation/), as a Cosmic Studio creation.
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const PROMPT = "Redraw the person in this photo as a 1950s atomic-age educational comic character: an observatory research staff member in a simple period cardigan or lab coat, clean ink lines, flat halftone colour in cream, deep indigo, warm yellow and red, plain cream background, head and shoulders. Keep their general hairstyle, skin tone and expression recognisable but stylised. No text, no logos, no jumpsuits, no thumbs-up, no fantasy or sci-fi armour.";

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
    if (!(await hasFullAccess(admin, u.user.id))) return json({ error: "Photo characters are part of Pro and Cosmic." }, 403);
    const form = await req.formData().catch(() => null);
    const photo = form?.get("image");
    if (!(photo instanceof File) || !TYPES.includes(photo.type)) return json({ error: "Choose a JPG, PNG or WebP photo." }, 400);
    if (photo.size > 8 * 1024 * 1024) return json({ error: "Keep the photo under 8 MB." }, 400);
    if (form?.get("consent") !== "yes") return json({ error: "Confirm the photo is of you, or that you have permission." }, 400);
    const short = await creditShortfall(admin, u.user.id, "photo-character");
    if (short) return json({ error: short }, 402);

    const up = new FormData();
    up.append("model", "openai/gpt-image-2.5-sunburst"); up.append("prompt", PROMPT); up.append("image", photo, photo.name || "photo.png");
    up.append("size", "1024x1024"); up.append("stream", "false");
    const r = await fetch("https://ai.gateway.lovable.dev/v1/images/edits", { method: "POST", headers: { "Lovable-API-Key": apiKey }, body: up });
    if (!r.ok) {
      const msg = r.status === 429 ? "Too many requests. Try again in a moment." : r.status === 402 ? "AI credits have run out." : r.status === 403 ? "This photo could not be drawn." : "The drawing could not be made right now.";
      return json({ error: msg }, [402, 403, 429].includes(r.status) ? r.status : 502);
    }
    const out = await r.json();
    const b64 = out?.data?.[0]?.b64_json;
    if (!b64) return json({ error: "No drawing came back. This photo may not be usable." }, 502);
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const path = `${u.user.id}/creation/character-${Date.now()}.png`;
    const st = await admin.storage.from("library").upload(path, bytes, { contentType: "image/png" });
    if (st.error) return json({ error: "The drawing was made but could not be saved." }, 500);
    await admin.from("ai_usage").insert({ user_id: u.user.id, feature: "photo-character" });
    const ins = await admin.from("library_items").insert({ kind: "creation", title: "My comic character", category: "Comic characters", file_path: path, file_name: "character.png", mime_type: "image/png", size_bytes: bytes.length, owner_id: u.user.id, shared_with_space: false }).select("id").single();
    if (ins.error) return json({ error: "The drawing was made but could not be saved." }, 500);
    const { data: signed } = await admin.storage.from("library").createSignedUrl(path, 600);
    return json({ id: ins.data.id, url: signed?.signedUrl ?? null });
  } catch (e) { console.error(e); return json({ error: "Something went wrong." }, 500); }
});
