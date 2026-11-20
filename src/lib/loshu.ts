export const LO_SHU = [4, 9, 2, 3, 5, 7, 8, 1, 6] as const;
const LINES = [[4, 9, 2], [3, 5, 7], [8, 1, 6], [4, 3, 8], [9, 5, 1], [2, 7, 6], [4, 5, 6], [2, 5, 8]];
/** Birth-date digit method; zeros do not occupy squares. Symbolic convention, not an energy measurement. */
export function loShu(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error('Enter a valid birth date.');
  const counts = Array.from({ length: 10 }, () => 0);
  for (const digit of date.replace(/-/g, '')) if (digit !== '0') counts[Number(digit)]++;
  return { counts, complete: LINES.filter(line => line.every(n => counts[n] > 0)), absent: LINES.filter(line => line.every(n => counts[n] === 0)) };
}