/**
 * Static first-paint snapshots for public pages. At build time each entry becomes its own HTML file
 * (dist/<path>/index.html) carrying the page's title, description, canonical and social tags plus a short
 * readable summary, so search engines and link previews see real content before the app starts.
 * Text mirrors each page's own usePageMeta wording; prices stay out (they live only in plans.ts/books.ts).
 */
export type PublicSnapshot = { path: string; title: string; description: string; heading: string; links?: [string, string][] };

const CORE: [string, string][] = [['/welcome', 'Home'], ['/astrobook', 'AstroBook'], ['/astrocomic', 'AstroComic'], ['/academy', 'Academy'], ['/forecast', 'Forecast'], ['/pricing', 'Pricing'], ['/auth', 'Sign in']];

export const PUBLIC_SNAPSHOTS: PublicSnapshot[] = [
  { path: '/welcome', title: 'Zodaci — Astral Research Authority', heading: 'Map the stars. Understand yourself.', description: 'Zodaci is a personal observatory: your birth chart calculated with astronomical precision, readings written for you, forecasts, and AstroBooks. Free to begin, private by default.' },
  { path: '/about', title: 'About Zodaci · Astronomy-grade precision, plain-language depth', heading: 'About Zodaci', description: 'Why Zodaci exists and how we calculate: birth charts worked out from your exact birth minute, readings in plain language that name their placements, and private context you control.' },
  { path: '/astrobook', title: 'AstroBook — Your Personalized Birth Chart Book in Five Versions | Zodaci', heading: 'AstroBook', description: 'A book written entirely from your birth chart, in five versions from digital to linen hardcover. Free US shipping.' },
  { path: '/astrocomic', title: 'AstroComic — your month as a personalized comic | Zodaci', heading: 'AstroComic', description: 'A printed 24-page comic each month, starring the planets in your birth chart and the transits that touch it.' },
  { path: '/academy', title: 'Zodaci Academy — learn to read your birth chart', heading: 'Zodaci Academy', description: 'Short, plain-language lessons on planets, signs, houses, aspects, transits, retrogrades, Ba Zi, numerology and Feng Shui.' },
  { path: '/learn', title: 'Learn astrology · Zodaci Research Library', heading: 'Research Library', description: 'Lessons, illustrated guides, today’s measured sky and a 30-day sky calendar, articles and member essays — all in one place.' },
  { path: '/forecast', title: 'Forecast Center · Zodaci', heading: 'Forecast Center', description: 'Today’s calculated sky, a 30-day calendar and private chart-based television channels, illustrated in Zodaci’s 1950s AstroComic style.' },
  { path: '/compatibility', title: 'Astrology compatibility score — Sun, Moon, Venus, Mars & Rising | Zodaci', heading: 'Compatibility', description: 'Compare two birth charts by element and modality across five placements. Free, calculated in your browser, with the method shown.' },
  { path: '/book-preview', title: 'AstroBook sample — read before you order | Zodaci', heading: 'AstroBook sample', description: 'Explore a short fictional AstroBook PDF sample with calculated chart facts and illustrative passages before ordering.' },
  { path: '/pricing', title: 'Pricing | Zodaci', heading: 'Pricing', description: 'Start free with your calculated birth chart, then choose Pro or Cosmic. Cancel anytime, 7-day refund on your first payment.' },
  { path: '/demo', title: 'Interactive Demo — Free, Pro and Cosmic | Zodaci', heading: 'Interactive demo', description: 'One fictional reader, one calculated chart: switch between Free, Pro and Cosmic, read an illustrated chapter, hear a podcast and open her AstroComic and AstroBook — no sign-up needed.' },
  { path: '/themes', title: '12 Core Astrology Themes Written From Your Birth Chart | Zodaci', heading: 'Twelve core themes', description: 'Personality, emotions, creativity, work, leadership, self-worth and more — twelve chart-specific readings. Start free with one section of every theme.' },
  { path: '/community', title: 'Zodaci Community · Talk charts with members', heading: 'Zodaci Community', description: 'Join Zodaci members to discuss birth charts, readings and astrology questions.' },
  { path: '/store', title: 'The Zodaci Shop: AstroBooks, AstroComics and atomic zodiac goods', heading: 'The Zodaci Shop', description: 'Your chart as an AstroBook or AstroComic, plus atomic zodiac stickers, totes, posters and notebooks from the Zodaci gift shop.' },
];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Static shell shown inside #root until the app takes over (React replaces it on first render). */
export function snapshotShell(p: PublicSnapshot) {
  const links = (p.links ?? CORE).map(([to, label]) => `<a href="${to}">${esc(label)}</a>`).join('');
  return `<div class="zx-snap"><header><a href="/welcome" class="zx-logo">ZODACI</a><nav>${links}</nav></header><main><h1>${esc(p.heading)}</h1><p>${esc(p.description)}</p><p class="zx-wait" role="status">Opening Zodaci…</p></main></div>`;
}

export const SNAPSHOT_STYLE = `<style>.zx-snap{min-height:100vh;background:#1E1E5A;color:#EFE3C8;font:16px/1.6 'Libre Franklin',system-ui,sans-serif;padding:20px}.zx-snap header{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;max-width:1100px;margin:0 auto}.zx-snap nav{display:flex;flex-wrap:wrap;gap:4px 16px}.zx-snap a{color:#FFC61A;text-decoration:none;min-height:44px;display:inline-flex;align-items:center}.zx-logo{font:400 22px/1 'Bebas Neue',system-ui;letter-spacing:.12em}.zx-snap main{max-width:760px;margin:12vh auto 0}.zx-snap h1{font:400 clamp(2.2rem,6vw,4rem)/1.05 'Alfa Slab One',Georgia,serif;margin:0 0 16px}.zx-wait{opacity:.7;font-size:14px}</style>`;

/** Rewrites the built index.html for one public page: page-specific head tags plus the static shell. */
export function snapshotHtml(base: string, p: PublicSnapshot) {
  const url = `https://zodaci.com${p.path}`;
  let html = base
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(p.description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(p.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(p.description)}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${esc(p.title)}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${esc(p.description)}`)
    .replace('</head>', `<link rel="canonical" href="${url}" /><meta property="og:url" content="${url}" />${SNAPSHOT_STYLE}</head>`);
  html = html.replace(/<div id="root">[\s\S]*?<\/div>\s*(?=<script|<\/body>)/, `<div id="root">${snapshotShell(p)}</div>\n    `);
  return html;
}
