import { useEffect, useState } from 'react';
import { canWriteAllReadings, loadMyTopicReadings, writeTopicReading, type TopicRow } from '@/lib/topicReadings';

/** Loads a reading; if missing and the member's plan includes it, writes it once on first open and polls until ready. */
export function useOnDemandReading(slug: string | undefined) {
  const [row, setRow] = useState<TopicRow | null | undefined>(undefined);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  useEffect(() => {
    if (!slug) return;
    let alive = true; let timer: number | undefined;
    const key = `topic-${slug}`;
    const find = async () => (await loadMyTopicReadings().catch(() => [])).find(r => r.page_key === key) ?? null;
    (async () => {
      setRow(undefined); setError(''); setWriting(false); setLocked(false);
      const r = await find();
      if (!alive) return;
      setRow(r);
      if (r) return;
      if (!(await canWriteAllReadings().catch(() => false))) { if (alive) setLocked(true); return; }
      setWriting(true);
      try { await writeTopicReading(slug); } catch (e) { if (alive) { setError((e as Error).message); setWriting(false); } return; }
      timer = window.setInterval(async () => { const f = await find(); if (alive && f) { setRow(f); setWriting(false); clearInterval(timer); } }, 8000);
    })();
    return () => { alive = false; if (timer) clearInterval(timer); };
  }, [slug]);
  return { row, setRow, writing, error, locked };
}
