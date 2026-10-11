import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ChartInput, HouseSystem } from '@/lib/astro';

export type MyBirth = { name: string; date: string; time: string | null; placeLabel: string; lat: number; lon: number; tz: string; houseSystem: HouseSystem };
const LOCAL = 'astrobook-my-birth-v1';

export const toChartInput = (b: MyBirth): ChartInput => ({ date: b.date, time: b.time, lat: b.lat, lon: b.lon, tz: b.tz, placeLabel: b.placeLabel, placeSource: 'geocoded', houseSystem: b.houseSystem });

/** Saves to the member's profile; keeps a device copy so a chart works before sign-in finishes. */
export async function saveMyBirth(b: MyBirth, chart: unknown) {
  localStorage.setItem(LOCAL, JSON.stringify(b));
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { saved: 'device' as const };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('profiles').upsert({
    id: u.user.id, display_name: b.name, birth_date: b.date, birth_time: b.time, place_label: b.placeLabel,
    lat: b.lat, lon: b.lon, tz: b.tz, house_system: b.houseSystem, chart, onboarded_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  });
  if (!error) window.dispatchEvent(new Event('astrobook-birth-saved'));
  return { saved: error ? ('device' as const) : ('account' as const), error };
}

export function useMyBirth() {
  const [birth, setBirth] = useState<MyBirth | null | undefined>(undefined);
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any).from('profiles').select('*').eq('id', u.user.id).maybeSingle();
        if (data?.birth_date) return setBirth({ name: data.display_name, date: data.birth_date, time: data.birth_time, placeLabel: data.place_label, lat: data.lat, lon: data.lon, tz: data.tz, houseSystem: data.house_system });
      }
      const raw = localStorage.getItem(LOCAL);
      setBirth(raw ? JSON.parse(raw) : null);
    })();
  }, []);
  return birth;
}
