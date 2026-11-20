import { useCallback, useEffect, useState } from 'react';

export type PreparedPreview<T> = { status: 'loading' } | { status: 'ready'; value: T } | { status: 'error' };

/** Paint the waiting view before synchronous chart/page work; cancelled jobs never publish. */
export function schedulePreview<T>(build: () => T, publish: (result: PreparedPreview<T>) => void) {
  let cancelled = false;
  let task: ReturnType<typeof setTimeout> | undefined;
  const frame = requestAnimationFrame(() => {
    task = setTimeout(() => {
      if (cancelled) return;
      try { const value = build(); if (!cancelled) publish({ status: 'ready', value }); }
      catch { if (!cancelled) publish({ status: 'error' }); }
    }, 0);
  });
  return () => { cancelled = true; cancelAnimationFrame(frame); clearTimeout(task); };
}

export function usePreparedPreview<T>(build: (() => T) | null) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ source: () => T; attempt: number; state: PreparedPreview<T> } | null>(null);
  useEffect(() => {
    if (!build) return;
    return schedulePreview(build, state => setResult({ source: build, attempt, state }));
  }, [build, attempt]);
  const retry = useCallback(() => setAttempt(n => n + 1), []);
  const state: PreparedPreview<T> = build && result?.source === build && result.attempt === attempt ? result.state : { status: 'loading' };
  return { ...state, retry };
}