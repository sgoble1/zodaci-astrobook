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


// ---- Deterministic scan: find statements about Shane's own placements that contradict the verified chart. ----
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const FACT_SIGN: Record<string, string> = { Sun: 'Aries', Moon: 'Taurus', Mercury: 'Pisces', Venus: 'Aries', Mars: 'Cancer', Jupiter: 'Libra', Saturn: 'Aquarius', Uranus: 'Capricorn', Neptune: 'Capricorn', Pluto: 'Scorpio', 'North Node': 'Sagittarius', 'South Node': 'Gemini', Chiron: 'Leo', Ascendant: 'Leo', Rising: 'Leo', Midheaven: 'Taurus' };
const FACT_HOUSE: Record<string, number> = { Sun: 9, Moon: 10, Mercury: 8, Venus: 9, Mars: 12, Jupiter: 3, Saturn: 7, Uranus: 6, Neptune: 6, Pluto: 4, 'North Node': 5, 'South Node': 11, Chiron: 1 };
const BODY = Object.keys(FACT_SIGN).join('|');
const SIGN = SIGNS.join('|');
const RX = [
  { re: new RegExp(`\\b(${BODY})\\b(?:\\s+(?:is|sits|was|placed|located))?\\s+in\\s+(${SIGN})\\b`, 'g'), body: 1, sign: 2 },
  { re: new RegExp(`\\b(${SIGN})\\s+(${BODY})\\b`, 'g'), body: 2, sign: 1 },
];
const HOUSE_RX = new RegExp(`\\b(${BODY})\\b[^.\\n]{0,40}?\\b(\\d{1,2})(?:st|nd|rd|th)\\s+house`, 'g');
// Statements about other people, transits or progressions are left alone.
const OTHER = /\b(transit|transiting|progress|April|Zac|Brandon|partner's|his brother|her\b)/i;

export function scanChapter(text: string) {
  const paras = text.split(/\n{2,}/);
  const flagged = new Set<number>();
  const samples: string[] = [];
  paras.forEach((para, i) => {
    for (const { re, body, sign } of RX) {
      for (const m of para.matchAll(re)) {
        const b = m[body] === 'Rising' ? 'Ascendant' : m[body];
        if (FACT_SIGN[b] && FACT_SIGN[b] !== m[sign]) { if (!OTHER.test(para)) { flagged.add(i); if (samples.length < 4) samples.push(m[0]); } }
      }
    }
    for (const m of para.matchAll(HOUSE_RX)) {
      const h = FACT_HOUSE[m[1]]; if (h && Number(m[2]) !== h && !OTHER.test(para)) { flagged.add(i); if (samples.length < 4) samples.push(m[0]); }
    }
  });
  return { paras, flagged: [...flagged].sort((a, b) => a - b), samples };
}

const PATCH_INSTRUCTIONS = `You are a careful astrology editor fixing errors in excerpts from one chapter of Shane's private Masterbook.
The verified chart facts below are authoritative:
${SHANE_FACTS}

Correct only statements about Shane's own natal placements that contradict these facts (wrong sign, degree, house, retrograde status, rising sign, chart ruler, impossible aspects), and the sentences that interpret those wrong placements.
Rewrite each wrong sentence so it fits the correct placement, in the same voice, length and depth. Leave statements about other people, transits and progressions untouched. Never invent biography, family details, events or people.
Output each correction exactly as:
@@FIND
<an exact, unique passage copied character for character from the excerpt — one or more whole sentences>
@@REPLACE
<the corrected passage>
@@END
Output nothing else. If nothing contradicts the facts, output only: NONE`;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const auth = req.headers.get('Authorization') ?? '';
  const body = await req.json().catch(() => ({}));
  const url = Deno.env.get('SUPABASE_URL')!;
  const user = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const [owns, dev, zacOwns] = await Promise.all([user.rpc('owns_official_edition', { _edition: 'shane' }), user.rpc('is_developer'), user.rpc('owns_official_edition', { _edition: 'zac' })]);
  if (body.action === 'zac-chapter-save' && zacOwns.data === true) {
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const bucket = admin.storage.from('private-content');
    const { data: file, error } = await bucket.download('zac/edition.json');
    if (error || !file) return json({ error: 'Edition unavailable.' }, 500);
    const zac = JSON.parse(await file.text()) as Record<string, string>;
    const id = String(body.id ?? ''); const text = String(body.text ?? '').trim();
    if (!/^zac-\d+\.md$/.test(id) || !zac[id] || text.length < zac[id].length * 0.7) return json({ error: 'Unknown chapter or incomplete correction.' }, 422);
    const backup = await bucket.download('zac/edition.original.json');
    if (!backup.data) {
      const saved = await bucket.upload('zac/edition.original.json', new Blob([JSON.stringify(zac)], { type: 'application/json' }), { upsert: false });
      if (saved.error) return json({ error: 'Backup failed; nothing saved.' }, 500);
    }
    zac[id] = text;
    if (body.indexTitle && zac['index.json']) {
      const index = JSON.parse(zac['index.json']);
      for (const row of index) if (row.id === id.replace(/\.md$/, '')) { row.title = String(body.indexTitle); row.excerpt = text.slice(0, 260); row.words = text.split(/\s+/).length; }
      zac['index.json'] = JSON.stringify(index);
    }
    const saved = await bucket.upload('zac/edition.json', new Blob([JSON.stringify(zac)], { type: 'application/json' }), { upsert: true });
    return saved.error ? json({ error: 'Save failed.' }, 500) : json({ id, saved: true });
  }
  if (owns.data !== true && dev.data !== true) return json({ error: 'Only Shane can correct this edition.' }, 403);

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const bucket = admin.storage.from('private-content');
  const load = async (path: string) => { const { data, error } = await bucket.download(path); if (error || !data) return null; return JSON.parse(await data.text()) as Record<string, string>; };
  const edition = await load('shane/edition.json');
  if (!edition) return json({ error: 'Edition unavailable.' }, 500);

  // Zac's workbook text: the developer can read it and save an edited version (backed up once first).
  if (body.action === 'zac-search' || body.action === 'zac-chapter-save') {
    if (dev.data !== true) return json({ error: 'Developer only.' }, 403);
    const zac = await load('zac/edition.json');
    if (!zac) return json({ error: 'Zac edition unavailable.' }, 500);
    if (body.action === 'zac-search') {
      const q = String(body.q ?? '').toLowerCase();
      return json({ hits: Object.entries(zac).filter(([, v]) => typeof v === 'string' && v.toLowerCase().includes(q)).map(([k, v]) => ({ id: k, length: v.length, text: body.full ? v : v.slice(Math.max(0, v.toLowerCase().indexOf(q) - 300), v.toLowerCase().indexOf(q) + 600) })) });
    }
    const cid = String(body.id ?? ''); const text = String(body.text ?? '').trim();
    if (!zac[cid] || text.length < 200) return json({ error: 'Unknown chapter or empty text.' }, 422);
    if (!(await load('zac/edition.original.json'))) await bucket.upload('zac/edition.original.json', new Blob([JSON.stringify(zac)], { type: 'application/json' }));
    zac[cid] = text;
    const saved = await bucket.upload('zac/edition.json', new Blob([JSON.stringify(zac)], { type: 'application/json' }), { upsert: true });
    return saved.error ? json({ error: saved.error.message }, 500) : json({ saved: true });
  }
  if (body.action === 'zac-workbook-get' || body.action === 'zac-workbook-save') {
    if (dev.data !== true) return json({ error: 'Developer only.' }, 403);
    const wb = await bucket.download('zac/workbook.json');
    if (wb.error || !wb.data) return json({ error: 'Workbook unavailable.' }, 500);
    const raw = await wb.data.text();
    if (body.action === 'zac-workbook-get') return json({ content: raw });
    const next = String(body.content ?? '');
    try { JSON.parse(next); } catch { return json({ error: 'Not valid JSON.' }, 422); }
    const hasBackup = await bucket.download('zac/workbook.original.json');
    if (hasBackup.error) await bucket.upload('zac/workbook.original.json', new Blob([raw], { type: 'application/json' }));
    const saved = await bucket.upload('zac/workbook.json', new Blob([next], { type: 'application/json' }), { upsert: true });
    return saved.error ? json({ error: saved.error.message }, 500) : json({ saved: true });
  }

  // Scan every chapter without AI; only flagged chapters are sent for correction.
  if (body.action === 'scan') {
    const rows = Object.entries(edition).filter(([k]) => !k.endsWith('.json')).map(([id, text]) => { const r = scanChapter(text); return { id, flagged: r.flagged.length, samples: r.samples }; });
    return json({ chapters: rows.length, flagged: rows.filter(r => r.flagged > 0) });
  }
  if (body.action === 'list') return json({ ids: Object.keys(edition).filter(k => !k.endsWith('.json')) });
  const id = String(body.id ?? '');
  const original = edition[id];
  if (!original || id.endsWith('.json')) return json({ error: 'Unknown chapter.' }, 404);


  // Patch mode: send only the flagged paragraphs (and the paragraph after each), apply exact find/replace edits.
  if (body.action === 'patch') {
    const { paras, flagged } = scanChapter(original);
    if (!flagged.length) return json({ id, applied: 0, skipped: 'no contradictions found' });
    const keep = [...new Set(flagged.flatMap(i => [i, i + 1]).filter(i => i < paras.length))].sort((a, b) => a - b);
    const excerpt = [paras[0].slice(0, 200), ...keep.filter(i => i > 0).map(i => paras[i])].join('\n\n');
    const key = Deno.env.get('LOVABLE_API_KEY')!;
    const prov = createOpenAI({ baseURL: GATEWAY_URL, apiKey: key, headers: { 'Lovable-API-Key': key, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' } });
    let out = '';
    try {
      const r = streamText({
        model: prov.responses(CHAT_MODEL), instructions: PATCH_INSTRUCTIONS, maxRetries: 1, maxOutputTokens: 6000,
        messages: [{ role: 'user', content: `Chapter id: ${id}\n\n${excerpt}` }],
        providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: 'low', reasoningSummary: 'auto', include: ['reasoning.encrypted_content'] } },
      });
      for await (const part of r.textStream) out += part;
    } catch (e) { const g = gatewayError(e); return json({ error: g.message }, g.status); }
    let text = original; let applied = 0; const missed: string[] = []; const edits: { find: string; replace: string }[] = [];
    for (const m of out.matchAll(/@@FIND\n([\s\S]*?)\n@@REPLACE\n([\s\S]*?)\n@@END/g)) {
      const find = m[1].trim(), repl = m[2].trim();
      if (!find || find === repl) continue;
      if (text.includes(find)) { text = text.split(find).join(repl); applied++; edits.push({ find, replace: repl }); } else missed.push(find.slice(0, 80));
    }
    if (!applied) return json({ id, applied: 0, missed, none: /^\s*NONE\s*$/.test(out) });
    if (body.dryRun) return json({ id, applied, missed, edits });
    const res = await persist(id, text, original.length);
    const saved = await res.json();
    return json({ ...saved, applied, missed, edits, after: scanChapter(text).flagged.length });
  }

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
