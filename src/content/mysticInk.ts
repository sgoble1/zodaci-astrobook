/**
 * Zodaci illustration style "Mystic Ink" (UPDATES · Illustration Style Guide). One shared master prompt and negative
 * prompt for every illustration: AstroBook art, AstroComic panels and site graphics. Only the scene text is editable;
 * the prefix is always prepended unchanged. supabase/functions/_shared/mystic-ink.ts mirrors the two constants.
 */
export const MYSTIC_INK_PREFIX = 'Original storybook illustration in the Zodaci "Mystic Ink" style: beautiful, mystical, enchanted. Soft pastel-pencil and chalk glow combined with rich painterly gouache and fine ink crosshatching. Luminous jewel tones of deep indigo, plum and teal with burnished gold, rose and pearl accents. Dramatic chiaroscuro lighting from a single magical light source such as a star, constellation or glowing zodiac symbol, giving figures a soft glowing rim light. Elegant, slightly elongated figures with graceful proportions and expressive faces. Refined, delicate linework in warm dark brown, never pure black. Gothic-Victorian architecture and antique props (astrolabes, brass telescopes, globes, old books). Atmospheric haze, drifting star dust, subtle paper grain. Constellations drawn as fine dotted gold lines with softly glowing star points. No text, no logos, no watermarks, no existing characters or copyrighted designs.';

export const MYSTIC_INK_NEGATIVE = 'Avoid: cartoon or goofy proportions, thick wobbly marker outlines, flat vector shapes, neon or oversaturated colors, plastic 3D render look, anime styling, pure black outlines, copies of any existing book cover, film still, character or logo, readable text inside the artwork.';

/** Section 4 colour system. Hex values are pigment references for artwork; the UI uses the matching --mi-* tokens. */
export const MYSTIC_PALETTE = [
  { key: 'indigo', name: 'Midnight Indigo', hex: '#1B1F4B', use: 'Night skies, page backgrounds, deepest shadows' },
  { key: 'plum', name: 'Royal Plum', hex: '#4A2C5E', use: 'Headings, shadows, secondary backgrounds' },
  { key: 'teal', name: 'Deep Teal', hex: '#1F5F6B', use: 'Water, mist, cool shadows' },
  { key: 'gold', name: 'Burnished Gold', hex: '#C9A24B', use: 'Constellation lines, star glow, ornaments, buttons' },
  { key: 'rose', name: 'Rose Coral', hex: '#C77D8E', use: 'Warm highlights, skin glow, accents' },
  { key: 'parchment', name: 'Pearl Parchment', hex: '#F2E6CF', use: 'Page and card backgrounds, text on dark' },
  { key: 'ink', name: 'Ink Brown', hex: '#2B1B14', use: 'Linework and body text on light' },
] as const;

export type ZodiacSign = 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';
export type SignStyle = { sign: ZodiacSign; accents: string; figure: string; motif: string };

/** Section 5: each sign keeps the same accent pair, central figure and constellation motif everywhere. */
export const SIGN_STYLE: SignStyle[] = [
  { sign: 'Aries', accents: 'ember red and gold', figure: 'Ram', motif: "ram's-horn curve of stars" },
  { sign: 'Taurus', accents: 'moss green and rose', figure: 'Bull', motif: 'V-shaped star cluster' },
  { sign: 'Gemini', accents: 'mint and lemon on teal', figure: 'Twins', motif: 'two parallel star chains' },
  { sign: 'Cancer', accents: 'pearl and silver-blue', figure: 'Crab', motif: 'Y-shaped star web' },
  { sign: 'Leo', accents: 'saffron and amber', figure: 'Lion', motif: 'sickle and mane of stars' },
  { sign: 'Virgo', accents: 'wheat gold and sage', figure: 'Maiden with wheat', motif: 'long reclining star figure' },
  { sign: 'Libra', accents: 'rose quartz and bronze', figure: 'Scales', motif: 'balanced star quadrilateral' },
  { sign: 'Scorpio', accents: 'deep crimson and violet', figure: 'Scorpion', motif: 'curving tail of stars' },
  { sign: 'Sagittarius', accents: 'copper and sky blue', figure: 'Archer', motif: 'teapot-shaped bow of stars' },
  { sign: 'Capricorn', accents: 'slate green and silver', figure: 'Sea-goat', motif: 'triangular star sweep' },
  { sign: 'Aquarius', accents: 'aqua and silver', figure: 'Water bearer', motif: 'zigzag stream of stars' },
  { sign: 'Pisces', accents: 'lilac and pearl', figure: 'Two fish', motif: 'two star-chains joined by a cord' },
];
export const signStyle = (sign: string) => SIGN_STYLE.find(s => s.sign.toLowerCase() === sign.trim().toLowerCase());

export type AssetType = 'chapter-opener' | 'full-page' | 'spot' | 'portrait' | 'comic-panel' | 'cover' | 'banner' | 'icon';
export type AssetTemplate = { id: AssetType; label: string; template: string; needsSign: boolean; size: string };

/** Section 6 templates. Bracketed words are filled from the sign guide or the editable scene text. */
export const ASSET_TEMPLATES: AssetTemplate[] = [
  { id: 'chapter-opener', label: 'AstroBook chapter opener', needsSign: true, size: '1024x1024', template: 'Circular framed medallion like an antique astrolabe, [SIGN] [FIGURE] at the center, [MOTIF] drawn as a gold dotted line around it, ornate Victorian filigree border with small stars. Square composition.' },
  { id: 'full-page', label: 'AstroBook full-page scene', needsSign: true, size: '1024x1536', template: '[SCENE]. A [SIGN] character lit by one glowing [MOTIF]. Dramatic low angle, deep shadows, rim light. Portrait composition.' },
  { id: 'spot', label: 'AstroBook spot illustration', needsSign: false, size: '1024x1024', template: 'Small vignette of [SCENE] on a plain parchment background, fading edges, soft glow, fine crosshatching, no border.' },
  { id: 'portrait', label: 'Character portrait', needsSign: true, size: '1024x1536', template: 'Half-length portrait of [SCENE], [ACCENTS] accent colors, soft rim light from a constellation behind, expressive eyes, elongated elegant features.' },
  { id: 'comic-panel', label: 'AstroComic panel', needsSign: false, size: '1536x1024', template: 'Single comic panel: [SCENE]. Painterly Mystic Ink rendering with fine ink linework, clear readable composition, space left for speech bubbles, no lettering in the art.' },
  { id: 'cover', label: 'Book or comic cover', needsSign: true, size: '1024x1536', template: '[SIGN] hero at the center under a large glowing constellation, ornate gold frame, title area left empty at top. Portrait composition.' },
  { id: 'banner', label: 'Website hero or section banner', needsSign: true, size: '1536x1024', template: 'Wide panoramic [SIGN] night landscape, constellation lines across the sky, generous empty space for headline text. Wide 16:9 composition.' },
  { id: 'icon', label: 'Icon or small graphic', needsSign: true, size: '1024x1024', template: 'Single [SIGN] symbol as a gold-leaf ornament with soft glow on a transparent or deep indigo background, delicate linework, centered, no text.' },
];

/** Fill one template from the sign guide and the scene text (the only hand-edited part). */
export function fillTemplate(asset: AssetType, scene: string, sign?: string): string {
  const t = ASSET_TEMPLATES.find(a => a.id === asset);
  if (!t) throw new Error(`Unknown asset type: ${asset}`);
  const s = sign ? signStyle(sign) : undefined;
  const sceneText = scene.trim().replace(/\.$/, '') || 'a quiet moment under the night sky';
  return t.template
    .replace(/\[SIGN\]/g, s?.sign ?? 'zodiac')
    .replace(/\[FIGURE\]/g, s?.figure.toLowerCase() ?? 'figure')
    .replace(/\[MOTIF\]/g, s?.motif ?? 'constellation')
    .replace(/\[ACCENTS\]/g, s?.accents ?? 'gold and pearl')
    .replace(/\[SCENE\]/g, sceneText);
}

/** The full prompt: master prefix first, then the filled template, then the sign's accents. */
export function mysticPrompt(asset: AssetType, scene: string, sign?: string): string {
  const s = sign ? signStyle(sign) : undefined;
  return [MYSTIC_INK_PREFIX, fillTemplate(asset, scene, sign), s ? `Sign accents: ${s.accents}; central figure: ${s.figure.toLowerCase()}; constellation motif: ${s.motif}.` : ''].filter(Boolean).join('\n');
}

/** Section 8 consistency checklist, shown beside the prompt builder. */
export const MYSTIC_CHECKLIST = [
  'The master style prompt is the first block of the prompt, unchanged.',
  'One magical light source; deep shadows elsewhere.',
  'Five to six colors from the palette plus the sign accents.',
  'Warm dark-brown linework, never pure black.',
  'Constellations drawn as dotted gold lines with glowing star points.',
  'No text, logos or watermarks inside the art.',
  'Nothing resembles an existing cover, character, scene or logo.',
];
