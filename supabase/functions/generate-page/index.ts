import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const Body = z.object({
  title: z.string().trim().min(1).max(200),
  brief: z.string().max(6000).default(''),
  passages: z.array(z.object({ n: z.number(), source: z.string(), loc: z.string(), text: z.string() })).max(20).default([]),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') ?? '';
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return json({ error: 'Please sign in to create pages.' }, 401);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Please add a page title.' }, 400);
    const { title, brief, passages } = parsed.data;
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) return json({ error: 'AI is not configured.' }, 500);

    const ctx = passages.map(p => `[${p.n}] (${p.source} — ${p.loc})\n${p.text.slice(0, 2200)}`).join('\n\n');
    const instructions = `You write new reference pages for April's private astrological companion site (born September 6, 1990, 3:38 PM EDT, Geneva, New York; Sun Virgo 8th house, Moon Aries 3rd house, Ascendant 29° Sagittarius).
Write a complete, well-organised page in Markdown: start with a short introduction, then clear ## sections, and finish with "## Key takeaways".
Analyse, calculate and reason step by step where the request asks for it, showing the working briefly. Answer every question in the brief.
Ground claims in the numbered source passages and cite them inline like [2]. If something is not in the passages, say it is general astrological knowledge, and never invent chart placements, dates or facts. Be warm, accurate and constructive. Do not repeat the page title as a heading.`;

    const r = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'fetch' },
      body: JSON.stringify({
        model: 'openai/gpt-6-astra', instructions, store: false, reasoning: { effort: 'medium' },
        input: [{ role: 'user', content: `Page title: ${title}\n\nWhat to research, analyse and answer:\n${brief || '(no extra brief — cover the topic thoroughly)'}\n\nSource passages:\n\n${ctx || '(none found)'}` }],
      }),
    });
    if (!r.ok) {
      const msg = r.status === 429 ? 'Too many requests — please wait a moment and try again.' : r.status === 402 ? 'AI credits have run out. Add credits in Settings → Plans & credits.' : 'The page could not be written right now.';
      return json({ error: msg }, r.status);
    }
    const data = await r.json();
    const text = data.output_text ?? (data.output ?? []).flatMap((o: { content?: { type: string; text?: string }[] }) => o.content ?? []).filter((c: { type: string }) => c.type === 'output_text').map((c: { text?: string }) => c.text ?? '').join('');
    if (!text) return json({ error: 'The page came back empty. Please try again.' }, 502);
    return json({ content: text });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Unexpected error' }, 500);
  }
});
