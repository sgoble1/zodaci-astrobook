import { useEffect, useRef, useState, type RefObject } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { readProgress } from '@/components/readings/ReadingNavigator';
import { furthest, readMarks, worthSaving, type SavedProgress } from '@/lib/readingProgress';

const COLS = 'path, title, section_id, section_title, progress, last_read_at';

/**
 * Remembers how far the signed-in reader got in one reading: loads their saved row, then writes their position a
 * few times per chapter (after 2 s without scrolling, and when leaving). Rows are owner-only; nothing is written
 * when signed out, and the saved row is dropped whenever the account changes.
 */
export function useReadingProgress({ path, title, contentRef, sections }: { path: string; title: string; contentRef: RefObject<HTMLElement>; sections: { id: string; title: string }[] }) {
  const uid = useSession()?.user.id;
  const [saved, setSaved] = useState<SavedProgress | null>(null);
  const [current, setCurrent] = useState(0);
  const baseline = useRef(0);

  useEffect(() => {
    setSaved(null); baseline.current = 0;
    if (!uid) return;
    let live = true;
    void supabase.from('reading_progress').select(COLS).eq('owner_id', uid).eq('path', path).maybeSingle().then(({ data }) => {
      if (!live || !data) return;
      setSaved(data as SavedProgress); baseline.current = data.progress;
    });
    return () => { live = false; };
  }, [uid, path]);

  useEffect(() => {
    if (!uid) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let last = { progress: -1, section: '' };
    let pending: { progress: number; section: string; sectionTitle: string } | null = null;
    const flush = () => {
      if (!pending) return;
      const row = pending; pending = null; last = { progress: row.progress, section: row.section };
      void supabase.from('reading_progress').upsert({
        owner_id: uid, path: path.slice(0, 300), title: (title || 'Reading').slice(0, 300), section_id: row.section || null, section_title: row.sectionTitle || null,
        progress: row.progress, last_read_at: new Date().toISOString(),
      }, { onConflict: 'owner_id,path' });
    };
    const measure = () => {
      const el = contentRef.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const progress = furthest(baseline.current, readProgress(r.top, r.height, window.innerHeight));
      baseline.current = progress; setCurrent(progress);
      let section = sections[0]?.id ?? '';
      for (const s of sections) { const h = document.getElementById(s.id); if (h && h.getBoundingClientRect().top < window.innerHeight / 3) section = s.id; }
      const next = { progress, section };
      if (last.progress >= 0 && !worthSaving(last, next)) return;
      pending = { ...next, sectionTitle: sections.find(s => s.id === section)?.title ?? '' };
      clearTimeout(timer); timer = setTimeout(flush, 2000);
    };
    // Opening a reading counts once the reader has stayed two seconds.
    const opened = setTimeout(measure, 300);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('pagehide', flush);
    return () => { clearTimeout(opened); clearTimeout(timer); flush(); window.removeEventListener('scroll', measure); window.removeEventListener('pagehide', flush); };
  }, [uid, path, title, contentRef, sections]);

  return { saved, current, signedIn: !!uid };
}

/** The reader's own recent readings, newest first. */
export function useRecentReading(limit = 50) {
  const uid = useSession()?.user.id;
  const [rows, setRows] = useState<SavedProgress[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    setRows(null); setError(false);
    if (!uid) { setRows([]); return; }
    let live = true;
    void supabase.from('reading_progress').select(COLS).eq('owner_id', uid).order('last_read_at', { ascending: false }).limit(limit).then(({ data, error: e }) => {
      if (!live) return;
      if (e) { setError(true); setRows([]); return; }
      setRows((data ?? []) as SavedProgress[]);
    });
    return () => { live = false; };
  }, [uid, limit]);
  const remove = async (path: string) => {
    if (!uid) return false;
    const r = await supabase.from('reading_progress').delete().eq('owner_id', uid).eq('path', path);
    if (r.error) return false;
    setRows(rs => (rs ?? []).filter(x => x.path !== path));
    return true;
  };
  return { rows, error, remove, signedIn: !!uid };
}

/** Sidebar read marks for chapter links under the given path prefixes (e.g. '/shane/'), from the reader's own rows. */
export function useReadMarks(prefixes: string[]) {
  const uid = useSession()?.user.id;
  const key = prefixes.join('|');
  const [marks, setMarks] = useState<Map<string, number>>(new Map());
  useEffect(() => {
    setMarks(new Map());
    if (!uid || !key) return;
    let live = true;
    const ors = key.split('|').map(p => `path.like.${p}%`).join(',');
    void supabase.from('reading_progress').select('path, progress').eq('owner_id', uid).or(ors).limit(500).then(({ data }) => { if (live && data) setMarks(readMarks(data)); });
    return () => { live = false; };
  }, [uid, key]);
  return marks;
}
