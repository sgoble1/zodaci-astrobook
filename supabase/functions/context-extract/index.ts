import { createClient } from "npm:@supabase/supabase-js@2";
import { creditShortfall } from "../_shared/credits.ts";
import { hasFullAccess } from "../_shared/chat-guard.ts";

// Reads a member's own diary photo or PDF and streams back plain transcribed text for them to review and edit.
// Nothing is stored here; the member decides whether to save it as personal context.
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
const TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

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
    if (!(await hasFullAccess(admin, u.user.id))) return json({ error: "Reading files is part of Pro and Cosmic." }, 403);
    const b = await req.json().catch(() => ({})) as { mime?: string; name?: string; data?: string };
    if (!b.mime || !TYPES.includes(b.mime) || typeof b.data !== "string" || !b.data) return json({ error: "Choose a JPG, PNG, WebP photo or a PDF." }, 400);
    if (b.data.length > 11_000_000) return json({ error: "That file is too large. Keep it under 8 MB." }, 400);
    const short = await creditShortfall(admin, u.user.id, "context-extract");
    if (short) return json({ error: short }, 402);

    const part = b.mime === "application/pdf"
      ? { type: "input_file", filename: String(b.name ?? "notes.pdf").slice(0, 80), file_data: `data:application/pdf;base64,${b.data}` }
      : { type: "input_image", image_url: `data:${b.mime};base64,${b.data}` };
    const instructions = "Transcribe the member's own handwritten or printed notes exactly as written, in plain text, keeping paragraph breaks. Do not summarise, interpret, correct or add anything. Mark unreadable words as [unclear]. If there is no readable text, reply only: No readable text found.";
    const up = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST", signal: req.signal,
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({ model: "openai/gpt-6-astra", instructions, input: [{ role: "user", content: [{ type: "input_text", text: "Transcribe this." }, part] }], stream: true, store: false, max_output_tokens: 4000, reasoning: { effort: "low" } }),
    });
    if (!up.ok || !up.body) {
      const msg = up.status === 429 ? "Too many requests. Try again in a moment." : up.status === 402 ? "AI credits have run out." : "The file could not be read right now.";
      return json({ error: msg }, up.status === 429 || up.status === 402 || up.status === 403 ? up.status : 502);
    }
    await admin.from("ai_usage").insert({ user_id: u.user.id, feature: "context-extract" });
    const out = new ReadableStream({
      async start(c) {
        const r = up.body!.getReader(), dec = new TextDecoder(), enc = new TextEncoder(); let buf = "";
        try {
          while (true) {
            const { done, value } = await r.read(); if (done) break;
            buf += dec.decode(value, { stream: true }); let i;
            while ((i = buf.indexOf("\n")) >= 0) {
              const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
              if (!line.startsWith("data:")) continue;
              try { const ev = JSON.parse(line.slice(5).trim()); if (ev.type === "response.output_text.delta" && ev.delta) c.enqueue(enc.encode(ev.delta)); } catch { /* partial */ }
            }
          }
        } catch { /* aborted */ }
        c.close();
      },
    });
    return new Response(out, { headers: { ...cors, "Content-Type": "text/plain; charset=utf-8" } });
  } catch (e) { console.error(e); return json({ error: "Something went wrong." }, 500); }
});
