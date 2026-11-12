// Mirror of src/content/mysticInk.ts (MYSTIC_INK_PREFIX / MYSTIC_INK_NEGATIVE). Every server-built illustration prompt
// starts with the prefix unchanged; src/content/mysticInk.test.ts fails if the two copies drift apart.
export const MYSTIC_INK_PREFIX = 'Original illustration in the Zodaci "Atomic Zodiac" style: 1950s golden-age commercial and comic illustration. Heavy confident deep-navy ink outlines, halftone dot shading, flat print inks of archive cream, deep indigo, mustard yellow, brick red and brass gold on aged paper. Mid-century figures with warm, grounded proportions; atomic orbit rings, starbursts, zodiac armillaries, observatory domes, brass telescopes and retro instruments. Slight print misregistration and paper grain, like a vintage educational poster or comic page. No text, no logos, no watermarks, no existing characters or copyrighted designs.';

export const MYSTIC_INK_NEGATIVE = 'Avoid: Vault Boy or Fallout characters, jumpsuits, thumbs-up poses, mascots, fantasy, crystals, cyberpunk, neon, cute storybook rendering, plastic 3D render look, anime styling, photographic realism, copies of any existing cover, film still, character or logo, readable text inside the artwork.';

/** Prefix first, scene second, negative guidance last (the image model takes a single prompt). */
export const withMysticInk = (scene: string) => `${MYSTIC_INK_PREFIX}\n${scene}\n${MYSTIC_INK_NEGATIVE}`;
