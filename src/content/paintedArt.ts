import dome from '@/assets/painted/observatory-dome.webp';
import astrobook from '@/assets/painted/astrobook-table.webp';
import astrocomic from '@/assets/painted/astrocomic-press.webp';
import keepsakes from '@/assets/painted/keepsakes-cabinet.webp';
import library from '@/assets/painted/learn-library.webp';
import transit from '@/assets/painted/transit-chamber.webp';
import dualOrbit from '@/assets/painted/dual-orbit-study.webp';
import products from '@/assets/painted/station-products.webp';
import calculators from '@/assets/painted/station-calculators.webp';
import academy from '@/assets/painted/station-academy.webp';
import members from '@/assets/painted/station-members.webp';
import april from '@/assets/painted/founder-april.webp';
import shane from '@/assets/painted/founder-shane.webp';
import zac from '@/assets/painted/founder-zac.webp';

/** Painted plates in the waitlist-painting style (gouache, amber lamp light, indigo night, lithographic grain). Illustrative, never chart output. */
export const PAINTED = {
  dome: { src: dome, alt: '1950s astronomers charting the night sky inside an observatory dome beside a brass armillary sphere and glowing consoles' },
  astrobook: { src: astrobook, alt: 'Open gold-embossed leather folios with engraved star charts on a lamp-lit drafting table' },
  astrocomic: { src: astrocomic, alt: 'A couple holding retro comics at a night newsstand beside a printing press lit by green banker lamps' },
  keepsakes: { src: keepsakes, alt: 'A collector cabinet of rolled parchment star charts, sealed certificates and brass astrolabes' },
  library: { src: library, alt: 'A grand reading library with floor-to-ceiling star charts and green reading lamps' },
  transit: { src: transit, alt: 'A technician adjusting a vernier dial on a brass transit telescope with gear-trains and counters' },
  dualOrbit: { src: dualOrbit, alt: 'Two people in armchairs either side of a brass orrery with two balanced orbits, evening horizon beyond' },
  stations: {
    products: { src: products, alt: 'Star books, a retro comic and a rolled star scroll under a brass lamp' },
    calculators: { src: calculators, alt: 'A woman adjusting the dials of a brass chart-wheel console' },
    academy: { src: academy, alt: 'A student at a lamp-lit desk before a chalkboard of orbits and a zodiac wheel' },
    members: { src: members, alt: 'A members’ lounge with private pigeonholes, a reel-to-reel console and a domed window of stars' },
  },
  founders: {
    april: { src: april, alt: 'A great open masterbook on a brass lectern beside companion volumes, a studio microphone and a tape recorder' },
    shane: { src: shane, alt: 'A dirty-blonde man reading a gold-embossed folio under the Aries and Taurus constellations' },
    zac: { src: zac, alt: 'Six numbered leather volumes, a diamond paperweight on an open workbook, a globe and a road map at dawn' },
  },
} as const;
