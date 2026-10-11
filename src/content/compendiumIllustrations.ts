/** The 16 illustrations specified in April's Illustration Reference Guide, generated from each plate's own AI prompt. */
const files = import.meta.glob('@/assets/compendium/ill-*.jpg', { eager: true, import: 'default' }) as Record<string, string>;
const url = (n: number) => Object.entries(files).find(([p]) => p.includes(`ill-${String(n).padStart(2, '0')}`))?.[1] ?? '';
export const COMPENDIUM_ILLUSTRATIONS = [
 {
  n: 1,
  title: "The Threshold Between Worlds"
 },
 {
  n: 2,
  title: "The Karmic Axis — Past Lives"
 },
 {
  n: 3,
  title: "The Sabian Wheel"
 },
 {
  n: 4,
  title: "The Ancient Sky — Fixed Stars"
 },
 {
  n: 5,
  title: "The Five-Year-Old With the Bags — Saturn Rx H1"
 },
 {
  n: 6,
  title: "The Bucket Handle Bearer — Moon in Aries H3"
 },
 {
  n: 7,
  title: "The Stage Performer Confronts the Past"
 },
 {
  n: 8,
  title: "The Chariot"
 },
 {
  n: 9,
  title: "The Well of Shadow"
 },
 {
  n: 10,
  title: "The Candlelit Gift"
 },
 {
  n: 11,
  title: "The Journaling Desk"
 },
 {
  n: 12,
  title: "The Birthday Ritual Desk — September 2026"
 },
 {
  n: 13,
  title: "The Corridor of Twelve Doors"
 },
 {
  n: 14,
  title: "The Map of All Things"
 },
 {
  n: 15,
  title: "The Winding Road — Life Phases"
 },
 {
  n: 16,
  title: "Walking Into the Light — The Final Illustration"
 }
].map(i => ({ ...i, src: url(i.n) }));
