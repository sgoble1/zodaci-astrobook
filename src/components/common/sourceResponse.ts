/** Expected service denials are page state, not thrown runtime errors. */
export async function sourceResponse(response: Response): Promise<
  { body: ReadableStream<Uint8Array>; error: null } | { body: null; error: string }
> {
  if (response.ok && response.body) return { body: response.body, error: null };
  const payload: unknown = await response.json().catch(() => null);
  const record = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  const message = typeof record.error === 'string' ? record.error
    : typeof record.message === 'string' ? record.message : null;
  return {
    body: null,
    error: message || (response.status === 402
      ? 'AI credits have run out. Add credits in Settings → Plans & credits.'
      : 'The sources could not answer right now. Please try again.'),
  };
}