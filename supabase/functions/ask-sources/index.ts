import { createClient } from "npm:@supabase/supabase-js@2";
const PRIVATE = ["shanealecompte@gmail.com", "shanegoble@gmail.com", "babybluepuppet@gmail.com"];
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

type Passage = { n: number; source: string; loc: string; text: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);
    const { question, passages, history } = await req.json() as { question?: string; passages?: Passage[]; history?: { role: string; content: string }[] };
    if (!question?.trim() || question.length > 4000) return json({ error: "Ask a question first." }, 400);
    const list = Array.isArray(passages) ? passages : [];
    // Members (not the private edition) get answers grounded in their own saved chart.
    const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    let member: string | null = null;
    if (token) {
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: { user } } = await admin.auth.getUser(token);
      const email = (user?.email ?? "").toLowerCase();
      if (user && !PRIVATE.includes(email)) {
        const { data: p } = await admin.from("profiles").select("display_name,birth_date,birth_time,place_label,house_system,sex,chart").eq("id", user.id).maybeSingle();
        if (p?.birth_date && p.chart) {
          const bodies = (p.chart.bodies ?? []).map((b: any) => `${b.name}: ${b.sign} ${b.deg}°${String(b.min).padStart(2, "0")}′${p.birth_time && b.house ? ` house ${b.house}` : ""}${b.retro ? " retrograde" : ""}`).join("\n");
          const asp = (p.chart.aspects ?? []).slice(0, 25).map((a: any) => `${a.a} ${a.type} ${a.b} (orb ${Number(a.orb).toFixed(1)}°)`).join("\n");
          member = `Reader: ${p.display_name || "member"}${p.sex ? ` (${p.sex})` : ""}. Born ${p.birth_date}${p.birth_time ? ` ${p.birth_time}` : " (time unknown: never mention houses, Ascendant or Midheaven)"}, ${p.place_label}. House system ${p.house_system}.\nPlacements:\n${bodies}\nAspects:\n${asp}`;
        } else if (user && !PRIVATE.includes(email)) {
          return json({ error: "Save your birth details first so SmartChat can answer from your chart." }, 400);
        }
      }
    }
    if (!member && list.length === 0) return json({ error: "No passages matched — try different words." }, 400);

    const ctx = list.slice(0, 16).map(p => `[${p.n}] (${p.source} — ${p.loc})\n${String(p.text).slice(0, 2200)}`).join("\n\n");
    const instructions = member ? `You are SmartChat, an expert astrologer, psychologist and life coach answering questions about this member's own calculated birth chart.
${member}
Use ONLY these placements; never invent placements, relatives, events or biography. Name the placement behind every claim and explain each technical term in plain everyday words. Offer interpretation for reflection, not prediction. Be warm, specific, practical, under about 400 words. For health, legal or crisis topics, encourage qualified help.` : `You answer questions about April's astrological source documents (birth: Sept 6 1990, 3:38 PM EDT, Geneva NY).
Use ONLY the numbered passages provided. Cite every claim inline with the passage number in square brackets, like [2] or [1][4].
Quote short exact phrases from passages where useful, in quotation marks. If the passages do not contain the answer, say so plainly and do not invent facts.
Write warmly and clearly in short paragraphs or bullet lists, under about 350 words. Do not add a references list at the end.
Earlier conversation turns are context only; citation numbers always refer to the passages given with the latest question.`;

    const runId = req.headers.get("X-Lovable-AIG-Run-ID");
    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      signal: req.signal,
      headers: {
        "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch",
        ...(runId ? { "X-Lovable-AIG-Run-ID": runId } : {}),
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions,
        input: [
          ...(Array.isArray(history) ? history.slice(-12).filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
            .map(m => ({ role: m.role, content: m.content.slice(0, 4000) })) : []),
          { role: "user", content: member ? question : `Passages for this turn:\n\n${ctx}\n\nQuestion: ${question}` },
        ],
        stream: true, store: false,
        reasoning: { effort: "low", summary: "auto" }, include: ["reasoning.encrypted_content"],
      }),
    });
    if (!upstream.ok || !upstream.body) {
      const t = await upstream.text();
      let msg = "The AI could not answer right now.";
      if (upstream.status === 429) msg = "Too many questions at once — please wait a moment and try again.";
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
              } catch { /* partial */ }
            }
          }
        } catch (_e) { /* aborted */ }
        controller.close();
      },
    });
    const h = new Headers({ ...cors, "Content-Type": "text/plain; charset=utf-8" });
    const rid = upstream.headers.get("X-Lovable-AIG-Run-ID"); if (rid) h.set("X-Lovable-AIG-Run-ID", rid);
    return new Response(out, { headers: h });
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: cors });
    return json({ error: (e as Error).message }, 500);
  }
});

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
