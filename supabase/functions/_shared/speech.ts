import { GATEWAY_URL } from './responses.ts';

export const TTS_MODEL = 'google/gemini-3.1-flash-tts-preview';

/** Writing rules that make a script sound spoken rather than read. Appended to podcast script instructions. */
export const SPOKEN_STYLE = 'Write for the ear: contractions, mixed short and longer sentences, the occasional question to the listener, gentle signposts ("here’s the thing", "now"), and commas or ellipses where a host would breathe. No lists, no parentheses, no abbreviations, no degree symbols — say "twelve degrees". Spell out numbers.';

/**
 * Director's note for the speech model. A full scene and performance brief (not a one-line "read warmly" prefix)
 * is what moves the voice from flat narration to a natural host. The note is never spoken.
 */
const direction = (text: string, part: number, total: number) => `# AUDIO PROFILE: a warm, grounded astrology podcast host
## THE SCENE
A quiet late-evening studio. The host is speaking one-to-one with a listener they know and like, about the listener's own birth chart.
### DIRECTOR'S NOTES
Style: conversational, intimate and unhurried, with a soft smile in the voice. Never announcer-like, never sing-song, never robotic.
Pace: relaxed, natural variation — slow down on key insights, let commas and full stops breathe, pause briefly between ideas.
Delivery: vary pitch and emphasis like real speech; lean into questions; lower the voice slightly for reflective lines.
${total > 1 ? `Continuity: this is part ${part} of ${total} of one episode — keep the same voice, energy and pace${part > 1 ? '; do not re-introduce the show' : ''}.` : ''}
#### TRANSCRIPT
${text}`;

export async function speak(apiKey: string, text: string, voice = 'Kore', part = 1, total = 1): Promise<Uint8Array> {
  const res = await fetch(`${GATEWAY_URL}/audio/speech`, {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: TTS_MODEL, contents: [{ role: 'user', parts: [{ text: direction(text, part, total) }] }], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } }, stream_format: 'audio' }),
  });
  if (!res.ok) { const t = await res.text(); throw Object.assign(new Error(`speech ${res.status}: ${t.slice(0, 300)}`), { statusCode: res.status }); }
  return pcmFromWav(new Uint8Array(await res.arrayBuffer()));
}

/** Speak every part and join them with a short breath of silence, so section seams don't sound clipped. */
export async function speakAll(apiKey: string, parts: string[], voice = 'Kore', rate = 24000): Promise<Uint8Array> {
  const gap = new Uint8Array(Math.round(rate * 0.45) * 2);
  const pcm: Uint8Array[] = [];
  for (let i = 0; i < parts.length; i++) { if (i) pcm.push(gap); pcm.push(await speak(apiKey, parts[i], voice, i + 1, parts.length)); }
  const out = new Uint8Array(pcm.reduce((a, b) => a + b.length, 0)); let o = 0; for (const b of pcm) { out.set(b, o); o += b.length; }
  return out;
}

export function pcmFromWav(buf: Uint8Array): Uint8Array {
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
