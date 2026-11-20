import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { schedulePreview } from './usePreparedPreview';

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => setTimeout(callback, 16));
  vi.stubGlobal('cancelAnimationFrame', (id: ReturnType<typeof setTimeout>) => clearTimeout(id));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('preview preparation lifecycle', () => {
  it('allows a paint before building and publishing the personalized pages', () => {
    const build = vi.fn(() => ['page 1', 'page 28']); const publish = vi.fn();
    schedulePreview(build, publish);
    expect(build).not.toHaveBeenCalled();
    vi.advanceTimersByTime(16);
    expect(build).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(publish).toHaveBeenCalledWith({ status: 'ready', value: ['page 1', 'page 28'] });
  });
  it('surfaces calculation failures and permits a fresh successful attempt', () => {
    const build = vi.fn().mockImplementationOnce(() => { throw new Error('private diagnostic'); }).mockReturnValue(['rebuilt']);
    const publish = vi.fn();
    schedulePreview(build, publish); vi.runAllTimers();
    expect(publish).toHaveBeenLastCalledWith({ status: 'error' });
    schedulePreview(build, publish); vi.runAllTimers();
    expect(publish).toHaveBeenLastCalledWith({ status: 'ready', value: ['rebuilt'] });
    expect(build).toHaveBeenCalledTimes(2);
  });
  it.each([0, 16])('cancels stale chart/account work after %i milliseconds', elapsed => {
    const build = vi.fn(() => ['old account']); const publish = vi.fn();
    const cancel = schedulePreview(build, publish);
    vi.advanceTimersByTime(elapsed); cancel(); vi.runAllTimers();
    expect(build).not.toHaveBeenCalled(); expect(publish).not.toHaveBeenCalled();
  });
});