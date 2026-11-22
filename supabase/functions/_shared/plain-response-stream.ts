/** Convert Responses SSE into plain text without disguising failed/unfinished answers as success. */
export function plainResponseStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';
  let ended = false;
  let completed = false;
  const parse = (line: string, controller: ReadableStreamDefaultController<Uint8Array>) => {
    if (!line.trim().startsWith('data:')) return;
    const data = line.trim().slice(5).trim();
    if (!data) return;
    if (data === '[DONE]') { completed = true; return; }
    let event: { type?: string; delta?: string };
    try { event = JSON.parse(data); } catch { throw new Error('The answer was interrupted. Please try again.'); }
    if (['response.failed', 'response.incomplete', 'error'].includes(event.type ?? '')) throw new Error('The answer was interrupted. Please try again.');
    if (event.type === 'response.completed') completed = true;
    if (event.type === 'response.output_text.delta' && typeof event.delta === 'string') controller.enqueue(encoder.encode(event.delta));
  };
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (ended) return;
      try {
        // A chunk may contain only part of an event or metadata. Keep reading
        // until text is emitted or the stream closes, otherwise pull can stall.
        const before = controller.desiredSize;
        do {
        const { done, value } = await reader.read();
        buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
        let newline;
        while ((newline = buffer.indexOf('\n')) >= 0) {
          parse(buffer.slice(0, newline), controller); buffer = buffer.slice(newline + 1);
        }
        if (done) { if (buffer.trim()) parse(buffer, controller); if (!completed) throw new Error('Incomplete answer'); ended = true; reader.releaseLock(); controller.close(); }
        } while (!ended && controller.desiredSize === before);
      } catch {
        ended = true;
        try { await reader.cancel(); } catch { /* upstream already failed */ }
        reader.releaseLock();
        controller.error(new Error('The answer was interrupted. Please try again.'));
      }
    },
    async cancel(reason) { ended = true; try { await reader.cancel(reason); } finally { reader.releaseLock(); } },
  });
}