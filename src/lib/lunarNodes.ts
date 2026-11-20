import * as Astronomy from 'astronomy-engine';
export type NodeMode = 'mean' | 'true';
const norm = (n: number) => ((n % 360) + 360) % 360;
/** Meeus 47.7: the smoothed regression, unchanged from the natal engine. */
export function meanNode(date: Date) {
  const T = (date.getTime() / 86400000 + 2440587.5 - 2451545) / 36525;
  return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T);
}
/** Instantaneous ascending intersection of the Moon's osculating orbit and the ecliptic of date. */
export function trueNode(date: Date) {
  const s = Astronomy.RotateState(Astronomy.Rotation_EQJ_ECT(date), Astronomy.GeoMoonState(date));
  const hx = s.y * s.vz - s.z * s.vy;
  const hy = s.z * s.vx - s.x * s.vz;
  return norm(Math.atan2(hx, -hy) * 180 / Math.PI);
}
export const lunarNode = (date: Date, mode: NodeMode = 'mean') => mode === 'true' ? trueNode(date) : meanNode(date);