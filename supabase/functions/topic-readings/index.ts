import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { createResponsesCall, gatewayError } from '../_shared/responses.ts';

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

/** Same life themes as the original edition; each is written fresh from the member's own calculated chart. */
const TOPICS: Record<string, { title: string; focus: string }> = {
  'chart-shape': { title: 'Chart Shape & Balance', focus: 'overall chart pattern (how the planets are spread around the wheel), element and modality balance, hemisphere emphasis, the tightest aspects, any stelliums, and the chart ruler' },
  'past-lives': { title: 'Past Lives & Karma', focus: 'South Node and North Node by sign and house, their rulers, Saturn, the 12th house, and aspects to the nodes; present past-life ideas as a belief tradition, not fact' },
  'numerology': { title: 'Numerology', focus: 'Life Path number, Birthday number and the current Personal Year calculated step by step from the birth date (show the arithmetic); name numbers are not available' },
  'recurring-themes': { title: 'Recurring Themes', focus: 'the tightest aspects, repeated signs/elements, planets repeated in angular houses, and how these patterns echo across the chart' },
  'obstacles': { title: 'Obstacles & Challenges', focus: 'Saturn, squares and oppositions, Mars, Pluto and Chiron contacts, retrograde planets, and constructive ways through each' },
  'shadow-work': { title: 'Shadow Work & Healing', focus: 'Pluto, Chiron, Black Moon Lilith if listed, the 8th and 12th houses, Moon aspects, and gentle reflective practices' },
  'purpose': { title: 'Life Purpose & Mission', focus: 'Sun, Midheaven, 10th house, North Node, chart ruler, and Jupiter, combined into a clear sense of direction' },
  'love': { title: 'Love & Relationships', focus: 'Venus, Moon, Mars, the 5th and 7th houses and Descendant, Juno if listed, and Venus/Moon aspects' },
  'career': { title: 'Career & Calling', focus: 'Midheaven and its ruler, 10th, 6th and 2nd houses, Saturn, Sun and Mars, with realistic work environments' },
  'money': { title: 'Money & Resources', focus: '2nd and 8th houses and their rulers, Venus, Jupiter, Saturn, and Part of Fortune if listed' },
  'health': { title: 'Health & Wellness', focus: 'Ascendant and chart ruler, 6th and 1st houses, Moon, Mars and Saturn, and element balance; reflection only, never medical advice' },
  'family-home': { title: 'Family & Home', focus: 'IC and 4th house, its ruler, Moon and Saturn, describing home setting and emotional foundations; never invent relatives, ancestry, lineage or childhood events' },
  'spiritual-gifts': { title: 'Spiritual Gifts & Intuition', focus: 'Neptune, Moon, the 9th and 12th houses, water placements, Jupiter, and Vertex if listed' },
  'practices': { title: 'Rituals, Tarot, Chakras & Affirmations', focus: 'traditional tarot correspondences for Sun, Moon and Rising signs, chakra associations by element, simple rituals and affirmations matched to the placements; label correspondences as traditions' },
  'timing': { title: 'Key Years & Turning Points', focus: 'Saturn returns, Jupiter returns, Uranus opposition, Chiron return, nodal returns, and annual profection years, with calendar years computed from the birth year' },
  'sex-attraction': { title: 'Sex & Attraction', focus: 'Venus, Mars, the 5th and 8th houses, Venus–Mars aspects and Lilith if listed, focused on consent, communication, comfort and boundaries' },
  'big-three': { title: 'Your Big Three', focus: 'Sun, Moon and Ascendant in depth, their rulers and houses, and how the three combine' },
  'mind': { title: 'Mind & Communication', focus: 'Mercury sign, house, aspects and retrograde status, the 3rd and 9th houses, and learning style' },
};
const Body = z.object({ slug: z.string().refine(s => s in TOPICS), regenerate: z.boolean().optional(), targetUserId: z.string().uuid().optional() });

/** Finds "Planet in Sign" claims that contradict the saved chart. */
// deno-lint-ignore no-explicit-any
function wrongPlacements(text: string, chart: any): string[] {
  const bad: string[] = [];
  // deno-lint-ignore no-explicit-any
  for (const b of chart?.bodies ?? []) {
    const re = new RegExp(`\\b${b.name}\\s+in\\s+(${SIGNS.join('|')})\\b`, 'g');
    for (const m of text.matchAll(re)) if (m[1] !== b.sign) bad.push(`${b.name} in ${m[1]}`);
  }
  return [...new Set(bad)];
}

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const fmt = (lon: number) => { const s = Math.floor(lon / 30); const d = lon - s * 30; return `${SIGNS[s]} ${Math.floor(d)}°${String(Math.round((d % 1) * 60)).padStart(2, '0')}′`; };
// deno-lint-ignore no-explicit-any
function chartFacts(p: any): string {
  const c = p.chart ?? {};
  // deno-lint-ignore no-explicit-any
  const lines = (c.bodies ?? []).map((b: any) => `${b.name}: ${b.sign} ${b.deg}°${String(b.min).padStart(2, '0')}′${p.birth_time && b.house ? `, house ${b.house}` : ''}${b.retro ? ', retrograde' : ''}`);
  if (p.birth_time && typeof c.asc === 'number') lines.push(`Ascendant: ${fmt(c.asc)}`);
  if (p.birth_time && typeof c.mc === 'number') lines.push(`Midheaven: ${fmt(c.mc)}`);
  for (const a of c.aspects ?? []) lines.push(`Aspect: ${a.a} ${a.type} ${a.b}; orb ${a.orb}°; ${a.applying ? 'applying' : 'separating'}`);
  if (p.birth_time && Array.isArray(c.cusps)) c.cusps.forEach((lon: number, i: number) => lines.push(`House ${i + 1} cusp: ${fmt(lon)}`));
  if (c.elements) lines.push(`Element counts: ${Object.entries(c.elements).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  // deno-lint-ignore no-explicit-any
  for (const b of c.bazi ?? []) lines.push(`Ba Zi ${b.label} pillar: ${b.romanized} (${b.stemElement}/${b.branchElement}, ${b.animal})`);
  for (const f of c.flags ?? []) lines.push(`Limitation: ${f.topic}: ${f.note}`);
  return `Birth: ${p.birth_date}${p.birth_time ? ` at ${p.birth_time}` : ' (time unknown — never use houses, Ascendant or Midheaven)'}, ${p.place_label}. House system: ${p.house_system}. Current year: ${new Date().getFullYear()}.\n${lines.join('\n')}`;
}
const RULES = 'Use ONLY the placements listed. Never invent placements, aspects, relatives, events or biography. Explain each technical term in everyday words right after using it. Present meanings as reflective interpretation, not prediction. For sex and attraction, focus on consent, boundaries, communication and non-graphic adult reflection; never infer orientation, history, trauma or consent from a chart. Never sexualize minors. Every claim must name the exact placement it comes from. Do not write generic sun-sign content: combine sign + house + aspects + rulers so the reading could only belong to this chart.';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL')!; const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(url, key);
    const { data: { user } } = await admin.auth.getUser(req.headers.get('Authorization')?.replace('Bearer ', ''));
    if (!user) return json({ error: 'Please sign in first.' }, 401);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Unknown topic.' }, 400);
    const { slug, regenerate, targetUserId } = parsed.data;
    let ownerId = user.id;
    if (targetUserId && targetUserId !== user.id) {
      const { data: isAdmin } = await admin.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (!isAdmin) return json({ error: 'Only an admin can rewrite another member\'s reading.' }, 403);
      ownerId = targetUserId;
    }
    const topic = TOPICS[slug];
    const page_key = `topic-${slug}`;
    const { data: have } = await admin.from('generated_pages').select('id,status').eq('owner_id', ownerId).eq('page_key', page_key).maybeSingle();
    if (have && !regenerate) return json({ id: have.id, status: have.status });
    const { data: profile } = await admin.from('profiles').select('*').eq('id', ownerId).maybeSingle();
    if (!profile?.birth_date || !profile.chart) return json({ error: 'Save your birth details first.' }, 400);
    const { data: paused } = await admin.from('ai_access_pauses').select('message').eq('scope', 'workspace').maybeSingle();
    if (paused) return json({ error: paused.message }, 402);
    const { data: ctx } = await admin.from('personal_context').select('title,body').eq('owner_id', ownerId).eq('use_in_generation', true).limit(6);
    const apiKey = Deno.env.get('LOVABLE_API_KEY'); if (!apiKey) return json({ error: 'AI is not configured.' }, 500);
    const call = createResponsesCall(req, { apiKey, effort: 'medium', instructions: `You are a master astrologer, psychologist and plain-language writer creating one chapter of a personal astrology book for ${profile.display_name || 'the reader'}, addressed as "you". The depth must match a professional printed natal report.\nTheir calculated chart:\n${chartFacts(profile)}\n${RULES}\nUser-reported life examples (optional, never override chart facts):\n${(ctx ?? []).map(c => `- ${c.title}: ${c.body}`).join('\n') || 'none'}\n\nTopic focus: ${topic.focus}.\nWrite 1,800–2,400 words in Markdown:\n1. A short opening overview in plain words.\n2. A "Placements behind this reading" table (placement | where it is | what it means in everyday words).\n3. 5–7 substantial sections, each analysing a specific placement or combination in depth (sign, house, ruler, aspects), each ending with a one-line "In plain words:" summary.\n4. "How this shows up in daily life" with concrete examples.\n5. "Strengths" and "Watch-outs" bullet lists.\n6. "Practices to try" (3–5).\n7. "Reflection questions" (4–6).\n8. A one-line note on what astrology can and cannot tell you.\nDo not start with a level-1 heading.` }, [{ role: 'user', content: `Write the "${topic.title}" chapter.` }]);
    let content = (await call.result.text).trim();
    let wrong = wrongPlacements(content, profile.chart);
    if (wrong.length) {
      const fix = createResponsesCall(req, { apiKey, effort: 'low', instructions: `Correct this astrology chapter. These statements contradict the calculated chart and must be fixed using only these facts:\n${chartFacts(profile)}\nWrong: ${wrong.join('; ')}.\nReturn the full corrected Markdown chapter, otherwise unchanged.` }, [{ role: 'user', content }]);
      content = (await fix.result.text).trim();
      wrong = wrongPlacements(content, profile.chart);
      if (wrong.length) return json({ error: 'The reading mentioned placements your chart does not have, so it was not saved. Please try again.' }, 502);
    }
    if (content.length < 400) return json({ error: 'The reading came back too short. Please try again.' }, 502);
    const row = { owner_id: ownerId, page_key, section: 'Topic Reading', title: topic.title, content, status: have?.status === 'hidden' ? 'hidden' : 'ready', updated_at: new Date().toISOString() };
    const ins = await admin.from('generated_pages').upsert(row, { onConflict: 'owner_id,page_key' }).select('id,status').single();
    if (ins.error) { console.error(ins.error); return json({ error: 'Could not save the reading.' }, 500); }
    await admin.from('ai_usage').insert({ user_id: user.id, feature: 'topic-reading' });
    return json(ins.data);
  } catch (e) {
    console.error(e);
    const { status, message } = gatewayError(e);
    return json({ error: message }, status);
  }
});
