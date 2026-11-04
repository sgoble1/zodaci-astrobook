import { cn } from '@/lib/utils';
import chart from '@/assets/spots/chart.jpg';
import self from '@/assets/spots/self.jpg';
import love from '@/assets/spots/love.jpg';
import purpose from '@/assets/spots/purpose.jpg';
import healing from '@/assets/spots/healing.jpg';
import year from '@/assets/spots/year.jpg';
import planet from '@/assets/spots/planet.jpg';
import house from '@/assets/spots/house.jpg';
import written from '@/assets/spots/written.jpg';
import honest from '@/assets/spots/honest.jpg';
import privateBox from '@/assets/spots/private.jpg';
import birth from '@/assets/spots/birth.jpg';
import explore from '@/assets/spots/explore.jpg';
import book from '@/assets/spots/book.jpg';
import tv from '@/assets/spots/tv.jpg';
import radio from '@/assets/spots/radio.jpg';
import compass from '@/assets/spots/compass.jpg';
import astrobook from '@/assets/spots/astrobook.jpg';
import source from '@/assets/spots/source.jpg';
import podcast from '@/assets/spots/podcast.jpg';
import counsel from '@/assets/spots/counsel.jpg';
import dream from '@/assets/spots/dream.jpg';
import growth from '@/assets/spots/growth.jpg';
import magnifier from '@/assets/spots/magnifier.jpg';
import fire from '@/assets/spots/fire.jpg';
import earth from '@/assets/spots/earth.jpg';
import air from '@/assets/spots/air.jpg';
import water from '@/assets/spots/water.jpg';
import aspect from '@/assets/spots/aspect.jpg';
import sign from '@/assets/spots/sign.jpg';
import numbers from '@/assets/spots/numbers.jpg';
import shop from '@/assets/spots/shop.jpg';
import moon from '@/assets/spots/moon.jpg';

/** Cheerful 1950s atomic-zodiac spot illustrations, one per box topic. */
export const SPOTS = {
  chart, self, love, purpose, healing, year, planet, house, written, honest, private: privateBox, birth, explore, book,
  tv, radio, compass, astrobook, source, podcast, counsel, dream, growth, magnifier, fire, earth, air, water, aspect, sign, numbers, shop, moon,
} as const;
export type SpotKind = keyof typeof SPOTS;

const ALT: Record<SpotKind, string> = {
  chart: 'A brass compass drawing a zodiac wheel on a desk', self: 'A smiling sun rising beside a crescent moon', love: 'Two planets on a heart-shaped orbit around a rose',
  purpose: 'An observatory on a mountain with a winding path', healing: 'A sprouting plant on a moonlit windowsill', year: 'An alarm clock circled by planets',
  planet: 'Ringed Saturn with atomic orbits', house: 'A cosy house with glowing windows under the stars', written: 'A typewriter under a desk lamp beside a cup of coffee',
  honest: 'A balance scale holding a planet and a magnifying glass', private: 'A keepsake box with a star chart and a brass key', birth: 'A calendar, clock and globe with a map pin',
  explore: 'A telescope at an open window facing a zodiac sky', book: 'An open book with a zodiac wheel rising from its pages', tv: 'A 1950s television showing the Moon and planets',
  radio: 'A tabletop radio sending signals to the stars', compass: 'A brass compass pointing to planets', astrobook: 'An indigo AstroBook between rocket bookends',
  source: 'A card catalogue drawer with a star chart card', podcast: 'A broadcast microphone under a crescent moon', counsel: 'Two armchairs and tea beside a starry window',
  dream: 'A quilted bed under an open moonlit window', growth: 'A tree with planets hanging like fruit', magnifier: 'A magnifying glass over a constellation map',
  fire: 'A starburst fire in a brick hearth', earth: 'Rolling hills, wheat and a garden fence under the sun', air: 'A kite and paper airplane on swirling wind',
  water: 'A curling wave with a crescent moon and a sailboat', aspect: 'Planets joined by geometric dotted lines', sign: 'A zodiac medallion with the twelve sign animals',
  numbers: 'An abacus whose beads are planets', shop: 'A striped gift shop counter with a gift and a mug', moon: 'A smiling crescent moon beneath an arc of Moon phases',
};

/** Keyword → spot. First match wins, so specific topics come before broad ones. */
const RULES: [RegExp, SpotKind][] = [
  [/calculat|measur|accura|compute|snapshot|wheel|natal|my chart|birth chart|chart/i, 'chart'],
  [/written for|one person|personal|writ|journal|wonder/i, 'written'],
  [/honest|limit|uncertain|verify|quality|deduction|confidence/i, 'honest'],
  [/privat|secure|lock|owner|context/i, 'private'],
  [/birth detail|birth data|save your|onboard|start|begin|get started/i, 'birth'],
  [/check|twice|never invent|magnif|search|discover/i, 'magnifier'],
  [/source|library|catalog|compendium|reference|research|sources/i, 'source'],
  [/astrobook|masterbook|edition|print|volume|dossier/i, 'astrobook'],
  [/podcast|audio|listen|media|broadcast/i, 'podcast'],
  [/ask|ai observatory|question|chat|signal|radio/i, 'radio'],
  [/current chapter|channel|tv|on air|today/i, 'tv'],
  [/compass|life compass|direction/i, 'compass'],
  [/counsel|therap|social|community|together|shared|talk/i, 'counsel'],
  [/forecast|transit|timing|year|cycle|calendar|retrograde|profection|saturn return|when/i, 'year'],
  [/love|relationship|partner|venus|compat|connect|attraction|sibling|family/i, 'love'],
  [/purpose|career|work|money|midheaven|path|node|calling/i, 'purpose'],
  [/heal|chiron|health|shadow|growth work/i, 'healing'],
  [/grow|jupiter|luck|expan/i, 'growth'],
  [/moon phase|lunar|new moon|full moon|moon cycle|the moon/i, 'moon'],
  [/dream|neptune|sleep|moon|spirit|past li/i, 'dream'],
  [/home|house|feng|bagua|kua|flying star/i, 'house'],
  [/numerolog|number|ba zi|chinese|pillar/i, 'numbers'],
  [/aspect|pattern|geometry/i, 'aspect'],
  [/^fire$|fire sign|aries|leo|sagittarius/i, 'fire'],
  [/^earth$|earth sign|taurus|virgo|capricorn/i, 'earth'],
  [/^air$|air sign|gemini|libra|aquarius/i, 'air'],
  [/^water$|water sign|cancer|scorpio|pisces/i, 'water'],
  [/sign|zodiac|archetype/i, 'sign'],
  [/self|who you are|sun|big three|rising|identity|personality|mind/i, 'self'],
  [/shop|store|gift|order|product|merch/i, 'shop'],
  [/read|book|chapter|lesson|guide|learn|academy|article|topic/i, 'book'],
  [/explore|observ|telescope|sky|star/i, 'explore'],
  [/planet|mercury|mars|uranus|pluto/i, 'planet'],
];

export function spotFor(label: string): SpotKind {
  return RULES.find(([re]) => re.test(label))?.[1] ?? 'planet';
}

/**
 * Printed medallion in the AstroBook cover style: cream disc, navy ink rule, mustard ring,
 * and (by default) a gold atomic orbit with a small brick-red planet crossing it.
 * Pass `orbit={false}` for icon-sized uses where the ring would crowd the label.
 */
export function SpotArt({ kind, label, className, shape = 'medallion', badge, decorative = true, orbit = true }: { kind?: SpotKind; label?: string; className?: string; shape?: 'medallion' | 'plate'; badge?: string | number; decorative?: boolean; orbit?: boolean }) {
  const k = kind ?? spotFor(label ?? '');
  const medallion = shape !== 'plate';
  return (
    <span className={cn('spot-art', medallion ? 'spot-art-medallion' : 'spot-art-plate', className)}>
      <span className="spot-art-disc">
        <img src={SPOTS[k]} alt={decorative ? '' : ALT[k]} aria-hidden={decorative || undefined} width={512} height={512} loading="lazy" decoding="async" />
      </span>
      {medallion && orbit && <span className="spot-art-orbit" aria-hidden="true" />}
      {badge !== undefined && <span className="spot-art-badge">{badge}</span>}
    </span>
  );
}
