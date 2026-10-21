import { describe, expect, it } from 'vitest';
import { PROMO_VIDEO, splitOnFilm } from './promoVideo';

describe('promo film on landing pages', () => {
  it('splits the body where a line says [film]', () => expect(splitOnFilm('Intro\n[film]\nMore')).toEqual(['Intro', 'More']));
  it('leaves a body without the marker whole', () => expect(splitOnFilm('Just text [film] inline')).toEqual(['Just text [film] inline']));
  it('describes a 24-second film', () => { expect(PROMO_VIDEO.isoDuration).toBe('PT24S'); expect(PROMO_VIDEO.lengthLabel).toBe('0:24'); });
});
