import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { createResponsesCall, gatewayError } from "../_shared/responses.ts";
import { SAFETY, SITE_PAGES } from "../_shared/april-profile.ts";
import { counselorContext } from "../_shared/member-profile.ts";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.object({
  tool: z.enum(["prompt", "checkin", "reframe"]),
  module: z.string().max(120).default(""),
  question: z.string().max(2000).default(""),
  answer: z.string().trim().min(1).max(8000),
  chartNote: z.string().max(1500).default(""),
  passages: z.array(z.object({ n: z.number(), source: z.string(), loc: z.string(), text: z.string() })).max(10).default([]),
});

const SHAPE: Record<string, string> = {
  prompt: `Use exactly these sections:
## What I hear
(2–3 sentences reflecting her answer back with insight, naming the feeling and the need underneath.)
## What your chart adds
(Connect her answer to 1–3 specific placements or aspects; cite passages like [n] when used.)
## A pattern worth noticing
(One psychological lens — CBT, ACT, IFS, attachment, shadow work etc. — and what it suggests.)
## Go deeper
(Two follow-up questions that make her think harder.)
## Try this
(One small, concrete experiment for the next few days.)
## Explore next
(2–3 links to related site pages with one line each on why.)`,
  checkin: `Use exactly these sections:
## Today's reading
(Reflect her mood, energy and body notes in 2–3 sentences, naming which part of her chart is most active in how she describes it.)
## Care for today
(Three short, practical suggestions matched to her chart and state — one for the body, one for the mind, one for connection.)
## One question to carry
(A single question for the day.)
## Explore next
(1–2 links to related site pages.)`,
  reframe: `Use exactly these sections:
## What happened inside
(Briefly map the situation → thought → feeling → urge, and which placements tend to amplify it.)
## Thinking traps
(Name any cognitive distortions present, kindly.)
## A balanced thought
(Offer 1–2 balanced alternative thoughts in her own voice, building on hers.)
## Next right action
(One concrete action, plus an opposite-action or grounding skill if emotions are high.)
## Explore next
(1–2 links to related site pages.)`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return json({ error: "Please sign in to get feedback." }, 401);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Please write an answer first." }, 400);
    const { tool, module, question, answer, chartNote, passages } = parsed.data;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const c0 = await counselorContext(sb, admin, u.user.id, u.user.email ?? "");
    if (!c0.ok) return json({ error: c0.error }, 400);
    const instructions = `You are the guide inside this person's personal workbook: a perceptive, warm, quietly all-seeing therapist-astrologer who knows their chart completely. You combine evidence-based psychology (CBT, ACT, DBT, IFS, attachment, positive psychology, narrative and somatic work, Jungian shadow work) with their chart and source documents. Speak to them as "you". Lead with validation, then be specific and practical. Be honest, kind and never generic.

${c0.context}

Write Markdown. ${SHAPE[tool]}
Keep it under about 380 words. Never invent placements, dates or facts; cite passages like [n] only when you use them.

${SITE_PAGES}

${SAFETY}`;
    const ctx = passages.map(p => `[${p.n}] (${p.source} — ${p.loc})\n${p.text.slice(0, 1500)}`).join("\n\n");
    const content = `Workbook area: ${module || tool}\n${question ? `Question: ${question}\n` : ""}${chartNote ? `Chart note shown with this question: ${chartNote}\n` : ""}\nHer answer:\n${answer}\n\nSource passages:\n${ctx || "(none)"}`;

    const call = createResponsesCall(req, { apiKey, instructions, effort: "low" }, [{ role: "user", content }]);
    const text = await call.result.text;
    if (!text.trim()) return json({ error: "The feedback came back empty. Please try again." }, 502);
    const runId = call.runIdFetch.getRunId();
    return new Response(JSON.stringify({ feedback: text }), { headers: { ...corsHeaders, "Content-Type": "application/json", ...(runId ? { "X-Lovable-AIG-Run-ID": runId } : {}) } });
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: corsHeaders });
    const { status, message } = gatewayError(e);
    return json({ error: message }, status);
  }
});
