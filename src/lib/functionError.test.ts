import { describe, it, expect } from 'vitest';
import { functionErrorMessage } from './functionError';

describe('functionErrorMessage', () => {
  it("shows the server's limit message from a 429 response", async () => {
    const err = { context: new Response(JSON.stringify({ error: 'Too many messages from here. Please try again in an hour.' }), { status: 429 }) };
    expect(await functionErrorMessage(err, null, 'fallback')).toBe('Too many messages from here. Please try again in an hour.');
  });
  it('falls back when the response has no message', async () => {
    expect(await functionErrorMessage({ context: new Response('oops', { status: 500 }) }, null, 'Please try again.')).toBe('Please try again.');
  });
});
