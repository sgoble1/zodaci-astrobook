import { createClient } from "npm:@supabase/supabase-js@2";
import { convertToModelMessages, type UIMessage } from "npm:ai@7.0.127";
import { z } from "npm:zod@3";
import { createResponsesCall, gatewayError } from "../_shared/responses.ts";
import { SAFETY, SITE_PAGES } from "../_shared/april-profile.ts";
import { counselorContext } from "../_shared/member-profile.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

const Body = z.object({
  sessionId: z.string().uuid(),
  messages: z.array(z.any()).min(1).max(200),
  passages: z.array(z.object({ n: z.number(), source: z.string(), loc: z.string(), text: z.string() })).max(10).default([]),
});

const buildInstructions = (CHART: string) => `You are "The Oracle Within", a therapeutic companion who knows the person's chart completely and speaks to them with serene, ancient, almost all-seeing calm — the voice of someone who has watched their whole sky and is not surprised by anything they bring. You are perceptive, warm, unhurried and quietly certain, never cold, grandiose or mystical for its own sake.

${CHART}

How you work:
- Blend evidence-based therapy with their chart: CBT (thoughts → feelings → actions), ACT (values, defusion, acceptance), DBT skills (TIPP, opposite action, wise mind), Internal Family Systems (parts, e.g. "the critic", "the fighter"), attachment theory, somatic grounding, narrative therapy, motivational interviewing, Jungian shadow work and positive psychology. Name the technique briefly when you use one.
- Read what they say through their placements: name which part of their chart is speaking (e.g. "that's your Moon sign wanting it said now") and why it makes sense.
- Tune your tone to them: lead with direct validation in one or two sentences based on their actual Moon, Sun, Mercury and rising signs. Be honest, never saccharine.
- Briefly mention one or two related, accurate things they may not have considered — a current life-phase theme, a connected placement, a psychology finding, or what people with similar placements commonly report (label community wisdom as anecdotal) — and link to a relevant site page.
- End most replies with one powerful question or one small, concrete experiment for the next 24 hours. Keep replies under about 300 words unless they ask for depth.
- When numbered source passages are given, ground chart claims in them and cite like [2]. Never invent placements, dates or facts; say plainly when something is general knowledge or a hypothesis.

${SITE_PAGES}

${SAFETY}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return json({ error: "Please sign in to talk with the companion." }, 401);
        const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const ctx0 = await counselorContext(sb, admin, u.user.id, u.user.email ?? "");
    if (!ctx0.ok) return json({ error: ctx0.error }, 400);
    const INSTRUCTIONS = buildInstructions(ctx0.context);
    await admin.from("ai_usage").insert({ user_id: u.user.id, feature: "oracle" });

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid request." }, 400);
    const { sessionId, passages } = parsed.data;
    const messages = parsed.data.messages as UIMessage[];

    const { data: session } = await sb.from("therapy_sessions").select("id,title").eq("id", sessionId).maybeSingle();
    if (!session) return json({ error: "That session was not found." }, 404);

    const last = messages[messages.length - 1];
    if (last?.role === "user") {
      const { error } = await sb.from("therapy_messages").insert({ session_id: sessionId, owner_id: u.user.id, ui_id: last.id ?? "", role: "user", parts: last.parts ?? [] });
      if (error) return json({ error: "Your message could not be saved." }, 500);
      const firstText = (last.parts ?? []).find((p: { type: string }) => p.type === "text") as { text?: string } | undefined;
      const patch: Record<string, string> = { updated_at: new Date().toISOString() };
      if (session.title === "New session" && firstText?.text) patch.title = firstText.text.slice(0, 70);
      await sb.from("therapy_sessions").update(patch).eq("id", sessionId);
    }

    const model = await convertToModelMessages(messages);
    if (passages.length) {
      const ctx = passages.map(p => `[${p.n}] (${p.source} — ${p.loc})\n${p.text.slice(0, 1500)}`).join("\n\n");
      model.push({ role: "user", content: `(Context for this turn — numbered passages from the person's own source documents; cite them like [n] when you use them.)\n\n${ctx}` });
    }

    const call = createResponsesCall(req, { apiKey, instructions: INSTRUCTIONS, effort: "medium" }, model);
    const response = call.result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: true,
      headers: cors,
      onFinish: async ({ responseMessage, isAborted }) => {
        if (!responseMessage?.parts?.length) return;
        const parts = responseMessage.parts.filter((p: { type: string }) => p.type === "text");
        if (!parts.length) return;
        const { error } = await sb.from("therapy_messages").insert({ session_id: sessionId, owner_id: u.user.id, ui_id: responseMessage.id, role: "assistant", parts: isAborted ? [...parts, { type: "text", text: "\n\n_(stopped)_" }] : parts });
        if (error) console.error("therapy-chat persist failed", error.message);
      },
      onError: (e) => gatewayError(e).message,
    });
    return await call.wrap(response, cors);
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: cors });
    const { status, message } = gatewayError(e);
    return json({ error: message }, status);
  }
});
