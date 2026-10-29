import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ChartInput, HouseSystem } from '@/lib/astro';
import { birthFingerprint } from '@/lib/birthFingerprint';
import { onAccountChange } from '@/lib/authEvents';
export { birthFingerprint };

export type MyBirth = { name: string; date: string; time: string | null; placeLabel: string; lat: number; lon: number; tz: string; houseSystem: HouseSystem; sex?: string | null };
/** Feng Shui Kua uses birth sex; other answers leave it unspecified. */
export const kuaSex = (sex?: string | null): 'male' | 'female' | 'unspecified' => sex === 'Female' ? 'female' : sex === 'Male' ? 'male' : 'unspecified';
const LOCAL = 'astrobook-my-birth-v1';

export const toChartInput = (b: MyBirth): ChartInput => ({ date: b.date, time: b.time, lat: b.lat, lon: b.lon, tz: b.tz, placeLabel: b.placeLabel, placeSource: 'geocoded', houseSystem: b.houseSystem });

/** Saves to the member's profile; keeps a device copy so a chart works before sign-in finishes. */
export async function saveMyBirth(b: MyBirth, chart: unknown) {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any).from('profiles').select('*').eq('id', u.user.id).maybeSingle();
        if (data?.birth_date && active && version === revision) return setBirth({ name: data.display_name, date: data.birth_date, time: data.birth_time, placeLabel: data.place_label, lat: data.lat, lon: data.lon, tz: data.tz, houseSystem: data.house_system, sex: data.sex || null });
        if (active && version === revision) setBirth(null);
        return;
      }
      const raw = localStorage.getItem(LOCAL);
      try { if (active) setBirth(raw ? JSON.parse(raw) : null); } catch { if (active && version === revision) setBirth(null); }
    };
    void load();
    const refresh = () => { void load(); };
    window.addEventListener('astrobook-birth-saved', refresh);
    const stop = onAccountChange(() => { revision++; if (active) setBirth(undefined); setTimeout(refresh, 0); });
    return () => { active = false; window.removeEventListener('astrobook-birth-saved', refresh); stop(); };
  }, []);
  return birth;
}
