import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { requestDeadline } from './request-deadline.ts';
Deno.test('caller cancellation aborts the bounded upstream request', () => {
  const controller = new AbortController();
  const signal = requestDeadline(30_000, controller.signal);
  controller.abort();
  assertEquals(signal.aborted, true);
});
Deno.test('a stuck upstream request reaches its deadline', async () => {
  const signal = requestDeadline(10);
  await new Promise(resolve => setTimeout(resolve, 30));
  assertEquals(signal.aborted, true);
  assertEquals(signal.reason.name, 'TimeoutError');
});