import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ChartInput, ChartResult, HouseSystem } from '@/lib/astro';
import { birthFingerprint } from '@/lib/birthFingerprint';
import { onAccountChange } from '@/lib/authEvents';
export { birthFingerprint };
import { viewingSharedEdition } from '@/hooks/useAprilSpace';
import { EDITION_OWNER_NAME } from '@/lib/editionSharing';

export type MyBirth = { name: string; date: string; time: string | null; placeLabel: string; lat: number; lon: number; tz: string; houseSystem: HouseSystem; sex?: string | null };
/** Feng Shui Kua uses birth sex; other answers leave it unspecified. */
export const kuaSex = (sex?: string | null): 'male' | 'female' | 'unspecified' => sex === 'Female' ? 'female' : sex === 'Male' ? 'male' : 'unspecified';
const LOCAL = 'astrobook-my-birth-v1';

export const toChartInput = (b: MyBirth): ChartInput => ({ date: b.date, time: b.time, lat: b.lat, lon: b.lon, tz: b.tz, placeLabel: b.placeLabel, placeSource: 'geocoded', houseSystem: b.houseSystem });

/** The chart snapshot stored on the profile (angles and houses are dropped when the birth time is unknown). */
export const savedChart = (chart: ChartResult, timed: boolean) => ({ bodies: chart.bodies, asc: timed ? chart.asc : null, mc: timed ? chart.mc : null, aspects: chart.aspects, cusps: chart.cusps, bazi: chart.bazi, elements: chart.elements, flags: chart.flags });

/** Saves to the member's profile; keeps a device copy so a chart works before sign-in finishes. */
export async function saveMyBirth(b: MyBirth, chart: unknown) {
  if (viewingSharedEdition()) return { saved: 'device' as const, error: new Error('Return to your own edition before editing birth details.'), readingsKept: true };
  localStorage.setItem(LOCAL, JSON.stringify(b));
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { saved: 'device' as const };
  // Readings are fresh when written after onboarded_at, so it only moves when the birth facts actually change.
  const { data: prev } = await supabase.from('profiles').select('birth_date, birth_time, lat, lon, tz, house_system, onboarded_at').eq('id', u.user.id).maybeSingle();
  const unchanged = !!prev?.onboarded_at && prev.birth_date != null && prev.lat != null && prev.lon != null
    && birthFingerprint({ date: prev.birth_date, time: prev.birth_time, lat: prev.lat, lon: prev.lon, tz: prev.tz, houseSystem: prev.house_system }) === birthFingerprint(b);
  const now = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('profiles').upsert({
    id: u.user.id, display_name: b.name, birth_date: b.date, birth_time: b.time, place_label: b.placeLabel,
    lat: b.lat, lon: b.lon, tz: b.tz, house_system: b.houseSystem, chart, onboarded_at: unchanged ? prev!.onboarded_at : now, updated_at: now,
  });
  if (!error) window.dispatchEvent(new Event('astrobook-birth-saved'));
  return { saved: error ? ('device' as const) : ('account' as const), error, readingsKept: unchanged };
}

export function useMyBirth() {
  const [birth, setBirth] = useState<MyBirth | null | undefined>(undefined);
  useEffect(() => {
    let active = true; let revision = 0;
    const load = async () => {
      const version = ++revision;
      const { data: u } = await supabase.auth.getUser();
      if (!active || version !== revision) return;
      if (u.user) {
        // Viewing someone else's shared edition: show their chart (the database only returns editions this account may open).
        const viewing = viewingSharedEdition();
        if (viewing) {
          const { data: allowed, error: denied } = await supabase.rpc('can_open_edition', { _edition: viewing });
          if (!active || version !== revision) return;
          if (denied || allowed !== true) { setBirth(null); return; }
          const { data: eds } = await supabase.rpc('my_official_editions');
          const b = (eds ?? []).find((e: { edition: string }) => e.edition === viewing)?.birth as Record<string, unknown> | undefined;
          if (!active || version !== revision) return;
          if (b?.date && Number.isFinite(b.lat) && Number.isFinite(b.lon)) return setBirth({ name: EDITION_OWNER_NAME[viewing], date: String(b.date), time: (b.time as string) ?? null, placeLabel: String(b.place_label ?? ''), lat: Number(b.lat), lon: Number(b.lon), tz: String(b.tz), houseSystem: ((b.house_system as HouseSystem) ?? 'placidus'), sex: null });
          setBirth(null);
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any).from('profiles').select('*').eq('id', u.user.id).maybeSingle();
        if (data?.birth_date && active && version === revision) return setBirth({ name: data.display_name, date: data.birth_date, time: data.birth_time, placeLabel: data.place_label, lat: data.lat, lon: data.lon, tz: data.tz, houseSystem: data.house_system, sex: data.sex || null });
        // Founders keep their chart in their own official edition; use it only for editions this account owns.
        const { data: own } = await supabase.rpc('my_official_editions');
        if (!active || version !== revision) return;
        const mine = (own ?? []).find((e: { is_own: boolean }) => e.is_own) as { edition: string; birth: Record<string, unknown> } | undefined;
        const ob = mine?.birth;
        if (ob?.date && Number.isFinite(Number(ob.lat)) && Number.isFinite(Number(ob.lon))) return setBirth({ name: EDITION_OWNER_NAME[mine!.edition] ?? data?.display_name ?? '', date: String(ob.date), time: (ob.time as string) ?? null, placeLabel: String(ob.place_label ?? ''), lat: Number(ob.lat), lon: Number(ob.lon), tz: String(ob.tz), houseSystem: ((ob.house_system as HouseSystem) ?? 'placidus'), sex: null });
        setBirth(null);
        return;
      }
      const raw = localStorage.getItem(LOCAL);
      try { if (active) setBirth(raw ? JSON.parse(raw) : null); } catch { if (active && version === revision) setBirth(null); }
    };
    const safelyLoad = () => { void load().catch(() => { if (active) setBirth(null); }); };
    safelyLoad();
    const refresh = safelyLoad;
    window.addEventListener('astrobook-birth-saved', refresh);
    const stop = onAccountChange(() => { revision++; if (active) setBirth(undefined); setTimeout(refresh, 0); });
    return () => { active = false; window.removeEventListener('astrobook-birth-saved', refresh); stop(); };
  }, []);
  return birth;
}
