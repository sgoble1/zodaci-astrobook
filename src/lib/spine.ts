/**
 * Spine width from page count, never typed by hand.
 * Paperback: Lulu's published interior formula (pages ÷ 444 + 0.06 in). Hardcover adds board thickness,
 * shown as an estimate; Lulu's cover check confirms the final width before print.
 */
export const PAGES_PER_INCH = 444;
export const PAPERBACK_EXTRA_IN = 0.06;
export const HARDCOVER_BOARDS_IN = 0.25;

export function spineInches(pages: number, hardcover = false): { inches: number; estimate: boolean } {
  const n = Math.max(24, Math.round(pages));
  const core = n / PAGES_PER_INCH + PAPERBACK_EXTRA_IN;
  return { inches: Math.round((core + (hardcover ? HARDCOVER_BOARDS_IN : 0)) * 1000) / 1000, estimate: hardcover };
}

/** Spine text fits only when the spine is at least this wide (Lulu asks for 100+ pages before spine text). */
export const spineTextFits = (pages: number) => pages >= 100;
