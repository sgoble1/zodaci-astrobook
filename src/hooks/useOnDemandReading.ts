import { useEffect, useState } from 'react';
import { canWriteAllReadings, loadMyTopicReadings, writeTopicReading, FREE_READINGS, CORE_THEMES, type TopicRow } from '@/lib/topicReadings';
import { readingStatus } from '@/lib/readingExperience';
import { supabase } from '@/integrations/supabase/client';
import { onAccountChange } from '@/lib/authEvents';
import { ADMIN_EDITION_KEY } from '@/hooks/useAprilSpace';

/** True while this tab views another founder's edition; topic readings are owner-keyed, so we never write the viewer's own here. */
export const viewingOtherEdition = () => typeof window !== 'undefined' && ['april', 'zac'].includes(window.sessionStorage.getItem(ADMIN_EDITION_KEY) ?? '');

/** Shown instead of any reading while another edition is open in this tab (the viewer's own rows are never loaded there). */
export const EDITION_VIEW_NOTE = "Readings on this page save to your own account, so they stay hidden while you view another edition. Leave the edition view to open or write your own.";

/** Core themes free members may preview (opening section only). */
export const isPreviewTheme = (slug: string) => !FREE_READINGS.includes(slug) && CORE_THEMES.some(t => t.slug === slug);

/** Edition guard first: while this tab views another founder's edition the viewer's own saved rows are never loaded or shown. */
export async function firstLook(slug: string) {
  if (viewingOtherEdition()) return { edition: true } as const;
  const key = `topic-${slug}`;
  const [rows, full, auth] = await Promise.all([loadMyTopicReadings(), canWriteAllReadings().catch(() => false), supabase.auth.getSession()]);
  // Checked again: the tab may have switched editions while the rows were loading.
  if (viewingOtherEdition()) return { edition: true } as const;
  return { edition: false, r: rows.find(x => x.page_key === key) ?? null, full, signedIn: !!auth.data.session } as const;
}

/** Loads a reading; if missing and the member's plan includes it (or a free preview), writes it once and polls until ready. */
export function useOnDemandReading(slug: string | undefined) {
  const [row, setRow] = useState<TopicRow | null | undefined>(undefined);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [preview, setPreview] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const changed = () => { setRow(undefined); setWriting(false); setAttempt(n => n + 1); };
    const stop = onAccountChange(changed);
    window.addEventListener('astrobook-birth-saved', changed);
    return () => { stop(); window.removeEventListener('astrobook-birth-saved', changed); };
  }, []);
  useEffect(() => {
    if (!slug) return;
    let alive = true; let timer: number | undefined;
    const key = `topic-${slug}`;
    const find = async () => (await loadMyTopicReadings()).find(r => r.page_key === key) ?? null;
    (async () => {
      try {
      setRow(undefined); setError(''); setWriting(false); setLocked(false); setPreview(false);
      const look = await firstLook(slug);
      if (!alive) return;
      if (look.edition) { setRow(null); setLocked(true); setError(EDITION_VIEW_NOTE); return; }
      const { r, full } = look;
      if (!look.signedIn) { setRow(null); setLocked(true); return; }
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
