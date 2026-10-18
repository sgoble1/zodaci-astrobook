import { useEffect, useState } from 'react';
import { canWriteAllReadings, loadMyTopicReadings, writeTopicReading, FREE_READINGS, CORE_THEMES, type TopicRow } from '@/lib/topicReadings';
import { readingStatus } from '@/lib/readingExperience';

/** Core themes free members may preview (opening section only). */
export const isPreviewTheme = (slug: string) => !FREE_READINGS.includes(slug) && CORE_THEMES.some(t => t.slug === slug);

/** Loads a reading; if missing and the member's plan includes it (or a free preview), writes it once and polls until ready. */
export function useOnDemandReading(slug: string | undefined) {
  const [row, setRow] = useState<TopicRow | null | undefined>(undefined);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [preview, setPreview] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!slug) return;
    let alive = true; let timer: number | undefined;
    const key = `topic-${slug}`;
    const find = async () => (await loadMyTopicReadings()).find(r => r.page_key === key) ?? null;
    (async () => {
      try {
      setRow(undefined); setError(''); setWriting(false); setLocked(false); setPreview(false);
      const [r, full] = await Promise.all([find(), canWriteAllReadings().catch(() => false)]);
      if (!alive) return;
      const upgrading = !!r && r.status === 'preview' && full;
      setPreview(!full && isPreviewTheme(slug));
      setRow(upgrading ? null : r);
      if (r && !upgrading && ['ready', 'preview'].includes(readingStatus(r.status))) return;
      if (!full && !FREE_READINGS.includes(slug) && !isPreviewTheme(slug)) { setLocked(true); return; }
      setRow(null);
      setWriting(true);
      try { await writeTopicReading(slug); } catch (e) { if (alive) { setError((e as Error).message); setWriting(false); } return; }
      const started = Date.now();
      const poll = async () => {
        try {
          const f = await find();
          if (!alive) return;
          if (f && ['ready', 'preview'].includes(readingStatus(f.status)) && (!upgrading || f.status !== 'preview')) { setRow(f); setWriting(false); return; }
          if (f && readingStatus(f.status) === 'failed') throw new Error('This reading could not finish. Please try again.');
          if (Date.now() - started > 240000) throw new Error('This is taking longer than expected. Check again; your saved reading will appear when ready.');
          timer = window.setTimeout(poll, 6000);
        } catch (e) { if (alive) { setError((e as Error).message); setWriting(false); } }
      };
      void poll();
      } catch (e) { if (alive) { setRow(null); setError((e as Error).message); setWriting(false); } }
    })();
    return () => { alive = false; if (timer) clearInterval(timer); };
  }, [slug, attempt]);
  return { row, setRow, writing, error, locked, preview, retry: () => setAttempt(n => n + 1) };
}
