import { assertEquals, assertRejects } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { plainResponseStream } from './plain-response-stream.ts';

const enc = new TextEncoder();
const stream = (parts: string[]) => new ReadableStream<Uint8Array>({ start(c) { for (const p of parts) c.enqueue(enc.encode(p)); c.close(); } });
Deno.test('split events and a final unterminated line retain the complete answer', async () => {
  const body = stream(['data: {"type":"response.output_', 'text.delta","delta":"Hello "}\n\n', 'data: {"type":"response.output_text.delta","delta":"reader"}\n', 'data: {"type":"response.completed"}']);
  assertEquals(await new Response(plainResponseStream(body)).text(), 'Hello reader');
});
Deno.test('a provider failure cannot be read as a successful partial answer', async () => {
  await assertRejects(() => new Response(plainResponseStream(stream(['data: {"type":"response.output_text.delta","delta":"Partial"}\n', 'data: {"type":"response.failed"}\n']))).text(), Error, 'interrupted');
});
Deno.test('an upstream read failure cannot silently complete the answer', async () => {
  const body = new ReadableStream<Uint8Array>({ pull(c) { c.error(new Error('offline')); } });
  await assertRejects(() => new Response(plainResponseStream(body)).text(), Error, 'interrupted');
});
Deno.test('a truncated connection without a completion event fails', async () => {
  await assertRejects(() => new Response(plainResponseStream(stream(['data: {"type":"response.output_text.delta","delta":"Partial"}\n']))).text(), Error, 'interrupted');
});
Deno.test('closing the reader cancels its upstream source', async () => {
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({ cancel() { cancelled = true; } });
  await plainResponseStream(body).cancel(); assertEquals(cancelled, true);
});