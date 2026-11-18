import { fmtLon, type ChartResult } from '@/lib/astro';

/** Fixed print inks, independent of UI theme, matching the celestial jacket suite. */
const INK = { night: '#EFE3C8', black: '#F4ECDD', foil: '#B18A28', pale: '#182B46', red: '#B5412C' };
const KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c] ?? c));
const xy = (lon: number, radius = 290) => ({ x: 450 + Math.cos((lon - 90) * Math.PI / 180) * radius, y: 445 + Math.sin((lon - 90) * Math.PI / 180) * radius });
export type PlateSpec = { ruler: string; element: string; sunSign: string; moonSign?: string; title: string; positions: { key: string; name: string; lon: number }[]; contacts: { a: string; b: string; type: string; orb: number }[] };

/** No angles or houses enter the engraving; date-only plates omit the provisional Moon and its contacts. */
export function bookPlateSpec(chart: ChartResult, ruler: string, element: string): PlateSpec {
  const timed = !!chart.input.time && chart.asc != null;
  const sun = chart.bodies.find(b => b.key === 'sun');
  if (!sun) throw new Error('The plate requires a measured Sun position.');
  const positions = chart.bodies.filter(b => KEYS.includes(b.key) && (timed || b.key !== 'moon')).map(({ key, name, lon }) => ({ key, name, lon }));
  const names = new Set(positions.map(p => p.name));
  const contacts = chart.aspects.filter(a => names.has(a.a) && names.has(a.b)).sort((a, b) => a.orb - b.orb).slice(0, 6).map(({ a, b, type, orb }) => ({ a, b, type, orb }));
  return { ruler, element, sunSign: sun.sign, moonSign: timed ? chart.bodies.find(b => b.key === 'moon')?.sign : undefined, title: `${element} · ${ruler} · planetary geometry`, positions, contacts };
}

/** Professional vector engraving at actual ecliptic longitudes; no decorative invented aspects. */
export function renderBookPlate(spec: PlateSpec): string {
  const ticks = Array.from({ length: 72 }, (_, i) => { const a = xy(i * 5, 315), b = xy(i * 5, i % 6 === 0 ? 335 : 322); return `<path d="M${a.x},${a.y}L${b.x},${b.y}"/>`; }).join('');
  const contacts = spec.contacts.map(a => { const p = spec.positions.find(p => p.name === a.a), q = spec.positions.find(p => p.name === a.b); if (!p || !q) return ''; const x = xy(p.lon), y = xy(q.lon); return `<path d="M${x.x},${x.y}L${y.x},${y.y}" stroke-width="${a.orb < 1 ? 2 : 1}" opacity=".65"><title>${escape(`${a.a} ${a.type} ${a.b} · orb ${a.orb.toFixed(2)}°`)}</title></path>`; }).join('');
  const points = spec.positions.map(p => { const at = xy(p.lon), lead = p.key === spec.ruler, light = p.key === 'sun' || p.key === 'moon'; return `<g><circle cx="${at.x}" cy="${at.y}" r="${lead ? 13 : light ? 9 : 5}" fill="${lead ? INK.foil : INK.night}"/><text x="${at.x}" y="${at.y - 20}" text-anchor="middle" font-size="14" fill="${INK.pale}" stroke="none">${escape(p.name)}</text><title>${escape(`${p.name} · ${fmtLon(p.lon).text}`)}</title></g>`; }).join('');
  const star = (x: number, y: number) => `<path d="M${x - 12},${y}h24M${x},${y - 12}v24M${x - 5},${y - 5}l10,10M${x - 5},${y + 5}l10,-10"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100"><defs><radialGradient id="ink"><stop stop-color="${INK.night}"/><stop offset="1" stop-color="${INK.black}"/></radialGradient><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".07"/></feComponentTransfer><feBlend in="SourceGraphic" mode="screen"/></filter></defs><rect width="900" height="1100" fill="url(#ink)" filter="url(#grain)"/><g stroke="${INK.foil}" fill="none" stroke-width="1.5"><rect x="30" y="30" width="840" height="1040"/><rect x="42" y="42" width="816" height="1016" opacity=".4"/><circle cx="450" cy="445" r="290"/><circle cx="450" cy="445" r="340"/>${ticks}${contacts}${points}<ellipse cx="450" cy="445" rx="190" ry="60" transform="rotate(-25 450 445)" opacity=".5"/><ellipse cx="450" cy="445" rx="190" ry="60" transform="rotate(25 450 445)" opacity=".5"/>${star(110, 115)}${star(790, 115)}${star(450, 445)}</g><rect x="65" y="68" width="770" height="68" fill="${INK.red}"/><g fill="${INK.pale}" text-anchor="middle" font-family="Georgia,serif"><text x="450" y="110" font-size="24" fill="${INK.night}">${escape(spec.element.toUpperCase())} · ${escape(spec.ruler.toUpperCase())}</text><text x="450" y="850" font-size="25">${escape(spec.sunSign)} Sun${spec.moonSign ? ` · ${escape(spec.moonSign)} Moon` : ' · Date-based reference'}</text><text x="450" y="898" font-size="18">Ecliptic positions · six closest measured contacts</text><text x="450" y="935" font-size="16">Symbolic engraving, not a house wheel or a photograph</text><text x="450" y="1010" font-size="18">ZODACI · ASTRAL RESEARCH AUTHORITY</text></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}