import { createClient } from "npm:@supabase/supabase-js@2";
import { convertToModelMessages, type UIMessage } from "npm:ai@7.0.127";
import { z } from "npm:zod@3";
import { createResponsesCall, gatewayError } from "../_shared/responses.ts";
import { SAFETY, SITE_PAGES } from "../_shared/april-profile.ts";
import { counselorContext } from "../_shared/member-profile.ts";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id", "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const Body = z.object({ sessionId: z.string().uuid(), messages: z.array(z.any()).min(1).max(200), passages: z.array(z.object({ n: z.number(), source: z.string(), loc: z.string(), text: z.string() })).max(10).default([]) });
const buildInstructions = (CHART: string) => `You are the person's Social Counselor: a calm, perceptive outside observer who studies human interaction almost like a kind alien learning human customs, while always sounding warm and respectful rather than robotic or superior.

${CHART}

Your job:
- First separate observable facts from guesses about motives. Explain the likely social dynamics in ordinary language.
- Use the person's chart only as a reflective hypothesis, never as scientific proof or destiny. Say "this may fit" rather than making certainty claims.
- Tune advice to them: matched to their actual Moon, Mercury and rising signs.
- Give useful human translation: what the other person may have heard, what them may be protecting, and where expectations may differ.
- Offer 2–3 concrete choices. When useful, provide exact words them can say, a boundary, and a small next step.
- Do not teach manipulation, diagnose another person, or claim to read minds. Ask for missing context when it materially changes the advice.
- Draw from evidence-informed psychology, therapy skills, life management, executive planning and social coaching as appropriate. Name the discipline or technique briefly and separate evidence-based guidance from astrological reflection.
- Keep replies under about 350 words unless depth is requested. End with one clear question or action.
- Cite numbered source passages as [n] when supplied. Never invent a source.

${SITE_PAGES}

${SAFETY}`;

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY"); const url = Deno.env.get("SUPABASE_URL"); const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!apiKey || !url || !anonKey) return json({ error: "The counselor is not configured." }, 500);
    const sb = createClient(url, anonKey, { global: { headers: { Authorization: request.headers.get("Authorization") ?? "" } } });
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) return json({ error: "Please sign in to use the Social Counselor." }, 401);
        const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const ctx0 = await counselorContext(sb, admin, auth.user.id);
    if (!ctx0.ok) return json({ error: ctx0.error }, 400);
    const INSTRUCTIONS = buildInstructions(ctx0.context);
    await admin.from("ai_usage").insert({ user_id: auth.user.id, feature: "social-counselor" });
    const parsed = Body.safeParse(await request.json()); if (!parsed.success) return json({ error: "Invalid request." }, 400);
    const { sessionId, passages } = parsed.data; const messages = parsed.data.messages as UIMessage[];
    const { data: session } = await sb.from("social_sessions").select("id,title").eq("id", sessionId).maybeSingle();
    if (!session) return json({ error: "That conversation was not found." }, 404);
    const last = messages[messages.length - 1];
    if (last?.role === "user") {
      const { error } = await sb.from("social_messages").insert({ session_id: sessionId, owner_id: auth.user.id, ui_id: last.id ?? "", role: "user", parts: last.parts ?? [] });
      if (error) return json({ error: "Your message could not be saved." }, 500);
      const firstText = (last.parts ?? []).find((part: { type: string }) => part.type === "text") as { text?: string } | undefined;
      const patch: Record<string, string> = { updated_at: new Date().toISOString() }; if (session.title === "New conversation" && firstText?.text) patch.title = firstText.text.slice(0, 70);
      await sb.from("social_sessions").update(patch).eq("id", sessionId);
    }
    const model = await convertToModelMessages(messages);
    if (passages.length) model.push({ role: "user", content: `(Relevant passages from the person's sources; cite [n] when used.)\n\n${passages.map(passage => `[${passage.n}] (${passage.source} — ${passage.loc})\n${passage.text.slice(0, 1500)}`).join("\n\n")}` });
    const call = createResponsesCall(request, { apiKey, instructions: INSTRUCTIONS, effort: "medium" }, model);
    const response = call.result.toUIMessageStreamResponse({ originalMessages: messages, sendReasoning: true, headers: cors, onFinish: async ({ responseMessage, isAborted }) => {
      if (!responseMessage?.parts?.length) return; const parts = responseMessage.parts.filter((part: { type: string }) => part.type === "text"); if (!parts.length) return;
      const { error } = await sb.from("social_messages").insert({ session_id: sessionId, owner_id: auth.user.id, ui_id: responseMessage.id, role: "assistant", parts: isAborted ? [...parts, { type: "text", text: "\n\n_(stopped)_" }] : parts });
      if (error) console.error("social-counselor persist failed", error.message);
    }, onError: error => gatewayError(error).message });
    return await call.wrap(response, cors);
  } catch (error) { if (request.signal.aborted) return new Response(null, { status: 499, headers: cors }); const result = gatewayError(error); return json({ error: result.message }, result.status); }
});