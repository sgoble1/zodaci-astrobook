import { createClient } from "npm:@supabase/supabase-js@2";
import { creditShortfall } from "../_shared/credits.ts";
import { counselorContext } from "../_shared/member-profile.ts";
import { hasFullAccess } from "../_shared/chat-guard.ts";

// "Consult the Observatory": one answer from the member's own calculated chart, today's sky (computed in the browser
// from the same chart), their Current Chapter, their Observation Log and the personal context they opted in.
// Every claim is tagged with the source it came from; nothing is saved here.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID, X-Observatory-Sources",
};
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
    if (!u?.user) return json({ error: "Sign in to consult the Observatory." }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (!(await hasFullAccess(admin, u.user.id))) return json({ error: "Consulting the Observatory is part of Pro and Cosmic. Upgrade to ask." }, 403);

    const body = await req.json().catch(() => ({})) as { question?: string; sky?: unknown[]; chapter?: { title?: string; summary?: string } };
    const question = clip(body.question, 1200);
    if (question.length < 3) return json({ error: "Type a question first." }, 400);

    const profile = await counselorContext(sb, admin, u.user.id, u.user.email ?? "");
    if (!profile.ok) return json({ error: profile.error }, 400);
    const short = await creditShortfall(admin, u.user.id, "observatory");
    if (short) return json({ error: short }, 402);

    // Owner-scoped reads through the member's own session (RLS keeps them to their rows).
    const [obs, ctx] = await Promise.all([
      sb.from("observation_log").select("observed_at,location,notes,tags").eq("owner_id", u.user.id).order("observed_at", { ascending: false }).limit(6),
      sb.from("personal_context").select("title,body").eq("owner_id", u.user.id).eq("use_in_generation", true).order("updated_at", { ascending: false }).limit(6),
    ]);
    const sky = (Array.isArray(body.sky) ? body.sky : []).slice(0, 12).map(s => clip(s, 220)).filter(Boolean);
    const chapter = body.chapter?.title ? `${clip(body.chapter.title, 120)} — ${clip(body.chapter.summary, 400)}` : "";
    const observations = (obs.data ?? []).map(o => `(${String(o.observed_at).slice(0, 10)}${o.location ? `, ${clip(o.location, 60)}` : ""}) ${clip(o.notes, 400)}${o.tags?.length ? ` [tags: ${o.tags.slice(0, 6).join(", ")}]` : ""}`);
    const context = (ctx.data ?? []).map(c => `${clip(c.title, 80)}: ${clip(c.body, 500)}`);

    const sources = [
      { kind: "chart", label: "Your calculated chart" },
      ...(sky.length ? [{ kind: "sky", label: `Today's sky · ${sky.length} contact${sky.length === 1 ? "" : "s"}` }] : []),
      ...(chapter ? [{ kind: "chapter", label: `Current Chapter · ${clip(body.chapter?.title, 60)}` }] : []),
      ...(observations.length ? [{ kind: "log", label: `Observation Log · ${observations.length} entr${observations.length === 1 ? "y" : "ies"}` }] : []),
      ...(context.length ? [{ kind: "context", label: `Your context · ${context.length} note${context.length === 1 ? "" : "s"}` }] : []),
    ];

    const instructions = `You are the Observatory's consulting astrologer at Zodaci, answering one member's question.
Work only from the material below. Tag every claim with the source it rests on, in square brackets: [Chart], [Sky today], [Current Chapter], [Log], [Context].
Never invent placements, transits, dates, relatives, events or biography; if the material does not answer part of the question, say so plainly.
Treat astrology as reflection, not prediction. Personal notes never override chart facts. For health, legal, money or crisis topics, encourage qualified help.
Write in plain, warm, specific language: a short direct answer first, then two to four short sections or bullets, then one small step to try this week. Under 380 words. No sign-off.

MEMBER CHART (calculated):
${profile.context}

TODAY'S SKY AGAINST THIS CHART (calculated in the member's browser from the same chart):
${sky.length ? sky.map(s => `- ${s}`).join("\n") : "- none supplied"}

CURRENT CHAPTER:
${chapter || "none supplied"}

OBSERVATION LOG (the member's own words, newest first):
${observations.length ? observations.map(o => `- ${o}`).join("\n") : "- no entries"}

PERSONAL CONTEXT THE MEMBER OPTED IN:
${context.length ? context.map(c => `- ${c}`).join("\n") : "- none"}`;

    await admin.from("ai_usage").insert({ user_id: u.user.id, feature: "observatory" });
    const runId = req.headers.get("X-Lovable-AIG-Run-ID");
    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST", signal: req.signal,
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch", ...(runId ? { "X-Lovable-AIG-Run-ID": runId } : {}) },
      body: JSON.stringify({
        model: "openai/gpt-6-astra", instructions, input: [{ role: "user", content: question }],
        stream: true, store: false, max_output_tokens: 3000,
        reasoning: { effort: "low", summary: "auto" }, include: ["reasoning.encrypted_content"],
      }),
    });
    if (!upstream.ok || !upstream.body) {
      const t = await upstream.text();
      let msg = "The Observatory could not answer right now. Please try again.";
      if (upstream.status === 429) msg = "Too many questions at once. Wait a moment and ask again.";
      else if (upstream.status === 402) msg = "AI credits have run out. Add credits in Settings → Plans & credits.";
      else { try { msg = JSON.parse(t)?.error?.message ?? msg; } catch { /* keep */ } }
      return json({ error: msg }, upstream.status);
    }
    const out = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader(); const dec = new TextDecoder(); const enc = new TextEncoder();
        let buf = "";
        try {
          while (true) {
            const { done, value } = await reader.read(); if (done) break;
            buf += dec.decode(value, { stream: true });
            let i;
            while ((i = buf.indexOf("\n")) >= 0) {
              const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim(); if (!data || data === "[DONE]") continue;
              try {
                const ev = JSON.parse(data);
                if (ev.type === "response.output_text.delta" && ev.delta) controller.enqueue(enc.encode(ev.delta));
                if (ev.type === "response.failed" || ev.type === "error") controller.enqueue(enc.encode("\n\n[The answer was interrupted.]"));
              } catch { /* partial line */ }
            }
          }
        } catch { /* aborted */ }
        controller.close();
      },
    });
    const h = new Headers({ ...cors, "Content-Type": "text/plain; charset=utf-8", "X-Observatory-Sources": encodeURIComponent(JSON.stringify(sources)) });
    const rid = upstream.headers.get("X-Lovable-AIG-Run-ID"); if (rid) h.set("X-Lovable-AIG-Run-ID", rid);
    return new Response(out, { headers: h });
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: cors });
    console.error("observatory-consult failed", e);
    return json({ error: "The Observatory could not answer right now. Please try again." }, 500);
  }
});
