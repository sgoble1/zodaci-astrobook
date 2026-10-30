import { describe, expect, it } from 'vitest';
import { sourceResponse } from './sourceResponse';

describe('source response failures', () => {
  it('returns a 402 denial as state without throwing or an answer stream', async () => {
    const result = await sourceResponse(new Response(JSON.stringify({ error: 'Not enough credits' }), { status: 402 }));
    expect(result.body).toBeNull();
    expect(result.error).toBe('Not enough credits');
  });
  it('handles a non-JSON credit denial without throwing', async () => {
    const result = await sourceResponse(new Response('Payment Required', { status: 402 }));
    expect(result.body).toBeNull();
    expect(result.error).toContain('AI credits');
  });
  it('preserves a provider denial instead of treating it as success', async () => {
    const result = await sourceResponse(new Response(JSON.stringify({ message: 'Access denied' }), { status: 403 }));
    expect(result).toEqual({ body: null, error: 'Access denied' });
  });
  it('keeps successful answers readable', async () => {
    const response = new Response('A cited answer');
    const result = await sourceResponse(response);
    expect(result.body).toBe(response.body);
    expect(result.error).toBeNull();
  });
});