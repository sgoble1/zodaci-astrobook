import aries from '@/assets/products/founder-cover-aries.jpg';
import taurus from '@/assets/products/taurus-cover-flat.jpg';
import cancer from '@/assets/products/founder-cover-cancer.jpg';
import virgo from '@/assets/products/founder-cover-virgo.jpg';

/**
 * Sun-sign AstroBook covers drawn in the shop listing style (cream stock, red ASTROBOOK band, atomic orbit, sign figure).
 * Chosen from the authorized edition's calculated Sun sign, never a fixed person; signs without a drawing use the default design.
 */
export const SIGN_COVERS: Partial<Record<string, string>> = { Aries: aries, Taurus: taurus, Cancer: cancer, Virgo: virgo };
export const signCover = (sunSign?: string | null) => (sunSign ? SIGN_COVERS[sunSign] : undefined);
