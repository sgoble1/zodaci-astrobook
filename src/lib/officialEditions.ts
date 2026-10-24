import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ChartInput, HouseSystem } from '@/lib/astro';

/** The three founder editions shown in the Official AstroBook section. */
export type OfficialEdition = 'april' | 'shane' | 'zac';
export const OFFICIAL_EDITIONS: OfficialEdition[] = ['april', 'shane', 'zac'];
export const isOfficialEdition = (x: unknown): x is OfficialEdition => x === 'april' || x === 'shane' || x === 'zac';

export type OfficialBirth = { date: string; time: string | null; lat: number; lon: number; tz: string; place_label: string; house_system: string | null };
/** One row of my_official_editions(): the backend returns only the caller's own edition, or every edition for admins. */
export type OfficialEditionRow = { edition: OfficialEdition; display_name: string; is_own: boolean; birth: OfficialBirth | null; birth_source: string };

/** What each edition's Official section contains. Links open pages that check access again on the server. */
export const OFFICIAL_BOOKS: Record<OfficialEdition, { masterbook: string; masterbookTitle: string; detail: string; readLabel: string; pages: number; extras: { to: string; title: string; detail: string }[] }> = {
  april: {
    masterbook: '/masterbook', masterbookTitle: 'April’s Astrological Masterbook', readLabel: 'Read the Masterbook', pages: 420,
    detail: 'Her complete original archive: natal chart, houses, aspects, timing and the companion volumes.', extras: [],
  },
  shane: {
    masterbook: '/shane', masterbookTitle: 'Shane’s Astrological Masterbook', readLabel: 'Read the Masterbook', pages: 260,
    detail: 'Natal foundations, Vedic, karmic, relationship and timing volumes.',
    extras: [{ to: '/official-astrobook/illustrated', title: 'Shane · Zodaci Illustrated, October 2026', detail: 'The 24-page illustrated edition, read page by page.' }],
  },
  zac: {
    masterbook: '/zac', masterbookTitle: 'Zac’s Astrological Library', readLabel: 'Read Volumes I–VI', pages: 380,
    detail: 'Six volumes: the natal chart, world systems, family and career, traditions, the 360° life map and the road ahead.',
    extras: [{ to: '/zac/workbook', title: 'The Diamond Workbook', detail: 'Eight stations built from the six volumes, with the year ahead month by month.' }],
  },
};

const HOUSES: HouseSystem[] = ['porphyry', 'placidus', 'whole', 'equal'];
/** Chart input from the edition's birth facts (saved profile first, otherwise the edition's verified source). */
export function officialChartInput(b: OfficialBirth): ChartInput {
  const houseSystem = HOUSES.includes(b.house_system as HouseSystem) ? b.house_system as HouseSystem : 'placidus';
  return { date: b.date, time: b.time, lat: b.lat, lon: b.lon, tz: b.tz, placeLabel: b.place_label, placeSource: 'geocoded', houseSystem };
}

/** The editions this account may see. The list is decided by the backend; the page never widens it. */
export function useOfficialEditions(): { rows: OfficialEditionRow[] | null; error: string; retry: () => void } {
  const [rows, setRows] = useState<OfficialEditionRow[] | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let on = true;
    setRows(null); setError('');
    void supabase.rpc('my_official_editions').then(({ data, error: e }) => {
      if (!on) return;
      if (e) { setError('Your editions couldn’t load.'); return; }
      setRows(((data ?? []) as OfficialEditionRow[]).filter(r => isOfficialEdition(r.edition)));
    });
    const { data: sub } = supabase.auth.onAuthStateChange(() => { if (on) setAttempt(a => a + 1); });
    return () => { on = false; sub.subscription.unsubscribe(); };
  }, [attempt]);
  const retry = useCallback(() => setAttempt(a => a + 1), []);
  return { rows, error, retry };
}

/** Whose edition a card shows, worded for the viewer: "Your" for the owner, the owner's name for the admin. */
export const ownerLabel = (r: Pick<OfficialEditionRow, 'is_own' | 'display_name'>) => (r.is_own ? 'Your edition' : `${r.display_name}’s edition · admin view`);
