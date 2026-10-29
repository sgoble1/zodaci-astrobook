import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { createResponsesCall, gatewayError } from '../_shared/responses.ts';
import { counselorContext } from '../_shared/member-profile.ts';
import { creditShortfall } from '../_shared/credits.ts';

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const Body = z.object({
  title: z.string().trim().min(1).max(200),
  brief: z.string().max(6000).default(''),
  // Passages come only from sources the signed-in reader is allowed to open (the protected loader enforces it).
  passages: z.array(z.object({ n: z.number(), source: z.string(), loc: z.string(), text: z.string() })).max(20).default([]),
});
const FEATURE = 'custom-page';

/** Writes a new reference page from the signed-in person's own chart, plus any private sources they can read. */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return json({ error: 'Please sign in to create pages.' }, 401);
    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: 'Please add a page title.' }, 400);
    const { title, brief, passages } = parsed.data;
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) return json({ error: 'AI is not configured.' }, 500);

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const who = await counselorContext(sb, admin, u.user.id, u.user.email ?? '');
    if (!who.ok) return json({ error: 'Save your birth details first so the page can be written from your chart.' }, 400);
    const short = await creditShortfall(admin, u.user.id, FEATURE);
    if (short) return json({ error: short }, 402);
    const { data: notes } = await admin.from('personal_context').select('title,body').eq('owner_id', u.user.id).eq('use_in_generation', true).order('updated_at', { ascending: false }).limit(8);
    const personal = (notes ?? []).map(n => `- ${n.title}: ${String(n.body).slice(0, 600)}`).join('\n');

    const ctx = passages.map(p => `[${p.n}] (${p.source} — ${p.loc})\n${p.text.slice(0, 2200)}`).join('\n\n');
    const instructions = `You write a new reference page for ${who.name}'s private astrology companion, addressed to them as "you".
${who.context}
${personal ? `\nWhat ${who.name} chose to share about their life (context only — it never changes chart facts):\n${personal}\n` : ''}
Write a complete, well-organised page in Markdown: a short introduction, then clear ## sections, and finish with "## Key takeaways".
${passages.length ? 'Ground claims in the numbered source passages where they apply and cite them inline, like [2] or [1][4]; quote short exact phrases where they help. Do not add a references list — the site shows the passages below the page.' : 'There are no source passages for this page: work only from the calculated chart above.'}
Name the placement behind every chart claim. Analyse, calculate and reason step by step where the brief asks for it, showing the working briefly, and answer every question in the brief.
Mark anything that is not from the chart or a passage as "(general astrological knowledge)". Never invent placements, dates, relatives, ancestry or life events. Be warm, accurate and constructive. Do not repeat the page title as a heading.`;

    const call = createResponsesCall(req, { apiKey, instructions, effort: 'low' }, [
      { role: 'user', content: `Page title: ${title}\n\nWhat to research, analyse and answer:\n${brief || '(no extra brief — cover the topic thoroughly)'}${ctx ? `\n\nSource passages:\n\n${ctx}` : ''}` },
    ]);
    const text = (await call.result.text).trim();
    if (!text) return json({ error: 'The page came back empty. Please try again.' }, 502);
    await admin.from('ai_usage').insert({ user_id: u.user.id, feature: FEATURE });
    return json({ content: text });
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: corsHeaders });
    console.error('generate-page', e);
    const { status, message } = gatewayError(e);
    return json({ error: message }, status);
  }
});
