// Temporary developer-only tool: corrects placement claims in Shane's stored edition against his calculated chart.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

const TRUTH = `Shane — born March 25, 1993, 1:55 PM EST, Williamsville, New York. Placidus houses. Calculated chart (authoritative):
Ascendant Leo 12°25'; Midheaven Taurus 0°22'.
Sun Aries 5°08' 9th house; Moon Taurus 2°29' 10th house; Mercury Pisces 10°47' 8th house (direct); Venus Aries 15°53' retrograde 9th house; Mars Cancer 16°09' 12th house; Jupiter Libra 10°24' retrograde 3rd house; Saturn Aquarius 25°59' 7th house; Uranus Capricorn 21°46' 6th house; Neptune Capricorn 20°56' 6th house; Pluto Scorpio 25°19' retrograde 4th house; North Node Sagittarius 15°59' 5th house; South Node Gemini 15°59' 11th house; Chiron Leo 17°37' 1st house; Lilith Pisces 17°53' 8th house; Part of Fortune Virgo 9°46' 2nd house; Vertex Capricorn 0°28' 5th house.
Cusps: 1 Leo 12°25', 2 Virgo 2°54', 3 Virgo 28°19', 4 Scorpio 0°22', 5 Sagittarius 7°15', 6 Capricorn 12°34', 7 Aquarius 12°25', 8 Pisces 2°54', 9 Pisces 28°19', 10 Taurus 0°22', 11 Gemini 7°15', 12 Cancer 12°34'.`;

const RULES = `You are correcting one chapter of a personal astrology book. The chapter was written from wrong positions (it claimed e.g. Moon Capricorn 17°, Mercury Aries 14° Rx, Venus Pisces 21°, Mars Cancer 10°39', Ascendant Leo 16°30'). Rewrite ONLY what depends on wrong placements so that every sign, degree, house, retrograde status and aspect matches the calculated chart below; recompute aspects between corrected points yourself (orbs ≤8° for majors) and drop aspects that no longer exist. Rewrite the interpretation of corrected placements so it honestly reflects the new sign/house (e.g. Moon in Taurus in the 10th, Venus retrograde in Aries in the 9th, Mercury in Pisces in the 8th). Keep everything already correct unchanged, keep the same headings structure, length, voice and markdown. Never invent biography, family facts or events. Fixed-star contacts: keep only if still within 1°. Output the full corrected chapter only — no preamble.

${TRUTH}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const auth = req.headers.get('Authorization') ?? '';
    const user = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: dev } = await user.rpc('is_developer');
    if (dev !== true) return json({ error: 'Developer only.' }, 403);
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const load = async () => {
      const { data, error } = await admin.storage.from('private-content').download('shane/edition.json');
      if (error || !data) throw new Error('edition unavailable');
      return JSON.parse(await data.text()) as Record<string, string>;
    };
    const save = async (ed: Record<string, string>) => {
      const { error } = await admin.storage.from('private-content').upload('shane/edition.json', new Blob([JSON.stringify(ed)], { type: 'application/json' }), { upsert: true });
      if (error) throw error;
    };
    const body = await req.json();
    const ed = await load();
    if (body.action === 'list') return json({ keys: Object.keys(ed).map(k => [k, ed[k].length]) });
    if (body.action === 'get') return json({ content: ed[body.key] });
    if (body.action === 'backup') {
      await admin.storage.from('private-content').upload('shane/edition.backup-2026-10-29.json', new Blob([JSON.stringify(ed)], { type: 'application/json' }), { upsert: true });
      return json({ ok: true });
    }
    if (body.action === 'set') { ed[body.key] = body.content; await save(ed); return json({ ok: true }); }
    if (body.action === 'fix') {
      const original = ed[body.key];
      if (typeof original !== 'string') return json({ error: 'missing' }, 404);
      const r = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`, 'Content-Type': 'application/json', 'X-Lovable-AIG-SDK': 'fetch' },
        body: JSON.stringify({ model: 'openai/gpt-6-astra', stream: true, store: false, reasoning: { effort: 'low' }, instructions: RULES, input: original }),
      });
      if (!r.ok || !r.body) return json({ error: `ai ${r.status}`, detail: await r.text() }, 502);
      let out = '', buf = '';
      const reader = r.body.pipeThrough(new TextDecoderStream()).getReader();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        const lines = buf.split('\n'); buf = lines.pop() ?? '';
        for (const l of lines) {
          if (!l.startsWith('data:')) continue;
          try { const ev = JSON.parse(l.slice(5)); if (ev.type === 'response.output_text.delta') out += ev.delta; } catch { /* keep-alive */ }
        }
      }
      out = out.trim();
      if (out.length < original.length * 0.6) return json({ error: 'output too short', got: out.length, had: original.length }, 422);
      const fresh = await load();
      fresh[body.key] = out;
      await save(fresh);
      return json({ ok: true, had: original.length, now: out.length });
    }
    return json({ error: 'bad action' }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
