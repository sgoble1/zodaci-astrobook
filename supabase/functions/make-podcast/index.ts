import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { createResponsesCall, gatewayError, GATEWAY_URL } from '../_shared/responses.ts';
import { APRIL_CHART } from '../_shared/april-profile.ts';

const TTS_MODEL = 'google/gemini-3.1-flash-tts-preview';
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const Body = z.object({
  topic: z.string().trim().min(2).max(200),
  brief: z.string().max(3000).default(''),
  voice: z.enum(['Kore', 'Aoede', 'Charon', 'Puck']).default('Kore'),
  passages: z.array(z.object({ n: z.number(), source: z.string(), loc: z.string(), text: z.string() })).max(14).default([]),
});

/** Split at sentence boundaries into chunks of at most `max` characters. */
function chunk(text: string, max = 1400): string[] {
  const parts = text.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) ?? [text];
  const out: string[] = []; let cur = '';
  for (const s of parts) { if ((cur + s).length > max && cur) { out.push(cur.trim()); cur = s; } else cur += s; }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Pull raw 16-bit PCM out of a WAV file (skips header chunks). */
function pcmFromWav(buf: Uint8Array): Uint8Array {
  const v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (String.fromCharCode(...buf.slice(0, 4)) !== 'RIFF') return buf;
  let o = 12;
  while (o + 8 <= buf.length) {
    const id = String.fromCharCode(...buf.slice(o, o + 4)); const size = v.getUint32(o + 4, true);
    if (id === 'data') return buf.slice(o + 8, o + 8 + size);
    o += 8 + size + (size % 2);
  }
  return buf.slice(44);
}

function wav(pcm: Uint8Array, rate = 24000): Uint8Array {
  const h = new DataView(new ArrayBuffer(44)); const w = (o: number, s: string) => [...s].forEach((c, i) => h.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); h.setUint32(4, 36 + pcm.length, true); w(8, 'WAVE'); w(12, 'fmt '); h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true);
  h.setUint32(24, rate, true); h.setUint32(28, rate * 2, true); h.setUint16(32, 2, true); h.setUint16(34, 16, true); w(36, 'data'); h.setUint32(40, pcm.length, true);
  const out = new Uint8Array(44 + pcm.length); out.set(new Uint8Array(h.buffer)); out.set(pcm, 44); return out;
}

function escapeXml(value: string) { return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] ?? char)); }

function podcastCover(title: string) {
  const safe = escapeXml(title.length > 54 ? `${title.slice(0, 51)}…` : title);
  const spokes = Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<line x1="${600 + Math.cos(a) * 230}" y1="${470 + Math.sin(a) * 230}" x2="${600 + Math.cos(a) * 310}" y2="${470 + Math.sin(a) * 310}" stroke="#d9a441" opacity=".5"/>`; }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200"><defs><radialGradient id="sky"><stop stop-color="#2b3858"/><stop offset="1" stop-color="#100f1a"/></radialGradient></defs><rect width="1200" height="1200" fill="url(#sky)"/><circle cx="600" cy="470" r="310" fill="none" stroke="#d9a441" stroke-width="5" opacity=".8"/><circle cx="600" cy="470" r="230" fill="none" stroke="#f0dfb4" stroke-width="2" opacity=".55"/>${spokes}<text x="600" y="440" text-anchor="middle" fill="#f0dfb4" font-family="Georgia,serif" font-size="170">☉</text><text x="600" y="555" text-anchor="middle" fill="#d9a441" font-family="Georgia,serif" font-size="42">APRIL'S CHART</text><text x="600" y="890" text-anchor="middle" fill="#fffaf0" font-family="Georgia,serif" font-size="54">${safe}</text><text x="600" y="990" text-anchor="middle" fill="#d9a441" font-family="Arial,sans-serif" font-size="26">A PRIVATE PODCAST</text></svg>`;
}

async function speak(apiKey: string, text: string, voice: string): Promise<Uint8Array> {
  const res = await fetch(`${GATEWAY_URL}/audio/speech`, {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: TTS_MODEL, contents: [{ role: 'user', parts: [{ text: `Read warmly and calmly, like an intimate podcast host: ${text}` }] }], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } }, stream_format: 'audio' }),
  });
  if (!res.ok) { const t = await res.text(); throw Object.assign(new Error(`speech ${res.status}: ${t.slice(0, 300)}`), { statusCode: res.status }); }
  return pcmFromWav(new Uint8Array(await res.arrayBuffer()));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') ?? '';
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return json({ error: 'Please sign in to create podcasts.' }, 401);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Please give the episode a topic.' }, 400);
    const { topic, brief, voice, passages } = parsed.data;
    if (!passages.length) return json({ error: 'No matching passages were found in the sources. Try different words.' }, 400);
    const apiKey = Deno.env.get('LOVABLE_API_KEY'); if (!apiKey) return json({ error: 'AI is not configured.' }, 500);

    const ctx = passages.map(p => `[${p.n}] (${p.source} — ${p.loc})\n${p.text.slice(0, 1800)}`).join('\n\n');
    const call = createResponsesCall(req, { apiKey, effort: 'low', instructions: `You write short spoken podcast episodes for April about her own chart.\n${APRIL_CHART}\nWrite a single-host script of about 450–550 words (roughly 3–4 minutes spoken). Speak directly to April as "you". Open with a one-line hook, then 3 short spoken sections, end with one practical takeaway. Base every claim on the passages; never invent placements. Plain spoken prose only: no headings, no bullet points, no citations, no stage directions, no emoji.` },
      [{ role: 'user', content: `Episode topic: ${topic}\n${brief ? `Focus: ${brief}\n` : ''}\nPassages:\n\n${ctx}` }]);
    const script = (await call.result.text).trim();
    if (!script) return json({ error: 'The script came back empty. Please try again.' }, 502);

    const parts = chunk(script);
    const pcm: Uint8Array[] = [];
    for (const p of parts) pcm.push(await speak(apiKey, p, voice)); // ordered, sequential: shared rate-limit budget
    const total = pcm.reduce((a, b) => a + b.length, 0); const joined = new Uint8Array(total); let off = 0; for (const b of pcm) { joined.set(b, off); off += b.length; }
    const file = wav(joined);

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const name = `${topic.replace(/[^\w]+/g, '_').slice(0, 60)}.wav`;
    const path = `${u.user.id}/podcast/${Date.now()}-${name}`;
    const up = await admin.storage.from('library').upload(path, file, { contentType: 'audio/wav' });
    if (up.error) return json({ error: 'Could not save the audio.' }, 500);
    const coverPath = `${u.user.id}/podcast/${Date.now()}-${name.replace(/\.wav$/i, '')}-cover.svg`;
    const cover = new TextEncoder().encode(podcastCover(topic));
    const coverUp = await admin.storage.from('library').upload(coverPath, cover, { contentType: 'image/svg+xml' });
    if (coverUp.error) return json({ error: 'Could not save the episode cover.' }, 500);
    const ins = await admin.from('library_items').insert({ kind: 'podcast', title: topic, description: script.split(/(?<=[.!?])\s/).slice(0, 2).join(' '), category: 'Created episodes', file_path: path, cover_path: coverPath, shared_with_space: true, file_name: name, mime_type: 'audio/wav', size_bytes: file.length, owner_id: u.user.id }).select('id').single();
    if (ins.error) return json({ error: 'Could not list the episode.' }, 500);
    return json({ id: ins.data.id, script, seconds: Math.round(joined.length / 48000) });
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: corsHeaders });
    console.error(e);
    const { status, message } = gatewayError(e);
    return json({ error: message }, status);
  }
});
