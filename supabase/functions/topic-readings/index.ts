import { readingJobIsCurrent } from '../_shared/reading-job-rules.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { createResponsesCall, gatewayError } from '../_shared/responses.ts';
import { systemFacts, SYSTEM_SLUGS } from './systemFacts.ts';

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
  'sex-attraction': { title: 'Sex & Attraction', focus: 'Venus, Mars, the 5th and 8th houses, Venus–Mars aspects and Lilith if listed, with sections on desire style, pace and rhythm, sensual preferences by element, suggested position styles and settings that suit the Venus/Mars signs and elements (described tastefully, adult-only, non-explicit), plus consent, communication, comfort and boundaries' },
  'big-three': { title: 'Your Big Three', focus: 'Sun, Moon and Ascendant in depth, their rulers and houses, and how the three combine' },
  'mind': { title: 'Mind & Communication', focus: 'Mercury sign, house, aspects and retrograde status, the 3rd and 9th houses, and learning style' },
};
const CORE_TOPICS: Record<string, { title: string; focus: string }> = {
  'core-personality': { title: 'Personality & Strengths', focus: 'Sun, Moon, Ascendant, chart ruler, dominant element and modality, and the tightest aspects, distilled into core strengths and natural talents' },
  'core-emotions': { title: 'Emotional World', focus: 'Moon sign, house and aspects, the 4th house, water placements and Neptune contacts: how feelings arise, are processed and soothed' },
  'core-friendship': { title: 'Friendship & Community', focus: 'the 11th and 3rd houses and rulers, Uranus, Mercury, Venus and Aquarius emphasis: friendship style, groups and belonging' },
  'core-creativity': { title: 'Creativity & Self-Expression', focus: 'the 5th house and ruler, Sun, Venus, Neptune and Leo emphasis: creative gifts, play and how you shine' },
  'core-work-style': { title: 'Work Style & Daily Habits', focus: 'the 6th house and ruler, Mercury, Mars, Saturn and Virgo emphasis: productivity rhythm, routines and ideal daily structure' },
  'core-leadership': { title: 'Leadership & Ambition', focus: 'Midheaven, Sun, Mars, Saturn, Jupiter and the 10th/1st houses: how you lead, aim high and handle responsibility' },
  'core-self-worth': { title: 'Self-Worth & Confidence', focus: 'the 2nd house and ruler, Venus, Sun, Jupiter and Saturn aspects to personal planets: confidence, values and self-esteem' },
  'core-resilience': { title: 'Stress & Resilience', focus: 'Saturn, Mars, Pluto, Chiron, the 8th and 12th houses and hard aspects: stress triggers, coping style and how you recover' },
  'core-learning': { title: 'Learning & Wisdom', focus: 'Mercury, Jupiter, the 3rd and 9th houses and Sagittarius/Gemini emphasis: learning style, curiosity and how knowledge becomes wisdom' },
  'core-beliefs-travel': { title: 'Beliefs, Travel & Adventure', focus: 'the 9th house and ruler, Jupiter, Sagittarius emphasis and the North Node: philosophy, faith, travel and expanding horizons' },
  'core-freedom-change': { title: 'Freedom & Change', focus: 'Uranus by sign, house and aspects, Aquarius emphasis, the 11th house and mutable placements: need for freedom and handling change' },
  'core-legacy': { title: 'Legacy & Life Direction', focus: 'Midheaven, North Node, Saturn, Pluto and the chart ruler: what you build over a lifetime and the mark you leave' },
};
const SYS_TITLES: Record<string, string> = { vedic: 'Vedic · Jyotish', chinese: 'Chinese · Ba Zi', 'mayan-tzolkin': 'Maya · Tzolk’in', 'tibetan-mewa': 'Tibetan Mewa', 'nine-star-ki': 'Japanese Nine Star Ki', 'chaldean-numerology': 'Chaldean Numerology', 'tarot-birth-cards': 'Tarot Birth Cards', 'celtic-tree-calendar': 'Celtic Tree Calendar' };
for (const k of SYSTEM_SLUGS) TOPICS[`sys-${k}`] = { title: SYS_TITLES[k], focus: `the ${SYS_TITLES[k]} system: interpret ONLY the calculated system values given under "System facts" (explain the system's origin and method briefly, then each value in depth and how they combine), and where useful compare with the Western chart; label traditional meanings as tradition` };
Object.assign(TOPICS, CORE_TOPICS);
const Body = z.object({ slug: z.string().refine(s => s in TOPICS), regenerate: z.boolean().optional(), targetUserId: z.string().uuid().optional(), chain: z.boolean().optional(), lane: z.number().int().min(0).max(3).optional(), lanes: z.number().int().min(1).max(4).optional() });
const DAILY_LIMIT = 50;
const FREE_READINGS = ['big-three', 'core-personality'];

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
  return `Birth: ${p.birth_date}${p.birth_time ? ` at ${p.birth_time}` : ' (time unknown — never use houses, Ascendant or Midheaven)'}, ${p.place_label}. House system: ${p.house_system}. Current year: ${new Date().getFullYear()}.${p.sex ? ` Reader's stated sex/gender: ${p.sex} (use only for respectful wording; never assume orientation).` : ''}\n${lines.join('\n')}`;
}
// deno-lint-ignore no-explicit-any
const placementsTable = (p: any) => {
  // deno-lint-ignore no-explicit-any
  const rows = (p.chart?.bodies ?? []).map((b: any) => `| ${b.name} | ${b.sign} ${b.deg}°${String(b.min).padStart(2, '0')}′${b.retro ? ' (retrograde)' : ''} | ${p.birth_time && b.house ? `House ${b.house}` : '—'} |`);
  return `## Placements behind this reading\n\n| Placement | Position | House |\n| --- | --- | --- |\n${rows.join('\n')}`;
};
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
    const { slug, regenerate, targetUserId, chain, lane, lanes } = parsed.data;
    let ownerId = user.id;
    if (targetUserId && targetUserId !== user.id) {
      const { data: isAdmin } = await admin.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (!isAdmin) return json({ error: 'Only an admin can rewrite another member\'s reading.' }, 403);
      ownerId = targetUserId;
    }
    // Free plan: only the spotlight readings are written, so free sign-ups cost very few AI credits.
    const [{ data: paid }, { data: isAdminUser }, { data: shared }] = await Promise.all([
      admin.rpc('has_paid_plan', { _user_id: ownerId }),
      admin.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
      admin.rpc('is_shared_space_user_id', { _user_id: ownerId }),
    ]);
    const fullAccess = !!(paid || isAdminUser || shared);
    // Free members get a short opening-section preview of every core theme; the full reading needs a paid plan.
    const teaser = !fullAccess && !FREE_READINGS.includes(slug) && slug in CORE_TOPICS;
    if (!fullAccess && !FREE_READINGS.includes(slug) && !teaser) return json({ error: 'This reading is part of Full Access. Upgrade to have it written from your chart.' }, 403);
    if (teaser && regenerate) return json({ error: 'Upgrade to Full Access to have the full reading written.' }, 403);
    const topic = TOPICS[slug];
    const page_key = `topic-${slug}`;
    const sysSlug = slug.startsWith('sys-') ? slug.slice(4) : null;
    const { data: have } = await admin.from('generated_pages').select('id,status,updated_at').eq('owner_id', ownerId).eq('page_key', page_key).maybeSingle();
    // A paid member opening an old preview gets the full reading written automatically.
    const { data: profile } = await admin.from('profiles').select('*').eq('id', ownerId).maybeSingle();
    if (!profile?.birth_date || !profile.chart) return json({ error: 'Save your birth details first.' }, 400);
    const stale = !!(have && profile.onboarded_at && Date.parse(have.updated_at) < Date.parse(profile.onboarded_at));
    if (have && !stale && ['ready','preview'].includes(have.status) && !regenerate && !(fullAccess && have.status === 'preview')) return json({ id: have.id, status: have.status });
    if (profile.generation_cancelled) return json({ error: 'Writing was stopped for this chart. Press Resume to continue.' }, 409);
    const { data: paused } = await admin.from('ai_access_pauses').select('message').eq('scope', 'workspace').maybeSingle();
    if (paused) return json({ error: paused.message }, 402);
    const { data: ctx } = await admin.from('personal_context').select('title,body').eq('owner_id', ownerId).eq('use_in_generation', true).limit(6);
    const apiKey = Deno.env.get('LOVABLE_API_KEY'); if (!apiKey) return json({ error: 'AI is not configured.' }, 500);
    const { data: admission, error: admissionError } = await admin.rpc('claim_topic_reading_job', { p_owner_id: ownerId, p_page_key: page_key, p_regenerate: stale || !!regenerate || have?.status === 'preview' || have?.status === 'hidden' });
    if (admissionError) throw admissionError;
    const claimed = admission?.[0];
    if (!claimed) throw new Error('Job reservation unavailable');
    if (claimed.quota_exceeded) return json({ error: 'Daily writing limit reached. Please return tomorrow.' }, 429);
    if (!claimed.claimed) return json({ status: claimed.job_status });
    const leaseTime = new Date().toISOString();
    const pending = await admin.from('generated_pages').upsert({ owner_id: ownerId, page_key, section: 'Topic Reading', title: topic.title, content: '', status: 'writing', updated_at: leaseTime }, { onConflict: 'owner_id,page_key' });
    if (pending.error) {
      await admin.from('topic_reading_jobs').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('claim_token', claimed.job_id);
      throw pending.error;
    }
    const authHeader = req.headers.get('Authorization') ?? ''; const apikeyHeader = req.headers.get('apikey') ?? '';
    // Writing takes over a minute, so it runs in the background and the page polls for the result.
    const ensureCurrent = async () => {
      const { data: current, error } = await admin.from('profiles').select('generation_cancelled,onboarded_at').eq('id', ownerId).single();
      if (error || !readingJobIsCurrent(current, profile.onboarded_at)) throw new Error('Chart changed or writing stopped');
    };
    const controller = new AbortController();
    const cancellationCheck = setInterval(() => { void ensureCurrent().catch(() => controller.abort()); }, 5000);
    const job = (async () => {
      try {
        await ensureCurrent();
        const call = createResponsesCall(req, { apiKey, background: true, signal: controller.signal, effort: 'low', instructions: `You are a master astrologer, psychologist and plain-language writer creating one chapter of a personal astrology book for ${profile.display_name || 'the reader'}, addressed as "you". The depth must match a professional printed natal report.\nTheir calculated chart:\n${chartFacts(profile)}\n${RULES}\nUser-reported life examples (optional, never override chart facts):\n${(ctx ?? []).map(c => `- ${c.title.slice(0,160)}: ${c.body.slice(0,2500)}`).join('\n') || 'none'}\n\nTopic focus: ${topic.focus}.${sysSlug ? `\nSystem facts (calculated, authoritative):\n${(() => { const f = systemFacts(sysSlug, profile.birth_date, profile.chart?.bodies ?? [], profile.chart?.bazi ?? []); return f ? `${f.summary}\nMethod: ${f.method}\n${f.rows.map(r => `${r[0]}: ${r[1]}`).join('\n')}` : 'none'; })()}` : ''}\n${teaser ? 'Write ONLY the opening section: 250–350 dense, specific words in Markdown under one level-2 heading, analysing the single most important placement for this theme and ending with a one-line "In plain words:" summary. A placements table is added automatically, so do not write one.\n' : `Write 900–1,200 dense, specific words in Markdown (depth over padding; no repetition, no generic filler). A placements table is added automatically, so do not write one:\n1. A short opening overview in plain words.\n2. 4–5 substantial sections, each analysing a specific placement or combination (sign, house, ruler, aspects), each ending with a one-line "In plain words:" summary.\n3. "How this shows up in daily life" with concrete examples.\n4. "Strengths" and "Watch-outs" bullet lists.\n5. "Practices to try" (3).\n6. "Reflection questions" (3–4).\n7. A one-line note on what astrology can and cannot tell you.\n`}Do not start with a level-1 heading.` }, [{ role: 'user', content: `Write the "${topic.title}" chapter.` }]);
        let content = (await call.result.text).trim();
        let wrong = wrongPlacements(content, profile.chart);
        if (wrong.length) {
          await ensureCurrent();
          const fix = createResponsesCall(req, { apiKey, background: true, signal: controller.signal, effort: 'low', instructions: `Correct this astrology chapter. These statements contradict the calculated chart and must be fixed using only these facts:\n${chartFacts(profile)}\nWrong: ${wrong.join('; ')}.\nReturn the full corrected Markdown chapter, otherwise unchanged.` }, [{ role: 'user', content }]);
          content = (await fix.result.text).trim();
          wrong = wrongPlacements(content, profile.chart);
          if (wrong.length) throw new Error(`wrong placements ${wrong.join(', ')}`);
        }
        if (content.length < (teaser ? 200 : 400)) throw new Error('too short');
        content = `${placementsTable(profile)}\n\n${content}`;
        await ensureCurrent();
        const finished = await admin.rpc('finish_topic_reading_job', { p_owner_id: ownerId, p_page_key: page_key, p_token: claimed.job_id, p_content: content, p_status: teaser ? 'preview' : have?.status === 'hidden' ? 'hidden' : 'ready', p_birth_saved_at: profile.onboarded_at });
        if (finished.error) throw finished.error;
        if (!finished.data) return;
      } catch (e) {
        console.error('topic job', slug, e);
        await admin.rpc('finish_topic_reading_job', { p_owner_id: ownerId, p_page_key: page_key, p_token: claimed.job_id, p_content: '', p_status: 'failed', p_birth_saved_at: profile.onboarded_at });
        return;
      } finally { clearInterval(cancellationCheck); }
      // Always move forward to the next unwritten topic (never back), so one failure can't stall or loop the queue.
      // Parallel lanes: each lane only takes topics whose index % lanes === lane, so lanes never collide.
      // A paused workspace (no credits) stops every lane.
      const { data: pausedNow } = await admin.from('ai_access_pauses').select('message').eq('scope', 'workspace').maybeSingle();
      if (chain && ownerId === user.id && !pausedNow) {
        // Re-read the stop switch: the member may cancel while this job is still writing.
        const { data: stoppedNow } = await admin.from('profiles').select('generation_cancelled').eq('id', ownerId).maybeSingle();
        if (stoppedNow?.generation_cancelled) return;
        const { data: done } = await admin.from('generated_pages').select('page_key').eq('owner_id', ownerId).eq('section', 'Topic Reading');
        const got = new Set((done ?? []).map(d => d.page_key));
        const keys = Object.keys(TOPICS);
        const L = lanes ?? 1; const myLane = lane ?? 0;
        const next = keys.slice(keys.indexOf(slug) + 1).find((k, i, arr) => !got.has(`topic-${k}`) && keys.indexOf(arr[i]) % L === myLane);
        if (next) await fetch(`${url}/functions/v1/topic-readings`, { method: 'POST', headers: { Authorization: authHeader, apikey: apikeyHeader, 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: next, chain: true, lane: myLane, lanes: L }) }).catch(e => console.error('chain', e));
      }
    })();
    // deno-lint-ignore no-explicit-any
    (globalThis as any).EdgeRuntime?.waitUntil?.(job);
    return json({ status: 'writing' }, 202);
  } catch (e) {
    console.error(e);
    const { status, message } = gatewayError(e);
    return json({ error: message }, status);
  }
});
