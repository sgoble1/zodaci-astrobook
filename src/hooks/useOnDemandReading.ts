import { useEffect, useState } from 'react';
import { canWriteAllReadings, loadMyTopicReadings, writeTopicReading, FREE_READINGS, CORE_THEMES, type TopicRow } from '@/lib/topicReadings';

/** Core themes free members may preview (opening section only). */
export const isPreviewTheme = (slug: string) => !FREE_READINGS.includes(slug) && CORE_THEMES.some(t => t.slug === slug);

/** Loads a reading; if missing and the member's plan includes it (or a free preview), writes it once and polls until ready. */
export function useOnDemandReading(slug: string | undefined) {
  const [row, setRow] = useState<TopicRow | null | undefined>(undefined);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    if (!slug) return;
    let alive = true; let timer: number | undefined;
    const key = `topic-${slug}`;
    const find = async () => (await loadMyTopicReadings().catch(() => [])).find(r => r.page_key === key) ?? null;
    (async () => {
      setRow(undefined); setError(''); setWriting(false); setLocked(false); setPreview(false);
      const [r, full] = await Promise.all([find(), canWriteAllReadings().catch(() => false)]);
      if (!alive) return;
      const upgrading = !!r && r.status === 'preview' && full;
      setPreview(!full && (r?.status === 'preview' || (!r && isPreviewTheme(slug))));
      setRow(upgrading ? null : r);
      if (r && !upgrading) return;
      if (!full && !isPreviewTheme(slug)) { setLocked(true); return; }
      setWriting(true);
      try { await writeTopicReading(slug); } catch (e) { if (alive) { setError((e as Error).message); setWriting(false); } return; }
      timer = window.setInterval(async () => { const f = await find(); if (alive && f && (!upgrading || f.status !== 'preview')) { setRow(f); setWriting(false); clearInterval(timer); } }, 6000);
    })();
    return () => { alive = false; if (timer) clearInterval(timer); };
  }, [slug]);
  return { row, setRow, writing, error, locked, preview };
}
