import { expect, it, vi } from 'vitest';
import { createSingleFlight } from './singleFlight';
it('a rapid duplicate submit performs one mutation and can submit again after completion', async () => {
  const run = createSingleFlight<void>();
  let finish: (() => void) | undefined;
  const mutation = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  const first = run(mutation), second = run(mutation);
  expect(first).toBe(second);
  await Promise.resolve();
  expect(mutation).toHaveBeenCalledTimes(1);
  finish?.(); await first;
  const next = run(mutation);
  await Promise.resolve(); finish?.(); await next;
  expect(mutation).toHaveBeenCalledTimes(2);
});
it('a failed request releases the lock for an explicit retry', async () => {
  const run = createSingleFlight<number>();
  await expect(run(async () => { throw new Error('offline'); })).rejects.toThrow('offline');
  await expect(run(async () => 7)).resolves.toBe(7);
});