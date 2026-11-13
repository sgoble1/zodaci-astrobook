/**
 * Zodaci illustration style: Atomic Zodiac (replaced the old "Mystic Ink" style guide; identifiers keep the old name). One shared master prompt and negative
 * prompt for every illustration: AstroBook art, AstroComic panels and site graphics. Only the scene text is editable;
 * the prefix is always prepended unchanged. supabase/functions/_shared/mystic-ink.ts mirrors the two constants.
 */
export const MYSTIC_INK_PREFIX = 'Original illustration in the Zodaci "Atomic Zodiac" style: 1950s golden-age commercial and comic illustration. Heavy confident deep-navy ink outlines, halftone dot shading, flat print inks of archive cream, deep indigo, mustard yellow, brick red and brass gold on aged paper. Mid-century figures with warm, grounded proportions; atomic orbit rings, starbursts, zodiac armillaries, observatory domes, brass telescopes and retro instruments. Slight print misregistration and paper grain, like a vintage educational poster or comic page. No text, no logos, no watermarks, no existing characters or copyrighted designs.';

export const MYSTIC_INK_NEGATIVE = 'Avoid: Vault Boy or Fallout characters, jumpsuits, thumbs-up poses, mascots, fantasy, crystals, cyberpunk, neon, cute storybook rendering, plastic 3D render look, anime styling, photographic realism, copies of any existing cover, film still, character or logo, readable text inside the artwork.';

/** Atomic Zodiac print palette ("Blend"). Hex values are pigment references for artwork; the UI uses the matching theme tokens. */
export const MYSTIC_PALETTE = [
  { key: 'cream', name: 'Archive Cream', hex: '#EFE3C8', use: 'Paper, page and card backgrounds, text on dark' },
  { key: 'indigo', name: 'Deep Indigo', hex: '#1E1E5A', use: 'Night skies, outlines, deepest shadows' },
  { key: 'yellow', name: 'Shop Yellow', hex: '#FFC61A', use: 'Caption boxes, starbursts, highlights' },
  { key: 'red', name: 'Shop Red', hex: '#E23B44', use: 'Title bands, accents, warm shadows' },
  { key: 'brass', name: 'Brass', hex: '#B8963E', use: 'Instruments, orbit rings, ornaments' },
  { key: 'ink', name: 'Ink Black', hex: '#14141C', use: 'Linework and lettering' },
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
  { sign: 'Scorpio', accents: 'deep crimson and indigo', figure: 'Scorpion', motif: 'curving tail of stars' },
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
  { id: 'chapter-opener', label: 'AstroBook chapter opener', needsSign: true, size: '1024x1024', template: 'Circular framed medallion like an antique astrolabe, [SIGN] [FIGURE] at the center, [MOTIF] drawn as a gold dotted line around it, brass atomic orbit-ring border with small starbursts and halftone tint. Square composition.' },
  { id: 'full-page', label: 'AstroBook full-page scene', needsSign: true, size: '1024x1536', template: '[SCENE]. A [SIGN] character lit by one glowing [MOTIF]. Low poster-style angle, flat print inks, bold ink outlines, halftone shadows. Portrait composition.' },
  { id: 'spot', label: 'AstroBook spot illustration', needsSign: false, size: '1024x1024', template: 'Small vignette of [SCENE] on plain archive-cream paper, bold ink outline, halftone shading, slight print misregistration, no border.' },
  { id: 'portrait', label: 'Character portrait', needsSign: true, size: '1024x1536', template: 'Half-length portrait of [SCENE], [ACCENTS] accent colors, a constellation drawn behind in brass dotted lines, clear expression, warm mid-century proportions.' },
  { id: 'comic-panel', label: 'AstroComic panel', needsSign: false, size: '1536x1024', template: 'Single comic panel: [SCENE]. 1950s golden-age Atomic Zodiac comic rendering with heavy ink outlines and halftone shading, clear readable composition, space left for speech bubbles, no lettering in the art.' },
  { id: 'cover', label: 'Book or comic cover', needsSign: true, size: '1024x1536', template: '[SIGN] hero at the center under a large constellation, gold orbit ring around the sign in the top third, red title band area left empty at top. Portrait composition.' },
  { id: 'banner', label: 'Website hero or section banner', needsSign: true, size: '1536x1024', template: 'Wide panoramic [SIGN] night landscape, constellation lines across the sky, generous empty space for headline text. Wide 16:9 composition.' },
  { id: 'icon', label: 'Icon or small graphic', needsSign: true, size: '1024x1024', template: 'Single [SIGN] symbol as a brass ink emblem with halftone tint inside a hand-cut badge on archive cream or deep indigo, heavy outline, centered, no text.' },
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
