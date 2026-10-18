import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { createResponsesCall, gatewayError } from '../_shared/responses.ts';
import { APRIL_CHART } from '../_shared/april-profile.ts';

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const Body = z.object({
  title: z.string().trim().min(1).max(200),
  brief: z.string().max(6000).default(''),
  passages: z.array(z.object({ n: z.number(), source: z.string(), loc: z.string(), text: z.string() })).max(20).default([]),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return json({ error: 'Please sign in to create pages.' }, 401);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Please add a page title.' }, 400);
    const { title, brief, passages } = parsed.data;
    if (!passages.length) return json({ error: 'No matching passages were found in the Masterbook or sources. Try different words in the title or description.' }, 400);
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) return json({ error: 'AI is not configured.' }, 500);

    const ctx = passages.map(p => `[${p.n}] (${p.source} — ${p.loc})\n${p.text.slice(0, 2200)}`).join('\n\n');
    const instructions = `You write new reference pages for April's private astrological companion site.
${APRIL_CHART}

Write a complete, well-organised page in Markdown: a short introduction, then clear ## sections, and finish with "## Key takeaways".
Base the page on the numbered passages from April's own Masterbook and source documents. Cite every factual or interpretive claim inline with its passage number, like [2] or [1][4], and quote short exact phrases in quotation marks where they help. Use as many different passages as are relevant.
Analyse, calculate and reason step by step where the brief asks for it, showing the working briefly. Answer every question in the brief.
Anything not supported by a passage must be marked "(general astrological knowledge)". Never invent chart placements, dates or facts. Be warm, accurate and constructive. Do not repeat the page title as a heading and do not add a references list — the site shows the passages below the page.`;

    const call = createResponsesCall(req, { apiKey, instructions, effort: 'low' }, [
      { role: 'user', content: `Page title: ${title}\n\nWhat to research, analyse and answer:\n${brief || '(no extra brief — cover the topic thoroughly)'}\n\nSource passages:\n\n${ctx}` },
    ]);
    const text = await call.result.text;
    if (!text.trim()) return json({ error: 'The page came back empty. Please try again.' }, 502);
    return json({ content: text });
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: corsHeaders });
    const { status, message } = gatewayError(e);
    return json({ error: message }, status);
  }
});
