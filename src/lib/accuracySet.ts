// Public accuracy check: thirteen moments (no real person's birth) with reference positions from the
// Swiss Ephemeris 2.10 (the engine behind Astrodienst), Placidus houses, mean node. Anyone can enter the
// same date, time and place on astro.com and compare. Founder charts are checked privately in astro.accuracy.test.ts.
import { computeChart, fmtLon, type ChartResult } from './astro';

export const ACCURACY_TOLERANCE = 0.1; // degrees

type BodyKey = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto' | 'northNode' | 'chiron';
export type AccuracyCase = {
  id: string; place: string; why: string; date: string; time: string; tz: string; lat: number; lon: number;
  ref: { utc: string; asc: number; mc: number; porphyry: boolean; cusps: number[]; bodies: Record<BodyKey, [number, boolean]> };
};

export const ACCURACY_CASES: AccuracyCase[] = [
  { id: 'greenwich-j2000', place: 'Greenwich, London', why: 'Noon on 1 January 2000 — the J2000 moment astronomers use as their reference point.', date: '2000-01-01', time: '12:00', tz: 'Europe/London', lat: 51.4769, lon: -0.0005,
    ref: { utc: '2000-01-01T12:00:00.000Z', asc: 24.264, mc: 279.611, porphyry: false, cusps: [24.264, 61.141, 82.02, 99.611, 119.062, 147.7, 204.264, 241.141, 262.02, 279.611, 299.062, 327.7],
      bodies: { sun: [280.369, false], moon: [223.324, false], mercury: [271.889, false], venus: [241.566, false], mars: [327.963, false], jupiter: [25.253, false], saturn: [40.396, true], uranus: [314.809, false], neptune: [303.193, false], pluto: [251.455, false], northNode: [125.041, true], chiron: [251.618, false] } } },
  { id: 'houston-apollo11', place: 'Houston, Texas', why: 'The minute of the Apollo 11 Moon landing on Mission Control’s clock, which was on 1969 summer time.', date: '1969-07-20', time: '15:17', tz: 'America/Chicago', lat: 29.5593, lon: -95.09,
    ref: { utc: '1969-07-20T20:17:00.000Z', asc: 229.646, mc: 145.318, porphyry: false, cusps: [229.646, 259.243, 291.501, 325.318, 357.574, 25.67, 49.646, 79.243, 111.501, 145.318, 177.574, 205.67],
      bodies: { sun: [117.911, false], moon: [187.874, false], mercury: [115.843, false], venus: [75.037, false], mars: [242.773, false], jupiter: [180.746, false], saturn: [38.098, false], uranus: [180.69, false], neptune: [236.023, true], pluto: [173.007, false], northNode: [353.979, true], chiron: [6.827, true] } } },
  { id: 'dallas-eclipse', place: 'Dallas, Texas', why: 'During the 2024 total solar eclipse, so the Sun and Moon must land within a fraction of a degree of each other.', date: '2024-04-08', time: '13:40', tz: 'America/Chicago', lat: 32.7767, lon: -96.797,
    ref: { utc: '2024-04-08T18:40:00.000Z', asc: 121.831, mc: 22.4, porphyry: false, cusps: [121.831, 144.302, 170.751, 202.4, 237.405, 271.392, 301.831, 324.302, 350.751, 22.4, 57.405, 91.392],
      bodies: { sun: [19.414, false], moon: [19.6, false], mercury: [24.789, true], venus: [4.462, false], mars: [343.062, false], jupiter: [49.049, false], saturn: [344.457, false], uranus: [51.172, false], neptune: [358.191, false], pluto: [301.968, false], northNode: [15.646, true], chiron: [19.406, false] } } },
  { id: 'sydney-summer', place: 'Sydney, Australia', why: 'Southern hemisphere on summer time, where the local date is already a day ahead of UTC.', date: '1985-02-14', time: '09:30', tz: 'Australia/Sydney', lat: -33.8688, lon: 151.2093,
    ref: { utc: '1985-02-13T22:30:00.000Z', asc: 2.199, mc: 272.39, porphyry: false, cusps: [2.199, 29.531, 60.03, 92.39, 124.736, 155.134, 182.199, 209.531, 240.03, 272.39, 304.736, 335.134],
      bodies: { sun: [325.177, false], moon: [255.531, false], mercury: [320.985, false], venus: [9.868, false], mars: [8.413, false], jupiter: [301.656, false], saturn: [237.73, false], uranus: [257.386, false], neptune: [272.936, false], pluto: [214.73, true], northNode: [52.822, true], chiron: [63.268, false] } } },
  { id: 'buenos-aires', place: 'Buenos Aires, Argentina', why: 'Southern hemisphere and western longitude together, in the middle of winter.', date: '1978-06-25', time: '15:00', tz: 'America/Argentina/Buenos_Aires', lat: -34.6037, lon: -58.3816,
    ref: { utc: '1978-06-25T18:00:00.000Z', asc: 230.417, mc: 122.851, porphyry: false, cusps: [230.417, 257.491, 279.957, 302.851, 330.42, 6.985, 50.417, 77.491, 99.957, 122.851, 150.42, 186.985],
      bodies: { sun: [93.809, false], moon: [341.83, false], mercury: [106.814, false], venus: [131.127, false], mars: [156.482, false], jupiter: [104.521, false], saturn: [146.722, false], uranus: [222.592, true], neptune: [256.478, true], pluto: [193.899, false], northNode: [181.248, true], chiron: [38.705, false] } } },
  { id: 'tokyo-1964', place: 'Tokyo, Japan', why: 'Far-east longitude, nine hours ahead of UTC, before 1970 time-zone records.', date: '1964-10-10', time: '14:00', tz: 'Asia/Tokyo', lat: 35.6764, lon: 139.65,
    ref: { utc: '1964-10-10T05:00:00.000Z', asc: 307.197, mc: 235.808, porphyry: false, cusps: [307.197, 351.05, 28.106, 55.808, 78.576, 100.705, 127.197, 171.05, 208.106, 235.808, 258.576, 280.705],
      bodies: { sun: [196.921, false], moon: [249.0, false], mercury: [192.811, false], venus: [155.101, false], mars: [135.014, false], jupiter: [55.064, true], saturn: [328.774, true], uranus: [162.686, false], neptune: [226.452, false], pluto: [165.127, false], northNode: [86.358, true], chiron: [345.09, true] } } },
  { id: 'mumbai-midnight', place: 'Mumbai, India', why: 'Exactly midnight: the UTC moment falls on the previous evening, with India’s half-hour offset.', date: '1947-08-15', time: '00:00', tz: 'Asia/Kolkata', lat: 19.076, lon: 72.8777,
    ref: { utc: '1947-08-14T18:30:00.000Z', asc: 51.657, mc: 310.261, porphyry: false, cusps: [51.657, 79.282, 104.257, 130.261, 160.302, 195.32, 231.657, 259.282, 284.257, 310.261, 340.302, 15.32],
      bodies: { sun: [141.111, false], moon: [117.105, false], mercury: [126.796, false], venus: [135.683, false], mars: [90.578, false], jupiter: [229.0, false], saturn: [133.595, false], uranus: [85.175, false], neptune: [188.829, false], pluto: [133.23, false], northNode: [58.192, true], chiron: [214.004, false] } } },
  { id: 'tromso-midsummer', place: 'Tromsø, Norway', why: 'North of the Arctic Circle, where Placidus houses can’t be drawn, so the Porphyry fallback and its notice are checked.', date: '2010-06-21', time: '12:00', tz: 'Europe/Oslo', lat: 69.6492, lon: 18.9553,
    ref: { utc: '2010-06-21T10:00:00.000Z', asc: 174.202, mc: 79.384, porphyry: true, cusps: [174.202, 202.596, 230.99, 259.384, 290.99, 322.596, 354.202, 22.596, 50.99, 79.384, 110.99, 142.596],
      bodies: { sun: [89.941, false], moon: [208.737, false], mercury: [81.353, false], venus: [128.213, false], mars: [157.588, false], jupiter: [1.779, false], saturn: [178.229, false], uranus: [0.509, false], neptune: [328.589, true], pluto: [274.222, true], northNode: [282.558, true], chiron: [330.846, true] } } },
  { id: 'anchorage-1959', place: 'Anchorage, Alaska', why: 'Alaska’s old time zone, ten hours behind UTC, which was retired in 1983.', date: '1959-01-03', time: '12:00', tz: 'America/Anchorage', lat: 61.2176, lon: -149.8997,
    ref: { utc: '1959-01-03T22:00:00.000Z', asc: 52.621, mc: 281.844, porphyry: false, cusps: [52.621, 77.343, 90.228, 101.844, 116.175, 142.509, 232.621, 257.343, 270.228, 281.844, 296.175, 322.509],
      bodies: { sun: [282.792, false], moon: [211.955, false], mercury: [261.063, false], venus: [295.698, false], mars: [47.893, false], jupiter: [234.502, false], saturn: [269.809, false], uranus: [135.574, true], neptune: [216.621, false], pluto: [154.033, true], northNode: [197.901, true], chiron: [319.946, false] } } },
  { id: 'honolulu', place: 'Honolulu, Hawaii', why: 'A place that never uses daylight-saving time, at sunrise, with the Sun close to the Ascendant.', date: '1975-03-10', time: '06:05', tz: 'Pacific/Honolulu', lat: 21.3069, lon: -157.8583,
    ref: { utc: '1975-03-10T16:05:00.000Z', asc: 335.566, mc: 252.564, porphyry: false, cusps: [335.566, 13.585, 45.79, 72.564, 97.244, 123.541, 155.566, 193.585, 225.79, 252.564, 277.244, 303.541],
      bodies: { sun: [349.46, false], moon: [324.207, false], mercury: [322.626, false], venus: [18.749, false], mars: [305.607, false], jupiter: [358.059, false], saturn: [101.956, true], uranus: [212.006, true], neptune: [251.792, false], pluto: [188.4, true], northNode: [244.96, true], chiron: [21.967, false] } } },
  { id: 'moscow-1961', place: 'Moscow, Russia', why: 'The minute of Yuri Gagarin’s launch, written in Moscow time.', date: '1961-04-12', time: '09:07', tz: 'Europe/Moscow', lat: 55.7558, lon: 37.6173,
    ref: { utc: '1961-04-12T06:07:00.000Z', asc: 97.908, mc: 327.375, porphyry: false, cusps: [97.908, 111.672, 127.004, 147.375, 179.41, 231.035, 277.908, 291.672, 307.004, 327.375, 359.41, 51.035],
      bodies: { sun: [22.099, false], moon: [342.879, false], mercury: [3.099, false], venus: [20.068, true], mars: [108.366, false], jupiter: [304.306, false], saturn: [299.247, false], uranus: [141.784, true], neptune: [220.44, true], pluto: [155.833, true], northNode: [153.981, true], chiron: [335.12, false] } } },
  { id: 'quito-equator', place: 'Quito, Ecuador', why: 'On the equator one minute before local midnight on 31 December 1999, which was already 2000 in UTC.', date: '1999-12-31', time: '23:59', tz: 'America/Guayaquil', lat: -0.1807, lon: -78.4678,
    ref: { utc: '2000-01-01T04:59:00.000Z', asc: 187.035, mc: 95.923, porphyry: false, cusps: [187.035, 218.868, 248.228, 275.923, 304.105, 334.569, 7.035, 38.868, 68.228, 95.923, 124.105, 154.569],
      bodies: { sun: [280.071, false], moon: [219.803, false], mercury: [271.435, false], venus: [241.212, false], mars: [327.737, false], jupiter: [25.241, false], saturn: [40.402, true], uranus: [314.794, false], neptune: [303.183, false], pluto: [251.444, false], northNode: [125.056, true], chiron: [251.584, false] } } },
  { id: 'reykjavik-winter', place: 'Reykjavík, Iceland', why: '64° north at the winter solstice, where Placidus houses are stretched the most.', date: '1990-12-21', time: '10:00', tz: 'Atlantic/Reykjavik', lat: 64.1466, lon: -21.9426,
    ref: { utc: '1990-12-21T10:00:00.000Z', asc: 251.86, mc: 220.187, porphyry: false, cusps: [251.86, 305.394, 12.042, 40.187, 55.009, 64.636, 71.86, 125.394, 192.042, 220.187, 235.009, 244.636],
      bodies: { sun: [269.274, false], moon: [315.678, false], mercury: [276.02, true], venus: [281.443, false], mars: [58.586, true], jupiter: [132.862, true], saturn: [294.457, false], uranus: [279.098, false], neptune: [283.72, false], pluto: [229.264, false], northNode: [299.695, true], chiron: [115.948, true] } } },
];

const POINT_NAMES: Record<BodyKey, string> = { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto', northNode: 'North Node (mean)', chiron: 'Chiron' };

/** Smallest angle between two longitudes, in degrees. */
export const angleDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

export type AccuracyRow = { point: string; ours: number; ref: number; diff: number; retroOk: boolean | null; pass: boolean };
export type AccuracyResult = { c: AccuracyCase; chart: ChartResult; utcOk: boolean; houseNoteOk: boolean; rows: AccuracyRow[]; passed: number; worst: number };

export function checkCase(c: AccuracyCase): AccuracyResult {
  const chart = computeChart({ date: c.date, time: c.time, lat: c.lat, lon: c.lon, tz: c.tz, placeLabel: c.place, placeSource: 'geocoded', houseSystem: 'placidus' });
  const rows: AccuracyRow[] = [];
  const add = (point: string, ours: number | null | undefined, ref: number, retro?: { ours: boolean; ref: boolean }) => {
    const diff = ours == null ? Infinity : angleDiff(ours, ref);
    const retroOk = retro ? retro.ours === retro.ref : null;
    rows.push({ point, ours: ours ?? NaN, ref, diff, retroOk, pass: diff < ACCURACY_TOLERANCE && retroOk !== false });
  };
  (Object.keys(c.ref.bodies) as BodyKey[]).forEach(k => {
    const b = chart.bodies.find(x => x.key === k); const [lon, retro] = c.ref.bodies[k];
    add(POINT_NAMES[k], b?.lon, lon, k === 'sun' || k === 'moon' ? undefined : { ours: !!b?.retro, ref: retro });
  });
  add('Ascendant', chart.asc, c.ref.asc);
  add('Midheaven', chart.mc, c.ref.mc);
  c.ref.cusps.forEach((x, i) => add(`House ${i + 1} cusp`, chart.cusps?.[i], x));
  const houseNoteOk = chart.flags.some(f => f.topic === 'Houses') === c.ref.porphyry;
  const utcOk = chart.utc.toISOString() === c.ref.utc;
  return { c, chart, utcOk, houseNoteOk, rows, passed: rows.filter(r => r.pass).length, worst: Math.max(...rows.map(r => r.diff)) };
}

export type AccuracySummary = { charts: number; points: number; passed: number; worst: number; utcOk: number; results: AccuracyResult[] };

/** Runs every public case in the visitor's own browser; nothing is precomputed or cached. */
export function runAccuracySet(cases = ACCURACY_CASES): AccuracySummary {
  const results = cases.map(checkCase);
  return {
    charts: results.length,
    points: results.reduce((n, r) => n + r.rows.length, 0),
    passed: results.reduce((n, r) => n + r.passed, 0),
    worst: Math.max(...results.map(r => r.worst)),
    utcOk: results.filter(r => r.utcOk).length,
    results,
  };
}

/** Degrees and minutes in sign, plus decimal seconds-of-arc difference, for display. */
export const fmtPoint = (lon: number) => Number.isFinite(lon) ? fmtLon(lon).text : 'not calculated';
export const fmtDiff = (d: number) => !Number.isFinite(d) ? '—' : d < 1 / 60 ? `${Math.round(d * 3600)}″` : `${(d * 60).toFixed(1)}′`;
