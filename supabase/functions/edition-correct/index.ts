import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { createOpenAI } from 'npm:@ai-sdk/openai@4.0.83';
import { streamText } from 'npm:ai@7.0.127';
import { CHAT_MODEL, GATEWAY_URL, gatewayError } from '../_shared/responses.ts';

// Corrects chart placements in Shane's private Masterbook against his computed chart.
// Only the edition owner (or the developer) may run it. The original edition is backed up once before the first save.

const SHANE_FACTS = `Shane — born March 25, 1993, 1:55 PM, Williamsville, NY. Placidus houses. Verified computed placements:
Ascendant Leo 12°25′; Midheaven Taurus 0°22′.
Sun Aries 5°08′, 9th house. Moon Taurus 2°29′, 10th house. Mercury Pisces 10°47′ direct, 8th house.
Venus Aries 15°53′ retrograde, 9th house. Mars Cancer 16°09′, 12th house. Jupiter Libra 10°24′ retrograde, 3rd house.
Saturn Aquarius 25°59′, 7th house. Uranus Capricorn 21°46′, 6th house. Neptune Capricorn 20°56′, 6th house.
Pluto Scorpio 25°19′ retrograde, 4th house. North Node Sagittarius 15°59′, 5th house (South Node Gemini 15°59′, 11th house). Chiron Leo 17°37′, 1st house.
Chart ruler: the Sun (Leo rising).`;

const INSTRUCTIONS = `You are a careful astrology editor correcting one chapter of a private Masterbook.
The verified chart facts below are authoritative:
${SHANE_FACTS}

Rules:
- Fix every statement that contradicts the facts (wrong sign, degree, house, retrograde status, rising sign, chart ruler, aspects that cannot exist with these positions).
- When a passage interprets a wrong placement, rewrite that interpretation so it fits the correct placement, in the same voice, length and depth.
- Keep everything already correct exactly as written: headings, structure, formatting, tone, length.
- Never invent biography, family details, events, or people. Do not add notes about the editing.
- Output only the full corrected chapter text in the same format as the input.`;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const auth = req.headers.get('Authorization') ?? '';
  const url = Deno.env.get('SUPABASE_URL')!;
  const user = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const [owns, dev] = await Promise.all([user.rpc('owns_official_edition', { _edition: 'shane' }), user.rpc('is_developer')]);
  if (owns.data !== true && dev.data !== true) return json({ error: 'Only Shane can correct this edition.' }, 403);

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const bucket = admin.storage.from('private-content');
  const load = async (path: string) => { const { data, error } = await bucket.download(path); if (error || !data) return null; return JSON.parse(await data.text()) as Record<string, string>; };
  const edition = await load('shane/edition.json');
  if (!edition) return json({ error: 'Edition unavailable.' }, 500);

  const body = await req.json().catch(() => ({}));
  if (body.action === 'list') return json({ ids: Object.keys(edition).filter(k => !k.endsWith('.json')) });
  const id = String(body.id ?? '');
  const original = edition[id];
  if (!original || id.endsWith('.json')) return json({ error: 'Unknown chapter.' }, 404);

  // Save a reviewed correction produced by an earlier dry run (owner only; same length guard).
  if (body.action === 'save') {
    const text = String(body.text ?? '').trim();
    if (text.length < original.length * 0.7) return json({ error: 'Correction looked incomplete; original kept.' }, 422);
    return await persist(id, text, original.length);
  }
  const apiKey = Deno.env.get('LOVABLE_API_KEY')!;
  const provider = createOpenAI({ baseURL: GATEWAY_URL, apiKey, headers: { 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' } });
  let text = '';
  try {
    const result = streamText({
      model: provider.responses(CHAT_MODEL), instructions: INSTRUCTIONS, maxRetries: 1, maxOutputTokens: 32000,
      messages: [{ role: 'user', content: `Chapter id: ${id}\n\n${original}` }],
      providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: 'low', reasoningSummary: 'auto', include: ['reasoning.encrypted_content'] } },
    });
    for await (const part of result.textStream) text += part;
  } catch (e) { const g = gatewayError(e); return json({ error: g.message }, g.status); }
  text = text.trim();
  // Refuse truncated or empty rewrites so a failed call never replaces real content.
  if (text.length < original.length * 0.7) return json({ error: 'Rewrite looked incomplete; original kept.', id, before: original.length, after: text.length }, 422);

  if (body.dryRun) return json({ id, before: original.length, after: text.length, text });
  return await persist(id, text, original.length);

  async function persist(id: string, text: string, before: number) {
    if (!(await load('shane/edition.original.json'))) {
      const backup = await bucket.upload('shane/edition.original.json', new Blob([JSON.stringify(edition)], { type: 'application/json' }), { upsert: false });
      if (backup.error && !/exists/i.test(backup.error.message)) return json({ error: 'Backup failed; nothing saved.' }, 500);
    }
    const fresh = (await load('shane/edition.json')) ?? edition; // re-read so earlier saves are kept
    fresh[id] = text;
    const saved = await bucket.upload('shane/edition.json', new Blob([JSON.stringify(fresh)], { type: 'application/json' }), { upsert: true });
    if (saved.error) return json({ error: saved.error.message }, 500);
    return json({ id, before, after: text.length, saved: true });
  }
});
