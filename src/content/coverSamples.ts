import collector from '@/assets/products/astrobook-collector-taurus-sample.jpg';
import signature from '@/assets/products/astrobook-signature-gemini-sample.jpg';
import pocket from '@/assets/products/astrobook-pocket-gemini-sample.jpg';

export type SampleBirth = { date: string; time: string; lat: number; lon: number; tz: string; placeLabel: string };
export type CoverSample = {
  id: 'collector' | 'signature' | 'pocket';
  edition: string;
  sign: 'Taurus' | 'Gemini';
  name: string;
  birth: SampleBirth;
  /** Exactly what is printed on the cover image (checked against the calculated chart in coverSamples.test.ts). */
  printed: { born: string; placements: string };
  src: string;
  alt: string;
};

/**
 * Public sample covers for three invented readers. Each name is fictional; each birth moment is calculated like a real
 * order, so the placements printed on the cover are true for that minute and place. No founder or member data is used.
 * Cover images are baked by scripts/bake-sample-covers.py from these same lines.
 */
export const COVER_SAMPLES: CoverSample[] = [
  {
    id: 'collector', edition: 'Collector', sign: 'Taurus', name: 'Rosalind Vance',
    birth: { date: '1987-05-03', time: '06:42', lat: 35.5951, lon: -82.5515, tz: 'America/New_York', placeLabel: 'Asheville, North Carolina' },
    printed: { born: 'Born 3 May 1987 · 6:42 a.m. · Asheville, North Carolina', placements: 'Sun Taurus 12° · Moon Cancer 13° · Rising Taurus 12°' },
    src: collector,
    alt: 'Collector AstroBook sample cover: a Taurus bull in a golden atomic orbit, printed for the fictional reader Rosalind Vance, born 3 May 1987 at 6:42 a.m. in Asheville, North Carolina',
  },
  {
    id: 'signature', edition: 'Signature', sign: 'Gemini', name: 'Theo Lindqvist',
    birth: { date: '1991-06-09', time: '23:18', lat: 46.7867, lon: -92.1005, tz: 'America/Chicago', placeLabel: 'Duluth, Minnesota' },
    printed: { born: 'Born 9 June 1991 · 11:18 p.m. · Duluth, Minnesota', placements: 'Sun Gemini 18° · Moon Taurus 16° · Rising Capricorn 24°' },
    src: signature,
    alt: 'Signature AstroBook sample cover: a mid-century Gemini couple inside golden orbit rings, printed for the fictional reader Theo Lindqvist, born 9 June 1991 at 11:18 p.m. in Duluth, Minnesota',
  },
  {
    id: 'pocket', edition: 'Pocket', sign: 'Gemini', name: 'Calvin Okafor',
    birth: { date: '1984-06-02', time: '16:05', lat: 32.0809, lon: -81.0912, tz: 'America/New_York', placeLabel: 'Savannah, Georgia' },
    printed: { born: 'Born 2 June 1984 · 4:05 p.m. · Savannah, Georgia', placements: 'Sun Gemini 12° · Moon Cancer 21° · Rising Libra 18°' },
    src: pocket,
    alt: 'Pocket AstroBook sample cover: Gemini twins in tan jackets before a golden orbit, printed for the fictional reader Calvin Okafor, born 2 June 1984 at 4:05 p.m. in Savannah, Georgia',
  },
];

export const LEAD_COVER = COVER_SAMPLES[0];
export const coverSample = (id: CoverSample['id']) => COVER_SAMPLES.find(s => s.id === id) ?? LEAD_COVER;
