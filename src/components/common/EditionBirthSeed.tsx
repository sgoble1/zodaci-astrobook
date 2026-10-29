import { useEffect, useRef } from 'react';
import { computeChart } from '@/lib/astro';
import { saveMyBirth, savedChart, useMyBirth } from '@/lib/myBirth';
import { officialChartInput, useOfficialEditions } from '@/lib/officialEditions';
import { useSession } from '@/hooks/useLibrary';

/**
 * An edition owner who hasn't entered birth details yet (for example Zac on first sign-in) gets their
 * edition's verified birth facts saved to their own account, so counselors, chat and readings use their chart.
 * Runs once per account; never overwrites details the person saved themselves.
 */
export function EditionBirthSeed() {
  const uid = useSession()?.user.id;
  const birth = useMyBirth();
  const { rows } = useOfficialEditions();
  const tried = useRef<string | null>(null);
  useEffect(() => {
    if (!uid || birth !== null || !rows || tried.current === uid) return;
    const own = rows.find(r => r.is_own && r.birth);
    if (!own?.birth) return;
    tried.current = uid;
    const input = officialChartInput(own.birth);
    const chart = computeChart(input);
    void saveMyBirth({ name: own.display_name, date: input.date, time: input.time, placeLabel: input.placeLabel, lat: input.lat, lon: input.lon, tz: input.tz, houseSystem: input.houseSystem }, savedChart(chart, !!input.time));
  }, [uid, birth, rows]);
  return null;
}
