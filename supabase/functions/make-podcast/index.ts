import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { createResponsesCall, gatewayError, GATEWAY_URL } from '../_shared/responses.ts';
import { counselorContext } from '../_shared/member-profile.ts';
import { creditShortfall } from '../_shared/credits.ts';
import { speakAll, SPOKEN_STYLE } from '../_shared/speech.ts';

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const Body = z.object({
  topic: z.string().trim().min(2).max(200),
  brief: z.string().max(3000).default(''),
  voice: z.enum(['Kore', 'Aoede', 'Charon', 'Puck']).default('Kore'),
  duration: z.enum(['short', 'standard', 'long']).default('standard'),
  shared: z.boolean().default(false),
  passages: z.array(z.object({ n: z.number(), source: z.string(), loc: z.string(), text: z.string(), href: z.string().startsWith('/').optional() })).max(20).default([]),
});

/** Split at sentence boundaries into chunks of at most `max` characters. */
function chunk(text: string, max = 1400): string[] {
  const parts = text.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) ?? [text];
  const out: string[] = []; let cur = '';
  for (const s of parts) { if ((cur + s).length > max && cur) { out.push(cur.trim()); cur = s; } else cur += s; }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function wav(pcm: Uint8Array, rate = 24000): Uint8Array {
  const h = new DataView(new ArrayBuffer(44)); const w = (o: number, s: string) => [...s].forEach((c, i) => h.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); h.setUint32(4, 36 + pcm.length, true); w(8, 'WAVE'); w(12, 'fmt '); h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true);
  h.setUint32(24, rate, true); h.setUint32(28, rate * 2, true); h.setUint16(32, 2, true); h.setUint16(34, 16, true); w(36, 'data'); h.setUint32(40, pcm.length, true);
  const out = new Uint8Array(44 + pcm.length); out.set(new Uint8Array(h.buffer)); out.set(pcm, 44); return out;
}

function escapeXml(value: string) { return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] ?? char)); }

function podcastCover(title: string, owner: string) {
  const safe = escapeXml(title.length > 54 ? `${title.slice(0, 51)}…` : title);
  const spokes = Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<line x1="${600 + Math.cos(a) * 230}" y1="${470 + Math.sin(a) * 230}" x2="${600 + Math.cos(a) * 310}" y2="${470 + Math.sin(a) * 310}" stroke="#d9a441" opacity=".5"/>`; }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200"><defs><radialGradient id="sky"><stop stop-color="#2b3858"/><stop offset="1" stop-color="#100f1a"/></radialGradient></defs><rect width="1200" height="1200" fill="url(#sky)"/><circle cx="600" cy="470" r="310" fill="none" stroke="#d9a441" stroke-width="5" opacity=".8"/><circle cx="600" cy="470" r="230" fill="none" stroke="#f0dfb4" stroke-width="2" opacity=".55"/>${spokes}<text x="600" y="440" text-anchor="middle" fill="#f0dfb4" font-family="Georgia,serif" font-size="170">☉</text><text x="600" y="555" text-anchor="middle" fill="#d9a441" font-family="Georgia,serif" font-size="42">${escapeXml(owner.toUpperCase())}</text><text x="600" y="890" text-anchor="middle" fill="#fffaf0" font-family="Georgia,serif" font-size="54">${safe}</text><text x="600" y="990" text-anchor="middle" fill="#d9a441" font-family="Arial,sans-serif" font-size="26">A PRIVATE PODCAST</text></svg>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') ?? '';
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return json({ error: 'Please sign in to create podcasts.' }, 401);
    // Source-grounded episodes are for edition owners and the shared space; Cosmic members use the Cosmic studio.
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const [{ data: member }, { data: edition }, { data: tier }] = await Promise.all([
      sb.rpc('is_shared_space_member'), sb.rpc('my_founder_edition'), admin.rpc('plan_tier', { _user_id: u.user.id }),
    ]);
    if (member !== true && !edition && tier !== 'creator') return json({ error: 'Podcasts are part of the Cosmic plan.' }, 403);
    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: 'Please give the episode a topic.' }, 400);
    const { topic, brief, voice, duration, passages, shared } = parsed.data;
    if (!passages.length) return json({ error: 'No matching passages were found in the sources. Try different words.' }, 400);
    const apiKey = Deno.env.get('LOVABLE_API_KEY'); if (!apiKey) return json({ error: 'AI is not configured.' }, 500);
    // Episodes speak to the creator about their own chart: April's verified profile for April, everyone else their saved chart.
    const who = await counselorContext(sb, admin, u.user.id, u.user.email ?? '');
    if (!who.ok) return json({ error: 'Save your birth details first so the episode can speak to your chart.' }, 400);
    const short = await creditShortfall(admin, u.user.id, 'creator-podcast');
    if (short) return json({ error: short }, 402);
    const { data: notes } = await admin.from('personal_context').select('title,body').eq('owner_id', u.user.id).eq('use_in_generation', true).order('updated_at', { ascending: false }).limit(6);
    const personal = (notes ?? []).map(n => `- ${n.title}: ${String(n.body).slice(0, 500)}`).join('\n');

    const durationConfig = {
      short: { words: '220–300', minutes: 'about 2', sections: 2 },
      standard: { words: '450–550', minutes: 'about 4', sections: 3 },
      long: { words: '900–1,100', minutes: 'about 8', sections: 6 },
    }[duration];
    const ctx = passages.map(p => `[${p.n}] (${p.source} — ${p.loc})\n${p.text.slice(0, 1800)}`).join('\n\n');
    const call = createResponsesCall(req, { apiKey, effort: 'low', instructions: `You write spoken podcast episodes for ${who.name} about their own chart.\n${who.context}\n${personal ? `What ${who.name} chose to share (context only; never overrides chart facts):\n${personal}\n` : ''}Write a single-host script of ${durationConfig.words} words (${durationConfig.minutes} minutes spoken). Speak directly to ${who.name} as "you". Open with a one-line hook, use ${durationConfig.sections} short spoken sections, and end with one practical takeaway. Base every factual claim on the supplied passages; never invent placements or use general astrology knowledge. Naturally name the source when useful (for example, "Your Masterbook describes..."). End each source-grounded paragraph with one or more matching citation numbers like [1] or [2][4]. Plain spoken prose only: no headings, no bullet points, no stage directions, no emoji. ${SPOKEN_STYLE}` },
      [{ role: 'user', content: `Episode topic: ${topic}\n${brief ? `Focus: ${brief}\n` : ''}\nPassages:\n\n${ctx}` }]);
    const script = (await call.result.text).trim();
    if (!script) return json({ error: 'The script came back empty. Please try again.' }, 502);

    const parts = chunk(script);
    // Citations remain in the transcript but are not read aloud.
    const joined = await speakAll(apiKey, parts.map(p => p.replace(/\[\d+\]/g, '')), voice);
    const file = wav(joined);

    const name = `${topic.replace(/[^\w]+/g, '_').slice(0, 60)}.wav`;
    const path = `${u.user.id}/podcast/${Date.now()}-${name}`;
    const up = await admin.storage.from('library').upload(path, file, { contentType: 'audio/wav' });
    if (up.error) return json({ error: 'Could not save the audio.' }, 500);
    const coverPath = `${u.user.id}/podcast/${Date.now()}-${name.replace(/\.wav$/i, '')}-cover.svg`;
    const cover = new TextEncoder().encode(podcastCover(topic, `${who.name}’s chart`));
    const coverUp = await admin.storage.from('library').upload(coverPath, cover, { contentType: 'image/svg+xml' });
    if (coverUp.error) { await admin.storage.from('library').remove([path]); return json({ error: 'Could not save the episode cover.' }, 500); }
    const citations = passages.map(p => ({ title: p.source, text: p.text, loc: p.loc, href: p.href ?? '', n: p.n }));
    const ins = await admin.from('library_items').insert({ kind: 'podcast', title: topic, description: script.split(/(?<=[.!?])\s/).slice(0, 2).join(' '), category: 'Created episodes', file_path: path, cover_path: coverPath, shared_with_space: shared, file_name: name, mime_type: 'audio/wav', size_bytes: file.length, owner_id: u.user.id, sections: [{ title: 'Episode transcript', text: script }, ...citations] }).select('id').single();
    if (ins.error) { await admin.storage.from('library').remove([path, coverPath]); return json({ error: 'Could not list the episode.' }, 500); }
    await admin.from('ai_usage').insert({ user_id: u.user.id, feature: 'creator-podcast' });
    return json({ id: ins.data.id, script, seconds: Math.round(joined.length / 48000) });
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: corsHeaders });
    console.error(e);
    const { status, message } = gatewayError(e);
    return json({ error: message }, status);
  }
});
