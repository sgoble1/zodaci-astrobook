/**
 * Birth fingerprint (Unified Master Specification §2.8): only the astrologically significant fields. The name and
 * place label are excluded, so renaming yourself or tidying the place text keeps your readings instead of marking them
 * out of date.
 */
export function birthFingerprint(b: { date: string; time: string | null; lat: number; lon: number; tz: string; houseSystem: string }) {
  return [b.date, b.time ?? '', b.lat.toFixed(4), b.lon.toFixed(4), b.tz, b.houseSystem].join('|');
}
